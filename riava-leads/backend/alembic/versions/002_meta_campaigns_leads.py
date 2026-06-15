"""Meta connections, campaigns, leads, lead_activities

Revision ID: 002
Revises: 001
Create Date: 2026-06-12
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── ENUM types ────────────────────────────────────────────────────────────
    lead_status_enum = postgresql.ENUM(
        "new", "contacted", "qualified", "proposal", "won", "lost",
        name="lead_status_enum",
    )
    lead_status_enum.create(op.get_bind())

    campaign_status_enum = postgresql.ENUM(
        "ACTIVE", "PAUSED", "ARCHIVED", "DELETED",
        name="campaign_status_enum",
    )
    campaign_status_enum.create(op.get_bind())

    # ── meta_connections ──────────────────────────────────────────────────────
    op.create_table(
        "meta_connections",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("company_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("ad_account_id", sa.String(64), nullable=False),
        sa.Column("ad_account_name", sa.String(200), nullable=False, server_default=""),
        sa.Column("page_id", sa.String(64)),
        sa.Column("page_name", sa.String(200)),
        sa.Column("instagram_account_id", sa.String(64)),
        sa.Column("access_token_enc", sa.Text(), nullable=False),
        sa.Column("token_expires_at", sa.DateTime(timezone=True)),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("connected_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("last_sync_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("company_id", "ad_account_id", name="uq_meta_conn_company_account"),
    )
    op.create_index("ix_meta_connections_company_id", "meta_connections", ["company_id"])

    # ── campaigns ─────────────────────────────────────────────────────────────
    op.create_table(
        "campaigns",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("company_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("meta_connection_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("meta_connections.id", ondelete="SET NULL")),
        sa.Column("meta_campaign_id", sa.String(64), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("status", sa.Enum("ACTIVE", "PAUSED", "ARCHIVED", "DELETED", name="campaign_status_enum"), nullable=False, server_default="ACTIVE"),
        sa.Column("objective", sa.String(100), server_default=""),
        sa.Column("budget_remaining", sa.Numeric(14, 2), server_default="0"),
        sa.Column("spend", sa.Numeric(14, 2), server_default="0"),
        sa.Column("impressions", sa.BigInteger(), server_default="0"),
        sa.Column("clicks", sa.BigInteger(), server_default="0"),
        sa.Column("leads_count", sa.Integer(), server_default="0"),
        sa.Column("cpl", sa.Numeric(14, 2), server_default="0"),
        sa.Column("last_synced_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("company_id", "meta_campaign_id", name="uq_campaigns_company_meta"),
    )
    op.create_index("ix_campaigns_company_id", "campaigns", ["company_id"])
    op.create_index("ix_campaigns_status", "campaigns", ["status"])

    # ── leads ─────────────────────────────────────────────────────────────────
    op.create_table(
        "leads",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("company_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("campaign_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("campaigns.id", ondelete="SET NULL")),
        sa.Column("meta_lead_id", sa.String(64)),
        sa.Column("full_name", sa.String(255), nullable=False, server_default=""),
        sa.Column("email", sa.String(255)),
        sa.Column("phone", sa.String(50)),
        sa.Column("company_name", sa.String(200), server_default=""),
        sa.Column("status", sa.Enum("new", "contacted", "qualified", "proposal", "won", "lost", name="lead_status_enum"), nullable=False, server_default="new"),
        sa.Column("score", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("source_campaign", sa.String(255), server_default=""),
        sa.Column("assigned_to", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("raw_data", postgresql.JSONB(), server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_leads_company_id", "leads", ["company_id"])
    op.create_index("ix_leads_status", "leads", ["status"])
    op.create_index("ix_leads_campaign_id", "leads", ["campaign_id"])
    op.create_index("ix_leads_meta_lead_id", "leads", ["meta_lead_id"], unique=True)
    op.create_index("ix_leads_created_at", "leads", ["created_at"])

    # ── lead_activities ───────────────────────────────────────────────────────
    op.create_table(
        "lead_activities",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("lead_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("leads.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("type", sa.String(50), nullable=False),
        sa.Column("note", sa.Text()),
        sa.Column("metadata", postgresql.JSONB(), server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_lead_activities_lead_id", "lead_activities", ["lead_id"])
    op.create_index("ix_lead_activities_created_at", "lead_activities", ["created_at"])

    # ── oauth_states (CSRF protection for Meta OAuth) ─────────────────────────
    op.create_table(
        "oauth_states",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("state", sa.String(128), nullable=False, unique=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("company_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_oauth_states_state", "oauth_states", ["state"])


def downgrade() -> None:
    op.drop_table("oauth_states")
    op.drop_table("lead_activities")
    op.drop_table("leads")
    op.drop_table("campaigns")
    op.drop_table("meta_connections")
    op.execute("DROP TYPE IF EXISTS campaign_status_enum")
    op.execute("DROP TYPE IF EXISTS lead_status_enum")
