---
name: Managed client schema
description: Correct field names for managedClientPackages, clientCaseActivities, clientDocuments tables
---

## managedClientPackages
caseStatus (not "status"), casesSummary (not "notes"), totalInvestment/amountPaid/paymentPlanType/nextPaymentAmount/nextPaymentDue/paymentStatus (not monthlyFee), assignedSpecialist, enrollmentDate (not startDate), servicesIncluded (jsonb array).
Removed: itemsIdentified, itemsRemoved, itemsInProgress, pointsGained, nextActionNote, nextActionDate.

## clientCaseActivities
description (not "title"), status (completed|in_progress|pending|waiting), occurredAt (not createdAt). No performedBy, no isVisibleToClient.

## clientDocuments
userId, documentType, label, status (needed|uploaded|reviewed|approved), uploadedAt. Simplified — no fileName, fileSize, mimeType, filePath, reviewedAt, adminNotes.

**Why:** Previous schema used item-count fields that conflicted with the spec. Spec tracks financials (investment/payments) not dispute item counts.

**How to apply:** Any code touching these tables must use the new field names. Admin panel forms must use caseStatus, not status.
