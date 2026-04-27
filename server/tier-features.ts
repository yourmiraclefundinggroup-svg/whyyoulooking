/**
 * Canonical tier feature map for ScoreShift subscription tiers.
 * Maps tier names to in-app feature flags and Array product codes.
 */

export type SubscriptionTier = "none" | "starter" | "pro" | "elite";

export interface TierConfig {
  label: string;
  stripePriceId: string;
  monthlyPrice: number;
  disputeLimit: number | null; // null = unlimited
  features: string[]; // in-app feature flags
  arrayProductCodes: string[]; // Array.com product codes to enroll
}

/**
 * Canonical feature flags used throughout the app.
 * These are checked by requireFeature() and useFeatureAccess().
 */
export const FEATURES = {
  DASHBOARD: "dashboard",
  CREDIT_OVERVIEW: "credit_overview",
  SCORE_TRACKER: "score_tracker",
  BASIC_DISPUTES: "basic_disputes", // 3/month
  UNLIMITED_DISPUTES: "unlimited_disputes",
  CREDIT_ALERTS: "credit_alerts",
  LOB_MAIL: "lob_mail",
  SCORE_SIMULATOR: "score_simulator",
  DEBT_ANALYSIS: "debt_analysis",
  DEBT_NAVIGATOR: "debt_navigator",
  IDENTITY_PROTECT: "identity_protect",
  PRIVACY_PROTECT: "privacy_protect",
  SUBSCRIPTION_MANAGER: "subscription_manager",
  STUDENT_LOAN_AID: "student_loan_aid",
  WHITE_LABEL_DOCS: "white_label_docs",
} as const;

export const TIER_FEATURES: Record<SubscriptionTier, TierConfig> = {
  none: {
    label: "No Plan",
    stripePriceId: "",
    monthlyPrice: 0,
    disputeLimit: 0,
    features: [],
    arrayProductCodes: [],
  },
  starter: {
    label: "Starter",
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID || "price_starter_monthly",
    monthlyPrice: 29,
    disputeLimit: 3,
    features: [
      FEATURES.DASHBOARD,
      FEATURES.CREDIT_OVERVIEW,
      FEATURES.SCORE_TRACKER,
      FEATURES.BASIC_DISPUTES,
    ],
    arrayProductCodes: [],
  },
  pro: {
    label: "Pro",
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || "price_pro_monthly",
    monthlyPrice: 79,
    disputeLimit: null,
    features: [
      FEATURES.DASHBOARD,
      FEATURES.CREDIT_OVERVIEW,
      FEATURES.SCORE_TRACKER,
      FEATURES.BASIC_DISPUTES,
      FEATURES.UNLIMITED_DISPUTES,
      FEATURES.CREDIT_ALERTS,
      FEATURES.LOB_MAIL,
      FEATURES.SCORE_SIMULATOR,
      FEATURES.DEBT_ANALYSIS,
      FEATURES.DEBT_NAVIGATOR,
    ],
    arrayProductCodes: [
      "exp3bStandardMonitoring",
      "creditScoreChangeAlertExp",
      "debtNavPremium",
    ],
  },
  elite: {
    label: "Elite",
    stripePriceId: process.env.STRIPE_ELITE_PRICE_ID || "price_elite_monthly",
    monthlyPrice: 149,
    disputeLimit: null,
    features: [
      FEATURES.DASHBOARD,
      FEATURES.CREDIT_OVERVIEW,
      FEATURES.SCORE_TRACKER,
      FEATURES.BASIC_DISPUTES,
      FEATURES.UNLIMITED_DISPUTES,
      FEATURES.CREDIT_ALERTS,
      FEATURES.LOB_MAIL,
      FEATURES.SCORE_SIMULATOR,
      FEATURES.DEBT_ANALYSIS,
      FEATURES.DEBT_NAVIGATOR,
      FEATURES.IDENTITY_PROTECT,
      FEATURES.PRIVACY_PROTECT,
      FEATURES.SUBSCRIPTION_MANAGER,
      FEATURES.STUDENT_LOAN_AID,
      FEATURES.WHITE_LABEL_DOCS,
    ],
    arrayProductCodes: [
      "exp3bStandardMonitoring",
      "creditScoreChangeAlertExp",
      "debtNavPremium",
      "idpBundle1Insurance1mmRestoreBundleMonitoring",
      "ppPIPApiMonitoringAndRemoval",
      "subscriptionManagerEnrichmentAndCancellation",
      "smTxnSrcFinLnk",
      "pioStudentLoanAidSubmission",
    ],
  },
};

/**
 * Resolve tier from a Stripe price ID.
 * Returns null if price ID doesn't match any tier.
 */
export function tierFromPriceId(priceId: string): SubscriptionTier | null {
  for (const [tier, config] of Object.entries(TIER_FEATURES)) {
    if (tier === "none") continue;
    if (config.stripePriceId && config.stripePriceId === priceId) {
      return tier as SubscriptionTier;
    }
  }
  return null;
}

/**
 * Check whether a tier has access to a given feature flag.
 */
export function tierHasFeature(tier: SubscriptionTier | string | null | undefined, feature: string): boolean {
  const t = (tier || "none") as SubscriptionTier;
  return TIER_FEATURES[t]?.features.includes(feature) ?? false;
}

/**
 * Get the monthly dispute limit for a tier. null = unlimited.
 */
export function getDisputeLimit(tier: SubscriptionTier | string | null | undefined): number | null {
  const t = (tier || "none") as SubscriptionTier;
  return TIER_FEATURES[t]?.disputeLimit ?? 0;
}
