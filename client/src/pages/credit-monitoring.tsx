/**
 * Credit Monitoring — Array.com embedded components page.
 * Handles token generation, account enrollment, and rendering all Array web components.
 */
import { useState, useEffect, useRef } from "react";
import { useUserContext } from "@/hooks/use-user-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useArrayScript } from "@/hooks/use-array-script";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield, CreditCard, TrendingUp, AlertTriangle, Eye, BookOpen,
  GraduationCap, Navigation, Loader2, CheckCircle, Lock
} from "lucide-react";

// Declare Array web component custom elements for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "array-account-enroll": any;
      "array-credit-overview": any;
      "array-credit-report": any;
      "array-score-tracker": any;
      "array-debt-analysis": any;
      "array-score-simulator": any;
      "array-credit-alerts": any;
      "array-identity-protect": any;
      "array-privacy-protect": any;
      "array-subscription-manager": any;
      "array-sla-enroll": any;
      "array-sla-dashboard": any;
      "array-debt-navigator": any;
    }
  }
}

interface ArrayTokenData {
  token: string;
  appKey: string;
  arrayUserId: string;
}

interface EnrollmentData {
  enrolled: boolean;
  arrayUserId: string | null;
  productCodes: string[];
  enrolledAt: string | null;
}

// Array component definitions with metadata
const BASIC_COMPONENTS = [
  {
    id: "credit-overview",
    tag: "array-credit-overview",
    label: "Credit Overview",
    icon: TrendingUp,
    description: "Live 3-bureau credit scores and account summary",
    color: "blue",
  },
  {
    id: "credit-report",
    tag: "array-credit-report",
    label: "Full Credit Report (3B)",
    icon: BookOpen,
    description: "Complete tri-bureau credit report with all tradelines",
    color: "indigo",
  },
  {
    id: "score-tracker",
    tag: "array-score-tracker",
    label: "Score Tracker",
    icon: TrendingUp,
    description: "Track score changes over time across all bureaus",
    color: "green",
  },
  {
    id: "debt-analysis",
    tag: "array-debt-analysis",
    label: "Debt Analysis",
    icon: CreditCard,
    description: "Breakdown of your debts and utilization",
    color: "amber",
  },
  {
    id: "score-simulator",
    tag: "array-score-simulator",
    label: "Score Simulator",
    icon: Navigation,
    description: "See how financial decisions would affect your score",
    color: "purple",
  },
];

const PREMIUM_COMPONENTS = [
  {
    id: "credit-alerts",
    tag: "array-credit-alerts",
    label: "Credit Alerts",
    icon: AlertTriangle,
    description: "Real-time alerts for changes to your credit file",
    productCodes: ["exp3bStandardMonitoring", "creditScoreChangeAlertExp"],
    color: "red",
  },
  {
    id: "identity-protect",
    tag: "array-identity-protect",
    label: "Identity Protect",
    icon: Shield,
    description: "Identity theft monitoring and protection",
    productCodes: ["idpBundle1Insurance1mmRestoreBundleMonitoring"],
    color: "slate",
  },
  {
    id: "privacy-protect",
    tag: "array-privacy-protect",
    label: "Privacy Protect",
    icon: Eye,
    description: "Remove your personal info from data broker sites",
    productCodes: ["ppPIPApiMonitoringAndRemoval"],
    color: "teal",
  },
  {
    id: "subscription-manager",
    tag: "array-subscription-manager",
    label: "Subscription Manager",
    icon: CreditCard,
    description: "Manage your Array product subscriptions",
    productCodes: ["subscriptionManagerEnrichmentAndCancellation", "smTxnSrcFinLnk"],
    color: "zinc",
  },
  {
    id: "student-loans",
    tag: "array-sla-dashboard",
    label: "Student Loan Aid",
    icon: GraduationCap,
    description: "Student loan aid enrollment and dashboard",
    productCodes: ["pioStudentLoanAidSubmission"],
    color: "cyan",
  },
  {
    id: "debt-navigator",
    tag: "array-debt-navigator",
    label: "Debt Navigator",
    icon: Navigation,
    description: "Premium debt payoff planning and navigation",
    productCodes: ["debtNavPremium"],
    color: "violet",
  },
];

