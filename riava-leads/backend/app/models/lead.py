import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

LeadStatusEnum = Enum("new", "contacted", "qualified", "proposal", "won", "lost", name="lead_status_enum")


class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    campaign_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("campaigns.id", ondelete="SET NULL"))
    meta_lead_id: Mapped[str | None] = mapped_column(String(64), unique=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    email: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(50))
    company_name: Mapped[str] = mapped_column(String(200), default="")
    status: Mapped[str] = mapped_column(LeadStatusEnum, nullable=False, default="new")
    score: Mapped[int] = mapped_column(Integer(), nullable=False, default=0)
    source_campaign: Mapped[str] = mapped_column(String(255), default="")
    assigned_to: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    raw_data: Mapped[dict] = mapped_column(JSONB(), default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    company: Mapped["Company"] = relationship("Company", back_populates="leads")  # noqa: F821
    campaign: Mapped["Campaign"] = relationship("Campaign", back_populates="leads")  # noqa: F821
    assigned_user: Mapped["User"] = relationship("User", foreign_keys=[assigned_to])  # noqa: F821
    activities: Mapped[list["LeadActivity"]] = relationship("LeadActivity", back_populates="lead", cascade="all, delete-orphan")


class LeadActivity(Base):
    __tablename__ = "lead_activities"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lead_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    note: Mapped[str | None] = mapped_column()
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB(), default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    lead: Mapped["Lead"] = relationship("Lead", back_populates="activities")  # noqa: F821
