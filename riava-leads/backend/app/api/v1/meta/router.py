import uuid

from fastapi import APIRouter, Depends, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import CurrentUser, get_db
from app.schemas.meta import MetaConnectionOut, MetaOAuthUrlResponse
from app.services import meta_service

router = APIRouter()


@router.get("/oauth/url", response_model=MetaOAuthUrlResponse)
async def get_oauth_url(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    url = await meta_service.generate_oauth_url(
        db=db,
        user_id=current_user.id,
        company_id=current_user.company_id,
    )
    return MetaOAuthUrlResponse(url=url)


@router.get("/oauth/callback")
async def oauth_callback(
    code: str = Query(...),
    state: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Meta redirects here after user grants permission.
    We exchange the code, save the connection, and redirect to the frontend.
    """
    await meta_service.exchange_code(db=db, code=code, state=state)
    return RedirectResponse(url="/dashboard/meta-ads?connected=1")


@router.get("/connections", response_model=list[MetaConnectionOut])
async def list_connections(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    return await meta_service.list_connections(
        db=db,
        company_id=current_user.company_id,
    )


@router.delete("/connections/{connection_id}", status_code=204)
async def disconnect(
    connection_id: uuid.UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    await meta_service.disconnect(
        db=db,
        connection_id=connection_id,
        company_id=current_user.company_id,
    )
