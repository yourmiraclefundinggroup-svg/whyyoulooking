/**
 * Demo Manager — Creates and resets demo accounts for screen recording
 * Demo account: Marcus Johnson — demo@scoreshift.com / Demo2026!
 */

import { db } from "../db";
import {
  users,
  creditReports,
  creditIssues,
  disputes,
  creditGoals,
  disputeLettersNew,
  disputeCalendarEvents,
  auditLog,
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { logAction } from "./audit-engine";

const DEMO_EMAIL = process.env.DEMO_EMAIL || "demo@scoreshift.com";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "Demo2026!";

export async function seedDemoAccount(): Promise<void> {
  console.log("[DemoManager] Seeding demo account for Marcus Johnson...");

  // Check if demo user already exists
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, DEMO_EMAIL))
    .limit(1);

  let demoUserId: number;

  if (existing) {
    demoUserId = existing.id;
    console.log("[DemoManager] Demo user exists, updating...");
  } else {
    const [newUser] = await db
      .insert(users)
      .values({
        firstName: "Marcus",
        lastName: "Johnson",
        email: DEMO_EMAIL,
        phone: "+15551234567",
        smsOptIn: true,
        password: DEMO_PASSWORD,
        accessLevel: "CLIENT_VIEWER",
        isTestUser: true,
        testingNotes: "Demo account for screen recording and sales demos",
        passwordResetRequired: false,
        subscriptionPlan: "PROFESSIONAL",
        subscriptionStatus: "ACTIVE",
      })
      .returning();
    demoUserId = newUser.id;
    console.log("[DemoManager] Created demo user:", demoUserId);
  }

  // Credit Report (Experian primary)
  const [existingReport] = await db
    .select()
    .from(creditReports)
    .where(eq(creditReports.userId, demoUserId))
    .limit(1);

  if (existingReport) {
    await db
      .update(creditReports)
      .set({
        creditScore: 634,
        creditRating: "FAIR",
        utilizationRate: 0.42,
        accountAge: 36,
        lastUpdated: new Date(),
      })
      .where(eq(creditReports.userId, demoUserId));
  } else {
    await db.insert(creditReports).values({
      userId: demoUserId,
      creditScore: 634,
      creditRating: "FAIR",
      utilizationRate: 0.42,
      accountAge: 36,
    });
  }

  // Credit Goal
  const [existingGoal] = await db
    .select()
    .from(creditGoals)
    .where(eq(creditGoals.userId, demoUserId))
    .limit(1);

  if (!existingGoal) {
    await db.insert(creditGoals).values({
      userId: demoUserId,
      targetScore: 680,
      currentScore: 634,
      targetDate: new Date("2026-09-30"),
    });
  }

  // Credit Issues (realistic mix)
  const existingIssues = await db
    .select()
    .from(creditIssues)
    .where(eq(creditIssues.userId, demoUserId));

  if (existingIssues.length === 0) {
    const issuesData = [
      {
        userId: demoUserId,
        type: "COLLECTION" as const,
        title: "Portfolio Recovery Associates",
        description: "Collection account — Original creditor: Capital One — $847",
        amount: 847,
        impact: -45,
        dateAdded: new Date("2023-08-15"),
        status: "DISPUTED",
        creditor: "Portfolio Recovery Associates",
      },
      {
        userId: demoUserId,
        type: "COLLECTION" as const,
        title: "Midland Credit Management",
        description: "Medical collection — Original creditor: Community Health — $1,240",
        amount: 1240,
        impact: -45,
        dateAdded: new Date("2023-05-20"),
        status: "DISPUTED",
        creditor: "Midland Credit Management",
      },
      {
        userId: demoUserId,
        type: "LATE_PAYMENT" as const,
        title: "Chase Bank — 60-Day Late",
        description: "Chase Sapphire — 60-day late payment in June 2023",
        amount: null,
        impact: -25,
        dateAdded: new Date("2023-06-12"),
        status: "DISPUTED",
        creditor: "Chase Bank",
      },
      {
        userId: demoUserId,
        type: "LATE_PAYMENT" as const,
        title: "Synchrony Bank — 30-Day Late",
        description: "Amazon Store Card — 30-day late payment",
        amount: null,
        impact: -15,
        dateAdded: new Date("2023-09-05"),
        status: "DISPUTED",
        creditor: "Synchrony Bank",
      },
      {
        userId: demoUserId,
        type: "CHARGE_OFF" as const,
        title: "Citibank — Charge-Off",
        description: "Citibank credit card charged-off — $2,100",
        amount: 2100,
        impact: -50,
        dateAdded: new Date("2023-02-28"),
        status: "DISPUTED",
        creditor: "Citibank",
      },
      {
        userId: demoUserId,
        type: "COLLECTION" as const,
        title: "LVNV Funding — Removed",
        description: "Collection removed after Round 1 dispute",
        amount: 650,
        impact: 45,
        dateAdded: new Date("2025-09-15"),
        status: "RESOLVED",
        creditor: "LVNV Funding",
      },
      {
        userId: demoUserId,
        type: "LATE_PAYMENT" as const,
        title: "Wells Fargo — 30-Day Late — Removed",
        description: "Late payment removed via goodwill letter",
        amount: null,
        impact: 15,
        dateAdded: new Date("2025-10-01"),
        status: "RESOLVED",
        creditor: "Wells Fargo",
      },
      {
        userId: demoUserId,
        type: "INQUIRY" as const,
        title: "Experian — Hard Inquiry",
        description: "Auto loan inquiry — 2024-03-12",
        amount: null,
        impact: -5,
        dateAdded: new Date("2024-03-12"),
        status: "ACTIVE",
        creditor: "Ford Motor Credit",
      },
    ];

    await db.insert(creditIssues).values(issuesData);
  }

  // Disputes — Round 2 active
  const existingDisputes = await db
    .select()
    .from(disputes)
    .where(eq(disputes.userId, demoUserId));

  if (existingDisputes.length === 0) {
    const issuesList = await db
      .select()
      .from(creditIssues)
      .where(eq(creditIssues.userId, demoUserId));

    const bureauRotation = ["EXPERIAN", "EQUIFAX", "TRANSUNION"] as const;
    for (let i = 0; i < Math.min(issuesList.length, 6); i++) {
      const issue = issuesList[i];
      const bureau = bureauRotation[i % 3];
      await db.insert(disputes).values({
        userId: demoUserId,
        issueId: issue.id,
        bureau,
        status: i < 4 ? "PENDING" : "RESOLVED",
        expectedResponse: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        letterContent: `Round 2 Dispute Letter — ${issue.creditor}\n\nDear Credit Bureau,\n\nI am writing to dispute the above-referenced account...`,
      });
    }
  }

  await logAction({
    action: "demo_account_seeded",
    details: { userId: demoUserId, email: DEMO_EMAIL },
    status: "success",
  });

  console.log("[DemoManager] Demo account ready:", DEMO_EMAIL);
}

export async function resetDemoAccount(): Promise<void> {
  console.log("[DemoManager] Resetting demo account...");

  const [demoUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, DEMO_EMAIL))
    .limit(1);

  if (demoUser) {
    // Delete all associated data
    await db.delete(disputes).where(eq(disputes.userId, demoUser.id));
    await db.delete(creditIssues).where(eq(creditIssues.userId, demoUser.id));
    await db.delete(creditGoals).where(eq(creditGoals.userId, demoUser.id));
    await db.delete(creditReports).where(eq(creditReports.userId, demoUser.id));
    // Delete the user too so seedDemoAccount re-creates clean
    await db.delete(users).where(eq(users.id, demoUser.id));
    console.log("[DemoManager] Deleted existing demo data");
  }

  await seedDemoAccount();
  console.log("[DemoManager] Demo account reset complete");
}
