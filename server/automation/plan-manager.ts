/**
 * Plan Manager — Feature-flag based plan enforcement
 */

import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { logAction } from "./audit-engine";
import { triggerCommunication, COMMUNICATION_TRIGGERS } from "./communication-engine";

export const PLAN_FEATURES: Record<string, string[]> = {
  FREE: ["basic_dashboard", "view_score"],
  BASIC: ["basic_dashboard", "view_score", "1_dispute_round", "document_upload"],
  PROFESSIONAL: [
    "full_dashboard",
    "unlimited_disputes",
    "lob_mail",
    "credit_coach_ai",
    "score_map",
  ],
  ENTERPRISE: [
    "full_dashboard",
    "unlimited_disputes",
    "lob_mail",
    "credit_coach_ai",
    "score_map",
    "denial_decoder",
    "referral_engine",
    "api_access",
  ],
  WHITE_LABEL: [
    "all_features",
    "white_label_portal",
    "custom_branding",
    "client_management",
    "bulk_operations",
    "full_dashboard",
    "unlimited_disputes",
    "lob_mail",
    "credit_coach_ai",
    "score_map",
    "denial_decoder",
    "referral_engine",
    "api_access",
  ],
};

export async function assignPlan(
  userId: number,
  plan: keyof typeof PLAN_FEATURES,
  adminId?: number
): Promise<void> {
  const validPlans = Object.keys(PLAN_FEATURES);
  if (!validPlans.includes(plan)) {
    throw new Error(`Invalid plan: ${plan}. Valid plans: ${validPlans.join(", ")}`);
  }

  await db
    .update(users)
    .set({
      subscriptionPlan: plan,
      subscriptionStatus: "ACTIVE",
    })
    .where(eq(users.id, userId));

  await logAction({
    userId,
    adminId,
    action: "plan_assigned",
    entity: "user",
    entityId: userId,
    details: { plan, features: PLAN_FEATURES[plan] },
    status: "success",
  });

  await triggerCommunication(COMMUNICATION_TRIGGERS.PLAN_ASSIGNED, userId, { plan });
}

export function getPlanFeatures(plan: string): string[] {
  return PLAN_FEATURES[plan] ?? PLAN_FEATURES.FREE;
}

export function hasFeature(plan: string, feature: string): boolean {
  const features = getPlanFeatures(plan);
  return features.includes(feature) || features.includes("all_features");
}
