from datetime import datetime
from decimal import Decimal
from typing import Literal
from uuid import UUID

from pydantic import BaseModel

CampaignStatus = Literal["ACTIVE", "PAUSED", "ARCHIVED", "DELETED"]


class CampaignOut(BaseModel):
    id: UUID
    meta_campaign_id: str
    name: str
    status: CampaignStatus
    objective: str
    budget_remaining: Decimal
    spend: Decimal
    impressions: int
    clicks: int
    leads_count: int
    cpl: Decimal
    last_synced_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CampaignListResponse(BaseModel):
    items: list[CampaignOut]
    total: int
