import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.role import Role, RoleEnum

pytestmark = pytest.mark.asyncio


# ── Helpers ───────────────────────────────────────────────────────────────────

async def _seed_roles(db: AsyncSession):
    """Insert the default roles that alembic seeds in production."""
    from sqlalchemy import select
    result = await db.execute(select(Role).where(Role.name == RoleEnum.company_admin.value))
    if not result.scalar_one_or_none():
        for role_name in RoleEnum:
            db.add(Role(name=role_name.value))
        await db.flush()


REGISTER_PAYLOAD = {
    "company_name": "Acme Corp",
    "name": "John",
    "last_name": "Doe",
    "email": "john@acme.com",
    "password": "Secret123",
}


# ── Register ──────────────────────────────────────────────────────────────────

async def test_register_creates_company_and_user(client: AsyncClient, db_session: AsyncSession):
    await _seed_roles(db_session)
    res = await client.post("/api/v1/auth/register", json=REGISTER_PAYLOAD)
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


async def test_register_duplicate_email_fails(client: AsyncClient, db_session: AsyncSession):
    await _seed_roles(db_session)
    await client.post("/api/v1/auth/register", json=REGISTER_PAYLOAD)
    res = await client.post("/api/v1/auth/register", json=REGISTER_PAYLOAD)
    assert res.status_code == 409


async def test_register_weak_password_fails(client: AsyncClient):
    payload = {**REGISTER_PAYLOAD, "email": "weak@test.com", "password": "simple"}
    res = await client.post("/api/v1/auth/register", json=payload)
    assert res.status_code == 422


# ── Login ─────────────────────────────────────────────────────────────────────

async def test_login_valid_credentials(client: AsyncClient, db_session: AsyncSession):
    await _seed_roles(db_session)
    await client.post("/api/v1/auth/register", json={**REGISTER_PAYLOAD, "email": "login@test.com"})
    res = await client.post("/api/v1/auth/login", json={"email": "login@test.com", "password": "Secret123"})
    assert res.status_code == 200
    assert "access_token" in res.json()


async def test_login_wrong_password_fails(client: AsyncClient, db_session: AsyncSession):
    await _seed_roles(db_session)
    await client.post("/api/v1/auth/register", json={**REGISTER_PAYLOAD, "email": "wrong@test.com"})
    res = await client.post("/api/v1/auth/login", json={"email": "wrong@test.com", "password": "WrongPass1"})
    assert res.status_code == 401


async def test_login_unknown_email_fails(client: AsyncClient):
    res = await client.post("/api/v1/auth/login", json={"email": "nobody@test.com", "password": "Secret123"})
    assert res.status_code == 401


# ── /me ───────────────────────────────────────────────────────────────────────

async def test_me_returns_user_profile(client: AsyncClient, db_session: AsyncSession):
    await _seed_roles(db_session)
    reg = await client.post("/api/v1/auth/register", json={**REGISTER_PAYLOAD, "email": "me@test.com"})
    token = reg.json()["access_token"]
    res = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == "me@test.com"
    assert "company_admin" in data["roles"]


async def test_me_without_token_fails(client: AsyncClient):
    res = await client.get("/api/v1/auth/me")
    assert res.status_code == 401


# ── Refresh ───────────────────────────────────────────────────────────────────

async def test_refresh_issues_new_tokens(client: AsyncClient, db_session: AsyncSession):
    await _seed_roles(db_session)
    reg = await client.post("/api/v1/auth/register", json={**REGISTER_PAYLOAD, "email": "refresh@test.com"})
    refresh_token = reg.json()["refresh_token"]
    res = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["refresh_token"] != refresh_token  # rotated


async def test_refresh_twice_with_same_token_fails(client: AsyncClient, db_session: AsyncSession):
    await _seed_roles(db_session)
    reg = await client.post("/api/v1/auth/register", json={**REGISTER_PAYLOAD, "email": "rotate@test.com"})
    refresh_token = reg.json()["refresh_token"]
    await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    res = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert res.status_code == 401


# ── Logout ────────────────────────────────────────────────────────────────────

async def test_logout_invalidates_refresh_token(client: AsyncClient, db_session: AsyncSession):
    await _seed_roles(db_session)
    reg = await client.post("/api/v1/auth/register", json={**REGISTER_PAYLOAD, "email": "logout@test.com"})
    tokens = reg.json()
    await client.post("/api/v1/auth/logout", json={"refresh_token": tokens["refresh_token"]})
    res = await client.post("/api/v1/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert res.status_code == 401
