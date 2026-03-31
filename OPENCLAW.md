# ScoreShift — Complete Agent Briefing for OpenClaw

> This document is the authoritative reference for any AI agent or autonomous system working with ScoreShift.
> It covers architecture, every file, all APIs, known bugs, and instructions for making improvements.

---

## 1. What is ScoreShift?

ScoreShift is a **credit repair SaaS platform** for credit repair professionals and their clients. It allows:
- Clients to track their credit repair journey, view disputes, monitor score progress
- Admins to upload client credit reports (PDF/text), AI-parse them, generate dispute letters, and track certified mail

**Stack:** React 18 + TypeScript (frontend) · Express.js + TypeScript (backend) · PostgreSQL via Neon + Drizzle ORM · OpenAI + Anthropic AI

---

## 2. Quick Access

| What | Value |
|------|-------|
| Live Dev URL | https://48f16265-85c1-4406-9443-ba4c6061d564-00-1rsm3f9vuqzbl.kirk.replit.dev |
| Audit Endpoint | GET /api/audit (no auth) |
| API Base | /api/v1/* |
| API Key Header | `X-Api-Key: ss_b64da37c30d784fd9b32014d2fd6231f168cdb892cc6c4ebf22bb61ca2a2805d` |
| Admin Login | admin@scoreshift.com / admin123 |
| DB | PostgreSQL via DATABASE_URL env var |

---

## 3. File Structure

```
/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/             # All page components
│   │   │   ├── landing.tsx    # Public landing page
│   │   │   ├── signup.tsx     # 3-step signup flow
│   │   │   ├── login.tsx      # Auth page
│   │   │   ├── dashboard.tsx  # Client main dashboard (1228 lines)
│   │   │   ├── credit-repair.tsx  # Dispute management
│   │   │   ├── admin-portal.tsx   # Full admin dashboard (3900+ lines)
│   │   │   ├── billing.tsx    # Subscription management
│   │   │   ├── education.tsx  # Credit education content
│   │   │   ├── lead-form.tsx  # Lead capture with SMS opt-in
│   │   │   ├── privacy-policy.tsx
│   │   │   └── terms.tsx
│   │   ├── components/        # Shared components
│   │   │   ├── onboarding-wizard.tsx  # New user setup wizard
│   │   │   ├── trial-upgrade-wall.tsx # Trial/subscription gate
│   │   │   ├── dispute-letter-modal.tsx
│   │   │   ├── credit-report-uploader.tsx
│   │   │   ├── support-chat.tsx
│   │   │   ├── navigation.tsx
│   │   │   └── ...many more
│   │   ├── hooks/
│   │   │   ├── use-user-context.tsx   # Global user state
│   │   │   └── use-toast.ts
│   │   ├── lib/
│   │   │   └── queryClient.ts  # TanStack Query + apiRequest helper
│   │   └── App.tsx             # Router + TrialUpgradeWall
├── server/
│   ├── routes.ts              # ALL backend API routes (6200+ lines)
│   ├── storage.ts             # Database abstraction layer (IStorage interface)
│   ├── db.ts                  # Drizzle DB connection
│   ├── ai-service.ts          # OpenAI helpers
│   ├── usps-api.ts            # USPS OAuth + tracking
│   ├── stripe-service.ts      # Stripe subscription logic
│   └── integrations/
│       └── credit-bureaus.ts  # Experian API client
├── shared/
│   └── schema.ts              # ALL database tables + Zod schemas (single source of truth)
├── OPENCLAW.md                # This file
└── replit.md                  # Project overview (kept in AI memory)
```

---

## 4. Database Schema (Key Tables)

All defined in `shared/schema.ts`. Database is PostgreSQL.

### users
```
id, email, password (hashed), firstName, lastName, phone, smsOptIn,
accessLevel (ADMIN | CLIENT_VIEWER), 
subscriptionPlan (FREE | BASIC | PROFESSIONAL | ENTERPRISE),
subscriptionStatus (TRIALING | ACTIVE | CANCELLED | EXPIRED),
passwordResetRequired (bool), createdAt
```

### credit_report_uploads
```
id, userId, fileName, fileType, sourceFormat (pdf|html|txt|csv),
bureau (EXPERIAN|EQUIFAX|TRANSUNION),
parseStatus (processing|succeeded|failed),
creditScore, uploadedAt, createdAt
```

### credit_report_accounts (linked to upload by uploadId)
```
id, uploadId, accountName, accountNumber, accountType,
status (OPEN|CLOSED|CHARGE_OFF|COLLECTION),
balance, creditLimit, paymentStatus, openDate, lastReported
```

### credit_report_inquiries
```
id, uploadId, creditorName, inquiryDate, inquiryType (HARD|SOFT)
```

### credit_report_collections
```
id, uploadId, agencyName, originalCreditor, amount,
dateReported, accountNumber
```

### credit_report_public_records
```
id, uploadId, recordType (BANKRUPTCY|JUDGMENT|TAX_LIEN),
court, dateFiled, amount, status
```

### disputes
```
id, userId, creditor, accountNumber, reason, status (PENDING|IN_PROGRESS|RESOLVED),
bureau, createdAt
```

### dispute_letters_new
```
id, userId, clientId, letterType, content (full letter text),
bureau, trackingNumber, status, sentAt, deliveredAt, createdAt
```

### credit_reports (legacy)
```
id, userId, creditScore, utilizationRate, totalAccounts,
negativeItems, lastUpdated
```

---

## 5. All API Endpoints

### Public (no auth)
```
GET  /api/audit                          Full site audit JSON
POST /api/auth/login                     { email, password } → { token, user }
GET  /api/auth/user                      Current session user
```

### Client (JWT auth via Authorization: Bearer <token>)
```
GET  /api/credit-reports                 Current user's credit report
GET  /api/my-credit-report              Parsed accounts/inquiries/collections
GET  /api/credit-issues                  Credit issues list
POST /api/credit-issues                  Create issue
GET  /api/disputes                       User's disputes
POST /api/disputes                       Create dispute
GET  /api/my-dispute-letters            User's dispute letters
POST /api/onboarding/request-credit-report  Notify admin to upload report
GET  /api/credit-goals                   User's credit goal
POST /api/credit-goals                   Set credit goal
GET  /api/ai/support-chat               Support chat history
POST /api/ai/support-chat               Send message to AI support
```

### Admin (JWT auth, accessLevel=ADMIN)
```
GET  /api/users                          All users
POST /api/users                          Create user
GET  /api/users/:id                      Get user
PATCH /api/users/:id                     Update user
GET  /api/admin/credit-report-uploads    All uploads
POST /api/admin/credit-report-uploads    Upload + trigger AI parse
GET  /api/admin/credit-report-uploads/:id/details  Parsed data
POST /api/admin/parse-credit-report-ai   AI parse raw text
GET  /api/dispute-letters-new            All letters
POST /api/dispute-letters-new            Create letter
PATCH /api/dispute-letters-new/:id       Update letter
POST /api/generate-dispute-letter        AI generate letter
GET  /api/usps/track/:trackingNumber     USPS tracking lookup
```

### OpenClaw API v1 (X-Api-Key header)
```
GET  /api/v1/clients                     All clients with stats
GET  /api/v1/clients/:id                 Full client profile
POST /api/v1/clients                     Create client
PATCH /api/v1/clients/:id               Update client
GET  /api/v1/credit-reports              All credit report uploads
GET  /api/v1/credit-reports/:id          Parsed credit report detail
GET  /api/v1/disputes                    All disputes
GET  /api/v1/letters                     All dispute letters
GET  /api/v1/stats                       Platform-wide stats + integration status
POST /api/v1/generate-letter             AI generate dispute letter (Claude primary, full professional format)
```

#### POST /api/v1/generate-letter — DisputeIQ Letter Generation

**Primary letter generation endpoint.** Uses Claude (Anthropic) exclusively. Generates professionally formatted, section-rich dispute letters matching real-world credit repair attorney standards.

**Request body (`DisputeIQParams`):**
```json
{
  "clientId": 1,
  "creditor": "Portfolio Recovery Associates",
  "accountNumber": "XXXX1234",
  "issueType": "COLLECTION",
  "description": "This account does not belong to me.",
  "bureau": "EXPERIAN",
  "roundNumber": 1,
  "letterType": "general",
  "accounts": [
    {
      "accountNumber": "XXXX1234",
      "dateOpened": "2019-03-15",
      "originalBalance": "$2,400",
      "currentBalance": "$2,847",
      "reportedStatus": "Collection/Charge-Off"
    }
  ]
}
```

**Field reference:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| clientId | number | Yes | ID of the client in the ScoreShift database |
| creditor | string | Yes | Creditor/furnisher name (exact as on credit report) |
| accountNumber | string | No | Account number (last 4 or partial is fine) |
| issueType | string | No | Free-form issue type; used for auto-detecting letterType if not provided |
| description | string | No | Dispute reason / description of the inaccuracy |
| bureau | "EXPERIAN" \| "EQUIFAX" \| "TRANSUNION" | No | Target bureau; defaults to EXPERIAN |
| roundNumber | number (1–5) | No | Dispute round; drives escalation language. Defaults to 1 |
| letterType | string | No | See letter type values below. Auto-detected from issueType if omitted |
| accounts | DisputeIQAccount[] | No | Array of account objects for multi-account table in the letter |

**`letterType` values:**

| Value | When to use | Key legal content |
|-------|-------------|-------------------|
| `"general"` | Standard FCRA disputes, collections, charge-offs | FCRA §§ 1681e(b), 1681i(a), 1681i(a)(5)(A), 1681s-2 |
| `"late_payment_metro2"` | Late payment entries; payment rating inaccuracies | Metro 2® CRRG Payment Rating, PHF, DOFD, XB Compliance Condition Code |
| `"closed_school"` | Student loans from closed schools (e.g. Corinthian, ITT Tech) | 34 CFR § 685.214 Closed School Discharge, 20 U.S.C. § 1087(c) |
| `"identity_theft"` | Fraudulently opened accounts | FCRA § 605B block demand, § 1681c-2, § 1681s-2(a)(6) |

**Auto-detection rules** (when `letterType` is omitted):
- issueType contains "late_payment" → `late_payment_metro2`
- issueType contains "closed_school" or "closed school" → `closed_school`
- issueType contains "identity" or "fraud" → `identity_theft`
- Everything else → `general`

**Generated letter structure:**
```
[Client name in ALL CAPS]
[Address]
[DOB, SSN last 4, phone, email — if on file]

[Date]
Sent Via Certified Mail — Return Receipt Requested

[Full bureau mailing address]

RE: Formal Dispute — [type] | Furnisher: [creditor] | Account: [number]

Dear [Bureau] Dispute Department,

I.   BACKGROUND
II.  DISPUTED ACCOUNTS  [account table if multiple accounts]
III. SPECIFIC INACCURACIES
IV.  LEGAL BASIS  [statutes specific to letterType]
V.   DEMANDS  [6–8 numbered demands]
VI.  LEGAL CONSEQUENCES  [statutory damages, CFPB, state AG, private action]
VII. ENCLOSURES  [tailored to letterType]

[Signature block]

NOTE: All three bureau addresses listed at bottom
```

**Response:**
```json
{
  "letter": "JOHN DOE\n123 Main St\n...",
  "client": { "id": 1, "name": "John Doe" },
  "letterType": "general",
  "generatedAt": "2026-03-31T12:00:00.000Z"
}
```

---

## 6. Known Issues (Priority Order)

### 🔴 HIGH — Experian API Not Working
- **Files:** `server/integrations/credit-bureaus.ts`, `server/routes.ts` (search "experian")
- **Problem:** EXPERIAN_CLIENT_ID and EXPERIAN_CLIENT_SECRET are set in env but the OAuth token fetch and credit report pull are failing
- **Impact:** Clients cannot auto-pull their credit report. Admin must manually upload
- **Fix needed:** Debug the OAuth 2.0 flow in `credit-bureaus.ts`, verify the correct Experian API endpoints and scopes, test with a real account

### 🟡 MEDIUM — USPS Tracking Needs Live Testing
- **Files:** `server/usps-api.ts`
- **Problem:** OAuth credentials are set, tracking endpoint implemented, but never tested with real tracking numbers
- **Impact:** Certified mail tracking on dispute letters shows no live data
- **Fix needed:** Test the USPS OAuth flow, verify tracking number format, test with a real certified mail piece

### 🟡 MEDIUM — Admin Password is Weak
- **Problem:** admin@scoreshift.com / admin123 — this is hardcoded in seed
- **File:** `server/seed.ts`
- **Fix needed:** Change password, add environment variable for admin credentials

### 🟡 MEDIUM — Fake "+23 pts this month" Hardcoded
- **Files:** `client/src/pages/dashboard.tsx` (search "+23 points")
- **Problem:** The credit score trend is hardcoded, not calculated from real data
- **Fix needed:** Track historical credit scores in DB and calculate real trends

### 🟢 LOW — Sendgrid Not Fully Wired
- **Problem:** Sendgrid is installed but email notifications not sent for key events (new client, report uploaded, dispute sent)
- **Fix needed:** Add email notification calls in key server routes

### 🟢 LOW — Trial Wall May Block Billing Route Edge Cases
- **Files:** `client/src/components/trial-upgrade-wall.tsx`
- **Problem:** Edge cases around /checkout params might not all be covered
- **Fix:** Test the full /checkout?plan=BASIC flow for trial users

---

## 7. How the Credit Report Flow Works

1. **Admin uploads** a PDF/HTML/TXT credit file via admin portal → `POST /api/admin/credit-report-uploads`
2. Server reads the file content, sends to **Anthropic Claude** for AI parsing
3. Claude extracts: accounts, inquiries, collections, public records, credit score
4. Data is saved to: `credit_report_accounts`, `credit_report_inquiries`, `credit_report_collections`, `credit_report_public_records`
5. Upload `parseStatus` changes from `processing` → `succeeded`
6. Client's dashboard now shows real data (onboarding wizard disappears)
7. Admin can generate **dispute letters** for specific accounts using AI
8. Letters are sent via certified mail, tracking number entered manually
9. **USPS tracking** polls for delivery status

---

## 8. Authentication Flow

- Login via `POST /api/auth/login` → returns JWT token
- Token stored in localStorage, sent as `Authorization: Bearer <token>`
- `authenticateToken` middleware verifies JWT
- `requireAdmin` middleware checks `accessLevel === "ADMIN"`
- `requireClientAccess` allows both admins and clients

---

## 9. How to Make Changes

Since this app runs on Replit and OpenClaw runs locally:

1. **Read data:** Use the `/api/v1/*` endpoints with `X-Api-Key`
2. **Suggest code changes:** Describe what to change → relay to the Replit agent via chat
3. **Test changes:** Hit the dev URL after changes are applied
4. **Full audit:** Start with `GET /api/audit` for a live snapshot

---

## 10. Environment Variables

| Variable | Purpose | Status |
|----------|---------|--------|
| DATABASE_URL | PostgreSQL connection | ✅ Set |
| OPENAI_API_KEY | GPT-4o for AI features | ✅ Set |
| ANTHROPIC_API_KEY | Claude for credit parsing | ✅ Set |
| STRIPE_SECRET_KEY | Stripe payments | ✅ Set |
| VITE_STRIPE_PUBLIC_KEY | Stripe frontend | ✅ Set |
| EXPERIAN_CLIENT_ID | Experian OAuth | ✅ Set (but API broken) |
| EXPERIAN_CLIENT_SECRET | Experian OAuth | ✅ Set (but API broken) |
| USPS_CLIENT_ID | USPS OAuth | ✅ Set (untested) |
| USPS_CLIENT_SECRET | USPS OAuth | ✅ Set (untested) |
| OPENCLAW_API_KEY | OpenClaw agent access | ✅ Set |
| SESSION_SECRET | Express sessions | ✅ Set |

---

## 11. Sample API Calls

### Get all clients
```bash
curl -H "X-Api-Key: ss_b64da37c30d784fd9b32014d2fd6231f168cdb892cc6c4ebf22bb61ca2a2805d" \
  https://<your-domain>/api/v1/clients
```

### Get platform stats
```bash
curl -H "X-Api-Key: ss_b64da37c30d784fd9b32014d2fd6231f168cdb892cc6c4ebf22bb61ca2a2805d" \
  https://<your-domain>/api/v1/stats
```

### Generate a dispute letter (general FCRA)
```bash
curl -X POST \
  -H "X-Api-Key: ss_b64da37c30d784fd9b32014d2fd6231f168cdb892cc6c4ebf22bb61ca2a2805d" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": 1,
    "issueType": "COLLECTION",
    "creditor": "Portfolio Recovery Associates",
    "accountNumber": "XXXX1234",
    "description": "This collection account does not belong to me and should be investigated.",
    "bureau": "EXPERIAN",
    "roundNumber": 1,
    "letterType": "general"
  }' \
  https://<your-domain>/api/v1/generate-letter
```

### Generate a late payment / Metro 2 dispute letter
```bash
curl -X POST \
  -H "X-Api-Key: ss_b64da37c30d784fd9b32014d2fd6231f168cdb892cc6c4ebf22bb61ca2a2805d" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": 1,
    "issueType": "LATE_PAYMENT",
    "creditor": "Capital One",
    "accountNumber": "XXXX5678",
    "description": "Payment was made on time in March 2023 but is incorrectly reported as 30 days late.",
    "bureau": "EQUIFAX",
    "roundNumber": 1,
    "letterType": "late_payment_metro2"
  }' \
  https://<your-domain>/api/v1/generate-letter
```

### Generate a closed school discharge letter
```bash
curl -X POST \
  -H "X-Api-Key: ss_b64da37c30d784fd9b32014d2fd6231f168cdb892cc6c4ebf22bb61ca2a2805d" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": 1,
    "issueType": "STUDENT_LOAN",
    "creditor": "Navient",
    "accountNumber": "XXXX9012",
    "description": "Student loan from Corinthian Colleges, which closed in 2015. Client is eligible for closed school discharge under 34 CFR 685.214.",
    "bureau": "TRANSUNION",
    "roundNumber": 1,
    "letterType": "closed_school"
  }' \
  https://<your-domain>/api/v1/generate-letter
```

### Generate an identity theft / FCRA 605B block letter
```bash
curl -X POST \
  -H "X-Api-Key: ss_b64da37c30d784fd9b32014d2fd6231f168cdb892cc6c4ebf22bb61ca2a2805d" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": 1,
    "issueType": "IDENTITY_THEFT",
    "creditor": "Synchrony Bank",
    "accountNumber": "XXXX3456",
    "description": "This account was opened fraudulently without my knowledge or consent. I am a victim of identity theft.",
    "bureau": "EXPERIAN",
    "roundNumber": 1,
    "letterType": "identity_theft"
  }' \
  https://<your-domain>/api/v1/generate-letter
```

### Full site audit
```bash
curl https://<your-domain>/api/audit
```
