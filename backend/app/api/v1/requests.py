from fastapi import APIRouter, Depends, status

from app.api.deps import get_request_service
from app.schemas.request import CreateRequestSchema, RequestCreatedResponse, RequestStatusResponse
from app.services.request_service import RequestService

router = APIRouter(prefix="/requests", tags=["requests"])


@router.post(
    "",
    response_model=RequestCreatedResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a new service request",
)
async def create_request(
    data: CreateRequestSchema,
    service: RequestService = Depends(get_request_service),
) -> RequestCreatedResponse:
    return await service.create_request(data)


@router.get(
    "/{reference_code}/status",
    response_model=RequestStatusResponse,
    summary="Check request status by reference code",
)
async def get_request_status(
    reference_code: str,
    service: RequestService = Depends(get_request_service),
) -> RequestStatusResponse:
    return await service.get_status(reference_code)
