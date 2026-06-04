import pytest


@pytest.mark.asyncio
async def test_create_request_success(client, valid_request_payload):
    response = await client.post("/api/v1/requests", json=valid_request_payload)
    assert response.status_code == 201
    data = response.json()
    assert "reference_code" in data
    assert data["reference_code"].startswith("MH-")
    assert data["status"] == "pending"
    assert "Anfrage" in data["message"]


@pytest.mark.asyncio
async def test_create_request_past_date(client, valid_request_payload):
    valid_request_payload["scheduled_date"] = "2020-01-01"
    response = await client.post("/api/v1/requests", json=valid_request_payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_request_too_many_helpers(client, valid_request_payload):
    valid_request_payload["helper_count"] = 99
    response = await client.post("/api/v1/requests", json=valid_request_payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_request_invalid_email(client, valid_request_payload):
    valid_request_payload["customer"]["email"] = "not-an-email"
    response = await client.post("/api/v1/requests", json=valid_request_payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_status_not_found(client):
    response = await client.get("/api/v1/requests/MH-2026-9999/status")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_status_after_create(client, valid_request_payload):
    create_resp = await client.post("/api/v1/requests", json=valid_request_payload)
    assert create_resp.status_code == 201
    ref_code = create_resp.json()["reference_code"]

    status_resp = await client.get(f"/api/v1/requests/{ref_code}/status")
    assert status_resp.status_code == 200
    assert status_resp.json()["status"] == "pending"
    assert status_resp.json()["reference_code"] == ref_code


@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
