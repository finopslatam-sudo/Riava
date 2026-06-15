import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import BigInteger, DateTime, Enum, ForeignKey, Integer, Numeric, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

CampaignStatusEnum = Enum("ACTIVE", "PAUSED", "ARCHIVED", "DELETED", name="campaign_status_enum")


class Campaign(Base):
    __tablename__ = "campaigns"
    __table_args__ = (
        UniqueConstraint("company_id", "meta_campaign_id", name="uq_campaigns_company_meta"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    meta_connection_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("meta_connections.id", ondelete="SET NULL"))
    meta_campaign_id: Mapped[str] = mapped_column(String(64), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(CampaignStatusEnum, nullable=False, default="ACTIVE")
    objective: Mapped[str] = mapped_column(String(100), default="")
    budget_remaining: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=Decimal("0"))
    spend: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=Decimal("0"))
    impressions: Mapped[int] = mapped_column(BigInteger(), default=0)
    clicks: Mapped[int] = mapped_column(BigInteger(), default=0)
    leads_count: Mapped[int] = mapped_column(Integer(), default=0)
    cpl: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=Decimal("0"))
    last_synced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    company: Mapped["Company"] = relationship("Company", back_populates="campaigns")  # noqa: F821
    meta_connection: Mapped["MetaConnection"] = relationship("MetaConnection", back_populates="campaigns")  # noqa: F821
    leads: Mapped[list["Lead"]] = relationship("Lead", back_populates="campaign")  # noqa: F821
