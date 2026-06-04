"""Pure domain entity — no ORM, no framework imports."""

import uuid
from dataclasses import dataclass
from datetime import datetime


@dataclass
class AdminEntity:
    id: uuid.UUID
    email: str
    full_name: str
    is_active: bool
    hashed_password: str
    last_login_at: datetime | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
