"""
Meta / Facebook Graph API service.

Handles:
- OAuth 2.0 authorization URL generation (with CSRF state)
- Authorization code exchange for long-lived user access token
- Fetching ad accounts and pages from Graph API
- Persisting MetaConnection records (tokens encrypted at rest)
- Webhook signature verification (HMAC-SHA256)
- Lead form data retrieval
- Token refresh via Celery task
"""
import hashlib
import hmac
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import AppException
from app.core.security import decrypt_value, encrypt_value
from app.models.meta_connection import MetaConnection
from app.models.oauth_state import OAuthState

GRAPH_BASE = f"https://graph.facebook.com/{settings.META_API_VERSION}"

# Required permissions for Lead Ads
META_SCOPES = [
    "ads_management",
    "ads_read",
    "leads_retrieval",
    "pages_show_list",
    "pages_read_engagement",
    "business_management",
]


# ── OAuth ────────────────────────────────────────────────────────────────────

async def generate_oauth_url(
    db: AsyncSession,
    user_id: uuid.UUID,
    company_id: uuid.UUID,
) -> str:
    state = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

    db.add(OAuthState(
        state=state,
        user_id=user_id,
        company_id=company_id,
        expires_at=expires_at,
    ))
    await db.commit()

    params = {
        "client_id": settings.META_APP_ID,
        "redirect_uri": settings.META_REDIRECT_URI,
        "scope": ",".join(META_SCOPES),
        "response_type": "code",
        "state": state,
    }
    return f"https://www.facebook.com/dialog/oauth?{urlencode(params)}"


async def exchange_code(
    db: AsyncSession,
    code: str,
    state: str,
) -> MetaConnection:
    """
    1. Validate CSRF state.
    2. Exchange code for short-lived token.
    3. Upgrade to long-lived token.
    4. Fetch ad accounts and pages.
    5. Persist MetaConnection (one per ad account).
    """
    # Validate state
    result = await db.execute(
        select(OAuthState).where(OAuthState.state == state)
    )
    oauth_state = result.scalar_one_or_none()
    if not oauth_state:
        raise AppException(400, "Estado OAuth inválido o expirado.")
    if oauth_state.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        await db.delete(oauth_state)
        await db.commit()
        raise AppException(400, "Estado OAuth expirado. Inicia el proceso de conexión de nuevo.")

    company_id = oauth_state.company_id
    user_id = oauth_state.user_id

    await db.delete(oauth_state)
    await db.flush()

    async with httpx.AsyncClient(timeout=15) as client:
        # Exchange code → short-lived token
        token_res = await client.get(
            f"{GRAPH_BASE}/oauth/access_token",
            params={
                "client_id": settings.META_APP_ID,
                "client_secret": settings.META_APP_SECRET,
                "redirect_uri": settings.META_REDIRECT_URI,
                "code": code,
            },
        )
        token_res.raise_for_status()
        short_token = token_res.json().get("access_token")
        if not short_token:
            raise AppException(502, "No se recibió access_token de Meta.")

        # Upgrade to long-lived token (valid ~60 days)
        long_res = await client.get(
            f"{GRAPH_BASE}/oauth/access_token",
            params={
                "grant_type": "fb_exchange_token",
                "client_id": settings.META_APP_ID,
                "client_secret": settings.META_APP_SECRET,
                "fb_exchange_token": short_token,
            },
        )
        long_res.raise_for_status()
        long_data = long_res.json()
        long_token = long_data.get("access_token", short_token)
        expires_in = long_data.get("expires_in", 5183944)  # ~60 days default
        token_expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)

        # Fetch ad accounts
        accounts_res = await client.get(
            f"{GRAPH_BASE}/me/adaccounts",
            params={
                "access_token": long_token,
                "fields": "id,name,account_status,currency",
            },
        )
        accounts_res.raise_for_status()
        ad_accounts = accounts_res.json().get("data", [])

        # Fetch pages
        pages_res = await client.get(
            f"{GRAPH_BASE}/me/accounts",
            params={
                "access_token": long_token,
                "fields": "id,name,instagram_business_account",
            },
        )
        pages_res.raise_for_status()
        pages = pages_res.json().get("data", [])

    page = pages[0] if pages else None
    page_id = page["id"] if page else None
    page_name = page["name"] if page else None
    instagram_id = page.get("instagram_business_account", {}).get("id") if page else None

    first_connection = None

    for account in ad_accounts:
        raw_account_id = account["id"]
        ad_account_id = raw_account_id.replace("act_", "")

        # Upsert connection
        existing = await db.execute(
            select(MetaConnection).where(
                MetaConnection.company_id == company_id,
                MetaConnection.ad_account_id == ad_account_id,
            )
        )
        conn = existing.scalar_one_or_none()

        if conn:
            conn.access_token_enc = encrypt_value(long_token)
            conn.token_expires_at = token_expires_at
            conn.is_active = True
            conn.page_id = page_id
            conn.page_name = page_name
            conn.instagram_account_id = instagram_id
            conn.ad_account_name = account.get("name", "")
        else:
            conn = MetaConnection(
                company_id=company_id,
                ad_account_id=ad_account_id,
                ad_account_name=account.get("name", ""),
                page_id=page_id,
                page_name=page_name,
                instagram_account_id=instagram_id,
                access_token_enc=encrypt_value(long_token),
                token_expires_at=token_expires_at,
                is_active=True,
            )
            db.add(conn)

        if first_connection is None:
            first_connection = conn

    await db.commit()

    if first_connection is None:
        raise AppException(400, "No se encontraron cuentas publicitarias en esta cuenta de Meta.")

    await db.refresh(first_connection)
    return first_connection


