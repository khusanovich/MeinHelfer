"""Domain events — AI integration hooks.

Each event is a pure dataclass with no framework dependencies.
In MVP these are created but not dispatched to any bus.
Future: publish to an event bus (Redis Streams / RabbitMQ) for AI consumers.
"""

import uuid
from dataclasses import dataclass, field
from datetime import date, datetime, time, timezone

from app.domain.enums import RequestStatus, ServiceType


@dataclass(frozen=True)
class DomainEvent:
    event_id: uuid.UUID = field(default_factory=uuid.uuid4)
    occurred_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass(frozen=True)
class RequestCreatedEvent(DomainEvent):
    """Fired when a customer submits a new service request."""

    request_id: uuid.UUID = field(default_factory=uuid.uuid4)
    reference_code: str = ""
    service_type: ServiceType = ServiceType.GENERAL
    helper_count: int = 1
    scheduled_date: date = field(default_factory=date.today)
    scheduled_time: time = field(default_factory=lambda: time(9, 0))
    description: str = ""
    customer_email: str = ""

    # AI hook: classify → estimate duration/price → generate summary


@dataclass(frozen=True)
class RequestStatusChangedEvent(DomainEvent):
    """Fired when an admin changes a request's status."""

    request_id: uuid.UUID = field(default_factory=uuid.uuid4)
    reference_code: str = ""
    old_status: RequestStatus = RequestStatus.PENDING
    new_status: RequestStatus = RequestStatus.CONFIRMED
    changed_by_admin_id: uuid.UUID | None = None
    customer_email: str = ""

    # AI hook: trigger summary re-generation, helper recommendation


@dataclass(frozen=True)
class RequestAssignedEvent(DomainEvent):
    """Fired when a helper is assigned to a request."""

    request_id: uuid.UUID = field(default_factory=uuid.uuid4)
    reference_code: str = ""
    assigned_helper: str = ""
    customer_email: str = ""