function ArrayComponent({ tag, token, appKey, onEnroll, scriptReady }: {
  tag: string;
  token: string;
  appKey: string;
  onEnroll?: () => void;
  scriptReady?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !token || !appKey) return;
    if (scriptReady === false) return; // wait for script
    containerRef.current.innerHTML = "";
    const el = document.createElement(tag);
    el.setAttribute("token", token);
    el.setAttribute("appKey", appKey);
    if (onEnroll) {
      el.addEventListener("array-event", (e: any) => {
        if (e?.detail?.tagName === "account-enroll") onEnroll();
      });
    }
    containerRef.current.appendChild(el);
    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [tag, token, appKey, scriptReady]);

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

  // Fetch Array token
  const { data: tokenData, isLoading: tokenLoading, error: tokenError } = useQuery<ArrayTokenData>({
    queryKey: ["/api/array/token"],
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // tokens valid 5min
    retry: 1,
  });

  // Fetch enrollment status
  const { data: enrollment, isLoading: enrollLoading } = useQuery<EnrollmentData>({
    queryKey: ["/api/array/enrollment"],
    enabled: !!user,
  });

  // Enroll mutation
  const enrollMutation = useMutation({
    mutationFn: (productCode?: string) =>
      apiRequest("POST", "/api/array/enroll", { productCode }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/array/enrollment"] });
      queryClient.invalidateQueries({ queryKey: ["/api/array/token"] });
    },
  });

  const isEnrolled = enrollment?.enrolled ?? false;
  const token = tokenData?.token ?? "";
  const appKey = tokenData?.appKey ?? "";

  // Load Array script dynamically once we have the appKey
  const { loaded: scriptReady } = useArrayScript(appKey || undefined);

  const isLoading = tokenLoading || enrollLoading;

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
      {/* Page Header */}
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
          </div>
          <p className="text-blue-300 text-sm">
            Live bureau data, real-time alerts, and premium credit tools — all in one place
          </p>
        </div>
      </div>

      {/* Section tabs */}
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

        {/* Enrollment Gate — shown if not yet enrolled */}
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
                  {token && appKey ? (
                    <div className="bg-white rounded-xl border border-blue-200 p-4">
                      <ArrayComponent
                        tag="array-account-enroll"
                        token={token}
                        appKey={appKey}
                        scriptReady={scriptReady}
                        onEnroll={() => enrollMutation.mutate(undefined)}
                      />
                    </div>
                  ) : tokenError ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                      Could not connect to credit monitoring service. Please try refreshing the page or contact support.
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

        {/* Main content — only show if enrolled and token available */}
        {isEnrolled && token && appKey ? (
          <>
            {/* Overview Section */}
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
                    <ArrayComponent tag="array-credit-overview" token={token} appKey={appKey} scriptReady={scriptReady} />
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
                      <ArrayComponent tag="array-score-tracker" token={token} appKey={appKey} scriptReady={scriptReady} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-slate-800 text-base">
                        <CreditCard className="h-4 w-4 text-amber-600" />
                        Debt Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ArrayComponent tag="array-debt-analysis" token={token} appKey={appKey} scriptReady={scriptReady} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Full Report */}
            {activeSection === "report" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                    Full 3-Bureau Credit Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ArrayComponent tag="array-credit-report" token={token} appKey={appKey} scriptReady={scriptReady} />
                </CardContent>
              </Card>
            )}

            {/* Alerts & Protection */}
            {activeSection === "alerts" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Credit Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ArrayComponent tag="array-credit-alerts" token={token} appKey={appKey} scriptReady={scriptReady} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <Shield className="h-5 w-5 text-slate-600" />
                      Identity Protect
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ArrayComponent tag="array-identity-protect" token={token} appKey={appKey} scriptReady={scriptReady} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <Eye className="h-5 w-5 text-teal-600" />
                      Privacy Protect
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ArrayComponent tag="array-privacy-protect" token={token} appKey={appKey} scriptReady={scriptReady} />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tools */}
            {activeSection === "tools" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <Navigation className="h-5 w-5 text-purple-600" />
                      Score Simulator
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ArrayComponent tag="array-score-simulator" token={token} appKey={appKey} scriptReady={scriptReady} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <Navigation className="h-5 w-5 text-violet-600" />
                      Debt Navigator
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ArrayComponent tag="array-debt-navigator" token={token} appKey={appKey} scriptReady={scriptReady} />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Premium / Subscriptions */}
            {activeSection === "premium" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <GraduationCap className="h-5 w-5 text-cyan-600" />
                      Student Loan Aid
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ArrayComponent tag="array-sla-enroll" token={token} appKey={appKey} scriptReady={scriptReady} />
                    <div className="mt-4">
                      <ArrayComponent tag="array-sla-dashboard" token={token} appKey={appKey} scriptReady={scriptReady} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <CreditCard className="h-5 w-5 text-zinc-600" />
                      Subscription Manager
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ArrayComponent tag="array-subscription-manager" token={token} appKey={appKey} scriptReady={scriptReady} />
                  </CardContent>
                </Card>
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

        {/* Not enrolled but has token — show locked premium previews */}
        {!isEnrolled && token && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Available after enrollment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...BASIC_COMPONENTS, ...PREMIUM_COMPONENTS].map((comp) => (
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
