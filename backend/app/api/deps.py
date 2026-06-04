from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.security import decode_access_token
from app.models.admin import Admin
from app.repositories.admin_repository import AdminRepository
from app.repositories.request_repository import ServiceRequestRepository
from app.services.admin_service import AdminService
from app.services.ai_service import AIService
from app.services.notification_service import NotificationService
from app.services.request_service import RequestService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_admin(
    token: str = Depends(oauth2_scheme),
    session: AsyncSession = Depends(get_session),
) -> Admin:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        email = decode_access_token(token)
    except JWTError:
        raise credentials_exception

    repo = AdminRepository(session)
    admin = await repo.get_by_email(email)
    if admin is None or not admin.is_active:
        raise credentials_exception
    return admin


def get_request_service(session: AsyncSession = Depends(get_session)) -> RequestService:
    return RequestService(
        repo=ServiceRequestRepository(session),
        notification=NotificationService(),
        ai=AIService(),
    )


def get_admin_service(session: AsyncSession = Depends(get_session)) -> AdminService:
    return AdminService(
        repo=ServiceRequestRepository(session),
        admin_repo=AdminRepository(session),
        notification=NotificationService(),
    )
