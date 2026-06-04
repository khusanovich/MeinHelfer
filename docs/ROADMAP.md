# MeinHelfer — Development Roadmap

## Phase 1: Blueprint (Current) ✓
Architecture, PRD, schema, API spec, user flows, Docker setup.
**Output:** All docs in `/docs/`

---

## Phase 2: Backend Foundation
**Goal:** Working FastAPI app with database, auth, and all endpoints.

### Tasks
- [ ] Project scaffold (`pyproject.toml`, dependencies)
- [ ] Core: config, database session, security (JWT + bcrypt)
- [ ] Domain: enums, entities, events
- [ ] SQLAlchemy models (ServiceRequest, StatusLog, Admin)
- [ ] Alembic migrations (4 migrations)
- [ ] Repository layer (base + 2 concrete repos)
- [ ] Service layer (request, admin, notification stub, AI stub)
- [ ] API layer (3 routers: requests, admin, auth)
- [ ] Pydantic schemas (all I/O contracts)
- [ ] `create_admin.py` CLI script
- [ ] Health check endpoint
- [ ] Structured JSON logging
- [ ] pytest setup with test DB

**Deliverables:** `backend/` fully functional, all endpoints testable via Swagger UI.

---

## Phase 3: Frontend
**Goal:** Complete customer-facing and admin UI.

### Tasks
- [ ] Next.js 15 project scaffold
- [ ] ShadCN UI setup + Tailwind config
- [ ] API client (`lib/api.ts`)
- [ ] Landing page (/)
- [ ] Multi-step booking form (5 steps + validation)
- [ ] Confirmation page
- [ ] Status check page
- [ ] Admin login page
- [ ] Admin request list (with filters, pagination)
- [ ] Admin request detail (status update, notes)
- [ ] Admin dashboard (stats, upcoming)
- [ ] Auth guard middleware (protected /admin routes)
- [ ] Mobile responsiveness pass
- [ ] German/English i18n structure (German primary)

**Deliverables:** Full UI, all flows working end-to-end.

---

## Phase 4: Infrastructure & Deployment
**Goal:** Production-ready Docker setup deployable to Hetzner.

### Tasks
- [ ] `docker-compose.yml` (development)
- [ ] `docker-compose.prod.yml` (production with Traefik)
- [ ] Backend Dockerfile (dev + prod stages)
- [ ] Frontend Dockerfile (dev + prod stages)
- [ ] Traefik config (TLS, rate limiting, security headers)
- [ ] `Makefile` with dev shortcuts
- [ ] `.env.example` complete
- [ ] Hetzner deployment guide
- [ ] Backup strategy for PostgreSQL

**Deliverables:** One-command local dev, one-command production deploy.

---

## Phase 5: Hardening & Polish
**Goal:** Production security, monitoring, edge cases.

### Tasks
- [ ] Email notifications (SMTP, templates)
- [ ] Rate limiting validation
- [ ] Security headers audit
- [ ] GDPR anonymization endpoint
- [ ] Input sanitization review
- [ ] Error boundary in frontend
- [ ] Loading states / skeleton screens
- [ ] 404 / error pages
- [ ] Reference code generation (MH-YYYY-NNNN)
- [ ] Integration tests (happy path + error cases)
- [ ] README with setup instructions

**Deliverables:** Launch-ready MVP.

---

## Future Phases (Post-MVP)

### Phase 6: AI Integration
- Integrate Claude API for request classification
- AI-estimated duration and price (displayed to customer)
- AI summary generator for admin
- AI helper recommendation (when helper DB exists)

### Phase 7: Helper Portal
- Helper accounts (invite-only)
- Job assignment notifications
- Availability calendar
- Simple job history

### Phase 8: Payments
- Stripe integration
- Deposit on booking
- Invoice generation

### Phase 9: Customer Accounts
- Account creation
- Booking history
- Re-booking flow
- Review system

---

## Timeline Estimate (MVP)

| Phase | Effort |
|-------|--------|
| Phase 1 (Blueprint) | Done |
| Phase 2 (Backend) | ~3 days |
| Phase 3 (Frontend) | ~4 days |
| Phase 4 (Infrastructure) | ~1 day |
| Phase 5 (Hardening) | ~2 days |
| **Total MVP** | **~10 days** |
