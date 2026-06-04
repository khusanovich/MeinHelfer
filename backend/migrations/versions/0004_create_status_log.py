"""Create request_status_log table

Revision ID: 0004
Revises: 0003
Create Date: 2026-06-05
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision: str = "0004"
down_revision: Union[str, None] = "0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "request_status_log",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column(
            "request_id",
            UUID(as_uuid=True),
            sa.ForeignKey("service_requests.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("old_status", sa.Enum(name="request_status", create_constraint=False), nullable=True),
        sa.Column("new_status", sa.Enum(name="request_status", create_constraint=False), nullable=False),
        sa.Column(
            "changed_by",
            UUID(as_uuid=True),
            sa.ForeignKey("admins.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_status_log_request_id", "request_status_log", ["request_id"])


def downgrade() -> None:
    op.drop_index("ix_status_log_request_id", table_name="request_status_log")
    op.drop_table("request_status_log")
