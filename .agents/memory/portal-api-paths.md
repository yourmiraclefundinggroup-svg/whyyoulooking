---
name: Portal API paths
description: Correct URL paths for client portal and admin managed-client endpoints
---

## Client Portal (authenticated user reads own data)
- GET /api/me/managed-package
- GET /api/me/case-activities
- GET /api/me/documents

## Admin (manage any client by ID)
- GET/PUT /api/admin/users/:id/managed-package
- GET/POST /api/admin/users/:id/case-activities
- PATCH /api/admin/users/:id/case-activities/:activityId
- GET/POST /api/admin/users/:id/documents
- PATCH /api/admin/users/:id/documents/:docId

**Why:** Old routes used /api/portal/* and /api/admin/managed/* which conflicted with spec and were rejected in code review.
