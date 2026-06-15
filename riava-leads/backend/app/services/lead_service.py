import uuid
from datetime import datetime, timezone

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException
from app.models.campaign import Campaign
from app.models.lead import Lead, LeadActivity
from app.schemas.lead import LeadListResponse, LeadOut


async def create_lead_from_webhook(
    db: AsyncSession,
    company_id: uuid.UUID,
    meta_lead_id: str,
    field_data: dict,
    campaign_meta_id: str | None,
    score: int,
) -> Lead:
    # Resolve campaign
    campaign_id = None
    source_campaign = ""
    if campaign_meta_id:
        result = await db.execute(
            select(Campaign).where(
                Campaign.company_id == company_id,
                Campaign.meta_campaign_id == campaign_meta_id,
            )
        )
        camp = result.scalar_one_or_none()
        if camp:
            campaign_id = camp.id
            source_campaign = camp.name
            camp.leads_count = (camp.leads_count or 0) + 1
            if camp.leads_count > 0 and float(camp.spend) > 0:
                camp.cpl = float(camp.spend) / camp.leads_count

    lead = Lead(
        company_id=company_id,
        campaign_id=campaign_id,
        meta_lead_id=meta_lead_id,
        full_name=field_data.get("full_name", ""),
        email=field_data.get("email"),
        phone=field_data.get("phone"),
        company_name=field_data.get("company_name", ""),
        status="new",
        score=score,
        source_campaign=source_campaign,
        raw_data=field_data.get("raw", {}),
    )
    db.add(lead)

    activity = LeadActivity(
        lead=lead,
        type="webhook_received",
        note="Lead recibido desde Meta Lead Ads",
        metadata_={"meta_lead_id": meta_lead_id},
    )
    db.add(activity)

    await db.commit()
    await db.refresh(lead)
    return lead


async def list_leads(
    db: AsyncSession,
    company_id: uuid.UUID,
    page: int = 1,
    size: int = 20,
    search: str | None = None,
    status: str | None = None,
) -> LeadListResponse:
    query = select(Lead).where(Lead.company_id == company_id)

    if search:
        term = f"%{search}%"
        query = query.where(
            or_(
                Lead.full_name.ilike(term),
                Lead.email.ilike(term),
                Lead.phone.ilike(term),
                Lead.company_name.ilike(term),
            )
        )
    if status:
        query = query.where(Lead.status == status)

    count_result = await db.execute(
        select(func.count()).select_from(query.subquery())
    )
    total = count_result.scalar_one()

    query = query.order_by(Lead.created_at.desc())
    query = query.offset((page - 1) * size).limit(size)
    result = await db.execute(query)
    leads = list(result.scalars().all())

    return LeadListResponse(
        items=[LeadOut.model_validate(l) for l in leads],
        total=total,
        page=page,
        size=size,
    )


async def get_lead(
    db: AsyncSession,
    lead_id: uuid.UUID,
    company_id: uuid.UUID,
) -> Lead:
    result = await db.execute(
        select(Lead).where(Lead.id == lead_id, Lead.company_id == company_id)
    )
    lead = result.scalar_one_or_none()
    if not lead:
        raise AppException(404, "Lead no encontrado.")
    return lead


async def update_lead_status(
    db: AsyncSession,
    lead_id: uuid.UUID,
    company_id: uuid.UUID,
    new_status: str,
    actor_id: uuid.UUID | None = None,
) -> Lead:
    lead = await get_lead(db, lead_id, company_id)
    old_status = lead.status
    lead.status = new_status
    lead.updated_at = datetime.now(timezone.utc)

    activity = LeadActivity(
        lead_id=lead.id,
        user_id=actor_id,
        type="status_changed",
        note=f"Estado cambiado de {old_status} a {new_status}",
        metadata_={"old": old_status, "new": new_status},
    )
    db.add(activity)
    await db.commit()
    await db.refresh(lead)
    return lead
