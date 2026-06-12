from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import CurrentUser, get_db, require_roles
from app.schemas.user import UserOut, UserUpdateRequest

router = APIRouter()


@router.get("/me", response_model=UserOut, summary="Alias for /auth/me")
async def get_me(current_user: CurrentUser):
    return UserOut(
        id=current_user.id,
        company_id=current_user.company_id,
        email=current_user.email,
        name=current_user.name,
        last_name=current_user.last_name,
        is_active=current_user.is_active,
        mfa_enabled=current_user.mfa_enabled,
        last_login=current_user.last_login,
        created_at=current_user.created_at,
        roles=current_user.get_role_names(),
    )


@router.patch("/me", response_model=UserOut, summary="Update own profile")
async def update_me(
    payload: UserUpdateRequest,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    if payload.name is not None:
        current_user.name = payload.name
    if payload.last_name is not None:
        current_user.last_name = payload.last_name
    await db.flush()
    return UserOut(
        id=current_user.id,
        company_id=current_user.company_id,
        email=current_user.email,
        name=current_user.name,
        last_name=current_user.last_name,
        is_active=current_user.is_active,
        mfa_enabled=current_user.mfa_enabled,
        last_login=current_user.last_login,
        created_at=current_user.created_at,
        roles=current_user.get_role_names(),
    )
