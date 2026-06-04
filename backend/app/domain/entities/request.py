"""Pure domain entity — no ORM, no framework imports."""

import uuid
from dataclasses import dataclass
from datetime import date, datetime, time
from decimal import Decimal

from app.domain.enums import RequestStatus, ServiceType


@dataclass
class RequestEntity:
    id: uuid.UUID
    reference_code: str
    service_type: ServiceType
    helper_count: int
    scheduled_date: date
    scheduled_time: time
    address_street: str
    address_city: str
    address_zip: str
    customer_name: str
    customer_email: str
    description: str
    status: RequestStatus
    address_notes: str | None = None
    customer_phone: str | None = None
    admin_notes: str | None = None
    assigned_helper: str | None = None
    estimated_price: Decimal | None = None
    estimated_hours: Decimal | None = None
    ai_summary: str | None = None
    ai_classified: bool = False
    confirmed_at: datetime | None = None
    completed_at: datetime | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
