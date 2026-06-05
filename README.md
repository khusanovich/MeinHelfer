# MeinHelfer

Managed marketplace for booking trusted helpers — moving, furniture assembly, cleaning, gardening, and more. Customers submit requests via the website; the platform owner assigns helpers manually.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 · TypeScript · Tailwind CSS · ShadCN UI |
| Backend | FastAPI · Python 3.12 · SQLAlchemy 2 (async) · Alembic |
| Database | PostgreSQL 16 |
| Auth | JWT (HS256) · bcrypt |
| Email | aiosmtplib (SMTP) |
| Infra | Docker · Traefik v3 · Hetzner Cloud |

---

## Prerequisites

- Docker 27+ and Docker Compose v2
- Node.js 20+ (for local frontend dev without Docker)
- Python 3.12+ (for local backend dev without Docker)

---

## Quick Start (Docker)

```bash
# 1. Clone
git clone https://github.com/your-org/meinhelfer.git
cd meinhelfer

# 2. Create .env
make setup
# → Edit .env and fill in all values (especially SECRET_KEY and POSTGRES_PASSWORD)

# 3. Start dev stack
make dev
```

Services:
- Frontend → http://localhost:3000
- Backend API → http://localhost:8000
- API docs (Swagger) → http://localhost:8000/api/v1/docs

### Create your first admin user

```bash
make create-admin
```

### Run database migrations

```bash
make migrate
```

---

## Development

### Backend only (without Docker)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt

# Requires a running Postgres — set DATABASE_URL in .env
uvicorn app.main:app --reload
```

### Frontend only (without Docker)

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

---

## Running Tests

```bash
# All tests
make test

# Unit tests only
make test-unit

# Integration tests only
make test-integration
```

Tests use SQLite in-memory — no external database required.

---

## Project Structure

```
meinhelfer/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # Route handlers (requests, admin, auth)
│   │   ├── core/            # Config, database, security, exceptions
│   │   ├── domain/          # Enums, domain events (no framework deps)
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── repositories/    # Data access layer
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   └── services/        # Business logic
│   ├── migrations/          # Alembic migration versions
│   ├── scripts/             # create_admin.py CLI
│   └── tests/               # unit/ + integration/
│
├── frontend/
│   └── src/
│       ├── app/             # Next.js App Router pages
│       │   ├── admin/       # Admin dashboard (protected)
│       │   ├── book/        # 5-step booking form
│       │   ├── confirmation/# Post-booking confirmation
│       │   └── status/      # Request status lookup
│       ├── components/      # Shared UI + admin + form components
│       ├── hooks/           # SWR data-fetching hooks
│       ├── lib/             # API client, auth helpers
│       └── types/           # TypeScript API types
│
├── docker/
│   ├── traefik/dynamic/     # Traefik middleware config
│   └── postgres/            # Postgres init script
│
├── docs/                    # PRD, architecture, API spec, deployment guide
├── docker-compose.yml       # Development stack
├── docker-compose.prod.yml  # Production stack (Traefik + TLS)
├── Makefile                 # All operational commands
└── .env.example             # Environment variable template
```

---

## Key Make Targets

| Target | Description |
|--------|-------------|
| `make setup` | Copy `.env.example` → `.env` |
| `make dev` | Start development stack |
| `make down` | Stop all containers |
| `make migrate` | Run Alembic migrations |
| `make create-admin` | Create admin user (interactive) |
| `make test` | Run all tests |
| `make shell-backend` | Bash into backend container |
| `make shell-db` | psql session |
| `make backup-db` | Dump database to file |
| `make deploy` | Start production stack |
| `make prod-migrate` | Run migrations in production |
| `make prod-create-admin` | Create admin user in production |
| `make prod-backup` | Dump production database |

---

## Request Lifecycle

```
PENDING → CONFIRMED → IN_PROGRESS → COMPLETED
    ↘         ↘            ↘
                        CANCELLED
```

Status transitions are enforced server-side. Invalid transitions return `400 Bad Request`.

---

## Admin Panel

The admin panel at `/admin` is protected by JWT authentication.

1. Log in at `/admin/login`
2. View all incoming requests on the dashboard and request list
3. Open a request to update its status, assign a helper, set price/hours, and add internal notes
4. GDPR: anonymize a request's PII via the anonymize action

---

## Environment Variables

See `.env.example` for a full reference. Key variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `POSTGRES_PASSWORD` | Yes | Database password |
| `SECRET_KEY` | Yes | JWT signing key (`openssl rand -hex 32`) |
| `SMTP_HOST` | No | Leave empty to disable emails |
| `ADMIN_EMAIL` | No | Receives new-request alert emails |
| `DOMAIN` | Prod only | Your domain name (e.g. `meinhelfer.de`) |

---

## Production Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the full step-by-step Hetzner deployment guide.

Summary:
1. Provision a Hetzner CX22 VPS (Ubuntu 24.04)
2. Install Docker, configure firewall
3. Clone repo, fill in `.env`
4. `make deploy` → Traefik obtains TLS certificates automatically
5. `make prod-migrate && make prod-create-admin`

Estimated cost: **~€5.50/month**.

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/PRD.md](docs/PRD.md) | Product requirements |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design & layers |
| [docs/API_SPEC.md](docs/API_SPEC.md) | All API endpoints |
| [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | Schema, indexes, GDPR |
| [docs/USER_FLOWS.md](docs/USER_FLOWS.md) | Customer & admin journeys |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Hetzner deployment guide |
| [docs/DOCKER_SETUP.md](docs/DOCKER_SETUP.md) | Docker configuration |
| [docs/ROADMAP.md](docs/ROADMAP.md) | MVP phases & post-MVP ideas |
