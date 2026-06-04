# MeinHelfer — Product Requirements Document

## 1. Product Overview

**Product Name:** MeinHelfer ("My Helper")  
**Type:** Managed Service Marketplace MVP  
**Version:** 1.0.0  
**Date:** 2026-06-05  

### Vision
A trusted, human-first platform where customers can book reliable helpers for everyday physical tasks — with the platform owner personally vetting and dispatching every helper.

### Problem
Finding reliable, vetted help for moving, cleaning, or assembly is fragmented and trust-deficient. Customers get strangers from apps with no accountability; helpers compete on price in a race to the bottom.

### Solution
A curated marketplace with no public helper registration. The platform owner is the single trusted broker: customers submit requests, the owner assigns known, vetted helpers manually.

---

## 2. Stakeholders

| Role | Description |
|------|-------------|
| Customer | Books services via the public website |
| Admin (Platform Owner) | Manages all bookings, assigns helpers, controls the platform |
| Helper | Trusted contractor, assigned offline — no platform account in MVP |

---

## 3. MVP Scope

### In Scope
- Public service request form
- Admin dashboard (login-protected)
- Request lifecycle management
- Basic statistics dashboard
- Email notifications (customer confirmation + admin alert)
- Docker-based deployment

### Out of Scope (MVP)
- Helper accounts / helper portal
- Online payments
- Real-time chat
- Customer accounts / history
- Review system
- AI features (architecture prepared, not implemented)

---

## 4. User Stories

### Customer
| ID | Story | Priority |
|----|-------|----------|
| C-01 | As a customer, I can select a service type so I know I'm booking the right help | Must |
| C-02 | As a customer, I can specify number of helpers needed | Must |
| C-03 | As a customer, I can select preferred date and time | Must |
| C-04 | As a customer, I can enter my address | Must |
| C-05 | As a customer, I can describe the job in detail | Must |
| C-06 | As a customer, I receive a confirmation after submitting | Must |
| C-07 | As a customer, I can see estimated duration and price (future AI) | Future |

### Admin
| ID | Story | Priority |
|----|-------|----------|
| A-01 | As admin, I can log in securely | Must |
| A-02 | As admin, I can see all submitted requests | Must |
| A-03 | As admin, I can view full request details | Must |
| A-04 | As admin, I can update request status | Must |
| A-05 | As admin, I can record which helper was assigned | Must |
| A-06 | As admin, I can add internal notes to a request | Must |
| A-07 | As admin, I see a dashboard with key stats | Must |
| A-08 | As admin, I can filter/search requests | Should |
| A-09 | As admin, I receive a notification for new requests | Should |

---

## 5. Service Types

| Key | Label | Description |
|-----|-------|-------------|
| moving | Umzug | Moving apartments or offices |
| assembly | Montage | Furniture / IKEA assembly |
| loading | Be-/Entladen | Loading / unloading trucks or containers |
| cleaning | Reinigung | Deep or regular cleaning |
| gardening | Gartenarbeit | Garden work and landscaping |
| general | Allgemeine Hilfe | General daily task assistance |

---

## 6. Request Lifecycle

```
PENDING → CONFIRMED → IN_PROGRESS → COMPLETED
                    ↘ CANCELLED
```

| Status | Meaning |
|--------|---------|
| PENDING | Customer submitted, admin not yet reviewed |
| CONFIRMED | Admin confirmed, helper assigned offline |
| IN_PROGRESS | Job is actively happening |
| COMPLETED | Job done |
| CANCELLED | Cancelled by admin or customer request |

---

## 7. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Response time (API) | < 200ms p95 |
| Uptime | 99.5% |
| Security | OWASP Top 10 mitigations |
| Data residency | EU (Hetzner Germany) |
| GDPR | Customer data deletable on request |
| Accessibility | WCAG 2.1 AA |
| Mobile | Fully responsive (mobile-first customer form) |

---

## 8. Success Metrics (MVP)

- First booking submitted within 48h of launch
- Admin can process a request end-to-end in < 2 minutes
- Zero security incidents in first 90 days
- Customer form completion rate > 60%
