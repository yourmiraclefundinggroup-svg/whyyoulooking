/**
 * Credit Monitoring — ScoreShift embedded credit components page.
 * Handles account enrollment and rendering all credit web components.
 * Features are gated by subscription tier (starter | pro | elite).
 */
import { useState, useEffect, useRef, useCallback, ComponentType, type Ref } from "react";
import { useUserContext } from "@/hooks/use-user-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useArrayToken } from "@/hooks/use-array-token";
import { useFeatureAccess, FEATURES, type SubscriptionTier } from "@/hooks/use-feature-access";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield, CreditCard, TrendingUp, AlertTriangle, Eye, BookOpen,
  GraduationCap, Navigation, Loader2, CheckCircle, Lock, RefreshCw, ArrowRight
} from "lucide-react";
import { Link } from "wouter";

interface CreditWebComponentProps {
  token: string;
  appKey: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "array-account-enroll": CreditWebComponentProps & { ref?: Ref<HTMLElement> };
      "array-credit-overview": CreditWebComponentProps & { ref?: Ref<HTMLElement> };
      "array-credit-report": CreditWebComponentProps & { ref?: Ref<HTMLElement> };
      "array-score-tracker": CreditWebComponentProps & { ref?: Ref<HTMLElement> };
      "array-debt-analysis": CreditWebComponentProps & { ref?: Ref<HTMLElement> };
      "array-score-simulator": CreditWebComponentProps & { ref?: Ref<HTMLElement> };
      "array-credit-alerts": CreditWebComponentProps & { ref?: Ref<HTMLElement> };
      "array-identity-protect": CreditWebComponentProps & { ref?: Ref<HTMLElement> };
      "array-privacy-protect": CreditWebComponentProps & { ref?: Ref<HTMLElement> };
      "array-subscription-manager": CreditWebComponentProps & { ref?: Ref<HTMLElement> };
      "array-sla-enroll": CreditWebComponentProps & { ref?: Ref<HTMLElement> };
      "array-sla-dashboard": CreditWebComponentProps & { ref?: Ref<HTMLElement> };
      "array-debt-navigator": CreditWebComponentProps & { ref?: Ref<HTMLElement> };
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
  const tierColors: Record<SubscriptionTier, string> = {
    none: "amber",
    starter: "amber",
    pro: "blue",
    elite: "violet",
  };
  const color = tierColors[requiredTier] || "amber";

