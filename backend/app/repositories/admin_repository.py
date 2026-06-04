from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.admin import Admin
from app.repositories.base import BaseRepository


class AdminRepository(BaseRepository[Admin]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Admin, session)

    async def get_by_email(self, email: str) -> Admin | None:
        result = await self.session.execute(
            select(Admin).where(Admin.email == email.lower())
        )
        return result.scalar_one_or_none()

    async def email_exists(self, email: str) -> bool:
        result = await self.session.execute(
            select(Admin.id).where(Admin.email == email.lower())
        )
        return result.scalar_one_or_none() is not None
