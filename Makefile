.PHONY: help setup dev down logs restart \
        migrate create-admin shell-backend shell-db \
        test test-unit test-integration \
        build-prod deploy prod-down prod-logs \
        backup-db

COMPOSE        = docker compose
COMPOSE_PROD   = docker compose -f docker-compose.prod.yml
BACKEND        = $(COMPOSE) exec backend
TIMESTAMP      = $(shell date +%Y%m%d_%H%M%S)

# ── Help ──────────────────────────────────────────────────────────────────────
help:
	@echo ""
	@echo "  MeinHelfer — available targets"
	@echo ""
	@echo "  Development"
	@echo "    make setup           — copy .env.example → .env (first time)"
	@echo "    make dev             — build + start all dev containers"
	@echo "    make down            — stop all containers"
	@echo "    make logs            — tail all logs"
	@echo "    make restart         — restart all containers"
	@echo ""
	@echo "  Database"
	@echo "    make migrate         — run Alembic migrations"
	@echo "    make create-admin    — interactive admin user creation"
	@echo "    make shell-db        — open psql session"
	@echo "    make backup-db       — dump database to file"
	@echo ""
	@echo "  Backend"
	@echo "    make shell-backend   — bash into backend container"
	@echo "    make test            — run all tests"
	@echo "    make test-unit       — run unit tests only"
	@echo "    make test-integration— run integration tests only"
	@echo ""
	@echo "  Production"
	@echo "    make build-prod      — build production images"
	@echo "    make deploy          — start production stack"
	@echo "    make prod-down       — stop production stack"
	@echo "    make prod-logs       — tail production logs"
	@echo ""

# ── Development ───────────────────────────────────────────────────────────────
setup:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "✓  .env created — edit it before starting"; \
	else \
		echo "  .env already exists, skipping"; \
	fi

dev:
	$(COMPOSE) up -d --build
	@echo ""
	@echo "✓  Dev stack running"
	@echo "   Frontend  → http://localhost:3001"
	@echo "   Backend   → http://localhost:8000"
	@echo "   API docs  → http://localhost:8000/api/v1/docs"
	@echo ""

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

restart:
	$(COMPOSE) restart

# ── Database ──────────────────────────────────────────────────────────────────
migrate:
	$(BACKEND) alembic upgrade head

create-admin:
	$(BACKEND) python scripts/create_admin.py

shell-db:
	$(COMPOSE) exec postgres psql -U $${POSTGRES_USER:-meinhelfer} $${POSTGRES_DB:-meinhelfer}

backup-db:
	$(COMPOSE) exec postgres pg_dump \
		-U $${POSTGRES_USER:-meinhelfer} $${POSTGRES_DB:-meinhelfer} \
		> backup_$(TIMESTAMP).sql
	@echo "✓  Backup saved: backup_$(TIMESTAMP).sql"

# ── Backend ───────────────────────────────────────────────────────────────────
shell-backend:
	$(BACKEND) bash

test:
	$(BACKEND) pytest -v --tb=short

test-unit:
	$(BACKEND) pytest tests/unit/ -v --tb=short

test-integration:
	$(BACKEND) pytest tests/integration/ -v --tb=short

# ── Production ────────────────────────────────────────────────────────────────
build-prod:
	$(COMPOSE_PROD) build --no-cache

deploy:
	@if ! docker network ls | grep -q "^.*web.*$$"; then \
		docker network create web; \
		echo "✓  Created 'web' Docker network"; \
	fi
	$(COMPOSE_PROD) up -d
	@echo ""
	@echo "✓  Production stack deployed"
	@echo "   Traefik will obtain TLS certificates automatically."
	@echo "   Run 'make prod-migrate' to apply database migrations."
	@echo ""

prod-migrate:
	$(COMPOSE_PROD) exec backend alembic upgrade head

prod-create-admin:
	$(COMPOSE_PROD) exec backend python scripts/create_admin.py

prod-down:
	$(COMPOSE_PROD) down

prod-logs:
	$(COMPOSE_PROD) logs -f

prod-backup:
	$(COMPOSE_PROD) exec postgres pg_dump \
		-U $${POSTGRES_USER:-meinhelfer} $${POSTGRES_DB:-meinhelfer} \
		> backup_prod_$(TIMESTAMP).sql
	@echo "✓  Production backup: backup_prod_$(TIMESTAMP).sql"
