from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class MetaConnectionOut(BaseModel):
    id: UUID
    ad_account_id: str
    ad_account_name: str
    page_id: str | None
    page_name: str | None
    instagram_account_id: str | None
    is_active: bool
    connected_at: datetime
    last_sync_at: datetime | None

    model_config = {"from_attributes": True}


class MetaOAuthUrlResponse(BaseModel):
    url: str


class MetaOAuthCallbackParams(BaseModel):
    code: str
    state: str


class MetaAdAccount(BaseModel):
    id: str
    name: str
    currency: str = ""
    account_status: int = 1


class MetaPage(BaseModel):
    id: str
    name: str
    access_token: str = ""
