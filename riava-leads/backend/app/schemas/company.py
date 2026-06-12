import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.company import PlanEnum


class CompanyOut(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    plan: PlanEnum
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class CompanyUpdateRequest(BaseModel):
    name: str | None = None
