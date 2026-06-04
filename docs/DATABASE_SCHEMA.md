# MeinHelfer — Database Schema

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────┐
│              service_requests               │
├─────────────────────────────────────────────┤
│ id              UUID        PK              │
│ reference_code  VARCHAR(12) UNIQUE NOT NULL │  ← Human-readable (MH-2026-0001)
│ service_type    ENUM        NOT NULL        │
│ helper_count    SMALLINT    NOT NULL        │  ← 1–10
│ scheduled_date  DATE        NOT NULL        │
│ scheduled_time  TIME        NOT NULL        │
│ address_street  VARCHAR(255) NOT NULL       │
│ address_city    VARCHAR(100) NOT NULL       │
│ address_zip     VARCHAR(20)  NOT NULL       │
│ address_notes   TEXT                        │  ← Floor, door code, etc.
│ customer_name   VARCHAR(255) NOT NULL       │
│ customer_email  VARCHAR(255) NOT NULL       │
│ customer_phone  VARCHAR(50)                 │
│ description     TEXT        NOT NULL        │
│ status          ENUM        NOT NULL        │  ← pending|confirmed|in_progress|completed|cancelled
│ admin_notes     TEXT                        │  ← Internal notes
│ assigned_helper VARCHAR(255)                │  ← Free-text name, offline assignment
│ estimated_price NUMERIC(10,2)               │  ← Future: AI estimation
│ estimated_hours NUMERIC(4,1)                │  ← Future: AI estimation
│ ai_summary      TEXT                        │  ← Future: AI-generated summary
│ ai_classified   BOOLEAN     DEFAULT FALSE   │  ← Future: was this AI-classified?
│ created_at      TIMESTAMPTZ NOT NULL        │
│ updated_at      TIMESTAMPTZ NOT NULL        │
│ confirmed_at    TIMESTAMPTZ                 │
│ completed_at    TIMESTAMPTZ                 │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│                  admins                     │
├─────────────────────────────────────────────┤
│ id              UUID        PK              │
│ email           VARCHAR(255) UNIQUE NOT NULL│
│ hashed_password VARCHAR(255) NOT NULL       │
│ full_name       VARCHAR(255) NOT NULL       │
│ is_active       BOOLEAN     DEFAULT TRUE    │
│ last_login_at   TIMESTAMPTZ                 │
│ created_at      TIMESTAMPTZ NOT NULL        │
│ updated_at      TIMESTAMPTZ NOT NULL        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│              request_status_log             │
├─────────────────────────────────────────────┤
│ id              UUID        PK              │
│ request_id      UUID        FK → service_requests.id │
│ old_status      ENUM                        │
│ new_status      ENUM        NOT NULL        │
│ changed_by      UUID        FK → admins.id (nullable) │
│ note            TEXT                        │
│ created_at      TIMESTAMPTZ NOT NULL        │
└─────────────────────────────────────────────┘
```

## Enumerations (PostgreSQL Native ENUMs)

```sql
CREATE TYPE service_type AS ENUM (
  'moving',
  'assembly',
  'loading',
  'cleaning',
  'gardening',
  'general'
);

CREATE TYPE request_status AS ENUM (
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled'
);
```

## Indexes

```sql
-- Fast admin queries
CREATE INDEX idx_requests_status ON service_requests(status);
CREATE INDEX idx_requests_scheduled_date ON service_requests(scheduled_date);
CREATE INDEX idx_requests_created_at ON service_requests(created_at DESC);
CREATE INDEX idx_requests_reference_code ON service_requests(reference_code);

-- Status log
CREATE INDEX idx_status_log_request_id ON request_status_log(request_id);
```

## Constraints

```sql
ALTER TABLE service_requests
  ADD CONSTRAINT chk_helper_count CHECK (helper_count BETWEEN 1 AND 10),
  ADD CONSTRAINT chk_scheduled_date CHECK (scheduled_date >= CURRENT_DATE);
```

## Reference Code Generation

Reference codes follow the pattern `MH-YYYY-NNNN` (e.g. `MH-2026-0047`).  
Generated in the service layer using a sequence, not in the database, to keep logic portable.

## GDPR Considerations

- `customer_email` and `customer_phone` are PII — deletable via `DELETE /api/v1/admin/requests/{id}/anonymize`
- Anonymization replaces personal fields with `[DELETED]` and nulls phone; it does not delete the row (preserves business metrics)
- `description` is cleared during anonymization if it contains identifiable info

## Migration Strategy

Managed by **Alembic** with autogenerate:
```
migrations/
├── env.py
├── script.py.mako
└── versions/
    ├── 0001_create_enums.py
    ├── 0002_create_admins.py
    ├── 0003_create_service_requests.py
    └── 0004_create_status_log.py
```

Zero-downtime migrations: additive only in MVP. Column drops happen in a separate release after code no longer reads them.
