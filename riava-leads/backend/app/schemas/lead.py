from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel

LeadStatus = Literal["new", "contacted", "qualified", "proposal", "won", "lost"]


class LeadOut(BaseModel):
    id: UUID
    full_name: str
    email: str | None
    phone: str | None
    company_name: str
    status: LeadStatus
    score: int
    source_campaign: str
    assigned_to: UUID | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class LeadListResponse(BaseModel):
    items: list[LeadOut]
    total: int
    page: int
    size: int


class LeadStatusUpdate(BaseModel):
    status: LeadStatus


class LeadActivityOut(BaseModel):
    id: UUID
    type: str
    note: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