  return (
    <Card className={`border-${color}-200 bg-${color}-50/50`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-full bg-${color}-100 flex items-center justify-center shrink-0`}>
            <Icon className={`h-5 w-5 text-${color}-500`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-700">{label}</h3>
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              <Badge
                variant="outline"
                className={`text-xs border-${color}-300 text-${color}-700 ml-auto`}
              >
                {requiredTier === "pro" ? "Pro" : requiredTier === "elite" ? "Elite" : "Starter"} feature
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mb-4">{description}</p>
            <Link href={requiredTier !== "none" ? `/checkout?tier=${requiredTier}` : "/pricing"}>
              <Button
                size="sm"
                className={`bg-${color}-500 hover:bg-${color}-600 text-white gap-1.5`}
              >
                {TIER_UPGRADE_LABELS[requiredTier]}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CreditComponent({ tag, token, appKey, onEnroll, onTokenExpired, scriptReady }: {
  tag: string;
  token: string;
  appKey: string;
  onEnroll?: () => void;
  onTokenExpired?: () => void;
  scriptReady?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !token || !appKey) return;
    if (scriptReady === false) return;
    containerRef.current.innerHTML = "";
    const el = document.createElement(tag);
    el.setAttribute("token", token);
    el.setAttribute("appKey", appKey);

    const handleEvent = (e: Event) => {
      const detail = (e as CustomEvent<{ tagName?: string; type?: string; status?: number; code?: string }>).detail;
      if (detail?.tagName === "account-enroll" && onEnroll) onEnroll();
      if (onTokenExpired) {
        const isAuthError =
          detail?.status === 401 ||
          detail?.code === "UNAUTHORIZED" ||
          detail?.type === "auth-error" ||
          detail?.type === "token-expired";
        if (isAuthError) onTokenExpired();
      }
    };

    el.addEventListener("array-event", handleEvent);
    el.addEventListener("array-error", handleEvent);
    containerRef.current.appendChild(el);

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [tag, token, appKey, scriptReady, onEnroll, onTokenExpired]);

  if (scriptReady === false) {
    return (
      <div className="w-full min-h-[200px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
      </div>
    );
  }

  return <div ref={containerRef} className="w-full min-h-[200px]" />;
}

export default function CreditMonitoring() {
  const { user } = useUserContext();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [sessionExpired, setSessionExpired] = useState(false);
  const refreshInFlight = useRef(false);
  const access = useFeatureAccess();

  // Token comes from the shared context — no per-page fetch needed.
  // `attempted` is true once the first fetch completes (success or failure),
  // so we can unblock the loading gate even when the token is unavailable.
  const { token, appKey, attempted, error: tokenError, refresh: refreshToken } = useArrayToken();

  const [scriptReady, setScriptReady] = useState(false);
  useEffect(() => {
    // Poll until the Array custom elements are registered
    if (scriptReady) return;
    const check = () => {
      if (customElements.get("array-credit-overview")) {
        setScriptReady(true);
      }
    };
    check();
    const interval = setInterval(check, 200);
    return () => clearInterval(interval);
  }, [scriptReady]);

  const handleTokenExpired = useCallback(async () => {
    if (refreshInFlight.current) return;
    refreshInFlight.current = true;
    try {
      await refreshToken();
      setSessionExpired(false);
    } catch {
      setSessionExpired(true);
    } finally {
      refreshInFlight.current = false;
    }
  }, [refreshToken]);

  const handleReconnect = useCallback(async () => {
    try {
      await refreshToken();
      setSessionExpired(false);
    } catch {
    }
  }, [refreshToken]);

  useEffect(() => {
    if (token) setSessionExpired(false);
  }, [token]);

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

  // Block the page only until the first fetch attempt AND enrollment are both settled.
  // Using `attempted` (not `isReady`) ensures a token failure shows the error UI
  // instead of leaving the user on an infinite loading spinner.
  const isLoading = !attempted || enrollLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-600">Loading credit monitoring...</p>
        </div>
      </div>
    );
  }

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "report", label: "Full Report" },
    { id: "alerts", label: "Alerts & Protection" },
    { id: "tools", label: "Tools" },
    { id: "premium", label: "Premium" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-7 w-7 text-blue-300" />
            <h1 className="text-2xl font-bold text-white">Credit Monitoring</h1>
            {isEnrolled && (
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            )}
            {access.hasAnyPlan && (
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 ml-auto">
                {access.tierLabel} Plan
              </Badge>
            )}
          </div>
          <p className="text-blue-300 text-sm">
            Live bureau data, real-time alerts, and premium credit tools — all in one place
          </p>
        </div>
      </div>

      <div className="bg-white border-b border-slate-200 px-6">
        <div className="max-w-6xl mx-auto flex gap-1 overflow-x-auto">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeSection === s.id
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {sessionExpired && (
          <Card className="border-amber-300 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="font-medium text-amber-900 text-sm">Session expired</p>
                    <p className="text-amber-700 text-xs mt-0.5">
                      Your credit monitoring session has expired. Reconnect to continue viewing your data.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={handleReconnect}
                  className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Reconnect
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!isEnrolled && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-blue-900 mb-1">
                    Set Up Credit Monitoring
                  </h2>
                  <p className="text-blue-700 text-sm mb-4">
                    Connect your credit file to get real-time bureau data, score tracking, and alerts.
                    This is a one-time setup that takes about 2 minutes.
                  </p>
                  {!access.hasAnyPlan ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-amber-800 text-sm font-medium mb-2">A subscription is required to access credit monitoring.</p>
                      <Link href="/pricing">
                        <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-black font-bold gap-1.5">
                          View Plans <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  ) : token && appKey ? (
                    <div className="bg-white rounded-xl border border-blue-200 p-4">
                      <CreditComponent
                        tag="array-account-enroll"
                        token={token}
                        appKey={appKey}
                        scriptReady={scriptReady}
                        onEnroll={() => enrollMutation.mutate(undefined)}
                      />
                    </div>
                  ) : tokenError ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                      Could not connect to credit monitoring. Please try refreshing the page or contact support.
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-blue-600 text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connecting to credit monitoring...
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isEnrolled && token && appKey ? (
          <>
            {activeSection === "overview" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Credit Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CreditComponent tag="array-credit-overview" token={token} appKey={appKey} scriptReady={scriptReady} onTokenExpired={handleTokenExpired} />
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-slate-800 text-base">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        Score Tracker
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CreditComponent tag="array-score-tracker" token={token} appKey={appKey} scriptReady={scriptReady} onTokenExpired={handleTokenExpired} />
                    </CardContent>
                  </Card>

                  {access.canAccess(FEATURES.DEBT_ANALYSIS) ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-800 text-base">
                          <CreditCard className="h-4 w-4 text-amber-600" />
                          Debt Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CreditComponent tag="array-debt-analysis" token={token} appKey={appKey} scriptReady={scriptReady} onTokenExpired={handleTokenExpired} />
                      </CardContent>
                    </Card>
                  ) : (
                    <TierUpgradeCard
                      label="Debt Analysis"
                      icon={CreditCard}
                      description="Breakdown of your debts and utilization"
                      requiredTier="pro"
                    />
                  )}
                </div>
              </div>
            )}

            {activeSection === "report" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                    Full 3-Bureau Credit Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CreditComponent tag="array-credit-report" token={token} appKey={appKey} scriptReady={scriptReady} onTokenExpired={handleTokenExpired} />
                </CardContent>
              </Card>
            )}

            {activeSection === "alerts" && (
              <div className="space-y-6">
                {access.canAccess(FEATURES.CREDIT_ALERTS) && enrollment?.productCodes?.some((c) =>
                  ["exp3bStandardMonitoring", "creditScoreChangeAlertExp"].includes(c)
                ) ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-slate-800">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Credit Alerts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CreditComponent tag="array-credit-alerts" token={token} appKey={appKey} scriptReady={scriptReady} onTokenExpired={handleTokenExpired} />
                    </CardContent>
                  </Card>
                ) : (
                  <TierUpgradeCard
                    label="Credit Alerts"
                    icon={AlertTriangle}
                    description="Real-time alerts for changes to your credit file"
                    requiredTier="pro"
                  />
                )}

                {access.canAccess(FEATURES.IDENTITY_PROTECT) && enrollment?.productCodes?.includes("idpBundle1Insurance1mmRestoreBundleMonitoring") ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-slate-800">
                        <Shield className="h-5 w-5 text-slate-600" />
                        Identity Protect
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CreditComponent tag="array-identity-protect" token={token} appKey={appKey} scriptReady={scriptReady} onTokenExpired={handleTokenExpired} />
                    </CardContent>
                  </Card>
                ) : (
                  <TierUpgradeCard
                    label="Identity Protect"
                    icon={Shield}
                    description="Identity theft monitoring and protection"
                    requiredTier="elite"
                  />
                )}

                {access.canAccess(FEATURES.PRIVACY_PROTECT) && enrollment?.productCodes?.includes("ppPIPApiMonitoringAndRemoval") ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-slate-800">
                        <Eye className="h-5 w-5 text-teal-600" />
                        Privacy Protect
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CreditComponent tag="array-privacy-protect" token={token} appKey={appKey} scriptReady={scriptReady} onTokenExpired={handleTokenExpired} />
                    </CardContent>
                  </Card>
                ) : (
                  <TierUpgradeCard
                    label="Privacy Protect"
                    icon={Eye}
                    description="Remove your personal info from data broker sites"
                    requiredTier="elite"
                  />
                )}
              </div>
            )}

            {activeSection === "tools" && (
              <div className="space-y-6">
                {access.canAccess(FEATURES.SCORE_SIMULATOR) ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-slate-800">
                        <Navigation className="h-5 w-5 text-purple-600" />
                        Score Simulator
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CreditComponent tag="array-score-simulator" token={token} appKey={appKey} scriptReady={scriptReady} onTokenExpired={handleTokenExpired} />
                    </CardContent>
                  </Card>
                ) : (
                  <TierUpgradeCard
                    label="Score Simulator"
                    icon={Navigation}
                    description="See how financial decisions would affect your score"
                    requiredTier="pro"
                  />
                )}

                {access.canAccess(FEATURES.DEBT_NAVIGATOR) && enrollment?.productCodes?.includes("debtNavPremium") ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-slate-800">
                        <Navigation className="h-5 w-5 text-violet-600" />
                        Debt Navigator
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CreditComponent tag="array-debt-navigator" token={token} appKey={appKey} scriptReady={scriptReady} onTokenExpired={handleTokenExpired} />
                    </CardContent>
                  </Card>
                ) : (
                  <TierUpgradeCard
                    label="Debt Navigator"
                    icon={Navigation}
                    description="Premium debt payoff planning and navigation"
                    requiredTier="pro"
                  />
                )}
              </div>
            )}

            {activeSection === "premium" && (
              <div className="space-y-6">
                {access.canAccess(FEATURES.STUDENT_LOAN_AID) && enrollment?.productCodes?.includes("pioStudentLoanAidSubmission") ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-slate-800">
                        <GraduationCap className="h-5 w-5 text-cyan-600" />
                        Student Loan Aid
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CreditComponent tag="array-sla-enroll" token={token} appKey={appKey} scriptReady={scriptReady} onTokenExpired={handleTokenExpired} />
                      <div className="mt-4">
                        <CreditComponent tag="array-sla-dashboard" token={token} appKey={appKey} scriptReady={scriptReady} onTokenExpired={handleTokenExpired} />
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <TierUpgradeCard
                    label="Student Loan Aid"
                    icon={GraduationCap}
                    description="Student loan aid enrollment and dashboard"
                    requiredTier="elite"
                  />
                )}

                {access.canAccess(FEATURES.SUBSCRIPTION_MANAGER) && enrollment?.productCodes?.some((c) =>
                  ["subscriptionManagerEnrichmentAndCancellation", "smTxnSrcFinLnk"].includes(c)
                ) ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-slate-800">
                        <CreditCard className="h-5 w-5 text-zinc-600" />
                        Subscription Manager
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CreditComponent tag="array-subscription-manager" token={token} appKey={appKey} scriptReady={scriptReady} onTokenExpired={handleTokenExpired} />
                    </CardContent>
                  </Card>
                ) : (
                  <TierUpgradeCard
                    label="Subscription Manager"
                    icon={CreditCard}
                    description="Manage your credit product subscriptions"
                    requiredTier="elite"
                  />
                )}
              </div>
            )}
          </>
        ) : isEnrolled && !token ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-3" />
              <p className="text-slate-600">Connecting to credit monitoring...</p>
            </CardContent>
          </Card>
        ) : null}

        {!isEnrolled && token && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Available after enrollment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { id: "credit-overview", label: "Credit Overview", icon: TrendingUp, description: "Live 3-bureau credit scores and account summary" },
                { id: "credit-report", label: "Full Credit Report (3B)", icon: BookOpen, description: "Complete tri-bureau credit report with all tradelines" },
                { id: "score-tracker", label: "Score Tracker", icon: TrendingUp, description: "Track score changes over time across all bureaus" },
                { id: "debt-analysis", label: "Debt Analysis", icon: CreditCard, description: "Breakdown of your debts and utilization" },
                { id: "score-simulator", label: "Score Simulator", icon: Navigation, description: "See how financial decisions would affect your score" },
                { id: "credit-alerts", label: "Credit Alerts", icon: AlertTriangle, description: "Real-time alerts for changes to your credit file" },
                { id: "identity-protect", label: "Identity Protect", icon: Shield, description: "Identity theft monitoring and protection" },
                { id: "privacy-protect", label: "Privacy Protect", icon: Eye, description: "Remove your personal info from data broker sites" },
                { id: "subscription-manager", label: "Subscription Manager", icon: CreditCard, description: "Manage your credit product subscriptions" },
                { id: "student-loans", label: "Student Loan Aid", icon: GraduationCap, description: "Student loan aid enrollment and dashboard" },
                { id: "debt-navigator", label: "Debt Navigator", icon: Navigation, description: "Premium debt payoff planning and navigation" },
              ].map((comp) => (
                <div
                  key={comp.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 opacity-60"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <comp.icon className="h-5 w-5 text-slate-400" />
                    <span className="font-medium text-slate-600 text-sm">{comp.label}</span>
                    <Lock className="h-3.5 w-3.5 text-slate-400 ml-auto" />
                  </div>
                  <p className="text-xs text-slate-400">{comp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
