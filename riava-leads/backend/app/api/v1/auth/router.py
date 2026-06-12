from typing import Annotated

import redis.asyncio as aioredis
from fastapi import APIRouter, Depends, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.dependencies import CurrentUser, get_db, get_redis
from app.schemas.auth import (
    LoginRequest,
    MFASetupResponse,
    MFAVerifyRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
)
from app.schemas.common import MessageResponse
from app.schemas.user import UserOut
from app.services import auth_service

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=201,
    summary="Register a new company and admin user",
)
@limiter.limit(f"{settings.AUTH_RATE_LIMIT_PER_MINUTE}/minute")
async def register(
    request: Request,
    payload: RegisterRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[aioredis.Redis, Depends(get_redis)],
):
    user, company = await auth_service.register_user(db, payload)
    return await auth_service.login_user(
        db,
        redis,
        LoginRequest(email=payload.email, password=payload.password),
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate and receive JWT tokens",
)
@limiter.limit(f"{settings.AUTH_RATE_LIMIT_PER_MINUTE}/minute")
async def login(
    request: Request,
    payload: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[aioredis.Redis, Depends(get_redis)],
):
    return await auth_service.login_user(db, redis, payload)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Rotate refresh token and get new access token",
)
async def refresh(
    payload: RefreshRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[aioredis.Redis, Depends(get_redis)],
):
    return await auth_service.refresh_access_token(db, redis, payload.refresh_token)


@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Revoke refresh token",
)
async def logout(
    payload: RefreshRequest,
    redis: Annotated[aioredis.Redis, Depends(get_redis)],
):
    await auth_service.logout_user(redis, payload.refresh_token)
    return MessageResponse(message="Logged out successfully")


@router.get(
    "/me",
    response_model=UserOut,
    summary="Get current authenticated user",
)
async def me(current_user: CurrentUser):
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


@router.post(
    "/mfa/setup",
    response_model=MFASetupResponse,
    summary="Begin MFA setup — returns TOTP secret and QR URI",
)
async def mfa_setup(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    data = await auth_service.setup_mfa(db, current_user)
    return MFASetupResponse(**data)


@router.post(
    "/mfa/verify",
    response_model=MessageResponse,
    summary="Confirm TOTP code to activate MFA",
)
async def mfa_verify(
    payload: MFAVerifyRequest,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    await auth_service.verify_mfa(db, current_user, payload.code)
    return MessageResponse(message="MFA enabled successfully")


@router.post(
    "/mfa/disable",
    response_model=MessageResponse,
    summary="Disable MFA — requires valid TOTP code to confirm",
)
async def mfa_disable(
    payload: MFAVerifyRequest,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    await auth_service.disable_mfa(db, current_user, payload.code)
    return MessageResponse(message="MFA disabled successfully")
