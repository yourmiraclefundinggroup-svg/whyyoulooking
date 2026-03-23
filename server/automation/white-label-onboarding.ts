/**
 * White-Label Onboarding Automation
 * Runs when a new white-label account is created
 * Handles all setup steps automatically
 */

import { db } from "../db";
import { whiteLabelAccounts, whiteLabelOnboardingSteps, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { logAction, createAdminAlert } from "./audit-engine";

const ONBOARDING_STEPS = [
  { stepName: "account_created", label: "Account Created", autoComplete: true },
  { stepName: "branding_setup", label: "Set Up Branding", autoComplete: false },
  { stepName: "first_client_added", label: "Add First Client", autoComplete: false },
  { stepName: "first_report_uploaded", label: "Upload First Report", autoComplete: false },
  { stepName: "first_letter_generated", label: "Generate First Dispute Letter", autoComplete: false },
  { stepName: "stripe_connected", label: "Connect Stripe for Billing", autoComplete: false },
  { stepName: "onboarding_complete", label: "Onboarding Complete", autoComplete: false },
];

export async function initializeWhiteLabelAccount(
  userId: number,
  brandName: string
): Promise<{ accountId: number }> {
  console.log(`[WL Onboarding] Initializing white-label account for user ${userId}, brand: ${brandName}`);

  // Step 1: Create white_label_accounts record
  const [account] = await db
    .insert(whiteLabelAccounts)
    .values({
      ownerUserId: userId,
      brandName,
      setupProgress: 14, // 1/7 steps = 14%
      status: "trial",
      onboardingCompleted: false,
    })
    .returning();

  // Step 2: Create all 7 onboarding steps
  for (const step of ONBOARDING_STEPS) {
    const isFirstStep = step.stepName === "account_created";
    await db.insert(whiteLabelOnboardingSteps).values({
      accountId: account.id,
      stepName: step.stepName,
      stepStatus: isFirstStep ? "completed" : "pending",
      completedAt: isFirstStep ? new Date() : null,
      autoCompleted: isFirstStep ? true : false,
    });
  }

  // Step 3: Log the initialization
  await logAction({
    userId,
    action: "white_label_account_created",
    entity: "white_label_account",
    entityId: account.id,
    details: { brandName, setupProgress: 14 },
    status: "success",
  });

  console.log(`[WL Onboarding] Account ${account.id} initialized with 7 steps`);
  return { accountId: account.id };
}

export async function completeOnboardingStep(
  accountId: number,
  stepName: string,
  autoCompleted = false
): Promise<void> {
  // Mark the step complete
  const steps = await db
    .select()
    .from(whiteLabelOnboardingSteps)
    .where(eq(whiteLabelOnboardingSteps.accountId, accountId));

  const step = steps.find((s) => s.stepName === stepName);
  if (!step) return;

  if (step.stepStatus === "completed") return; // Already done

  await db
    .update(whiteLabelOnboardingSteps)
    .set({ stepStatus: "completed", completedAt: new Date(), autoCompleted })
    .where(eq(whiteLabelOnboardingSteps.id, step.id));

  // Recalculate progress
  const completedCount = steps.filter(
    (s) => s.stepName === stepName || s.stepStatus === "completed"
  ).length;
  const progress = Math.round((completedCount / ONBOARDING_STEPS.length) * 100);

  const allComplete = completedCount >= ONBOARDING_STEPS.length;

  await db
    .update(whiteLabelAccounts)
    .set({
      setupProgress: progress,
      onboardingCompleted: allComplete,
    })
    .where(eq(whiteLabelAccounts.id, accountId));
}

export async function getOnboardingStatus(accountId: number) {
  const [account] = await db
    .select()
    .from(whiteLabelAccounts)
    .where(eq(whiteLabelAccounts.id, accountId))
    .limit(1);

  const steps = await db
    .select()
    .from(whiteLabelOnboardingSteps)
    .where(eq(whiteLabelOnboardingSteps.accountId, accountId));

  return { account, steps };
}
