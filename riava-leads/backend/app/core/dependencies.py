import uuid
from typing import Annotated

import redis.asyncio as aioredis
from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import ExpiredSignatureError, JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.exceptions import ForbiddenException, InvalidTokenException, TokenExpiredException
from app.core.security import decode_token
from app.db.session import get_db
from app.models.user import User
from app.models.role import UserRole, Role

bearer_scheme = HTTPBearer(auto_error=False)

# ── Redis pool (shared) ───────────────────────────────────────────────────────

_redis_pool: aioredis.Redis | None = None


async def get_redis() -> aioredis.Redis:
    global _redis_pool
    if _redis_pool is None:
        _redis_pool = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            max_connections=20,
        )
    return _redis_pool


# ── Token extraction ──────────────────────────────────────────────────────────

async def get_current_user(
    request: Request,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[aioredis.Redis, Depends(get_redis)],
) -> User:
    if not credentials:
        raise InvalidTokenException()

    token = credentials.credentials
    try:
        payload = decode_token(token)
    except ExpiredSignatureError:
        raise TokenExpiredException()
    except JWTError:
        raise InvalidTokenException()

    if payload.get("type") != "access":
        raise InvalidTokenException()

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise InvalidTokenException()

    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise InvalidTokenException()

    # Check token not blacklisted
    blacklisted = await redis.get(f"blacklist:access:{token[:16]}")
    if blacklisted:
        raise InvalidTokenException()

    result = await db.execute(
        select(User)
        .where(User.id == user_id, User.is_active == True)
        .options(selectinload(User.user_roles).selectinload(UserRole.role))
    )
    user = result.scalar_one_or_none()
    if not user:
        raise InvalidTokenException()

    # Attach decoded info to request.state for convenience
    request.state.user_id = str(user.id)
    request.state.company_id = str(user.company_id)

    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


# ── RBAC helper ───────────────────────────────────────────────────────────────

def require_roles(*allowed_roles: str):
    """
    Usage:
        @router.get("/admin", dependencies=[Depends(require_roles("company_admin", "super_admin"))])
    """
    async def checker(current_user: CurrentUser) -> User:
        user_role_names = {ur.role.name for ur in current_user.user_roles}
        if not user_role_names.intersection(set(allowed_roles)):
            raise ForbiddenException()
        return current_user

    return checker


def require_any_role(*allowed_roles: str):
    """Same as require_roles but returns the user for use as a typed dep."""
    async def checker(current_user: CurrentUser) -> User:
        user_role_names = {ur.role.name for ur in current_user.user_roles}
        if not user_role_names.intersection(set(allowed_roles)):
            raise ForbiddenException()
        return current_user
    return Annotated[User, Depends(checker)]
