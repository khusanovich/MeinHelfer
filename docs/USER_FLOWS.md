# MeinHelfer — User Flows

## Flow 1: Customer Booking Journey

```
[Landing Page]
      │
      ▼
[Click "Jetzt buchen" / "Book Now"]
      │
      ▼
┌─────────────────────────────────┐
│    STEP 1: Select Service       │
│  ○ Umzug (Moving)               │
│  ○ Montage (Assembly)           │
│  ○ Be-/Entladen (Loading)       │
│  ○ Reinigung (Cleaning)         │
│  ○ Gartenarbeit (Gardening)     │
│  ○ Allgemeine Hilfe (General)   │
└─────────────────────────────────┘
      │ Select one → Next
      ▼
┌─────────────────────────────────┐
│    STEP 2: Date & Helpers       │
│  [Date picker — min: tomorrow]  │
│  [Time picker — 07:00–20:00]    │
│  [Number of helpers: 1 2 3 4+]  │
└─────────────────────────────────┘
      │ Fill all → Next
      ▼
┌─────────────────────────────────┐
│    STEP 3: Address              │
│  [Street + Number]              │
│  [ZIP Code]  [City]             │
│  [Floor / Access Notes]         │
└─────────────────────────────────┘
      │ Fill required → Next
      ▼
┌─────────────────────────────────┐
│    STEP 4: Contact & Details    │
│  [Full Name]                    │
│  [Email Address]                │
│  [Phone Number (optional)]      │
│  [Job Description - textarea]   │
└─────────────────────────────────┘
      │ Fill required → Review
      ▼
┌─────────────────────────────────┐
│    STEP 5: Review & Submit      │
│  Summary of all entered data    │
│  [← Edit]  [Submit Request →]   │
└─────────────────────────────────┘
      │ Submit
      ▼
[API: POST /api/v1/requests]
      │ 201 Created
      ▼
┌─────────────────────────────────┐
│    CONFIRMATION PAGE            │
│  ✓ Anfrage erhalten!            │
│  Reference: MH-2026-0047        │
│  "Wir melden uns in Kürze"      │
│  [Save reference code]          │
│  [← Back to Home]               │
└─────────────────────────────────┘
      │ Async
      ▼
[Email sent to customer + admin]
```

**Edge Cases:**
- Form validation in real-time (Zod schema)
- If API fails: show retry option, preserve form data
- If date in the past: show inline error
- Mobile: each step full-screen, swipe-friendly

---

## Flow 2: Admin Request Management

```
[Navigate to /admin]
      │
      ▼ (if not logged in)
┌─────────────────────────────────┐
│         LOGIN PAGE              │
│  [Email]                        │
│  [Password]       [Login]       │
│                                 │
│  After 5 failed: 15min lockout  │
└─────────────────────────────────┘
      │ Valid credentials
      ▼
[API: POST /auth/login → JWT stored in httpOnly cookie]
      │
      ▼
┌─────────────────────────────────┐
│         DASHBOARD               │
│  ┌──────┐ ┌──────┐ ┌──────┐    │
│  │  8   │ │  5   │ │ 124  │    │
│  │Pend. │ │Conf. │ │Done  │    │
│  └──────┘ └──────┘ └──────┘    │
│                                 │
│  Upcoming this week (list)      │
│  New requests (last 24h)        │
└─────────────────────────────────┘
      │
      ▼
[Click "Requests" in sidebar]
      │
      ▼
┌─────────────────────────────────┐
│       REQUEST LIST              │
│  [Search...] [Status ▼] [Date]  │
│  ─────────────────────────────  │
│  MH-0047 | Moving | 20.06 | ●  │  ← status dot
│  MH-0046 | Clean  | 18.06 | ✓  │
│  ...                            │
│  [← 1 2 3 →]                   │
└─────────────────────────────────┘
      │ Click row
      ▼
┌─────────────────────────────────┐
│       REQUEST DETAIL            │
│  MH-2026-0047                   │
│  Service: Umzug   Helper: 2     │
│  Date: 20.06.2026 09:00         │
│  ─────────────────────────────  │
│  Customer: Anna Müller          │
│  Email: anna@example.de         │
│  Phone: +49 151 ...             │
│  ─────────────────────────────  │
│  Address: Musterstr. 42, Berlin │
│  Notes: 3. OG, kein Aufzug      │
│  ─────────────────────────────  │
│  Description: ...               │
│  ─────────────────────────────  │
│  STATUS: [PENDING ▼]            │
│  Assigned Helper: [_______]     │
│  Admin Notes: [textarea]        │
│                    [Save]       │
│  ─────────────────────────────  │
│  Status History:                │
│  • pending → confirmed (10:55)  │
└─────────────────────────────────┘
      │ Change status + save
      ▼
[API: PATCH /admin/requests/{id}]
      │ 200 OK
      ▼
[Success toast + status updated inline]
      │ (if status changed to confirmed/completed)
      ▼
[Customer notification email sent]
```

---

## Flow 3: Status Check (Customer)

```
[Customer has reference code MH-2026-0047]
      │
      ▼
[Navigate to /status or use footer link]
      │
      ▼
[Enter reference code]
      │
      ▼
[API: GET /requests/MH-2026-0047/status]
      │
      ▼
[Show current status + scheduled date]
```

---

## Email Notification Flow

```
Customer submits request
  ├── Customer email:
  │     Subject: "Anfrage MH-2026-0047 erhalten – MeinHelfer"
  │     Body: Summary of request + reference code + "we'll be in touch"
  │
  └── Admin email:
        Subject: "[NEU] Anfrage MH-2026-0047 – Umzug – 20.06.2026"
        Body: Full request details + link to admin panel
```

Status update emails (to customer):
- CONFIRMED: "Your booking is confirmed"
- IN_PROGRESS: (optional, skip for MVP)
- COMPLETED: "Thank you for using MeinHelfer"
- CANCELLED: "Your booking was cancelled"
