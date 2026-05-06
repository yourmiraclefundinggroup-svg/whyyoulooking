import { useState, useEffect, useRef, ComponentType } from "react";
import { useUserContext } from "@/hooks/use-user-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  useArrayScript,
  ARRAY_SANDBOX_APP_KEY,
  ARRAY_SANDBOX_API_URL,
  ARRAY_SANDBOX_TOKENS,
} from "@/hooks/use-array-script";
import { useFeatureAccess, FEATURES, type SubscriptionTier } from "@/hooks/use-feature-access";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield, CreditCard, TrendingUp, AlertTriangle, Eye,
  GraduationCap, Navigation, CheckCircle, Lock, ArrowRight,
  BarChart3, Zap, Star, FileSearch
} from "lucide-react";
import { Link } from "wouter";
import { ScoreShiftLogo } from "@/components/scoreshift-logo";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "array-account-enroll": Record<string, string | undefined>;
      "array-credit-overview": Record<string, string | undefined>;
      "array-credit-report": Record<string, string | undefined>;
      "array-credit-score": Record<string, string | undefined>;
      "array-credit-debt-analysis": Record<string, string | undefined>;
      "array-credit-score-simulator": Record<string, string | undefined>;
      "array-credit-alerts": Record<string, string | undefined>;
      "array-identity-protect": Record<string, string | undefined>;
      "array-pip-dashboard": Record<string, string | undefined>;
      "array-pip-scan": Record<string, string | undefined>;
      "array-subscription-manager": Record<string, string | undefined>;
      "array-student-loan-navigator": Record<string, string | undefined>;
      "array-student-loan-aid": Record<string, string | undefined>;
      "array-debt-navigator": Record<string, string | undefined>;
    }
  }
}

interface EnrollmentData {
  enrolled: boolean;
  arrayUserId: string | null;
  productCodes: string[];
  enrolledAt: string | null;
}

const TIER_UPGRADE_LABELS: Record<SubscriptionTier, string> = {
  none: "Choose a Plan",
  starter: "Upgrade to Starter",
  pro: "Upgrade to Pro",
  elite: "Upgrade to Elite",
};

const TIER_BADGE_STYLES: Record<SubscriptionTier, string> = {
  none: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600",
  starter: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  pro: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30",
  elite: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/30",
};

const BUREAU_CONFIG = {
  Experian: { color: "#0062FF", dot: "bg-[#0062FF]" },
  Equifax: { color: "#E12726", dot: "bg-[#E12726]" },
  TransUnion: { color: "#662D8C", dot: "bg-[#662D8C]" },
} as const;

