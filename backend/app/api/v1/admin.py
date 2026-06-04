import uuid
from datetime import date

from fastapi import APIRouter, Depends, Query, status

from app.api.deps import get_admin_service, get_current_admin
from app.domain.enums import RequestStatus, ServiceType
from app.models.admin import Admin
from app.schemas.admin import (
    AdminRequestDetail,
    AdminRequestListItem,
    DashboardResponse,
    UpdateRequestSchema,
)
from app.schemas.common import MessageResponse, PaginatedResponse
from app.services.admin_service import AdminService

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(
    _: Admin = Depends(get_current_admin),
    service: AdminService = Depends(get_admin_service),
) -> DashboardResponse:
    return await service.get_dashboard()


@router.get("/requests", response_model=PaginatedResponse[AdminRequestListItem])
async def list_requests(
    status_filter: RequestStatus | None = Query(None, alias="status"),
    service_type: ServiceType | None = Query(None),
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    search: str | None = Query(None, max_length=100),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    _: Admin = Depends(get_current_admin),
    service: AdminService = Depends(get_admin_service),
) -> PaginatedResponse[AdminRequestListItem]:
    return await service.list_requests(
        status=status_filter,
        service_type=service_type,
        date_from=date_from,
        date_to=date_to,
        search=search,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/requests/{request_id}", response_model=AdminRequestDetail)
async def get_request(
    request_id: uuid.UUID,
    _: Admin = Depends(get_current_admin),
    service: AdminService = Depends(get_admin_service),
) -> AdminRequestDetail:
    return await service.get_request(request_id)


@router.patch("/requests/{request_id}", response_model=AdminRequestDetail)
async def update_request(
    request_id: uuid.UUID,
    data: UpdateRequestSchema,
    current_admin: Admin = Depends(get_current_admin),
    service: AdminService = Depends(get_admin_service),
) -> AdminRequestDetail:
    return await service.update_request(request_id, data, current_admin.id)


@router.delete(
    "/requests/{request_id}/anonymize",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
)
async def anonymize_request(
    request_id: uuid.UUID,
    _: Admin = Depends(get_current_admin),
    service: AdminService = Depends(get_admin_service),
) -> MessageResponse:
    await service.anonymize_request(request_id)
    return MessageResponse(message="Personal data anonymized successfully.")
