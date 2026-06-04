# MeinHelfer — System Architecture

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Internet                              │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
                    ┌──────▼──────┐
                    │   Traefik   │  Reverse proxy + TLS (Let's Encrypt)
                    │  (port 443) │
                    └──────┬──────┘
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼──────┐     │     ┌──────▼──────┐
       │  Next.js    │     │     │   FastAPI    │
       │  Frontend   │     │     │   Backend    │
       │  :3000      │     │     │   :8000      │
       └─────────────┘     │     └──────┬───────┘
                           │            │
                    ┌──────▼──────┐  ┌──▼──────────┐
                    │   Caddy /   │  │  PostgreSQL  │
                    │   Static    │  │  :5432       │
                    └─────────────┘  └─────────────┘
```

## 2. Container Architecture

```
docker-compose.yml
├── traefik          — Reverse proxy, TLS termination
├── frontend         — Next.js 15 app
├── backend          — FastAPI app (Uvicorn)
├── postgres         — PostgreSQL 16
└── redis            — Session cache / rate limiting (future)
```

## 3. Backend Clean Architecture

```
backend/
├── app/
│   ├── api/              ← HTTP layer (FastAPI routers)
│   │   ├── v1/
│   │   │   ├── requests.py
│   │   │   ├── admin.py
│   │   │   └── auth.py
│   │   └── deps.py       ← Dependency injection
│   │
│   ├── core/             ← Cross-cutting concerns
│   │   ├── config.py     ← Pydantic Settings
│   │   ├── security.py   ← JWT, password hashing
│   │   ├── database.py   ← SQLAlchemy engine + session
│   │   └── exceptions.py
│   │
│   ├── domain/           ← Pure business logic (no framework deps)
│   │   ├── entities/     ← Domain models (dataclasses)
│   │   ├── enums.py
│   │   └── events.py     ← Domain events (AI hook points)
│   │
│   ├── repositories/     ← Data access layer
│   │   ├── base.py
│   │   ├── request_repo.py
│   │   └── admin_repo.py
│   │
│   ├── services/         ← Business logic orchestration
│   │   ├── request_service.py
│   │   ├── admin_service.py
│   │   ├── notification_service.py
│   │   └── ai_service.py  ← Stub, ready for AI integration
│   │
│   ├── models/           ← SQLAlchemy ORM models
│   │   ├── base.py
│   │   ├── request.py
│   │   └── admin.py
│   │
│   ├── schemas/          ← Pydantic request/response schemas
│   │   ├── request.py
│   │   └── admin.py
│   │
│   └── main.py           ← FastAPI app factory
│
├── migrations/           ← Alembic migrations
├── tests/
└── Dockerfile
```

## 4. Frontend Architecture

```
frontend/
├── src/
│   ├── app/              ← Next.js App Router
│   │   ├── (public)/     ← Customer-facing pages
│   │   │   ├── page.tsx          — Landing page
│   │   │   └── book/page.tsx     — Booking form
│   │   ├── admin/        ← Admin dashboard (protected)
│   │   │   ├── login/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   └── requests/
│   │   │       ├── page.tsx      — Request list
│   │   │       └── [id]/page.tsx — Request detail
│   │   └── api/          ← Next.js API routes (BFF layer)
│   │
│   ├── components/
│   │   ├── ui/           ← ShadCN primitives
│   │   ├── forms/        ← Booking form components
│   │   └── admin/        ← Admin UI components
│   │
│   ├── lib/
│   │   ├── api.ts        ← Typed API client
│   │   ├── auth.ts       ← Auth helpers
│   │   └── utils.ts
│   │
│   ├── hooks/            ← Custom React hooks
│   ├── types/            ← Shared TypeScript types
│   └── constants/        ← Service types, status labels
```

## 5. Data Flow

### Customer submits request
```
Browser
  → POST /api/v1/requests
  → RequestRouter
  → RequestService.create_request()
  → RequestRepository.create()
  → PostgreSQL
  → NotificationService.send_confirmation()  (email to customer + admin)
  → Return RequestID + confirmation message
```

### Admin views requests
```
Admin Browser
  → GET /api/v1/admin/requests
  → JWT Middleware (validates token)
  → AdminRouter
  → AdminService.list_requests()
  → RequestRepository.find_all(filters)
  → PostgreSQL
  → Return paginated list
```

### Admin updates status
```
Admin Browser
  → PATCH /api/v1/admin/requests/{id}
  → JWT Middleware
  → AdminRouter
  → AdminService.update_request()
  → RequestRepository.update()
  → NotificationService.send_status_update()
  → Return updated request
```

## 6. Security Architecture

| Layer | Mechanism |
|-------|-----------|
| Transport | TLS 1.3 (Traefik + Let's Encrypt) |
| Authentication | JWT (RS256, 8h expiry) |
| Admin passwords | bcrypt (cost factor 12) |
| CORS | Strict allowlist |
| Rate limiting | Traefik middleware (10 req/min on booking endpoint) |
| SQL injection | SQLAlchemy parameterized queries only |
| Input validation | Pydantic v2 strict mode |
| Secret management | Environment variables + Docker secrets |
| Headers | HSTS, X-Frame-Options, CSP via Traefik |

## 7. AI Integration Points (Future)

The architecture reserves explicit hooks for AI without polluting the MVP:

```python
# services/ai_service.py — stub today, real tomorrow
class AIService:
    async def classify_request(self, description: str) -> ServiceType: ...
    async def estimate_duration(self, request: Request) -> int: ...        # minutes
    async def estimate_price(self, request: Request) -> Decimal: ...
    async def recommend_helpers(self, request: Request) -> list[str]: ...
    async def generate_summary(self, request: Request) -> str: ...
```

Each service method fires a domain event (`RequestCreated`, `RequestUpdated`) that AI consumers can subscribe to in future without changing existing code.

## 8. Deployment Architecture (Hetzner)

```
Hetzner CX22 VPS (2 vCPU, 4GB RAM)
├── Ubuntu 24.04 LTS
├── Docker Engine 27+
├── Docker Compose v2
└── Volumes:
    ├── postgres_data  → /var/lib/postgresql/data
    └── traefik_certs  → /etc/traefik/acme.json
```

DNS: A record `meinhelfer.de` → VPS IP (Cloudflare proxied recommended)
