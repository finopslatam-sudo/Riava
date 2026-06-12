import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr


class RoleOut(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None = None

    model_config = {"from_attributes": True}


class UserOut(BaseModel):
    id: uuid.UUID
    company_id: uuid.UUID
    email: EmailStr
    name: str
    last_name: str
    is_active: bool
    mfa_enabled: bool
    last_login: datetime | None = None
    created_at: datetime
    roles: list[str] = []

    model_config = {"from_attributes": True}


class UserUpdateRequest(BaseModel):
    name: str | None = None
    last_name: str | None = None
