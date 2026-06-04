"""Create PostgreSQL ENUM types

Revision ID: 0001
Revises:
Create Date: 2026-06-05
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

service_type_enum = sa.Enum(
    "moving", "assembly", "loading", "cleaning", "gardening", "general",
    name="service_type",
)
request_status_enum = sa.Enum(
    "pending", "confirmed", "in_progress", "completed", "cancelled",
    name="request_status",
)


def upgrade() -> None:
    service_type_enum.create(op.get_bind(), checkfirst=True)
    request_status_enum.create(op.get_bind(), checkfirst=True)


def downgrade() -> None:
    request_status_enum.drop(op.get_bind(), checkfirst=True)
    service_type_enum.drop(op.get_bind(), checkfirst=True)
