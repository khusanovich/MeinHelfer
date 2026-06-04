import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.database import get_session
from app.main import app
from app.models.base import Base

# SQLite in-memory for fast unit/integration tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture(scope="function")
async def test_engine():
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def test_session(test_engine):
    session_factory = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        yield session


@pytest_asyncio.fixture(scope="function")
async def client(test_engine):
    session_factory = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)

    async def override_get_session():
        async with session_factory() as session:
            yield session

    app.dependency_overrides[get_session] = override_get_session

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
def valid_request_payload() -> dict:
    return {
        "service_type": "moving",
        "helper_count": 2,
        "scheduled_date": "2027-01-15",
        "scheduled_time": "09:00",
        "address": {
            "street": "Musterstraße 42",
            "city": "Berlin",
            "zip": "10115",
            "notes": "3. OG",
        },
        "customer": {
            "name": "Anna Müller",
            "email": "anna@example.de",
            "phone": "+49 151 12345678",
        },
        "description": "Umzug einer 3-Zimmer-Wohnung mit ca. 50 Kartons und Möbeln.",
    }
