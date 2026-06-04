# MeinHelfer — API Specification

Base URL: `https://api.meinhelfer.de/api/v1`  
Format: JSON  
Auth: Bearer JWT (admin endpoints only)

---

## Public Endpoints

### POST /requests
Submit a new service request.

**Request Body**
```json
{
  "service_type": "moving",
  "helper_count": 2,
  "scheduled_date": "2026-06-20",
  "scheduled_time": "09:00",
  "address": {
    "street": "Musterstraße 42",
    "city": "Berlin",
    "zip": "10115",
    "notes": "3. OG, kein Aufzug"
  },
  "customer": {
    "name": "Anna Müller",
    "email": "anna@example.de",
    "phone": "+49 151 12345678"
  },
  "description": "Umzug 3-Zimmer-Wohnung, ca. 50 Kartons und Möbel."
}
```

**Validation Rules**
- `service_type`: one of the 6 defined service types
- `helper_count`: integer 1–10
- `scheduled_date`: ISO date, must be ≥ today + 1 day
- `scheduled_time`: HH:MM, 07:00–20:00
- `address.street`, `address.city`, `address.zip`: required
- `customer.name`, `customer.email`: required
- `customer.email`: valid email format
- `description`: 10–2000 characters

**Response 201**
```json
{
  "reference_code": "MH-2026-0047",
  "status": "pending",
  "message": "Ihre Anfrage wurde erfolgreich übermittelt. Wir melden uns in Kürze."
}
```

**Error Responses**
- `422 Unprocessable Entity` — validation failure (Pydantic)
- `429 Too Many Requests` — rate limit exceeded (10/min per IP)

---

### GET /requests/{reference_code}/status
Check status of a request by reference code (no auth needed — reference code is the secret).

**Response 200**
```json
{
  "reference_code": "MH-2026-0047",
  "status": "confirmed",
  "service_type": "moving",
  "scheduled_date": "2026-06-20",
  "scheduled_time": "09:00"
}
```

**Error Responses**
- `404 Not Found`

---

## Admin Authentication

### POST /auth/login
Obtain JWT access token.

**Request Body**
```json
{
  "email": "admin@meinhelfer.de",
  "password": "securepassword"
}
```

**Response 200**
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer",
  "expires_in": 28800
}
```

**Error Responses**
- `401 Unauthorized` — invalid credentials
- `429 Too Many Requests` — 5 failed attempts per 15 min

---

### POST /auth/refresh
Refresh access token (requires valid token not yet expired).

**Headers:** `Authorization: Bearer <token>`

**Response 200**
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer",
  "expires_in": 28800
}
```

---

## Admin Endpoints
All require `Authorization: Bearer <token>`

### GET /admin/requests
List all service requests with filtering and pagination.

**Query Parameters**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| status | string | all | Filter by status |
| service_type | string | all | Filter by service type |
| date_from | date | — | Filter scheduled_date ≥ |
| date_to | date | — | Filter scheduled_date ≤ |
| search | string | — | Search name/email/reference |
| page | int | 1 | Page number |
| page_size | int | 20 | Items per page (max 100) |
| sort_by | string | created_at | Sort field |
| sort_order | string | desc | asc/desc |

**Response 200**
```json
{
  "items": [
    {
      "id": "uuid",
      "reference_code": "MH-2026-0047",
      "service_type": "moving",
      "helper_count": 2,
      "scheduled_date": "2026-06-20",
      "scheduled_time": "09:00",
      "customer_name": "Anna Müller",
      "customer_email": "anna@example.de",
      "status": "pending",
      "assigned_helper": null,
      "created_at": "2026-06-05T10:30:00Z"
    }
  ],
  "total": 47,
  "page": 1,
  "page_size": 20,
  "pages": 3
}
```

---

### GET /admin/requests/{id}
Get full request details.

**Response 200**
```json
{
  "id": "uuid",
  "reference_code": "MH-2026-0047",
  "service_type": "moving",
  "helper_count": 2,
  "scheduled_date": "2026-06-20",
  "scheduled_time": "09:00",
  "address": {
    "street": "Musterstraße 42",
    "city": "Berlin",
    "zip": "10115",
    "notes": "3. OG, kein Aufzug"
  },
  "customer": {
    "name": "Anna Müller",
    "email": "anna@example.de",
    "phone": "+49 151 12345678"
  },
  "description": "Umzug 3-Zimmer-Wohnung...",
  "status": "confirmed",
  "assigned_helper": "Thomas K.",
  "admin_notes": "Confirmed via phone.",
  "estimated_price": null,
  "estimated_hours": null,
  "status_history": [
    {
      "old_status": "pending",
      "new_status": "confirmed",
      "changed_at": "2026-06-05T11:00:00Z",
      "note": "Confirmed via phone."
    }
  ],
  "created_at": "2026-06-05T10:30:00Z",
  "updated_at": "2026-06-05T11:00:00Z"
}
```

---

### PATCH /admin/requests/{id}
Update a request (status, helper assignment, notes).

**Request Body** (all fields optional)
```json
{
  "status": "confirmed",
  "assigned_helper": "Thomas K.",
  "admin_notes": "Customer confirmed via phone. Thomas available.",
  "estimated_price": 180.00,
  "estimated_hours": 3.0
}
```

**Validation Rules**
- Status transitions must follow the valid flow: PENDING → CONFIRMED → IN_PROGRESS → COMPLETED / CANCELLED
- Backwards transitions forbidden (except to CANCELLED from any state)

**Response 200** — returns full updated request object (same as GET)

**Error Responses**
- `400 Bad Request` — invalid status transition
- `404 Not Found`

---

### DELETE /admin/requests/{id}/anonymize
GDPR anonymization of personal data (soft delete of PII, not the record).

**Response 200**
```json
{
  "message": "Personal data anonymized successfully."
}
```

---

### GET /admin/dashboard
Get aggregate statistics for the dashboard.

**Response 200**
```json
{
  "overview": {
    "total_requests": 142,
    "pending": 8,
    "confirmed": 5,
    "in_progress": 2,
    "completed": 124,
    "cancelled": 3
  },
  "this_week": {
    "new_requests": 12,
    "completed": 9
  },
  "by_service_type": {
    "moving": 48,
    "assembly": 31,
    "loading": 22,
    "cleaning": 19,
    "gardening": 14,
    "general": 8
  },
  "upcoming_scheduled": [
    {
      "reference_code": "MH-2026-0047",
      "service_type": "moving",
      "scheduled_date": "2026-06-20",
      "customer_name": "Anna Müller",
      "status": "confirmed"
    }
  ]
}
```

---

## Error Response Format

All errors follow RFC 7807 (Problem Details):
```json
{
  "type": "https://meinhelfer.de/errors/validation-error",
  "title": "Validation Error",
  "status": 422,
  "detail": "scheduled_date must be at least 1 day in the future",
  "instance": "/api/v1/requests"
}
```

## API Versioning

- Current: `/api/v1/`
- Version in URL path (not header) for simplicity
- `/api/v1/health` — health check endpoint (no auth)
- `/api/v1/openapi.json` — OpenAPI schema
- `/api/v1/docs` — Swagger UI (disabled in production, enabled in dev/staging)
