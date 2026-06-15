from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import CurrentUser, get_db
from app.schemas.analytics import DashboardStats
from app.services.analytics_service import get_dashboard_stats

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
async def dashboard_stats(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    return await get_dashboard_stats(db=db, company_id=current_user.company_id)
