import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class MetaConnection(Base):
    __tablename__ = "meta_connections"
    __table_args__ = (
        UniqueConstraint("company_id", "ad_account_id", name="uq_meta_conn_company_account"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    ad_account_id: Mapped[str] = mapped_column(String(64), nullable=False)
    ad_account_name: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    page_id: Mapped[str | None] = mapped_column(String(64))
    page_name: Mapped[str | None] = mapped_column(String(200))
    instagram_account_id: Mapped[str | None] = mapped_column(String(64))
    access_token_enc: Mapped[str] = mapped_column(Text(), nullable=False)
    token_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=True)
    connected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_sync_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    company: Mapped["Company"] = relationship("Company", back_populates="meta_connections")  # noqa: F821
    campaigns: Mapped[list["Campaign"]] = relationship("Campaign", back_populates="meta_connection")  # noqa: F821
