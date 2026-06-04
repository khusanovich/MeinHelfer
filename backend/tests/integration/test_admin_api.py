import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.models.admin import Admin


async def create_test_admin(session: AsyncSession) -> Admin:
    admin = Admin(
        email="admin@test.de",
        hashed_password=get_password_hash("testpassword123"),
        full_name="Test Admin",
        is_active=True,
    )
    session.add(admin)
    await session.commit()
    await session.refresh(admin)
    return admin


async def get_token(client) -> str:
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.de", "password": "testpassword123"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


@pytest.mark.asyncio
async def test_login_success(client, test_session):
    await create_test_admin(test_session)
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.de", "password": "testpassword123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password(client, test_session):
    await create_test_admin(test_session)
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.de", "password": "wrongpassword"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_requests_list_requires_auth(client):
    response = await client.get("/api/v1/admin/requests")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_dashboard_requires_auth(client):
    response = await client.get("/api/v1/admin/dashboard")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_list_requests_authenticated(client, test_session, valid_request_payload):
    await create_test_admin(test_session)
    token = await get_token(client)

    # Create a request first
    await client.post("/api/v1/requests", json=valid_request_payload)

    response = await client.get(
        "/api/v1/admin/requests",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert data["total"] >= 1


@pytest.mark.asyncio
async def test_dashboard_authenticated(client, test_session):
    await create_test_admin(test_session)
    token = await get_token(client)

    response = await client.get(
        "/api/v1/admin/dashboard",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "overview" in data
    assert "this_week" in data
    assert "by_service_type" in data
