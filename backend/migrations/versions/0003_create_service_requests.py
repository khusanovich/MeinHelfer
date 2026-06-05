"""Create service_requests table

Revision ID: 0003
Revises: 0002
Create Date: 2026-06-05
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import ENUM as PgENUM, UUID

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "service_requests",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("reference_code", sa.String(16), nullable=False),

        sa.Column("service_type", PgENUM(name="service_type", create_type=False), nullable=False),
        sa.Column("helper_count", sa.SmallInteger(), nullable=False),
        sa.Column("scheduled_date", sa.Date(), nullable=False),
        sa.Column("scheduled_time", sa.Time(), nullable=False),

        # Address
        sa.Column("address_street", sa.String(255), nullable=False),
        sa.Column("address_city", sa.String(100), nullable=False),
        sa.Column("address_zip", sa.String(20), nullable=False),
        sa.Column("address_notes", sa.Text(), nullable=True),

        # Customer
        sa.Column("customer_name", sa.String(255), nullable=False),
        sa.Column("customer_email", sa.String(255), nullable=False),
        sa.Column("customer_phone", sa.String(50), nullable=True),

        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("status", PgENUM(name="request_status", create_type=False), nullable=False, server_default="pending"),
        sa.Column("admin_notes", sa.Text(), nullable=True),
        sa.Column("assigned_helper", sa.String(255), nullable=True),

        # AI fields
        sa.Column("estimated_price", sa.Numeric(10, 2), nullable=True),
        sa.Column("estimated_hours", sa.Numeric(4, 1), nullable=True),
        sa.Column("ai_summary", sa.Text(), nullable=True),
        sa.Column("ai_classified", sa.Boolean(), nullable=False, server_default=sa.false()),

        # Lifecycle timestamps
        sa.Column("confirmed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),

        # Constraints
        sa.CheckConstraint("helper_count BETWEEN 1 AND 10", name="chk_helper_count"),
    )

    op.create_index("ix_service_requests_reference_code", "service_requests", ["reference_code"], unique=True)
    op.create_index("ix_service_requests_status", "service_requests", ["status"])
    op.create_index("ix_service_requests_scheduled_date", "service_requests", ["scheduled_date"])
    op.create_index("ix_service_requests_created_at", "service_requests", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_service_requests_created_at", table_name="service_requests")
    op.drop_index("ix_service_requests_scheduled_date", table_name="service_requests")
    op.drop_index("ix_service_requests_status", table_name="service_requests")
    op.drop_index("ix_service_requests_reference_code", table_name="service_requests")
    op.drop_table("service_requests")
