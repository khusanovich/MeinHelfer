import uuid
from datetime import date, datetime, timezone

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.enums import RequestStatus, ServiceType
from app.models.request import RequestStatusLog, ServiceRequest
from app.repositories.base import BaseRepository


class ServiceRequestRepository(BaseRepository[ServiceRequest]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(ServiceRequest, session)

    async def get_by_reference_code(self, code: str) -> ServiceRequest | None:
        result = await self.session.execute(
            select(ServiceRequest).where(ServiceRequest.reference_code == code.upper())
        )
        return result.scalar_one_or_none()

    async def get_with_logs(self, record_id: uuid.UUID) -> ServiceRequest | None:
        result = await self.session.execute(
            select(ServiceRequest)
            .options(selectinload(ServiceRequest.status_logs))
            .where(ServiceRequest.id == record_id)
        )
        return result.scalar_one_or_none()

    async def find_all(
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
    ) -> tuple[list[ServiceRequest], int]:
        query = select(ServiceRequest)

        if status:
            query = query.where(ServiceRequest.status == status)
        if service_type:
            query = query.where(ServiceRequest.service_type == service_type)
        if date_from:
            query = query.where(ServiceRequest.scheduled_date >= date_from)
        if date_to:
            query = query.where(ServiceRequest.scheduled_date <= date_to)
        if search:
            term = f"%{search}%"
            query = query.where(
                or_(
                    ServiceRequest.customer_name.ilike(term),
                    ServiceRequest.customer_email.ilike(term),
                    ServiceRequest.reference_code.ilike(term),
                )
            )

        # Total count
        count_result = await self.session.execute(
            select(func.count()).select_from(query.subquery())
        )
        total = count_result.scalar_one()

        # Sorting
        sort_col = getattr(ServiceRequest, sort_by, ServiceRequest.created_at)
        if sort_order == "asc":
            query = query.order_by(sort_col.asc())
        else:
            query = query.order_by(sort_col.desc())

        # Pagination
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        result = await self.session.execute(query)
        return list(result.scalars().all()), total

    async def count_by_status(self) -> dict[str, int]:
        result = await self.session.execute(
            select(ServiceRequest.status, func.count(ServiceRequest.id))
            .group_by(ServiceRequest.status)
        )
        return {row[0].value: row[1] for row in result.all()}

    async def count_by_service_type(self) -> dict[str, int]:
        result = await self.session.execute(
            select(ServiceRequest.service_type, func.count(ServiceRequest.id))
            .group_by(ServiceRequest.service_type)
        )
        return {row[0].value: row[1] for row in result.all()}

    async def get_upcoming(self, days: int = 7) -> list[ServiceRequest]:
        today = datetime.now(timezone.utc).date()
        cutoff = date.fromordinal(today.toordinal() + days)
        result = await self.session.execute(
            select(ServiceRequest)
            .where(
                ServiceRequest.scheduled_date >= today,
                ServiceRequest.scheduled_date <= cutoff,
                ServiceRequest.status.in_(
                    [RequestStatus.CONFIRMED, RequestStatus.PENDING]
                ),
            )
            .order_by(ServiceRequest.scheduled_date.asc(), ServiceRequest.scheduled_time.asc())
            .limit(10)
        )
        return list(result.scalars().all())

    async def count_this_week_new(self) -> int:
        from datetime import timedelta

        start = datetime.now(timezone.utc) - timedelta(days=7)
        result = await self.session.execute(
            select(func.count(ServiceRequest.id)).where(
                ServiceRequest.created_at >= start
            )
        )
        return result.scalar_one()

    async def count_this_week_completed(self) -> int:
        from datetime import timedelta

        start = datetime.now(timezone.utc) - timedelta(days=7)
        result = await self.session.execute(
            select(func.count(ServiceRequest.id)).where(
                ServiceRequest.completed_at >= start,
                ServiceRequest.status == RequestStatus.COMPLETED,
            )
        )
        return result.scalar_one()

    async def count_for_year(self, year: int) -> int:
        result = await self.session.execute(
            select(func.count(ServiceRequest.id)).where(
                func.extract("year", ServiceRequest.created_at) == year
            )
        )
        return result.scalar_one() or 0

    async def add_status_log(
        self,
        request_id: uuid.UUID,
        old_status: RequestStatus | None,
        new_status: RequestStatus,
        changed_by: uuid.UUID | None = None,
        note: str | None = None,
    ) -> RequestStatusLog:
        log = RequestStatusLog(
            request_id=request_id,
            old_status=old_status,
            new_status=new_status,
            changed_by=changed_by,
            note=note,
        )
        self.session.add(log)
        await self.session.flush()
        return log
