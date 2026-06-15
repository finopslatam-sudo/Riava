import uuid
from datetime import date, datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.campaign import Campaign
from app.models.lead import Lead
from app.schemas.analytics import DashboardStats


async def get_dashboard_stats(
    db: AsyncSession,
    company_id: uuid.UUID,
) -> DashboardStats:
    today = date.today()
    month_start = today.replace(day=1)

    # Total leads
    total_res = await db.execute(
        select(func.count(Lead.id)).where(Lead.company_id == company_id)
    )
    total_leads = total_res.scalar_one() or 0

    # New leads today
    today_start = datetime(today.year, today.month, today.day, tzinfo=timezone.utc)
    new_today_res = await db.execute(
        select(func.count(Lead.id)).where(
            Lead.company_id == company_id,
            Lead.created_at >= today_start,
        )
    )
    new_leads_today = new_today_res.scalar_one() or 0

    # Leads this month
    month_start_dt = datetime(month_start.year, month_start.month, month_start.day, tzinfo=timezone.utc)
    month_res = await db.execute(
        select(func.count(Lead.id)).where(
            Lead.company_id == company_id,
            Lead.created_at >= month_start_dt,
        )
    )
    leads_this_month = month_res.scalar_one() or 0

    # Won leads (for conversion rate)
    won_res = await db.execute(
        select(func.count(Lead.id)).where(
            Lead.company_id == company_id,
            Lead.status == "won",
        )
    )
    won_leads = won_res.scalar_one() or 0
    conversion_rate = round((won_leads / total_leads * 100), 1) if total_leads > 0 else 0.0

    # Average score
    avg_res = await db.execute(
        select(func.avg(Lead.score)).where(Lead.company_id == company_id)
    )
    avg_score = float(avg_res.scalar_one() or 0)

    # Active campaigns
    active_res = await db.execute(
        select(func.count(Campaign.id)).where(
            Campaign.company_id == company_id,
            Campaign.status == "ACTIVE",
        )
    )
    active_campaigns = active_res.scalar_one() or 0

    # Total spend and CPL
    spend_res = await db.execute(
        select(func.sum(Campaign.spend)).where(Campaign.company_id == company_id)
    )
    total_spend = float(spend_res.scalar_one() or 0)
    cpl = round(total_spend / total_leads, 2) if total_leads > 0 else 0.0

    return DashboardStats(
        total_leads=total_leads,
        new_leads_today=new_leads_today,
        leads_this_month=leads_this_month,
        conversion_rate=conversion_rate,
        avg_score=round(avg_score, 1),
        active_campaigns=active_campaigns,
        total_spend=total_spend,
        cpl=cpl,
    )
