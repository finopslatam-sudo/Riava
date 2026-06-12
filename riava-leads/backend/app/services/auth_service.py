import uuid
from datetime import datetime, timezone, timedelta

import pyotp
import redis.asyncio as aioredis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.exceptions import (
    BadRequestException,
    ConflictException,
    InvalidTokenException,
    NotFoundException,
    UnauthorizedException,
)
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decrypt_value,
    hash_password,
    verify_password,
)
from app.models.company import Company
from app.models.role import Role, RoleEnum, UserRole
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserOut
from app.services.company_service import create_company

_ACCESS_TTL = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
_REFRESH_TTL = settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400


# ── Register ──────────────────────────────────────────────────────────────────

async def register_user(
    db: AsyncSession,
    payload: RegisterRequest,
) -> tuple[User, Company]:
    # Email uniqueness check
    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none():
        raise ConflictException("Email already registered")

    company = await create_company(db, payload.company_name)

    user = User(
        company_id=company.id,
        email=payload.email,
        password_hash=hash_password(payload.password),
        name=payload.name,
        last_name=payload.last_name,
    )
    db.add(user)
    await db.flush()

    # Assign company_admin role
    role_result = await db.execute(
        select(Role).where(Role.name == RoleEnum.company_admin.value)
    )
    role = role_result.scalar_one_or_none()
    if role:
        db.add(UserRole(user_id=user.id, role_id=role.id))

    await db.flush()

    # Reload with roles
    result = await db.execute(
        select(User)
        .where(User.id == user.id)
        .options(selectinload(User.user_roles).selectinload(UserRole.role))
    )
    user = result.scalar_one()
    return user, company


# ── Login ─────────────────────────────────────────────────────────────────────

async def login_user(
    db: AsyncSession,
    redis: aioredis.Redis,
    payload: LoginRequest,
) -> TokenResponse:
    result = await db.execute(
        select(User)
        .where(User.email == payload.email, User.is_active == True)
        .options(selectinload(User.user_roles).selectinload(UserRole.role))
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.password_hash):
        raise UnauthorizedException("Invalid email or password")

    # MFA check
    if user.mfa_enabled:
        if not payload.mfa_code:
            raise BadRequestException("MFA code required")
        totp = pyotp.TOTP(user.mfa_secret)
        if not totp.verify(payload.mfa_code, valid_window=1):
            raise UnauthorizedException("Invalid MFA code")

    roles = user.get_role_names()
    access_token = create_access_token(
        user_id=str(user.id),
        company_id=str(user.company_id),
        roles=roles,
    )
    refresh_token, jti = create_refresh_token(str(user.id))

    # Store refresh JTI in Redis
    await redis.setex(f"refresh:{jti}", _REFRESH_TTL, str(user.id))

    # Update last login
    user.last_login = datetime.now(timezone.utc)
    await db.flush()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=_ACCESS_TTL,
    )


# ── Refresh ───────────────────────────────────────────────────────────────────

async def refresh_access_token(
    db: AsyncSession,
    redis: aioredis.Redis,
    refresh_token: str,
) -> TokenResponse:
    from jose import ExpiredSignatureError, JWTError
    from app.core.security import decode_token

    try:
        payload = decode_token(refresh_token)
    except ExpiredSignatureError:
        raise InvalidTokenException()
    except JWTError:
        raise InvalidTokenException()

    if payload.get("type") != "refresh":
        raise InvalidTokenException()

    jti = payload.get("jti")
    user_id_str = payload.get("sub")
    if not jti or not user_id_str:
        raise InvalidTokenException()

    # Verify JTI exists (not logged out)
    stored = await redis.get(f"refresh:{jti}")
    if not stored:
        raise InvalidTokenException()

    user_id = uuid.UUID(user_id_str)
    result = await db.execute(
        select(User)
        .where(User.id == user_id, User.is_active == True)
        .options(selectinload(User.user_roles).selectinload(UserRole.role))
    )
    user = result.scalar_one_or_none()
    if not user:
        raise InvalidTokenException()

    # Rotate: revoke old, issue new
    await redis.delete(f"refresh:{jti}")
    roles = user.get_role_names()
    new_access = create_access_token(str(user.id), str(user.company_id), roles)
    new_refresh, new_jti = create_refresh_token(str(user.id))
    await redis.setex(f"refresh:{new_jti}", _REFRESH_TTL, str(user.id))

    return TokenResponse(
        access_token=new_access,
        refresh_token=new_refresh,
        expires_in=_ACCESS_TTL,
    )


# ── Logout ────────────────────────────────────────────────────────────────────

async def logout_user(redis: aioredis.Redis, refresh_token: str) -> None:
    from jose import JWTError
    from app.core.security import decode_token

    try:
        payload = decode_token(refresh_token)
        jti = payload.get("jti")
        if jti:
            await redis.delete(f"refresh:{jti}")
    except JWTError:
        pass  # Already invalid — treat as successful logout


# ── MFA ───────────────────────────────────────────────────────────────────────

async def setup_mfa(db: AsyncSession, user: User) -> dict:
    if user.mfa_enabled:
        raise BadRequestException("MFA already enabled")

    secret = pyotp.random_base32()
    totp = pyotp.TOTP(secret)
    provisioning_uri = totp.provisioning_uri(
        name=user.email,
        issuer_name="Riava Leads",
    )

    # Store secret (not yet enabled — only enabled after verify)
    user.mfa_secret = secret
    await db.flush()

    return {
        "secret": secret,
        "provisioning_uri": provisioning_uri,
        "qr_code_url": f"https://api.qrserver.com/v1/create-qr-code/?size=200x200&data={provisioning_uri}",
    }


async def verify_mfa(db: AsyncSession, user: User, code: str) -> None:
    if not user.mfa_secret:
        raise BadRequestException("MFA setup not started")
    if user.mfa_enabled:
        raise BadRequestException("MFA already active")

    totp = pyotp.TOTP(user.mfa_secret)
    if not totp.verify(code, valid_window=1):
        raise UnauthorizedException("Invalid MFA code")

    user.mfa_enabled = True
    await db.flush()


async def disable_mfa(db: AsyncSession, user: User, code: str) -> None:
    if not user.mfa_enabled:
        raise BadRequestException("MFA not enabled")

    totp = pyotp.TOTP(user.mfa_secret)
    if not totp.verify(code, valid_window=1):
        raise UnauthorizedException("Invalid MFA code")

    user.mfa_enabled = False
    user.mfa_secret = None
    await db.flush()
