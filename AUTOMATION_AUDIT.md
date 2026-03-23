# ScoreShift Automation Audit
**Date:** 2026-03-24
**Auditor:** Senior Full-Stack Engineer
**Repo:** /data/.openclaw/workspace/scoreshift-repo

---

## 1. CURRENTLY MANUAL ACTIONS (Admin Must Do By Hand)

| Action | Where | Notes |
|--------|-------|-------|
| Upload credit report PDF/HTML | Admin Portal → Dispute Hub | Admin must select file, pick bureau, click upload |
| Assign client to dispute round | Admin Portal → Clients tab | No automated round progression |
| Generate dispute letters | Admin Portal → Dispute Hub | Admin selects items, clicks generate |
| Send letters via Lob.com | Admin Portal | Admin must click "Send via Lob" manually |
| Assign subscription plan to user | Admin Portal → Users | No self-serve plan upgrade flow wired to DB |
| Create demo account data | None — seed.ts only creates Sarah Johnson | No demo-specific seeding function |
| Reset demo account | Not possible — must manually delete DB records | No reset endpoint |
| Set up white-label account | No white-label table or flow exists | Must be done manually |
| Send welcome SMS/email on signup | Not wired to Twilio/SendGrid | Twilio config exists in settings but not triggered |
| Log admin actions | No audit_log table | Silent — no trail of who did what |
| Create admin alerts for failures | console.error only | Errors vanish into logs |
| Assign credit issues after parse | Not automated post-parse | Admin must review and manually create issues |
| Update credit score from parsed report | Not wired back to credit_reports table | Score exists in upload but not propagated |
| Route leads by source (personal vs business) | No source field on signup | All signups go to same dashboard |

---

## 2. ACTIONS THAT CAN BE AUTOMATED IMMEDIATELY

| Action | Trigger | Automation |
|--------|---------|------------|
| Create credit_issues from parsed report | After parse succeeds | Scan accounts/collections for derogatory flags → create issues |
| Update credit score in credit_reports | After parse succeeds | Copy creditScore from upload → credit_reports record |
| Log "Scoreshifting complete" event | After parse succeeds | Insert into audit_log |
| Create admin alert on parse failure | After parse fails | Insert into admin_alerts with error details |
| Send welcome SMS/email | User signup | Trigger Twilio SMS + SendGrid email |
| Send "report ready" notification | After parse succeeds | Notify client their report is ready |
| Create WL onboarding steps | WL account creation | Auto-create 7 steps, mark step 1 complete |
| Seed demo account | Admin request | idempotent function resets Marcus Johnson data |
| Assign FREE plan on signup | User registration | Default plan set automatically |
| Log all admin actions | Any admin API call | Middleware-level or inline logging |

---

## 3. ACTIONS THAT MUST REMAIN MANUAL (Compliance/Approval)

| Action | Reason |
|--------|--------|
| Approve dispute letters before sending | CROA compliance — consumer must authorize |
| Send letters to credit bureaus | Legal review required before physical mail |
| Mark items as "removed" | Must be verified from bureau response |
| Create legal escalation letters | Attorney review may be required |
| Approve white-label account | KYC/AML checks on business owners |
| Process refunds | Financial reversals require human review |
| Suspend/ban user accounts | Must be reviewed by admin to prevent abuse |

---

## 4. BROKEN FLOWS FOUND

| Issue | File | Description |
|-------|------|-------------|
| Credit score not propagated | routes.ts:5154 | `parseStatus = "succeeded"` sets score on upload but NOT on `credit_reports` table |
| credit_issues not created | routes.ts:5048-5135 | Accounts/collections saved but NO `credit_issues` records created |
| Audit log missing | All routes | No `audit_log` table exists — zero action logging |
| Admin alerts missing | routes.ts:5162 | Parse failures only `console.error`, no DB alert |
| Demo data always shows | dashboard.tsx | Mock data renders regardless of whether real data exists |
| No source tracking on signup | routes.ts | User `source` field doesn't exist in schema |
| White-label has no schema | schema.ts | `white_label_accounts` table missing entirely |
| Communication triggers not wired | routes.ts | Twilio/SendGrid config in settings but zero outbound calls |
| Plan assignment has no automation | routes.ts | Plan stored on user but no feature-flag enforcement |
| Onboarding wizard text | onboarding-wizard.tsx:349 | Says "AI parses" — should say "Scoreshifting" |
| Admin portal text | admin-portal.tsx:1271 | "AI Parsing..." badge — should say "Scoreshifting..." |

---

## 5. AUTOMATION MAP

### User Signup Flow
```
POST /api/auth/register
  → Create user (FREE plan default)
  → Create credit_reports placeholder
  → Log action to audit_log
  → Trigger COMMUNICATION: USER_SIGNED_UP
    → SMS: "Welcome to ScoreShift! Your credit repair journey starts now."
    → Email: Welcome email with next steps
  → If source = "white_label" → redirect to /white-label/onboarding
  → If source = "personal" → redirect to /dashboard
```

### Credit Pull / Scoreshifting Flow
```
POST /api/admin/credit-report-uploads
  → Create upload record (parseStatus: "processing")
  → Background: AI parses PDF/HTML/image
  → runScoreshiftingEngine(uploadId, userId)
    → Update upload: parseStatus = "succeeded"
    → Update credit_reports: creditScore = parsedScore
    → Create credit_issues for each negative item
    → Log "Scoreshifting complete" to audit_log
    → Trigger COMMUNICATION: SCORESHIFTING_COMPLETE
  → On failure:
    → Update upload: parseStatus = "failed", errorFlag = true
    → Create admin_alert (type: "error")
    → Log to audit_log with status: "error"
```

### Dashboard Updates
```
GET /api/dashboard (new endpoint)
  → Fetch credit_reports for user
  → Fetch disputes (count by status)
  → Fetch credit_issues (count active/resolved)
  → Fetch dispute_letters_new (sent count)
  → Return real data OR signal isDemoMode=true if no data
```

### Plan Assignment
```
POST /api/admin/plans/assign
  → Update user.subscriptionPlan
  → Grant feature flags (stored as plan name)
  → Log to audit_log
  → Trigger COMMUNICATION: PLAN_ASSIGNED
```

### Demo Setup
```
POST /api/admin/demo/reset (admin only)
  → Call resetDemoAccount()
  → Delete all demo user data
  → Call seedDemoAccount()
    → Create Marcus Johnson (demo@scoreshift.com)
    → 3-bureau scores: 634/621/628
    → 14 dispute items in Round 2
    → 4 removed items, 3 Lob tracking entries
    → 6 activity feed events
  → Return { success: true }
```

### Lead Routing
```
POST /api/auth/register
  → body.source = "landing_personal" | "landing_business" | "referral" | "direct"
  → Store source in users.leadSource (new field)
  → If source = "landing_business" OR source = "white_label":
    → Auto-create white_label_account
    → Route to /white-label/onboarding
  → Else:
    → Route to /dashboard
```