/* ── Tier upgrade card ───────────────────────────────────────────────────── */
function TierUpgradeCard({
  label,
  icon: Icon,
  description,
  requiredTier,
}: {
  label: string;
  icon: ComponentType<{ className?: string }>;
  description: string;
  requiredTier: SubscriptionTier;
}) {
  const colorMap: Record<SubscriptionTier, { bg: string; icon: string; border: string; btn: string }> = {
    none:    { bg: "bg-amber-50 dark:bg-amber-950/20", icon: "bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400", border: "border-amber-200 dark:border-amber-500/25", btn: "bg-amber-500 hover:bg-amber-600 text-white" },
    starter: { bg: "bg-amber-50 dark:bg-amber-950/20", icon: "bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400", border: "border-amber-200 dark:border-amber-500/25", btn: "bg-amber-500 hover:bg-amber-600 text-white" },
    pro:     { bg: "bg-blue-50 dark:bg-blue-950/20",   icon: "bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400",    border: "border-blue-200 dark:border-blue-500/25",   btn: "bg-blue-600 hover:bg-blue-700 text-white" },
    elite:   { bg: "bg-violet-50 dark:bg-violet-950/20", icon: "bg-violet-100 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400", border: "border-violet-200 dark:border-violet-500/25", btn: "bg-violet-600 hover:bg-violet-700 text-white" },
  };

  const c = colorMap[requiredTier] ?? colorMap.starter;
  const tierLabel = requiredTier === "pro" ? "Pro" : requiredTier === "elite" ? "Elite" : "Starter";

  return (
    <div className={`rounded-xl border p-5 ${c.bg} ${c.border}`}>
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{label}</h3>
            <Lock className="h-3.5 w-3.5 text-slate-400" />
            <Badge variant="outline" className="text-xs ml-auto shrink-0">
              Available in {tierLabel} plan
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">{description}</p>
          <Link href="/pricing">
            <Button size="sm" className={`gap-1.5 text-xs font-semibold ${c.btn}`}>
              {TIER_UPGRADE_LABELS[requiredTier]}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Array component wrapper ─────────────────────────────────────────────── */
function CreditComponent({
  tag,
  appKey,
  userToken,
  onEnroll,
  scriptReady,
  isEnrollment,
  attrs,
}: {
  tag: string;
  appKey: string;
  userToken?: string;
  onEnroll?: () => void;
  scriptReady?: boolean;
  isEnrollment?: boolean;
  attrs?: Record<string, string>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !appKey) return;
    if (scriptReady === false) return;
    containerRef.current.innerHTML = "";

    const el = document.createElement(tag);
    el.setAttribute("appKey", appKey);
    el.setAttribute("apiUrl", ARRAY_SANDBOX_API_URL);
    el.setAttribute("sandbox", "true");
    if (userToken) el.setAttribute("userToken", userToken);
    if (isEnrollment) el.setAttribute("showQuickView", "true");
    if (attrs) {
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    }

    const handleEvent = (e: Event) => {
      const detail = (e as CustomEvent<{ tagName?: string; type?: string }>).detail;
      if ((detail?.tagName === "account-enroll" || detail?.type === "enroll-success") && onEnroll) {
        onEnroll();
      }
    };

    el.addEventListener("array-event", handleEvent);
    containerRef.current.appendChild(el);

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [tag, appKey, userToken, scriptReady, onEnroll, isEnrollment, attrs]);

  if (scriptReady === false) {
    return (
      <div className="w-full min-h-[200px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent ss-spinner" />
          <p className="text-xs text-slate-400 dark:text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className="w-full min-h-[200px]" />;
}

/* ── Branded Array card wrapper ──────────────────────────────────────────── */
function ArrayCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#0F1E35] overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-white/[0.05]">
        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <span className="ml-auto text-[10px] text-slate-300 dark:text-slate-600 font-medium">
          Powered by ScoreShift
        </span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ── Tab definition ──────────────────────────────────────────────────────── */
const TABS = [
  {
    id: "overview",
    label: "Overview",
    subtitle: "Scores & summary",
    icon: BarChart3,
  },
  {
    id: "report",
    label: "Full Report",
    subtitle: "3-bureau detail",
    icon: FileSearch,
  },
  {
    id: "alerts",
    label: "Alerts & Protection",
    subtitle: "Real-time monitoring",
    icon: Shield,
  },
  {
    id: "tools",
    label: "Tools",
    subtitle: "Simulators & planners",
    icon: Zap,
  },
  {
    id: "premium",
    label: "Premium Services",
    subtitle: "Elite features",
    icon: Star,
  },
] as const;

type TabId = typeof TABS[number]["id"];

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function CreditMonitoring() {
  const { user } = useUserContext();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<TabId>("overview");
  const access = useFeatureAccess();

  const { loaded: scriptReady } = useArrayScript();

  const { data: enrollment, isLoading: enrollLoading } = useQuery<EnrollmentData>({
    queryKey: ["/api/array/enrollment"],
    enabled: !!user,
  });

  const enrollMutation = useMutation({
    mutationFn: (productCode?: string) =>
      apiRequest("POST", "/api/array/enroll", { productCode }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/array/enrollment"] });
    },
  });

  const isEnrolled = enrollment?.enrolled ?? false;

  const displayName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
    : "Your Account";

  if (enrollLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <ScoreShiftLogo size="lg" />
          <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent ss-spinner" />
          <p className="text-muted-foreground text-sm">Loading credit monitoring...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#0F172A] to-[#1E3A5F] dark:from-[#050A14] dark:to-[#0A1628]">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <ScoreShiftLogo size="sm" variant="light" />
                <span className="w-px h-5 bg-white/20" />
                <h1 className="text-xl font-bold text-white">Credit Monitoring</h1>
              </div>
              <p className="text-blue-300/80 text-sm max-w-md">
                Live bureau data, real-time alerts, and premium credit tools — all in one place.
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-2 shrink-0">
              {/* Tier badge */}
              {access.hasAnyPlan && (
                <Badge className={`w-fit text-xs font-semibold ${TIER_BADGE_STYLES[access.tier]}`}>
                  {access.tierLabel} Plan
                </Badge>
              )}
              {isEnrolled && (
                <Badge className="w-fit bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Monitoring Active
                </Badge>
              )}

              {/* All 3 Bureaus badge */}
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs gap-1">
                  <CheckCircle className="h-3 w-3" />
                  All 3 Bureaus
                </Badge>
                {(["Experian", "Equifax", "TransUnion"] as const).map((name) => (
                  <span key={name} className="text-[10px] text-white/50 font-medium flex items-center gap-0.5">
                    <CheckCircle className="h-2.5 w-2.5 text-emerald-400" />
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {displayName && !displayName.includes("Account") && (
            <p className="text-white/50 text-xs mt-3">Viewing as: {displayName}</p>
          )}
        </div>
      </div>

      {/* ── Tab bar ──────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0A1628] border-b border-slate-200 dark:border-white/[0.07]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-0.5 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`group flex items-center gap-2 px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors relative ${
                    isActive
                      ? "border-amber-500 text-amber-600 dark:text-amber-400"
                      : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-white/20"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-amber-500" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`} />
                  <span className="flex flex-col items-start">
                    <span>{tab.label}</span>
                    <span className={`text-[10px] font-normal hidden sm:block ${isActive ? "text-amber-500/70" : "text-slate-400 dark:text-slate-500"}`}>
                      {tab.subtitle}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* Enrollment state */}
        {!isEnrolled && (
          <div className="rounded-2xl border border-blue-200 dark:border-blue-800/40 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <ScoreShiftLogo size="sm" />
                    <span className="text-slate-400 dark:text-slate-500 text-sm">·</span>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Credit Profile Setup</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2 mb-1">
                    Set Up Your Credit Profile
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-5 leading-relaxed max-w-lg">
                    Connect your credit file to unlock real-time bureau data, score tracking, and intelligent alerts.
                    One-time setup — takes about 2 minutes.
                  </p>

                  {/* 3-bureau badges */}
                  <div className="flex items-center gap-2 mb-5 flex-wrap">
                    {(Object.entries(BUREAU_CONFIG) as [keyof typeof BUREAU_CONFIG, typeof BUREAU_CONFIG[keyof typeof BUREAU_CONFIG]][]).map(([name, cfg]) => (
                      <span
                        key={name}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-full text-white"
                        style={{ backgroundColor: cfg.color }}
                      >
                        {name}
                      </span>
                    ))}
                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">All 3 bureaus covered</span>
                  </div>

                  {!access.hasAnyPlan ? (
                    <div className="rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 p-4 max-w-md">
                      <p className="text-amber-800 dark:text-amber-300 text-sm font-medium mb-3">
                        A subscription is required to access credit monitoring.
                      </p>
                      <Link href="/pricing">
                        <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-black font-bold gap-1.5">
                          View Plans <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-blue-200 dark:border-blue-700/40 bg-white dark:bg-[#0F1E35] p-5 max-w-xl">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                          <span className="text-white text-[9px] font-black">SS</span>
                        </div>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                          ScoreShift · Secure Enrollment
                        </span>
                      </div>
                      <CreditComponent
                        tag="array-account-enroll"
                        appKey={ARRAY_SANDBOX_APP_KEY}
                        userToken={ARRAY_SANDBOX_TOKENS.default}
                        scriptReady={scriptReady}
                        isEnrollment={true}
                        onEnroll={() => enrollMutation.mutate(undefined)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Enrolled content by tab ────────────────────────────────────── */}
        {isEnrolled ? (
          <>
            {activeSection === "overview" && (
              <div className="space-y-5">
                <ArrayCard
                  icon={BarChart3}
                  title="Credit Overview"
                  description="Live 3-bureau credit scores and account summary"
                >
                  <CreditComponent
                    tag="array-credit-overview"
                    appKey={ARRAY_SANDBOX_APP_KEY}
                    userToken={ARRAY_SANDBOX_TOKENS.default}
                    scriptReady={scriptReady}
                  />
                </ArrayCard>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <ArrayCard
                    icon={TrendingUp}
                    title="Score Tracker"
                    description="Track your score history across all three bureaus"
                  >
                    <CreditComponent
                      tag="array-credit-score"
                      appKey={ARRAY_SANDBOX_APP_KEY}
                      userToken={ARRAY_SANDBOX_TOKENS.default}
                      scriptReady={scriptReady}
                      attrs={{ bureau: "all", scoreTracker: "true" }}
                    />
                  </ArrayCard>

                  {access.canAccess(FEATURES.DEBT_ANALYSIS) ? (
                    <ArrayCard
                      icon={CreditCard}
                      title="Debt Analysis"
                      description="Utilization breakdown and balance summary"
                    >
                      <CreditComponent
                        tag="array-credit-debt-analysis"
                        appKey={ARRAY_SANDBOX_APP_KEY}
                        userToken={ARRAY_SANDBOX_TOKENS.default}
                        scriptReady={scriptReady}
                      />
                    </ArrayCard>
                  ) : (
                    <TierUpgradeCard
                      label="Debt Analysis"
                      icon={CreditCard}
                      description="See a full breakdown of your debts, balances, and credit utilization by account."
                      requiredTier="pro"
                    />
                  )}
                </div>
              </div>
            )}

            {activeSection === "report" && (
              <ArrayCard
                icon={FileSearch}
                title="Full 3-Bureau Credit Report"
                description="Complete tradeline detail across Experian, Equifax, and TransUnion"
              >
                <CreditComponent
                  tag="array-credit-report"
                  appKey={ARRAY_SANDBOX_APP_KEY}
                  userToken={ARRAY_SANDBOX_TOKENS.default}
                  scriptReady={scriptReady}
                  attrs={{ defaultBureau: "all" }}
                />
              </ArrayCard>
            )}

            {activeSection === "alerts" && (
              <div className="space-y-5">
                {access.canAccess(FEATURES.CREDIT_ALERTS) && enrollment?.productCodes?.some((c) =>
                  ["exp3bStandardMonitoring", "creditScoreChangeAlertExp"].includes(c)
                ) ? (
                  <ArrayCard
                    icon={AlertTriangle}
                    title="Credit Alerts"
                    description="Real-time notifications when your credit file changes"
                  >
                    <CreditComponent
                      tag="array-credit-alerts"
                      appKey={ARRAY_SANDBOX_APP_KEY}
                      userToken={ARRAY_SANDBOX_TOKENS.creditAlerts}
                      scriptReady={scriptReady}
                    />
                  </ArrayCard>
                ) : (
                  <TierUpgradeCard
                    label="Credit Alerts"
                    icon={AlertTriangle}
                    description="Get instant notifications when anything changes on your credit file — new accounts, hard inquiries, balance changes, and more."
                    requiredTier="pro"
                  />
                )}

                {access.canAccess(FEATURES.IDENTITY_PROTECT) && enrollment?.productCodes?.includes("idpBundle1Insurance1mmRestoreBundleMonitoring") ? (
                  <ArrayCard
                    icon={Shield}
                    title="Identity Protect"
                    description="Identity theft monitoring, alerts, and $1M insurance"
                  >
                    <CreditComponent
                      tag="array-identity-protect"
                      appKey={ARRAY_SANDBOX_APP_KEY}
                      userToken={ARRAY_SANDBOX_TOKENS.default}
                      scriptReady={scriptReady}
                    />
                  </ArrayCard>
                ) : (
                  <TierUpgradeCard
                    label="Identity Protect"
                    icon={Shield}
                    description="Monitors your personal information across the dark web and public records, with $1M insurance coverage and full restoration support."
                    requiredTier="elite"
                  />
                )}

                {access.canAccess(FEATURES.PRIVACY_PROTECT) && enrollment?.productCodes?.includes("ppPIPApiMonitoringAndRemoval") ? (
                  <ArrayCard
                    icon={Eye}
                    title="Privacy Protect"
                    description="Remove your personal info from data broker sites"
                  >
                    <CreditComponent
                      tag="array-pip-dashboard"
                      appKey={ARRAY_SANDBOX_APP_KEY}
                      userToken={ARRAY_SANDBOX_TOKENS.default}
                      scriptReady={scriptReady}
                    />
                    <div className="mt-4">
                      <CreditComponent
                        tag="array-pip-scan"
                        appKey={ARRAY_SANDBOX_APP_KEY}
                        userToken={ARRAY_SANDBOX_TOKENS.default}
                        scriptReady={scriptReady}
                      />
                    </div>
                  </ArrayCard>
                ) : (
                  <TierUpgradeCard
                    label="Privacy Protect"
                    icon={Eye}
                    description="Automatically scans and removes your personal information from data broker websites and people-finder sites."
                    requiredTier="elite"
                  />
                )}
              </div>
            )}

            {activeSection === "tools" && (
              <div className="space-y-5">
                {access.canAccess(FEATURES.SCORE_SIMULATOR) ? (
                  <ArrayCard
                    icon={Navigation}
                    title="Score Simulator"
                    description="Model how financial decisions would impact your credit score"
                  >
                    <CreditComponent
                      tag="array-credit-score-simulator"
                      appKey={ARRAY_SANDBOX_APP_KEY}
                      userToken={ARRAY_SANDBOX_TOKENS.default}
                      scriptReady={scriptReady}
                    />
                  </ArrayCard>
                ) : (
                  <TierUpgradeCard
                    label="Score Simulator"
                    icon={Navigation}
                    description="Simulate paying off debt, opening new credit, or closing accounts — see exactly how each action would affect your score before doing it."
                    requiredTier="pro"
                  />
                )}

                {access.canAccess(FEATURES.DEBT_NAVIGATOR) && enrollment?.productCodes?.includes("debtNavPremium") ? (
                  <ArrayCard
                    icon={Zap}
                    title="Debt Navigator"
                    description="Premium debt payoff planning and strategy engine"
                  >
                    <CreditComponent
                      tag="array-debt-navigator"
                      appKey={ARRAY_SANDBOX_APP_KEY}
                      userToken={ARRAY_SANDBOX_TOKENS.default}
                      scriptReady={scriptReady}
                    />
                  </ArrayCard>
                ) : (
                  <TierUpgradeCard
                    label="Debt Navigator"
                    icon={Navigation}
                    description="Build a personalized debt payoff plan using avalanche or snowball strategies, with projected timelines and interest savings."
                    requiredTier="pro"
                  />
                )}
              </div>
            )}

            {activeSection === "premium" && (
              <div className="space-y-5">
                {access.canAccess(FEATURES.STUDENT_LOAN_AID) && enrollment?.productCodes?.includes("pioStudentLoanAidSubmission") ? (
                  <ArrayCard
                    icon={GraduationCap}
                    title="Student Loan Aid"
                    description="Navigate your student loan options and enrollment"
                  >
                    <CreditComponent
                      tag="array-student-loan-navigator"
                      appKey={ARRAY_SANDBOX_APP_KEY}
                      userToken={ARRAY_SANDBOX_TOKENS.default}
                      scriptReady={scriptReady}
                      attrs={{ autolaunch: "true" }}
                    />
                    <div className="mt-4">
                      <CreditComponent
                        tag="array-student-loan-aid"
                        appKey={ARRAY_SANDBOX_APP_KEY}
                        userToken={ARRAY_SANDBOX_TOKENS.studentLoanAid}
                        scriptReady={scriptReady}
                      />
                    </div>
                  </ArrayCard>
                ) : (
                  <TierUpgradeCard
                    label="Student Loan Aid"
                    icon={GraduationCap}
                    description="Find income-driven repayment plans, forgiveness programs, and refinancing options tailored to your student loan situation."
                    requiredTier="elite"
                  />
                )}

                {access.canAccess(FEATURES.SUBSCRIPTION_MANAGER) && enrollment?.productCodes?.some((c) =>
                  ["subscriptionManagerEnrichmentAndCancellation", "smTxnSrcFinLnk"].includes(c)
                ) ? (
                  <ArrayCard
                    icon={CreditCard}
                    title="Subscription Manager"
                    description="View, manage, and cancel your credit product subscriptions"
                  >
                    <CreditComponent
                      tag="array-subscription-manager"
                      appKey={ARRAY_SANDBOX_APP_KEY}
                      userToken={ARRAY_SANDBOX_TOKENS.subscriptionManager}
                      scriptReady={scriptReady}
                    />
                  </ArrayCard>
                ) : (
                  <TierUpgradeCard
                    label="Subscription Manager"
                    icon={CreditCard}
                    description="Get a full view of your recurring subscriptions with the ability to cancel unwanted services directly from your dashboard."
                    requiredTier="elite"
                  />
                )}
              </div>
            )}
          </>
        ) : null}

        {/* ── Not enrolled preview grid ─────────────────────────────────── */}
        {!isEnrolled && (
          <div className="mt-2">
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
              Available after enrollment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { id: "credit-overview",  label: "Credit Overview",       icon: BarChart3,      description: "Live 3-bureau credit scores and account summary" },
                { id: "credit-report",    label: "Full Credit Report",    icon: FileSearch,     description: "Complete tri-bureau credit report with all tradelines" },
                { id: "score-tracker",    label: "Score Tracker",         icon: TrendingUp,     description: "Track score changes over time across all bureaus" },
                { id: "debt-analysis",    label: "Debt Analysis",         icon: CreditCard,     description: "Breakdown of your debts and utilization" },
                { id: "score-simulator",  label: "Score Simulator",       icon: Navigation,     description: "See how financial decisions would affect your score" },
                { id: "credit-alerts",    label: "Credit Alerts",         icon: AlertTriangle,  description: "Real-time alerts for changes to your credit file" },
                { id: "identity-protect", label: "Identity Protect",      icon: Shield,         description: "Identity theft monitoring and $1M insurance" },
                { id: "privacy-protect",  label: "Privacy Protect",       icon: Eye,            description: "Remove personal info from data broker sites" },
                { id: "debt-navigator",   label: "Debt Navigator",        icon: Zap,            description: "Premium debt payoff planning and navigation" },
                { id: "student-loans",    label: "Student Loan Aid",      icon: GraduationCap,  description: "Navigate student loan options and forgiveness" },
                { id: "subscriptions",    label: "Subscription Manager",  icon: CreditCard,     description: "Manage your recurring credit product subscriptions" },
              ].map((comp) => (
                <div
                  key={comp.id}
                  className="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#0F1E35]/60 p-4 opacity-60 pointer-events-none"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center">
                      <comp.icon className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                    </div>
                    <span className="font-medium text-slate-600 dark:text-slate-400 text-sm">{comp.label}</span>
                    <Lock className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 ml-auto" />
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">{comp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="h-12" />
      </div>
    </div>
  );
}
