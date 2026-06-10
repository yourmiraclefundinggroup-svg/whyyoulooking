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

/* ── Tier upgrade card — ScoreShift Glass ────────────────────────────────── */
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
  const tierLabel = requiredTier === "pro" ? "Pro" : requiredTier === "elite" ? "Elite" : "Starter";
  const accentColor = requiredTier === "elite" ? "rgba(124,58,237,0.22)" : requiredTier === "pro" ? "rgba(37,99,235,0.18)" : "rgba(245,158,11,0.18)";
  const iconColor   = requiredTier === "elite" ? "#A78BFA" : requiredTier === "pro" ? "#60A5FA" : "#FCD34D";
  const btnClass    = requiredTier === "elite" ? "bg-violet-600 hover:bg-violet-500" : requiredTier === "pro" ? "bg-blue-600 hover:bg-blue-500" : "bg-amber-500 hover:bg-amber-400";

  return (
    <div style={{
      background: "rgba(255,253,248,0.06)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      border: "1px solid rgba(255,255,255,0.10)",
      borderRadius: "28px",
      boxShadow: `0 8px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.08)`,
      padding: "22px 24px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Ambient tier glow */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 180, height: 180,
        background: `radial-gradient(ellipse at top right, ${accentColor} 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "flex-start", gap: "16px" }}>
        <div style={{
          width: 42, height: 42, borderRadius: "13px", flexShrink: 0,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.10)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
        }}>
          <Icon className="h-4 w-4" style={{ color: iconColor } as React.CSSProperties} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
            <h3 style={{ color: "rgba(255,252,245,0.88)", fontSize: "14px", fontWeight: 600 }}>{label}</h3>
            <Lock style={{ width: 12, height: 12, color: "rgba(255,252,245,0.30)" }} />
            <span style={{
              marginLeft: "auto", fontSize: "10px", fontWeight: 700,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: "rgba(255,252,245,0.35)",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: "100px", padding: "3px 9px",
            }}>
              {tierLabel} plan
            </span>
          </div>
          <p style={{ color: "rgba(255,252,245,0.45)", fontSize: "13px", lineHeight: "1.65", marginBottom: "16px" }}>{description}</p>
          <Link href="/pricing">
            <Button size="sm" className={`gap-1.5 text-xs font-semibold text-white ${btnClass}`} style={{ borderRadius: "100px" }}>
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

/* ── ScoreShift Glass Panel — Array card wrapper ─────────────────────────── */
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
    <div style={{
      background: "rgba(255,253,248,0.055)",
      backdropFilter: "blur(32px)",
      WebkitBackdropFilter: "blur(32px)",
      border: "1px solid rgba(255,255,255,0.11)",
      borderRadius: "32px",
      boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.10)",
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Indigo ambient glow — top-left */}
      <div style={{
        position: "absolute", top: -40, left: -40,
        width: 260, height: 260,
        background: "radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 68%)",
        pointerEvents: "none",
      }} />

      {/* Card header */}
      <div style={{
        display: "flex", alignItems: "center", gap: "14px",
        padding: "20px 24px 18px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        position: "relative", zIndex: 1,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: "12px", flexShrink: 0,
          background: "rgba(99,102,241,0.12)",
          border: "1px solid rgba(99,102,241,0.18)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon className="h-4 w-4" style={{ color: "#818CF8" } as React.CSSProperties} />
        </div>
        <div>
          <p style={{ color: "rgba(255,252,245,0.90)", fontSize: "14px", fontWeight: 600, letterSpacing: "-0.2px" }}>{title}</p>
          <p style={{ color: "rgba(255,252,245,0.38)", fontSize: "12px", marginTop: "1px" }}>{description}</p>
        </div>
        <span style={{
          marginLeft: "auto",
          fontSize: "10px", fontWeight: 700,
          letterSpacing: "0.12em", textTransform: "uppercase",
          color: "rgba(255,252,245,0.18)",
        }}>
          ScoreShift
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: "24px", position: "relative", zIndex: 1 }}>{children}</div>
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
      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0B0E1A 0%, #0F1628 55%, #0A0D1C 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
          <div style={{ height: 36, overflow: "hidden", display: "flex", alignItems: "center" }}>
            <img src="/images/scoreshift-wordmark-transparent.png" alt="ScoreShift" style={{ height: 130, width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-indigo-400 border-t-transparent ss-spinner" />
          <p style={{ color: "rgba(255,252,245,0.35)", fontSize: "13px" }}>Loading credit monitoring…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0B0E1A 0%, #0F1628 55%, #0A0D1C 100%)" }}>

      {/* ── Page header — glass panel ─────────────────────────────────────── */}
      <div style={{
        background: "rgba(255,253,248,0.04)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        {/* Subtle indigo wash behind header */}
        <div style={{ background: "linear-gradient(135deg, rgba(67,56,202,0.12) 0%, transparent 60%)", position: "absolute", inset: 0, pointerEvents: "none" }} />
        <div className="max-w-6xl mx-auto px-6 py-8" style={{ position: "relative", zIndex: 1 }}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "10px" }}>
                <div style={{ height: 26, overflow: "hidden", display: "flex", alignItems: "center" }}>
                  <img src="/images/scoreshift-wordmark-transparent.png" alt="ScoreShift" style={{ height: 100, width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
                </div>
                <span style={{ width: 1, height: 20, background: "rgba(255,255,255,0.15)" }} />
                <h1 style={{ color: "rgba(255,252,245,0.90)", fontSize: "18px", fontWeight: 600, letterSpacing: "-0.3px" }}>Credit Monitoring</h1>
              </div>
              <p style={{ color: "rgba(255,252,245,0.38)", fontSize: "13px", maxWidth: "420px", lineHeight: "1.55" }}>
                Live bureau data, real-time alerts, and premium credit tools — all in one place.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 }}>
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
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs gap-1">
                  <CheckCircle className="h-3 w-3" />
                  All 3 Bureaus
                </Badge>
                {(["Experian", "Equifax", "TransUnion"] as const).map((name) => (
                  <span key={name} style={{ fontSize: "10px", color: "rgba(255,255,255,0.40)", fontWeight: 500, display: "flex", alignItems: "center", gap: "3px" }}>
                    <CheckCircle className="h-2.5 w-2.5 text-emerald-400" />
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {displayName && !displayName.includes("Account") && (
            <p style={{ color: "rgba(255,252,245,0.28)", fontSize: "11px", marginTop: "12px" }}>Viewing as: {displayName}</p>
          )}
        </div>
      </div>

      {/* ── Tab bar — glass strip ─────────────────────────────────────────── */}
      <div style={{
        background: "rgba(255,253,248,0.03)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-0.5 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "16px",
                    fontSize: "14px", fontWeight: 500, whiteSpace: "nowrap",
                    borderBottom: isActive ? "2px solid #818CF8" : "2px solid transparent",
                    color: isActive ? "#A5B4FC" : "rgba(255,252,245,0.38)",
                    background: "none", border: "none",
                    borderBottomWidth: "2px",
                    borderBottomStyle: "solid",
                    borderBottomColor: isActive ? "#818CF8" : "transparent",
                    cursor: "pointer",
                    transition: "color 0.2s, border-color 0.2s",
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = "rgba(255,252,245,0.65)"; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "rgba(255,252,245,0.38)"; }}
                >
                  <Icon className="h-4 w-4 shrink-0" style={{ color: isActive ? "#818CF8" : "rgba(255,252,245,0.30)" } as React.CSSProperties} />
                  <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <span>{tab.label}</span>
                    <span style={{ fontSize: "10px", fontWeight: 400, display: "none", color: isActive ? "rgba(165,180,252,0.60)" : "rgba(255,252,245,0.25)" }} className="sm:block">
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

        {/* Enrollment state — glass panel */}
        {!isEnrolled && (
          <div style={{
            background: "rgba(255,253,248,0.05)",
            backdropFilter: "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: "32px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.08)",
            overflow: "hidden",
            position: "relative",
          }}>
            {/* Indigo enrollment glow */}
            <div style={{
              position: "absolute", top: -60, left: -60,
              width: 320, height: 320,
              background: "radial-gradient(ellipse, rgba(99,102,241,0.14) 0%, transparent 68%)",
              pointerEvents: "none",
            }} />
            <div style={{ padding: "36px 40px", position: "relative", zIndex: 1 }}>
              <div className="flex flex-col sm:flex-row items-start gap-5">
                {/* Icon */}
                <div style={{
                  width: 56, height: 56, borderRadius: "18px", flexShrink: 0,
                  background: "linear-gradient(135deg, rgba(99,102,241,0.30) 0%, rgba(67,56,202,0.20) 100%)",
                  border: "1px solid rgba(99,102,241,0.30)",
                  boxShadow: "0 8px 24px rgba(67,56,202,0.20), inset 0 1px 0 rgba(255,255,255,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Shield style={{ width: 26, height: 26, color: "#A5B4FC" }} />
                </div>

                <div style={{ flex: 1 }}>
                  {/* Eyebrow */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
                    <div style={{ height: 22, overflow: "hidden", display: "flex", alignItems: "center" }}>
                      <img src="/images/scoreshift-wordmark-transparent.png" alt="ScoreShift" style={{ height: 85, width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
                    </div>
                    <span style={{ color: "rgba(255,252,245,0.20)", fontSize: "13px" }}>·</span>
                    <span style={{ color: "rgba(255,252,245,0.40)", fontSize: "13px" }}>Credit Profile Setup</span>
                  </div>
                  <h2 style={{ color: "rgba(255,252,245,0.92)", fontSize: "20px", fontWeight: 600, letterSpacing: "-0.4px", marginBottom: "8px" }}>
                    Set Up Your Credit Profile
                  </h2>
                  <p style={{ color: "rgba(255,252,245,0.42)", fontSize: "14px", lineHeight: "1.65", maxWidth: "500px", marginBottom: "24px" }}>
                    Connect your credit file to unlock real-time bureau data, score tracking, and intelligent alerts.
                    One-time setup — takes about 2 minutes.
                  </p>

                  {/* Bureau badges */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
                    {(Object.entries(BUREAU_CONFIG) as [keyof typeof BUREAU_CONFIG, typeof BUREAU_CONFIG[keyof typeof BUREAU_CONFIG]][]).map(([name, cfg]) => (
                      <span
                        key={name}
                        style={{
                          fontSize: "11px", fontWeight: 700, padding: "4px 12px",
                          borderRadius: "100px", color: "#fff",
                          backgroundColor: cfg.color,
                          boxShadow: `0 2px 8px ${cfg.color}55`,
                        }}
                      >
                        {name}
                      </span>
                    ))}
                    <span style={{ color: "rgba(255,252,245,0.32)", fontSize: "12px", marginLeft: "4px" }}>All 3 bureaus covered</span>
                  </div>

                  {!access.hasAnyPlan ? (
                    <div style={{
                      borderRadius: "20px",
                      background: "rgba(245,158,11,0.08)",
                      border: "1px solid rgba(245,158,11,0.20)",
                      padding: "18px 20px", maxWidth: "420px",
                    }}>
                      <p style={{ color: "rgba(252,211,77,0.85)", fontSize: "13px", fontWeight: 500, marginBottom: "14px" }}>
                        A subscription is required to access credit monitoring.
                      </p>
                      <Link href="/pricing">
                        <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-black font-bold gap-1.5" style={{ borderRadius: "100px" }}>
                          View Plans <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div style={{
                      borderRadius: "20px",
                      background: "rgba(255,253,248,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                      padding: "20px", maxWidth: "540px",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: "100px",
                          background: "linear-gradient(135deg, #F59E0B, #D97706)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <span style={{ color: "#fff", fontSize: "8px", fontWeight: 900 }}>SS</span>
                        </div>
                        <span style={{ color: "rgba(255,252,245,0.38)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
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

        {/* ── Not enrolled preview grid — glass tiles ───────────────────── */}
        {!isEnrolled && (
          <div style={{ marginTop: "8px" }}>
            <p style={{
              fontSize: "10px", fontWeight: 700,
              letterSpacing: "0.16em", textTransform: "uppercase",
              color: "rgba(255,252,245,0.22)",
              marginBottom: "20px",
            }}>
              Available after enrollment
            </p>
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
                  style={{
                    background: "rgba(255,253,248,0.035)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "20px",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.05)",
                    padding: "18px 18px 16px",
                    opacity: 0.55,
                    pointerEvents: "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: "10px", flexShrink: 0,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <comp.icon className="h-3.5 w-3.5" style={{ color: "rgba(255,252,245,0.30)" } as React.CSSProperties} />
                    </div>
                    <span style={{ color: "rgba(255,252,245,0.55)", fontSize: "13px", fontWeight: 500 }}>{comp.label}</span>
                    <Lock style={{ width: 12, height: 12, color: "rgba(255,252,245,0.18)", marginLeft: "auto" }} />
                  </div>
                  <p style={{ color: "rgba(255,252,245,0.28)", fontSize: "12px", lineHeight: "1.55" }}>{comp.description}</p>
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
