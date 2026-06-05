import uuid
from datetime import date, datetime, time
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Index,
    Numeric,
    SmallInteger,
    String,
    Text,
    Time,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.domain.enums import RequestStatus, ServiceType
from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ServiceRequest(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "service_requests"

    __table_args__ = (
        Index("ix_service_requests_status", "status"),
        Index("ix_service_requests_scheduled_date", "scheduled_date"),
        Index("ix_service_requests_created_at", "created_at"),
        Index("ix_service_requests_reference_code", "reference_code"),
    )

    reference_code: Mapped[str] = mapped_column(
        String(16), unique=True, nullable=False
    )
    service_type: Mapped[ServiceType] = mapped_column(
        SAEnum(ServiceType, name="service_type", create_type=False, create_constraint=False),
        nullable=False,
    )
    helper_count: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    scheduled_date: Mapped[date] = mapped_column(Date, nullable=False)
    scheduled_time: Mapped[time] = mapped_column(Time, nullable=False)

    # Address
    address_street: Mapped[str] = mapped_column(String(255), nullable=False)
    address_city: Mapped[str] = mapped_column(String(100), nullable=False)
    address_zip: Mapped[str] = mapped_column(String(20), nullable=False)
    address_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Customer
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    customer_email: Mapped[str] = mapped_column(String(255), nullable=False)
    customer_phone: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Request details
    description: Mapped[str] = mapped_column(Text, nullable=False)

    # Status
    status: Mapped[RequestStatus] = mapped_column(
        SAEnum(RequestStatus, name="request_status", create_type=False, create_constraint=False),
        nullable=False,
        default=RequestStatus.PENDING,
    )
    admin_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    assigned_helper: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # AI fields (populated in future phases)
    estimated_price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    estimated_hours: Mapped[Decimal | None] = mapped_column(Numeric(4, 1), nullable=True)
    ai_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_classified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Lifecycle timestamps
    confirmed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    status_logs: Mapped[list["RequestStatusLog"]] = relationship(
        "RequestStatusLog",
        back_populates="request",
        order_by="RequestStatusLog.created_at",
        cascade="all, delete-orphan",
    )


class RequestStatusLog(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "request_status_log"

    __table_args__ = (Index("ix_status_log_request_id", "request_id"),)

    request_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("service_requests.id", ondelete="CASCADE"),
        nullable=False,
    )
    old_status: Mapped[RequestStatus | None] = mapped_column(
        SAEnum(RequestStatus, name="request_status", create_type=False, create_constraint=False),
        nullable=True,
    )
    new_status: Mapped[RequestStatus] = mapped_column(
        SAEnum(RequestStatus, name="request_status", create_type=False, create_constraint=False),
        nullable=False,
    )
    changed_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("admins.id", ondelete="SET NULL"),
        nullable=True,
    )
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    request: Mapped["ServiceRequest"] = relationship(
        "ServiceRequest", back_populates="status_logs"
    )
