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


@pytest.mark.asyncio
async def test_get_single_request_authenticated(client, test_session, valid_request_payload):
    await create_test_admin(test_session)
    token = await get_token(client)

    create_resp = await client.post("/api/v1/requests", json=valid_request_payload)
    assert create_resp.status_code == 201

    list_resp = await client.get(
        "/api/v1/admin/requests",
        headers={"Authorization": f"Bearer {token}"},
    )
    request_id = list_resp.json()["items"][0]["id"]

    response = await client.get(
        f"/api/v1/admin/requests/{request_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == request_id
    assert data["status"] == "pending"
    assert "status_history" in data


@pytest.mark.asyncio
async def test_update_request_status_confirmed(client, test_session, valid_request_payload):
    await create_test_admin(test_session)
    token = await get_token(client)

    await client.post("/api/v1/requests", json=valid_request_payload)

    list_resp = await client.get(
        "/api/v1/admin/requests",
        headers={"Authorization": f"Bearer {token}"},
    )
    request_id = list_resp.json()["items"][0]["id"]

    response = await client.patch(
        f"/api/v1/admin/requests/{request_id}",
        json={"status": "confirmed"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "confirmed"
    assert data["confirmed_at"] is not None


@pytest.mark.asyncio
async def test_invalid_status_transition(client, test_session, valid_request_payload):
    await create_test_admin(test_session)
    token = await get_token(client)

    await client.post("/api/v1/requests", json=valid_request_payload)

    list_resp = await client.get(
        "/api/v1/admin/requests",
        headers={"Authorization": f"Bearer {token}"},
    )
    request_id = list_resp.json()["items"][0]["id"]

    # PENDING → COMPLETED is not a valid transition
    response = await client.patch(
        f"/api/v1/admin/requests/{request_id}",
        json={"status": "completed"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400
    assert "transition" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_anonymize_request(client, test_session, valid_request_payload):
    await create_test_admin(test_session)
    token = await get_token(client)

    await client.post("/api/v1/requests", json=valid_request_payload)

    list_resp = await client.get(
        "/api/v1/admin/requests",
        headers={"Authorization": f"Bearer {token}"},
    )
    request_id = list_resp.json()["items"][0]["id"]

    anon_resp = await client.delete(
        f"/api/v1/admin/requests/{request_id}/anonymize",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert anon_resp.status_code == 200

    detail_resp = await client.get(
        f"/api/v1/admin/requests/{request_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    data = detail_resp.json()
    assert data["customer"]["name"] == "[DELETED]"
    assert data["customer"]["email"] == "[ANONYMIZED]"


@pytest.mark.asyncio
async def test_assign_helper(client, test_session, valid_request_payload):
    await create_test_admin(test_session)
    token = await get_token(client)

    await client.post("/api/v1/requests", json=valid_request_payload)

    list_resp = await client.get(
        "/api/v1/admin/requests",
        headers={"Authorization": f"Bearer {token}"},
    )
    request_id = list_resp.json()["items"][0]["id"]

    response = await client.patch(
        f"/api/v1/admin/requests/{request_id}",
        json={"assigned_helper": "Max Mustermann", "estimated_price": 150.0, "estimated_hours": 3.0},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["assigned_helper"] == "Max Mustermann"
    assert data["estimated_price"] == 150.0
    assert data["estimated_hours"] == 3.0
