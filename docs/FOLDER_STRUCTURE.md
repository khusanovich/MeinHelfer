# MeinHelfer — Complete Folder Structure

```
MeinHelfer/
│
├── docs/                              ← Project documentation
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_SPEC.md
│   ├── USER_FLOWS.md
│   └── FOLDER_STRUCTURE.md
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    ← FastAPI app factory
│   │   │
│   │   ├── api/                       ← HTTP transport layer
│   │   │   ├── __init__.py
│   │   │   ├── deps.py                ← Shared dependencies (DB session, current_admin)
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── router.py          ← Combines all v1 routers
│   │   │       ├── requests.py        ← Public: POST /requests, GET /requests/{code}/status
│   │   │       ├── admin.py           ← Admin: CRUD on requests, dashboard
│   │   │       └── auth.py            ← POST /auth/login, POST /auth/refresh
│   │   │
│   │   ├── core/                      ← Cross-cutting, no business logic
│   │   │   ├── __init__.py
│   │   │   ├── config.py              ← Pydantic BaseSettings (reads .env)
│   │   │   ├── database.py            ← SQLAlchemy async engine + session factory
│   │   │   ├── security.py            ← JWT encode/decode, bcrypt
│   │   │   ├── exceptions.py          ← Custom exception classes
│   │   │   └── logging.py             ← Structured JSON logging
│   │   │
│   │   ├── domain/                    ← Pure domain logic, zero framework imports
│   │   │   ├── __init__.py
│   │   │   ├── enums.py               ← ServiceType, RequestStatus
│   │   │   ├── events.py              ← RequestCreated, RequestStatusChanged (AI hooks)
│   │   │   └── entities/
│   │   │       ├── __init__.py
│   │   │       ├── request.py         ← Request domain entity (dataclass)
│   │   │       └── admin.py           ← Admin domain entity
│   │   │
│   │   ├── models/                    ← SQLAlchemy ORM models (DB representation)
│   │   │   ├── __init__.py
│   │   │   ├── base.py                ← DeclarativeBase + TimestampMixin
│   │   │   ├── request.py             ← ServiceRequest + StatusLog ORM models
│   │   │   └── admin.py               ← Admin ORM model
│   │   │
│   │   ├── repositories/              ← Data access layer (Repository pattern)
│   │   │   ├── __init__.py
│   │   │   ├── base.py                ← Generic async repository base class
│   │   │   ├── request_repository.py  ← ServiceRequestRepository
│   │   │   └── admin_repository.py    ← AdminRepository
│   │   │
│   │   ├── services/                  ← Business logic orchestration
│   │   │   ├── __init__.py
│   │   │   ├── request_service.py     ← Create request, validate, generate ref code
│   │   │   ├── admin_service.py       ← List/update/dashboard logic
│   │   │   ├── notification_service.py ← Email dispatch (SMTP)
│   │   │   └── ai_service.py          ← AI stub (all methods → NotImplemented stubs)
│   │   │
│   │   └── schemas/                   ← Pydantic I/O schemas (API contracts)
│   │       ├── __init__.py
│   │       ├── request.py             ← CreateRequestSchema, RequestStatusResponse
│   │       ├── admin.py               ← AdminRequestListItem, AdminRequestDetail, UpdateRequestSchema
│   │       ├── auth.py                ← LoginRequest, TokenResponse
│   │       └── common.py              ← PaginatedResponse, ErrorResponse
│   │
│   ├── migrations/                    ← Alembic
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions/
│   │       ├── 0001_create_enums.py
│   │       ├── 0002_create_admins.py
│   │       ├── 0003_create_service_requests.py
│   │       └── 0004_create_status_log.py
│   │
│   ├── tests/
│   │   ├── conftest.py                ← pytest fixtures, test DB setup
│   │   ├── unit/
│   │   │   ├── test_request_service.py
│   │   │   └── test_security.py
│   │   └── integration/
│   │       ├── test_requests_api.py
│   │       └── test_admin_api.py
│   │
│   ├── scripts/
│   │   └── create_admin.py            ← CLI to create first admin user
│   │
│   ├── alembic.ini
│   ├── pyproject.toml                 ← uv / pip project config
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── app/                       ← Next.js App Router
│   │   │   ├── layout.tsx             ← Root layout (fonts, providers)
│   │   │   ├── page.tsx               ← Landing page (/)
│   │   │   ├── book/
│   │   │   │   └── page.tsx           ← Multi-step booking form
│   │   │   ├── confirmation/
│   │   │   │   └── page.tsx           ← Post-submission confirmation
│   │   │   ├── status/
│   │   │   │   └── page.tsx           ← Status check page
│   │   │   └── admin/
│   │   │       ├── layout.tsx         ← Admin layout + auth guard
│   │   │       ├── login/
│   │   │       │   └── page.tsx
│   │   │       ├── dashboard/
│   │   │       │   └── page.tsx
│   │   │       └── requests/
│   │   │           ├── page.tsx       ← Request list
│   │   │           └── [id]/
│   │   │               └── page.tsx   ← Request detail
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                    ← ShadCN components (auto-generated)
│   │   │   ├── forms/
│   │   │   │   ├── BookingForm.tsx    ← Multi-step form orchestrator
│   │   │   │   ├── steps/
│   │   │   │   │   ├── ServiceTypeStep.tsx
│   │   │   │   │   ├── DateTimeStep.tsx
│   │   │   │   │   ├── AddressStep.tsx
│   │   │   │   │   ├── ContactStep.tsx
│   │   │   │   │   └── ReviewStep.tsx
│   │   │   │   └── FormProgress.tsx
│   │   │   ├── admin/
│   │   │   │   ├── RequestsTable.tsx
│   │   │   │   ├── RequestDetail.tsx
│   │   │   │   ├── StatusBadge.tsx
│   │   │   │   ├── DashboardStats.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   └── layout/
│   │   │       ├── Header.tsx
│   │   │       └── Footer.tsx
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts                 ← Typed fetch wrapper (all API calls)
│   │   │   ├── auth.ts                ← Token storage, auth state
│   │   │   └── utils.ts               ← cn(), formatDate(), formatStatus()
│   │   │
│   │   ├── hooks/
│   │   │   ├── useBookingForm.ts      ← Multi-step form state
│   │   │   └── useRequests.ts         ← SWR/React Query hooks for admin
│   │   │
│   │   ├── types/
│   │   │   ├── api.ts                 ← API response types (mirrors backend schemas)
│   │   │   └── forms.ts               ← Form data types
│   │   │
│   │   └── constants/
│   │       ├── services.ts            ← Service type labels + icons
│   │       └── status.ts              ← Status labels + colors
│   │
│   ├── public/
│   │   ├── logo.svg
│   │   └── icons/
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   ├── .env.local.example
│   └── Dockerfile
│
├── docker/
│   ├── traefik/
│   │   ├── traefik.yml                ← Static config
│   │   └── dynamic/
│   │       └── middlewares.yml        ← Rate limiting, headers
│   └── postgres/
│       └── init.sql                   ← Initial DB setup (extensions, etc.)
│
├── .env.example                       ← Template for all env vars
├── .env                               ← Local only, gitignored
├── docker-compose.yml                 ← Development compose
├── docker-compose.prod.yml            ← Production overrides
├── .gitignore
├── Makefile                           ← Dev shortcuts
└── README.md
```
