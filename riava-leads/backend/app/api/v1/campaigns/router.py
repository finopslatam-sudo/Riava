import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import CurrentUser, get_db
from app.schemas.campaign import CampaignListResponse, CampaignOut
from app.services import campaign_service

router = APIRouter()


@router.get("", response_model=CampaignListResponse)
async def list_campaigns(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    campaigns = await campaign_service.list_campaigns(db=db, company_id=current_user.company_id)
    return CampaignListResponse(items=campaigns, total=len(campaigns))


@router.get("/{campaign_id}", response_model=CampaignOut)
async def get_campaign(
    campaign_id: uuid.UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    campaign = await campaign_service.get_campaign(
        db=db, campaign_id=campaign_id, company_id=current_user.company_id
    )
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaña no encontrada.")
    return campaign


@router.post("/sync", response_model=CampaignListResponse)
async def sync_campaigns(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Trigger manual sync from Meta Ads API."""
    campaigns = await campaign_service.sync_campaigns(db=db, company_id=current_user.company_id)
    return CampaignListResponse(items=campaigns, total=len(campaigns))
