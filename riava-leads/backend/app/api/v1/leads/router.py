import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import CurrentUser, get_db
from app.schemas.lead import LeadListResponse, LeadOut, LeadStatusUpdate
from app.services import lead_service

router = APIRouter()


@router.get("", response_model=LeadListResponse)
async def list_leads(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    status: str | None = Query(None),
):
    return await lead_service.list_leads(
        db=db,
        company_id=current_user.company_id,
        page=page,
        size=size,
        search=search,
        status=status,
    )


@router.get("/{lead_id}", response_model=LeadOut)
async def get_lead(
    lead_id: uuid.UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    lead = await lead_service.get_lead(
        db=db, lead_id=lead_id, company_id=current_user.company_id
    )
    return lead


@router.patch("/{lead_id}/status", response_model=LeadOut)
async def update_lead_status(
    lead_id: uuid.UUID,
    body: LeadStatusUpdate,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    return await lead_service.update_lead_status(
        db=db,
        lead_id=lead_id,
        company_id=current_user.company_id,
        new_status=body.status,
        actor_id=current_user.id,
    )
