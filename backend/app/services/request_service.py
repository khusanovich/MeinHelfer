from datetime import datetime, timezone

from app.core.exceptions import NotFoundError
from app.domain.enums import RequestStatus
from app.domain.events import RequestCreatedEvent
from app.models.request import ServiceRequest
from app.repositories.request_repository import ServiceRequestRepository
from app.schemas.request import CreateRequestSchema, RequestCreatedResponse, RequestStatusResponse
from app.services.ai_service import AIService
from app.services.notification_service import NotificationService


class RequestService:
    def __init__(
        self,
        repo: ServiceRequestRepository,
        notification: NotificationService,
        ai: AIService,
    ) -> None:
        self.repo = repo
        self.notification = notification
        self.ai = ai

    async def create_request(self, data: CreateRequestSchema) -> RequestCreatedResponse:
        ref_code = await self._generate_reference_code()

        request = ServiceRequest(
            reference_code=ref_code,
            service_type=data.service_type,
            helper_count=data.helper_count,
            scheduled_date=data.scheduled_date,
            scheduled_time=data.scheduled_time,
            address_street=data.address.street,
            address_city=data.address.city,
            address_zip=data.address.zip,
            address_notes=data.address.notes,
            customer_name=data.customer.name,
            customer_email=data.customer.email,
            customer_phone=data.customer.phone,
            description=data.description,
            status=RequestStatus.PENDING,
        )

        await self.repo.save(request)
        await self.repo.add_status_log(
            request_id=request.id,
            old_status=None,
            new_status=RequestStatus.PENDING,
        )

        await self.repo.session.commit()
        await self.repo.session.refresh(request)

        # Domain event — AI hook (no-op in MVP)
        _event = RequestCreatedEvent(
            request_id=request.id,
            reference_code=request.reference_code,
            service_type=request.service_type,
            helper_count=request.helper_count,
            scheduled_date=request.scheduled_date,
            scheduled_time=request.scheduled_time,
            description=request.description,
            customer_email=request.customer_email,
        )

        await self.notification.send_request_confirmation(request)
        await self.notification.send_new_request_alert(request)

        return RequestCreatedResponse(
            reference_code=request.reference_code,
            status=request.status,
            message=(
                "Ihre Anfrage wurde erfolgreich übermittelt. "
                "Wir melden uns in Kürze bei Ihnen."
            ),
        )

    async def get_status(self, reference_code: str) -> RequestStatusResponse:
        request = await self.repo.get_by_reference_code(reference_code)
        if not request:
            raise NotFoundError("Request", reference_code)
        return RequestStatusResponse(
            reference_code=request.reference_code,
            status=request.status,
            service_type=request.service_type,
            scheduled_date=request.scheduled_date,
            scheduled_time=request.scheduled_time,
        )

    async def _generate_reference_code(self) -> str:
        year = datetime.now(timezone.utc).year
        count = await self.repo.count_for_year(year)
        return f"MH-{year}-{count + 1:04d}"
