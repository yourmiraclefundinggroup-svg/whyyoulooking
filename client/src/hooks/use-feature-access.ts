import { useUserContext } from "@/hooks/use-user-context";

export type SubscriptionTier = "none" | "starter" | "pro" | "elite";

export interface TierFeatureMap {
  tier: SubscriptionTier;
  label: string;
  monthlyPrice: number;
  disputeLimit: number | null;
  features: string[];
}

export const FEATURES = {
  DASHBOARD: "dashboard",
  CREDIT_OVERVIEW: "credit_overview",
  SCORE_TRACKER: "score_tracker",
  BASIC_DISPUTES: "basic_disputes",
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

const TIER_MAP: Record<SubscriptionTier, TierFeatureMap> = {
  none: {
    tier: "none",
    label: "No Plan",
    monthlyPrice: 0,
    disputeLimit: 0,
    features: [],
  },
  starter: {
    tier: "starter",
    label: "Starter",
    monthlyPrice: 29,
    disputeLimit: 3,
    features: [
      FEATURES.DASHBOARD,
      FEATURES.CREDIT_OVERVIEW,
      FEATURES.SCORE_TRACKER,
      FEATURES.BASIC_DISPUTES,
    ],
  },
  pro: {
    tier: "pro",
    label: "Pro",
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
  },
  elite: {
    tier: "elite",
    label: "Elite",
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
  },
};

export function useFeatureAccess(feature?: string) {
  const { user } = useUserContext();
  const rawTier = user?.subscriptionTier;
  const tier: SubscriptionTier =
    rawTier === "starter" || rawTier === "pro" || rawTier === "elite"
      ? rawTier
      : "none";
  const config = TIER_MAP[tier] ?? TIER_MAP.none;

  const hasFeature = feature ? config.features.includes(feature) : true;

  const canAccess = (f: string) => config.features.includes(f);

  const upgradeTarget: SubscriptionTier | null = (() => {
    if (!feature) return null;
    if (hasFeature) return null;
    if (TIER_MAP.starter.features.includes(feature)) return "starter";
    if (TIER_MAP.pro.features.includes(feature)) return "pro";
    if (TIER_MAP.elite.features.includes(feature)) return "elite";
    return null;
  })();

  const upgradeLabel = upgradeTarget
    ? `Upgrade to ${TIER_MAP[upgradeTarget].label}`
    : null;

  return {
    tier,
    tierLabel: config.label,
    hasFeature,
    canAccess,
    upgradeTarget,
    upgradeLabel,
    disputeLimit: config.disputeLimit,
    isStarter: tier === "starter",
    isPro: tier === "pro",
    isElite: tier === "elite",
    hasAnyPlan: tier !== "none",
  };
}
