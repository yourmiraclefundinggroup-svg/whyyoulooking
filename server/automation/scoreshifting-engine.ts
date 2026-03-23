/**
 * ScoreShifting Engine — Automated credit data processing pipeline
 * Runs automatically after every credit report upload
 */

import { db } from "../db";
import { storage } from "../storage";
import {
  creditReportAccounts,
  creditReportCollections,
  creditReportPublicRecords,
  creditIssues,
  creditReports,
  auditLog,
  adminAlerts,
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { logAction, createAdminAlert } from "./audit-engine";

export async function runScoreshiftingEngine(
  uploadId: number,
  userId: number,
  parsedData: {
    creditScore?: number | null;
    accounts?: any[];
    inquiries?: any[];
    collections?: any[];
    publicRecords?: any[];
  }
): Promise<void> {
  console.log(`[ScoreShifting] Starting engine for upload ${uploadId}, user ${userId}`);

  try {
    // Step 1: Update credit_reports with new score
    if (parsedData.creditScore) {
      try {
        const existingReport = await storage.getCreditReport(userId);
        if (existingReport) {
          await storage.updateCreditReport(userId, {
            creditScore: parsedData.creditScore,
            creditRating: getCreditRating(parsedData.creditScore),
            lastUpdated: new Date(),
          });
        } else {
          await storage.createCreditReport({
            userId,
            creditScore: parsedData.creditScore,
            creditRating: getCreditRating(parsedData.creditScore),
            utilizationRate: 0,
            accountAge: 0,
          });
        }
        console.log(`[ScoreShifting] Updated credit score: ${parsedData.creditScore}`);
      } catch (scoreErr) {
        console.error("[ScoreShifting] Failed to update credit score:", scoreErr);
      }
    }

    // Step 2: Create credit_issues for each negative item found
    let issuesCreated = 0;

    // From collections
    if (parsedData.collections && Array.isArray(parsedData.collections)) {
      for (const col of parsedData.collections) {
        try {
          await storage.createCreditIssue({
            userId,
            type: "COLLECTION",
            title: `Collection: ${col.agencyName || "Unknown Agency"}`,
            description: col.originalCreditor
              ? `Collection from ${col.agencyName} (Original: ${col.originalCreditor})${col.amount ? ` — $${col.amount}` : ""}`
              : `Collection account from ${col.agencyName || "Unknown Agency"}${col.amount ? ` — $${col.amount}` : ""}`,
            amount: col.amount || null,
            impact: -45,
            dateAdded: new Date(),
            status: "ACTIVE",
            creditor: col.agencyName || "Unknown Agency",
          });
          issuesCreated++;
        } catch (e) {
          console.error("[ScoreShifting] Failed to create collection issue:", e);
        }
      }
    }

    // From public records
    if (parsedData.publicRecords && Array.isArray(parsedData.publicRecords)) {
      for (const rec of parsedData.publicRecords) {
        try {
          await storage.createCreditIssue({
            userId,
            type: "CHARGE_OFF",
            title: `Public Record: ${rec.recordType || "Unknown"}`,
            description: `${rec.recordType || "Public record"}${rec.court ? ` — ${rec.court}` : ""}${rec.status ? ` (${rec.status})` : ""}`,
            amount: rec.amount || null,
            impact: -80,
            dateAdded: new Date(),
            status: "ACTIVE",
            creditor: rec.court || "Court Record",
          });
          issuesCreated++;
        } catch (e) {
          console.error("[ScoreShifting] Failed to create public record issue:", e);
        }
      }
    }

    // From accounts with derogatory flags
    if (parsedData.accounts && Array.isArray(parsedData.accounts)) {
      for (const acct of parsedData.accounts) {
        const flags: string[] = acct.derogatoryFlags || [];
        const hasDerogatory =
          flags.length > 0 ||
          (acct.paymentStatus &&
            ["charge-off", "charged-off", "collection", "late"].some((k) =>
              acct.paymentStatus.toLowerCase().includes(k)
            ));

        if (!hasDerogatory) continue;

        try {
          let type: "COLLECTION" | "LATE_PAYMENT" | "CHARGE_OFF" | "INQUIRY" = "LATE_PAYMENT";
          let impact = -15;

          if (flags.includes("Charge-off") || flags.includes("Charged-Off")) {
            type = "CHARGE_OFF";
            impact = -50;
          } else if (flags.includes("Collection")) {
            type = "COLLECTION";
            impact = -45;
          } else if (flags.includes("Late Payment")) {
            type = "LATE_PAYMENT";
            impact = -20;
          }

          const lp = acct.latePayments || {};
          const lateDetail =
            lp.days90 > 0
              ? "90+ day late payment"
              : lp.days60 > 0
              ? "60 day late payment"
              : lp.days30 > 0
              ? "30 day late payment"
              : flags.join(", ");

          await storage.createCreditIssue({
            userId,
            type,
            title: `${acct.creditorName}: ${lateDetail || "Derogatory Account"}`,
            description: `${acct.creditorName} — ${acct.accountType || "Account"} — ${acct.paymentStatus || flags.join(", ")}`,
            amount: acct.balance || null,
            impact,
            dateAdded: new Date(),
            status: "ACTIVE",
            creditor: acct.creditorName || "Unknown Creditor",
          });
          issuesCreated++;
        } catch (e) {
          console.error("[ScoreShifting] Failed to create account issue:", e);
        }
      }
    }

    console.log(`[ScoreShifting] Created ${issuesCreated} credit issues`);

    // Step 3: Log "Scoreshifting complete" to audit log
    await logAction({
      userId,
      action: "scoreshifting_complete",
      entity: "credit_report_upload",
      entityId: uploadId,
      details: {
        creditScore: parsedData.creditScore,
        accountsFound: parsedData.accounts?.length || 0,
        inquiriesFound: parsedData.inquiries?.length || 0,
        collectionsFound: parsedData.collections?.length || 0,
        publicRecordsFound: parsedData.publicRecords?.length || 0,
        issuesCreated,
      },
      status: "success",
    });

    console.log(`[ScoreShifting] Engine complete for upload ${uploadId}`);
  } catch (err: any) {
    console.error("[ScoreShifting] Engine error:", err);

    // Step 4: Mark with error and create admin alert
    await logAction({
      userId,
      action: "scoreshifting_failed",
      entity: "credit_report_upload",
      entityId: uploadId,
      details: { error: err.message },
      status: "error",
      errorMessage: err.message,
    }).catch(() => {});

    await createAdminAlert(
      "error",
      "ScoreShifting Engine Failed",
      `Upload ID ${uploadId} for user ${userId} failed during automated processing. Error: ${err.message}`,
      "credit_report_upload",
      uploadId
    ).catch(() => {});

    throw err; // re-throw so caller can also handle
  }
}

function getCreditRating(score: number): string {
  if (score >= 800) return "EXCELLENT";
  if (score >= 740) return "VERY_GOOD";
  if (score >= 670) return "GOOD";
  if (score >= 580) return "FAIR";
  return "POOR";
}
