"""
Meta Webhooks endpoint.

Verification (GET):  Meta sends hub.challenge to verify the endpoint.
Lead events (POST):  Meta sends leadgen events when a user fills a form.

Security: HMAC-SHA256 signature verified before processing.
"""
import logging

from fastapi import APIRouter, Header, HTTPException, Query, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from app.core.config import settings
from app.core.dependencies import get_db
from app.models.meta_connection import MetaConnection
from app.services.meta_service import (
    compute_lead_score,
    parse_lead_fields,
    verify_webhook_signature,
)
from app.services.lead_service import create_lead_from_webhook

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/meta")
async def verify_webhook(
    hub_mode: str = Query(alias="hub.mode", default=""),
    hub_challenge: str = Query(alias="hub.challenge", default=""),
    hub_verify_token: str = Query(alias="hub.verify_token", default=""),
):
    """Meta webhook verification handshake."""
    if hub_mode == "subscribe" and hub_verify_token == settings.META_VERIFY_TOKEN:
        return int(hub_challenge)
    raise HTTPException(status_code=403, detail="Token de verificación inválido.")


@router.post("/meta", status_code=200)
async def receive_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    x_hub_signature_256: str = Header(default="", alias="X-Hub-Signature-256"),
):
    """Receive and process Meta lead events."""
    body = await request.body()

    if settings.META_APP_SECRET and not verify_webhook_signature(body, x_hub_signature_256):
        logger.warning("Invalid webhook signature — rejected")
        raise HTTPException(status_code=401, detail="Firma de webhook inválida.")

    payload = await request.json()
    logger.info("Meta webhook received: %s", payload.get("object"))

    if payload.get("object") != "page":
        return {"status": "ignored"}

    for entry in payload.get("entry", []):
        for change in entry.get("changes", []):
            if change.get("field") != "leadgen":
                continue

            value = change.get("value", {})
            meta_lead_id = str(value.get("leadgen_id", ""))
            page_id = str(value.get("page_id", ""))
            campaign_meta_id = str(value.get("campaign_id", "")) or None

            if not meta_lead_id:
                continue

            # Find company owning this page
            conn_result = await db.execute(
                select(MetaConnection).where(
                    MetaConnection.page_id == page_id,
                    MetaConnection.is_active == True,
                )
            )
            conn = conn_result.scalar_one_or_none()
            if not conn:
                logger.warning("No active connection for page_id=%s", page_id)
                continue

            # The webhook payload includes field_data directly in some versions
            field_data_raw = value.get("field_data", [])
            parsed = parse_lead_fields(field_data_raw)
            score = compute_lead_score(parsed)

            try:
                lead = await create_lead_from_webhook(
                    db=db,
                    company_id=conn.company_id,
                    meta_lead_id=meta_lead_id,
                    field_data=parsed,
                    campaign_meta_id=campaign_meta_id,
                    score=score,
                )
                logger.info("Lead created: %s (score=%d)", lead.id, score)
            except Exception as exc:
                logger.error("Error creating lead meta_lead_id=%s: %s", meta_lead_id, exc)

    return {"status": "ok"}
