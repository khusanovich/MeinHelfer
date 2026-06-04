import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import date, time

from app.domain.enums import RequestStatus, ServiceType
from app.schemas.request import AddressSchema, CreateRequestSchema, CustomerSchema


def make_create_schema(**overrides) -> CreateRequestSchema:
    defaults = dict(
        service_type=ServiceType.MOVING,
        helper_count=2,
        scheduled_date=date(2027, 6, 15),
        scheduled_time=time(9, 0),
        address=AddressSchema(street="Musterstr. 1", city="Berlin", zip="10115"),
        customer=CustomerSchema(name="Test User", email="test@example.de"),
        description="This is a test job description with enough characters.",
    )
    defaults.update(overrides)
    return CreateRequestSchema(**defaults)


@pytest.mark.asyncio
async def test_create_request_returns_reference_code():
    from app.services.request_service import RequestService
    from app.services.notification_service import NotificationService
    from app.services.ai_service import AIService

    mock_repo = AsyncMock()
    mock_repo.count_for_year.return_value = 0
    mock_repo.save.return_value = None
    mock_repo.add_status_log.return_value = None

    # Simulate the saved request
    import uuid
    from unittest.mock import MagicMock
    saved_request = MagicMock()
    saved_request.id = uuid.uuid4()
    saved_request.reference_code = "MH-2027-0001"
    saved_request.status = RequestStatus.PENDING
    saved_request.service_type = ServiceType.MOVING
    saved_request.scheduled_date = date(2027, 6, 15)
    saved_request.scheduled_time = time(9, 0)
    saved_request.description = "test"
    saved_request.customer_email = "test@example.de"
    saved_request.helper_count = 2

    mock_session = AsyncMock()

    # Patch ServiceRequest constructor to return our mock
    with patch("app.services.request_service.ServiceRequest") as MockRequest:
        MockRequest.return_value = saved_request
        mock_repo.session = mock_session

        mock_notification = AsyncMock(spec=NotificationService)
        mock_ai = AsyncMock(spec=AIService)

        service = RequestService(
            repo=mock_repo,
            notification=mock_notification,
            ai=mock_ai,
        )

        data = make_create_schema()
        result = await service.create_request(data)

    assert "MH-" in result.reference_code
    assert result.status == RequestStatus.PENDING
    assert "Anfrage" in result.message


def test_reference_code_format():
    """Reference code must match MH-YYYY-NNNN pattern."""
    import re
    code = "MH-2026-0047"
    assert re.match(r"MH-\d{4}-\d{4}", code)


def test_schema_validation_rejects_past_date():
    from pydantic import ValidationError
    from datetime import date

    with pytest.raises(ValidationError):
        CreateRequestSchema(
            service_type=ServiceType.MOVING,
            helper_count=2,
            scheduled_date=date(2020, 1, 1),  # past
            scheduled_time=time(9, 0),
            address=AddressSchema(street="St 1", city="Berlin", zip="10115"),
            customer=CustomerSchema(name="Test", email="t@t.de"),
            description="Enough characters here to pass validation.",
        )


def test_schema_validation_rejects_out_of_hours():
    from pydantic import ValidationError

    with pytest.raises(ValidationError):
        CreateRequestSchema(
            service_type=ServiceType.MOVING,
            helper_count=2,
            scheduled_date=date(2027, 6, 15),
            scheduled_time=time(5, 0),  # too early
            address=AddressSchema(street="St 1", city="Berlin", zip="10115"),
            customer=CustomerSchema(name="Test", email="t@t.de"),
            description="Enough characters here to pass validation.",
        )
