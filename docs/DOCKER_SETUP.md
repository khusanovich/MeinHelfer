# MeinHelfer — Docker Setup

## docker-compose.yml (Development)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: meinhelfer
      POSTGRES_USER: meinhelfer
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U meinhelfer"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      target: development
    environment:
      DATABASE_URL: postgresql+asyncpg://meinhelfer:${POSTGRES_PASSWORD}@postgres:5432/meinhelfer
      SECRET_KEY: ${SECRET_KEY}
      SMTP_HOST: ${SMTP_HOST}
      SMTP_PORT: ${SMTP_PORT}
      SMTP_USER: ${SMTP_USER}
      SMTP_PASSWORD: ${SMTP_PASSWORD}
      ADMIN_EMAIL: ${ADMIN_EMAIL}
      ENVIRONMENT: development
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    depends_on:
      postgres:
        condition: service_healthy
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build:
      context: ./frontend
      target: development
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev

volumes:
  postgres_data:
```

## docker-compose.prod.yml (Production Overrides)

```yaml
services:
  traefik:
    image: traefik:v3.1
    command:
      - "--api.insecure=false"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.email=${ACME_EMAIL}"
      - "--certificatesresolvers.letsencrypt.acme.storage=/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "traefik_certs:/acme.json"
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      target: production
    environment:
      DATABASE_URL: postgresql+asyncpg://meinhelfer:${POSTGRES_PASSWORD}@postgres:5432/meinhelfer
      SECRET_KEY: ${SECRET_KEY}
      ENVIRONMENT: production
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(`api.meinhelfer.de`)"
      - "traefik.http.routers.backend.entrypoints=websecure"
      - "traefik.http.routers.backend.tls.certresolver=letsencrypt"
      - "traefik.http.middlewares.ratelimit.ratelimit.average=10"
      - "traefik.http.middlewares.ratelimit.ratelimit.burst=20"
    restart: unless-stopped
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 512M

  frontend:
    build:
      context: ./frontend
      target: production
    environment:
      NEXT_PUBLIC_API_URL: https://api.meinhelfer.de
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`meinhelfer.de`)"
      - "traefik.http.routers.frontend.entrypoints=websecure"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
    restart: unless-stopped

  postgres:
    restart: unless-stopped
    ports: []  # No external port in prod

volumes:
  postgres_data:
  traefik_certs:
```

## backend/Dockerfile

```dockerfile
FROM python:3.12-slim AS base
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

FROM base AS development
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

FROM base AS production
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir gunicorn
COPY . .
# Run migrations then start
CMD ["sh", "-c", "alembic upgrade head && gunicorn app.main:app -w 2 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000"]
```

## frontend/Dockerfile

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS development
COPY package*.json .
RUN npm ci
COPY . .
CMD ["npm", "run", "dev"]

FROM base AS deps
COPY package*.json .
RUN npm ci --only=production

FROM base AS builder
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build

FROM base AS production
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY package*.json .
CMD ["npm", "start"]
```

## .env.example

```bash
# Database
POSTGRES_PASSWORD=change_me_in_production

# Backend
SECRET_KEY=change_me_64_chars_minimum_random_string
ENVIRONMENT=development

# SMTP (email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@meinhelfer.de
SMTP_PASSWORD=app_password_here
ADMIN_EMAIL=owner@meinhelfer.de

# Domain (production)
DOMAIN=meinhelfer.de
ACME_EMAIL=owner@meinhelfer.de

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```
