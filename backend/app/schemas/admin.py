import uuid
from datetime import date, datetime, time
from decimal import Decimal

from pydantic import BaseModel, Field

from app.domain.enums import RequestStatus, ServiceType


# ── Request list item (compact) ───────────────────────────────────────────────

class AdminRequestListItem(BaseModel):
    id: uuid.UUID
    reference_code: str
    service_type: ServiceType
    helper_count: int
    scheduled_date: date
    scheduled_time: time
    customer_name: str
    customer_email: str
    status: RequestStatus
    assigned_helper: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Status log entry ──────────────────────────────────────────────────────────

class StatusLogEntry(BaseModel):
    old_status: RequestStatus | None
    new_status: RequestStatus
    note: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Request detail (full) ─────────────────────────────────────────────────────

class AddressDetail(BaseModel):
    street: str
    city: str
    zip: str
    notes: str | None


class CustomerDetail(BaseModel):
    name: str
    email: str
    phone: str | None


class AdminRequestDetail(BaseModel):
    id: uuid.UUID
    reference_code: str
    service_type: ServiceType
    helper_count: int
    scheduled_date: date
    scheduled_time: time
    address: AddressDetail
    customer: CustomerDetail
    description: str
    status: RequestStatus
    assigned_helper: str | None
    admin_notes: str | None
    estimated_price: Decimal | None
    estimated_hours: Decimal | None
    ai_summary: str | None
    status_history: list[StatusLogEntry]
    confirmed_at: datetime | None
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Update request ────────────────────────────────────────────────────────────

class UpdateRequestSchema(BaseModel):
    status: RequestStatus | None = None
    assigned_helper: str | None = Field(None, max_length=255)
    admin_notes: str | None = Field(None, max_length=5000)
    estimated_price: Decimal | None = Field(None, ge=0, decimal_places=2)
    estimated_hours: Decimal | None = Field(None, ge=0, decimal_places=1)


# ── Dashboard ─────────────────────────────────────────────────────────────────

class OverviewStats(BaseModel):
    total_requests: int
    pending: int
    confirmed: int
    in_progress: int
    completed: int
    cancelled: int


class WeekStats(BaseModel):
    new_requests: int
    completed: int


class UpcomingRequest(BaseModel):
    reference_code: str
    service_type: ServiceType
    scheduled_date: date
    scheduled_time: time
    customer_name: str
    status: RequestStatus


class DashboardResponse(BaseModel):
    overview: OverviewStats
    this_week: WeekStats
    by_service_type: dict[str, int]
    upcoming_scheduled: list[UpcomingRequest]