# ── Connections list ──────────────────────────────────────────────────────────

async def list_connections(
    db: AsyncSession,
    company_id: uuid.UUID,
) -> list[MetaConnection]:
    result = await db.execute(
        select(MetaConnection)
        .where(MetaConnection.company_id == company_id)
        .order_by(MetaConnection.connected_at.desc())
    )
    return list(result.scalars().all())


async def disconnect(
    db: AsyncSession,
    connection_id: uuid.UUID,
    company_id: uuid.UUID,
) -> None:
    result = await db.execute(
        select(MetaConnection).where(
            MetaConnection.id == connection_id,
            MetaConnection.company_id == company_id,
        )
    )
    conn = result.scalar_one_or_none()
    if not conn:
        raise AppException(404, "Conexión no encontrada.")
    conn.is_active = False
    await db.commit()


# ── Webhook signature verification ───────────────────────────────────────────

def verify_webhook_signature(payload: bytes, x_hub_signature: str) -> bool:
    """Verify Meta webhook payload using HMAC-SHA256."""
    if not x_hub_signature.startswith("sha256="):
        return False
    expected = "sha256=" + hmac.new(
        key=settings.META_APP_SECRET.encode(),
        msg=payload,
        digestmod=hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, x_hub_signature)


# ── Lead form field parser ────────────────────────────────────────────────────

def parse_lead_fields(field_data: list[dict]) -> dict:
    """
    Convert Meta lead form field_data array to a flat dict.
    Standard fields: full_name, email, phone_number, company_name
    """
    mapping = {
        "full_name": "full_name",
        "email": "email",
        "phone_number": "phone",
        "phone": "phone",
        "company_name": "company_name",
        "company": "company_name",
    }
    result: dict = {}
    raw: dict = {}
    for field in field_data:
        key = field.get("name", "").lower()
        value = field.get("values", [""])[0] if field.get("values") else ""
        raw[key] = value
        mapped = mapping.get(key)
        if mapped:
            result[mapped] = value
    result["raw"] = raw
    return result


# ── Lead scoring ──────────────────────────────────────────────────────────────

def compute_lead_score(lead_data: dict) -> int:
    """Simple heuristic: +25 per filled field, max 100."""
    score = 0
    if lead_data.get("full_name"):
        score += 25
    if lead_data.get("email"):
        score += 25
    if lead_data.get("phone"):
        score += 25
    if lead_data.get("company_name"):
        score += 15
    if lead_data.get("raw") and len(lead_data["raw"]) > 4:
        score += 10
    return min(score, 100)


# ── Sync campaigns from Graph API ─────────────────────────────────────────────

async def fetch_campaigns_for_account(
    ad_account_id: str,
    access_token: str,
) -> list[dict]:
    """Fetch campaigns from Meta Graph API for a given ad account."""
    async with httpx.AsyncClient(timeout=20) as client:
        res = await client.get(
            f"{GRAPH_BASE}/act_{ad_account_id}/campaigns",
            params={
                "access_token": access_token,
                "fields": "id,name,status,objective,budget_remaining,spend_cap",
                "limit": 100,
            },
        )
        if res.status_code != 200:
            return []
        data = res.json().get("data", [])

        # Fetch insights (spend, impressions, clicks) separately
        insights_res = await client.get(
            f"{GRAPH_BASE}/act_{ad_account_id}/insights",
            params={
                "access_token": access_token,
                "fields": "campaign_id,spend,impressions,clicks",
                "level": "campaign",
                "date_preset": "lifetime",
                "limit": 100,
            },
        )
        insights_map: dict[str, dict] = {}
        if insights_res.status_code == 200:
            for ins in insights_res.json().get("data", []):
                insights_map[ins["campaign_id"]] = ins

        result = []
        for c in data:
            ins = insights_map.get(c["id"], {})
            spend = float(ins.get("spend", 0))
            leads = 0  # updated via webhook
            result.append({
                "meta_campaign_id": c["id"],
                "name": c.get("name", ""),
                "status": c.get("status", "ACTIVE"),
                "objective": c.get("objective", ""),
                "budget_remaining": float(c.get("budget_remaining") or 0) / 100,
                "spend": spend,
                "impressions": int(ins.get("impressions", 0)),
                "clicks": int(ins.get("clicks", 0)),
                "leads_count": leads,
                "cpl": round(spend / leads, 2) if leads > 0 else 0.0,
            })
        return result
