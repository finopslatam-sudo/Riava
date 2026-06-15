import uuid
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decrypt_value
from app.models.campaign import Campaign
from app.models.meta_connection import MetaConnection
from app.services.meta_service import fetch_campaigns_for_account


async def sync_campaigns(
    db: AsyncSession,
    company_id: uuid.UUID,
) -> list[Campaign]:
    """Pull campaigns from all active Meta connections and upsert into DB."""
    conns_result = await db.execute(
        select(MetaConnection).where(
            MetaConnection.company_id == company_id,
            MetaConnection.is_active == True,
        )
    )
    connections = list(conns_result.scalars().all())

    synced: list[Campaign] = []
    for conn in connections:
        try:
            token = decrypt_value(conn.access_token_enc)
        except Exception:
            continue

        raw_campaigns = await fetch_campaigns_for_account(conn.ad_account_id, token)
        for raw in raw_campaigns:
            existing = await db.execute(
                select(Campaign).where(
                    Campaign.company_id == company_id,
                    Campaign.meta_campaign_id == raw["meta_campaign_id"],
                )
            )
            campaign = existing.scalar_one_or_none()
            if campaign:
                campaign.name = raw["name"]
                campaign.status = raw["status"]
                campaign.objective = raw["objective"]
                campaign.budget_remaining = raw["budget_remaining"]
                campaign.spend = raw["spend"]
                campaign.impressions = raw["impressions"]
                campaign.clicks = raw["clicks"]
                campaign.last_synced_at = datetime.now(timezone.utc)
            else:
                campaign = Campaign(
                    company_id=company_id,
                    meta_connection_id=conn.id,
                    meta_campaign_id=raw["meta_campaign_id"],
                    name=raw["name"],
                    status=raw["status"],
                    objective=raw["objective"],
                    budget_remaining=raw["budget_remaining"],
                    spend=raw["spend"],
                    impressions=raw["impressions"],
                    clicks=raw["clicks"],
                    leads_count=raw["leads_count"],
                    cpl=raw["cpl"],
                    last_synced_at=datetime.now(timezone.utc),
                )
                db.add(campaign)
            synced.append(campaign)

        conn.last_sync_at = datetime.now(timezone.utc)

    await db.commit()
    for c in synced:
        await db.refresh(c)
    return synced


async def list_campaigns(
    db: AsyncSession,
    company_id: uuid.UUID,
) -> list[Campaign]:
    result = await db.execute(
        select(Campaign)
        .where(Campaign.company_id == company_id)
        .order_by(Campaign.created_at.desc())
    )
    return list(result.scalars().all())


async def get_campaign(
    db: AsyncSession,
    campaign_id: uuid.UUID,
    company_id: uuid.UUID,
) -> Campaign | None:
    result = await db.execute(
        select(Campaign).where(
            Campaign.id == campaign_id,
            Campaign.company_id == company_id,
        )
    )
    return result.scalar_one_or_none()
