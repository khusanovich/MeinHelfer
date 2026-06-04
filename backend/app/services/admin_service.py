import uuid
from datetime import date, datetime, timezone

from app.core.exceptions import InvalidStatusTransitionError, NotFoundError
from app.domain.enums import RequestStatus, ServiceType, is_valid_transition
from app.repositories.admin_repository import AdminRepository
from app.repositories.request_repository import ServiceRequestRepository
from app.schemas.admin import (
    AddressDetail,
    AdminRequestDetail,
    AdminRequestListItem,
    CustomerDetail,
    DashboardResponse,
    OverviewStats,
    StatusLogEntry,
    UpcomingRequest,
    UpdateRequestSchema,
    WeekStats,
)
from app.schemas.common import PaginatedResponse
from app.services.notification_service import NotificationService


class AdminService:
    def __init__(
        self,
        repo: ServiceRequestRepository,
        admin_repo: AdminRepository,
        notification: NotificationService,
    ) -> None:
        self.repo = repo
        self.admin_repo = admin_repo
        self.notification = notification

    async def list_requests(
        self,
        status: RequestStatus | None = None,
        service_type: ServiceType | None = None,
        date_from: date | None = None,
        date_to: date | None = None,
        search: str | None = None,
        page: int = 1,
        page_size: int = 20,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> PaginatedResponse[AdminRequestListItem]:
        requests, total = await self.repo.find_all(
            status=status,
            service_type=service_type,
            date_from=date_from,
            date_to=date_to,
            search=search,
            page=page,
            page_size=page_size,
            sort_by=sort_by,
            sort_order=sort_order,
        )
        items = [AdminRequestListItem.model_validate(r) for r in requests]
        pages = max(1, (total + page_size - 1) // page_size)
        return PaginatedResponse(items=items, total=total, page=page, page_size=page_size, pages=pages)

    async def get_request(self, request_id: uuid.UUID) -> AdminRequestDetail:
        request = await self.repo.get_with_logs(request_id)
        if not request:
            raise NotFoundError("Request", str(request_id))
        return self._to_detail(request)

    async def update_request(
        self,
        request_id: uuid.UUID,
        data: UpdateRequestSchema,
        admin_id: uuid.UUID,
    ) -> AdminRequestDetail:
        request = await self.repo.get_with_logs(request_id)
        if not request:
            raise NotFoundError("Request", str(request_id))

        old_status = request.status
        status_changed = data.status is not None and data.status != old_status

        if status_changed:
            if not is_valid_transition(old_status, data.status):
                raise InvalidStatusTransitionError(old_status.value, data.status.value)
            request.status = data.status

            now = datetime.now(timezone.utc)
            if data.status == RequestStatus.CONFIRMED:
                request.confirmed_at = now
            elif data.status == RequestStatus.COMPLETED:
                request.completed_at = now

        if data.assigned_helper is not None:
            request.assigned_helper = data.assigned_helper
        if data.admin_notes is not None:
            request.admin_notes = data.admin_notes
        if data.estimated_price is not None:
            request.estimated_price = data.estimated_price
        if data.estimated_hours is not None:
            request.estimated_hours = data.estimated_hours

        await self.repo.save(request)

        if status_changed:
            await self.repo.add_status_log(
                request_id=request.id,
                old_status=old_status,
                new_status=data.status,
                changed_by=admin_id,
                note=data.admin_notes,
            )

        await self.repo.session.commit()
        await self.repo.session.refresh(request)

        if status_changed and data.status in (
            RequestStatus.CONFIRMED,
            RequestStatus.COMPLETED,
            RequestStatus.CANCELLED,
        ):
            await self.notification.send_status_update(request, data.status)

        request = await self.repo.get_with_logs(request_id)
        return self._to_detail(request)

    async def anonymize_request(self, request_id: uuid.UUID) -> None:
        request = await self.repo.get_by_id(request_id)
        if not request:
            raise NotFoundError("Request", str(request_id))

        request.customer_name = "[DELETED]"
        request.customer_email = "[DELETED]"
        request.customer_phone = None
        request.description = "[ANONYMIZED]"
        request.address_notes = None

        await self.repo.save(request)
        await self.repo.session.commit()

    async def get_dashboard(self) -> DashboardResponse:
        by_status = await self.repo.count_by_status()
        by_service = await self.repo.count_by_service_type()
        upcoming_rows = await self.repo.get_upcoming(days=7)
        new_this_week = await self.repo.count_this_week_new()
        completed_this_week = await self.repo.count_this_week_completed()

        overview = OverviewStats(
            total_requests=sum(by_status.values()),
            pending=by_status.get(RequestStatus.PENDING.value, 0),
            confirmed=by_status.get(RequestStatus.CONFIRMED.value, 0),
            in_progress=by_status.get(RequestStatus.IN_PROGRESS.value, 0),
            completed=by_status.get(RequestStatus.COMPLETED.value, 0),
            cancelled=by_status.get(RequestStatus.CANCELLED.value, 0),
        )

        return DashboardResponse(
            overview=overview,
            this_week=WeekStats(new_requests=new_this_week, completed=completed_this_week),
            by_service_type=by_service,
            upcoming_scheduled=[
                UpcomingRequest(
                    reference_code=r.reference_code,
                    service_type=r.service_type,
                    scheduled_date=r.scheduled_date,
                    scheduled_time=r.scheduled_time,
                    customer_name=r.customer_name,
                    status=r.status,
                )
                for r in upcoming_rows
            ],
        )

    def _to_detail(self, request) -> AdminRequestDetail:
        return AdminRequestDetail(
            id=request.id,
            reference_code=request.reference_code,
            service_type=request.service_type,
            helper_count=request.helper_count,
            scheduled_date=request.scheduled_date,
            scheduled_time=request.scheduled_time,
            address=AddressDetail(
                street=request.address_street,
                city=request.address_city,
                zip=request.address_zip,
                notes=request.address_notes,
            ),
            customer=CustomerDetail(
                name=request.customer_name,
                email=request.customer_email,
                phone=request.customer_phone,
            ),
            description=request.description,
            status=request.status,
            assigned_helper=request.assigned_helper,
            admin_notes=request.admin_notes,
            estimated_price=request.estimated_price,
            estimated_hours=request.estimated_hours,
            ai_summary=request.ai_summary,
            status_history=[
                StatusLogEntry(
                    old_status=log.old_status,
                    new_status=log.new_status,
                    note=log.note,
                    created_at=log.created_at,
                )
                for log in request.status_logs
            ],
            confirmed_at=request.confirmed_at,
            completed_at=request.completed_at,
            created_at=request.created_at,
            updated_at=request.updated_at,
        )
