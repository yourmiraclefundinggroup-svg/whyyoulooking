import React, { useState, useEffect, useRef } from "react";
import scoreshiftLogo from "@assets/scoreshift-logo.png";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserContext } from "@/hooks/use-user-context";
import { useArrayScript } from "@/hooks/use-array-script";
import { useArrayToken } from "@/hooks/use-array-token";
import { STUDENT_LOAN_APP_KEY, STUDENT_LOAN_TOKEN } from "@/hooks/use-array-script";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { useArrayThemeInjector } from "@/hooks/use-array-theme-injector";
import { useScoreShiftProfile, type PlanSuggestion, type ProfileDispute } from "@/hooks/use-score-shift-profile";
import { apiRequest } from "@/lib/queryClient";
import "@/styles/portal.css";
import { DisputeIQPage as RealDisputeIQPage } from "@/pages/dispute-iq";

/* ── Custom element declarations ──────────────────────────────────── */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "array-credit-overview": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & Record<string, any>, HTMLElement>;
      "array-credit-score": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & Record<string, any>, HTMLElement>;
      "array-credit-alerts": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & Record<string, any>, HTMLElement>;
      "array-identity-protect": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & Record<string, any>, HTMLElement>;
      "array-pip-dashboard": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & Record<string, any>, HTMLElement>;
      "array-pip-scan": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & Record<string, any>, HTMLElement>;
      "array-credit-score-simulator": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & Record<string, any>, HTMLElement>;
      "array-credit-report": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & Record<string, any>, HTMLElement>;
      "array-credit-debt-analysis": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & Record<string, any>, HTMLElement>;
      "array-debt-navigator": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & Record<string, any>, HTMLElement>;
      "array-student-loan-navigator": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & Record<string, any>, HTMLElement>;
      "array-subscription-manager": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & Record<string, any>, HTMLElement>;
    }
  }
}

/* ── Types ────────────────────────────────────────────────────────── */
type PageId = "home" | "plan" | "dispute-iq" | "debt" | "subscriptions" | "student-loans" | "protection" | "report" | "progress" | "profile" | "payment-center" | "mail-wallet" | "concierge";

type OnboardingGoal = "improve-score" | "remove-negatives" | "build-credit" | "reduce-debt";
type OnboardingTimeline = "3-months" | "6-months" | "1-year" | "exploring";

/* ── Icon SVG helper ─────────────────────────────────────────────── */
function Icon({ children, size = 16 }: { children: React.ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

/* ── Count-up animation ──────────────────────────────────────────── */
// Module-level set persists across page navigation — animation fires once per session only
const _cpAnimatedKeys = new Set<string>();

function useCountUp(target: number | null, animKey: string, duration = 800): number | null {
  const [display, setDisplay] = useState<number | null>(() => {
    if (target === null) return null;
    return _cpAnimatedKeys.has(animKey) ? target : 0;
  });
  useEffect(() => {
    if (target === null) { setDisplay(null); return; }
    if (_cpAnimatedKeys.has(animKey)) { setDisplay(target); return; }
    _cpAnimatedKeys.add(animKey);
    const t0 = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const prog = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - prog, 3);
      setDisplay(Math.round(target * eased));
      if (prog < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, animKey, duration]);
  return display;
}

function CountUp({ to, animKey, suffix = "", prefix = "" }: {
  to: number | null; animKey: string; suffix?: string; prefix?: string;
}) {
  const val = useCountUp(to, animKey);
  if (to === null || val === null) return <>—</>;
  return <>{prefix}{val}{suffix}</>;
}

// For stat grids where values may be numeric strings or "—"
function AnimatedStatVal({ val, label }: { val: string; label: string }) {
  const pctMatch = val.match(/^(\d+)%$/);
  const numOnly = !pctMatch && /^\d+$/.test(val);
  const target = pctMatch ? parseInt(pctMatch[1]) : numOnly ? parseInt(val) : null;
  const animated = useCountUp(target, `stat-val-${label}`);
  if (target === null || animated === null) return <>{val}</>;
  if (pctMatch) return <>{animated}%</>;
  return <>{animated}</>;
}

/* ── Array Wrapper ───────────────────────────────────────────────── */
function ArrayWrapper({
  title, sub, badge, accentTop, loading, locked, children,
}: {
  title: string; sub?: string; badge?: React.ReactNode;
  accentTop?: boolean; loading: boolean; locked?: boolean; children: React.ReactNode;
}) {
  return (
    <div className={`cp-array-wrapper${accentTop ? " cp-card-accent-top" : ""}`}>
      <div className="cp-array-wrapper-header">
        <div>
          <div className="cp-array-wrapper-title">{title}</div>
          {sub && <div className="cp-array-wrapper-sub">{sub}</div>}
        </div>
        {badge}
      </div>
      <div className="cp-array-wrapper-body">
        {locked ? (
          <div className="cp-array-locked">
            <Icon size={32}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></Icon>
            <div className="cp-array-locked-title">Feature unavailable</div>
            <div className="cp-array-locked-sub">This feature requires a subscription. Contact your credit advisor to upgrade your plan.</div>
          </div>
        ) : loading ? (
          <div className="cp-array-loading">
            <div className="cp-array-spinner" />
            Loading…
          </div>
        ) : children}
      </div>
    </div>
  );
}

/* ── Toggle ──────────────────────────────────────────────────────── */
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button className={`cp-toggle${on ? "" : " off"}`} onClick={onToggle} aria-pressed={on}>
      <div className="cp-toggle-thumb" />
    </button>
  );
}

/* ── Sub-tab bar ─────────────────────────────────────────────────── */
function SubTabs({ tabs, active, onChange }: { tabs: { id: string; label: string }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="cp-subtabs">
      {tabs.map(t => (
        <button key={t.id} className={`cp-subtab${active === t.id ? " active" : ""}`} onClick={() => onChange(t.id)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ── Onboarding flow ─────────────────────────────────────────────── */
const GOALS: { id: OnboardingGoal; label: string; icon: string; desc: string }[] = [
  { id: "improve-score", label: "Improve my score", icon: "📈", desc: "Boost your credit score as fast as possible" },
  { id: "remove-negatives", label: "Remove negative items", icon: "🗑️", desc: "Dispute collections, late payments & errors" },
  { id: "build-credit", label: "Build credit history", icon: "🏗️", desc: "Establish a strong credit profile from scratch" },
  { id: "reduce-debt", label: "Reduce debt", icon: "💳", desc: "Pay down balances and lower utilization" },
];

const TIMELINES: { id: OnboardingTimeline; label: string; sub: string }[] = [
  { id: "3-months", label: "3 months", sub: "Aggressive — I need results fast" },
  { id: "6-months", label: "6 months", sub: "Balanced — steady and consistent" },
  { id: "1-year", label: "1 year", sub: "Long-term — build lasting habits" },
  { id: "exploring", label: "Just exploring", sub: "No timeline — show me everything" },
];

const GOAL_SUMMARIES: Record<OnboardingGoal, string> = {
  "improve-score": "Focus on removing negative items and lowering utilization. Each dispute resolved and each balance paid down brings your score closer to your target.",
  "remove-negatives": "Dispute inaccurate collections, late payments, and charge-offs. Removing even one negative item can produce a meaningful score jump.",
  "build-credit": "Keep all accounts in good standing, diversify your credit mix, and avoid unnecessary hard inquiries. Consistency builds lasting credit health.",
  "reduce-debt": "Target high-utilization accounts first. Paying each card below 30% utilization typically produces the fastest score gains.",
};

function OnboardingScreen({ onDone }: { onDone: (goal: OnboardingGoal, timeline: OnboardingTimeline) => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [goal, setGoal] = useState<OnboardingGoal | null>(null);
  const [timeline, setTimeline] = useState<OnboardingTimeline | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  useEffect(() => {
    if (step === 3) {
      const steps = [0, 18, 37, 52, 68, 81, 94, 100];
      let i = 0;
      const interval = setInterval(() => {
        i++;
        if (i < steps.length) {
          setAnalysisProgress(steps[i]);
        } else {
          clearInterval(interval);
          setTimeout(() => onDone(goal!, timeline!), 600);
        }
      }, 340);
      return () => clearInterval(interval);
    }
  }, [step]);

  if (step === 3) {
    return (
      <div className="cp-onboarding-overlay">
        <div className="cp-onboarding-card" style={{ textAlign: "center", maxWidth: 400 }}>
          <div className="cp-onboarding-analyzing-icon">
            <div className="cp-onboarding-spinner" />
          </div>
          <h2 className="cp-onboarding-title" style={{ marginTop: 24 }}>Building your plan…</h2>
          <p className="cp-onboarding-sub">Analyzing your credit profile and preparing your personalized Credit Action Intelligence report.</p>
          <div style={{ marginTop: 28 }}>
            <div className="cp-flex-between" style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "var(--cp-text-muted)" }}>
                {analysisProgress < 30 ? "Scanning bureau data…" : analysisProgress < 60 ? "Identifying opportunities…" : analysisProgress < 90 ? "Prioritizing actions…" : "Plan ready!"}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--cp-accent)" }}>{analysisProgress}%</span>
            </div>
            <div className="cp-progress-bar"><div className="cp-progress-fill" style={{ width: `${analysisProgress}%`, transition: "width 0.3s ease" }} /></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cp-onboarding-overlay">
      <div className="cp-onboarding-card">
        <div className="cp-onboarding-logo">
          <img src={scoreshiftLogo} alt="ScoreShift" style={{ width: 36, height: 36, objectFit: "contain" }} />
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 16, color: "var(--cp-text-primary)" }}>ScoreShift</span>
        </div>

        {step === 1 && (
          <>
            <div className="cp-onboarding-step-indicator">
              <span className="cp-onboarding-step active" />
              <span className="cp-onboarding-step" />
            </div>
            <h2 className="cp-onboarding-title">What's your main credit goal?</h2>
            <p className="cp-onboarding-sub">We'll build a personalized action plan around this.</p>
            <div className="cp-onboarding-options">
              {GOALS.map(g => (
                <button
                  key={g.id}
                  className={`cp-onboarding-option${goal === g.id ? " selected" : ""}`}
                  onClick={() => setGoal(g.id)}
                >
                  <span className="cp-onboarding-option-icon">{g.icon}</span>
                  <div>
                    <div className="cp-onboarding-option-label">{g.label}</div>
                    <div className="cp-onboarding-option-desc">{g.desc}</div>
                  </div>
                  {goal === g.id && (
                    <span className="cp-onboarding-check">
                      <Icon size={14}><polyline points="20 6 9 17 4 12" /></Icon>
                    </span>
                  )}
                </button>
              ))}
            </div>
            <button className="cp-btn cp-btn-primary" style={{ width: "100%", marginTop: 20, justifyContent: "center" }} disabled={!goal} onClick={() => setStep(2)}>
              Continue
              <Icon size={15}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></Icon>
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="cp-onboarding-step-indicator">
              <span className="cp-onboarding-step done" />
              <span className="cp-onboarding-step active" />
            </div>
            <h2 className="cp-onboarding-title">What's your timeline?</h2>
            <p className="cp-onboarding-sub">We'll calibrate urgency and pacing for your plan.</p>
            <div className="cp-onboarding-options">
              {TIMELINES.map(t => (
                <button
                  key={t.id}
                  className={`cp-onboarding-option${timeline === t.id ? " selected" : ""}`}
                  onClick={() => setTimeline(t.id)}
                >
                  <div style={{ flex: 1 }}>
                    <div className="cp-onboarding-option-label">{t.label}</div>
                    <div className="cp-onboarding-option-desc">{t.sub}</div>
                  </div>
                  {timeline === t.id && (
                    <span className="cp-onboarding-check">
                      <Icon size={14}><polyline points="20 6 9 17 4 12" /></Icon>
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button className="cp-btn cp-btn-secondary" style={{ flex: 1, justifyContent: "center" }} onClick={() => setStep(1)}>Back</button>
              <button className="cp-btn cp-btn-primary" style={{ flex: 2, justifyContent: "center" }} disabled={!timeline} onClick={() => setStep(3)}>
                Build My Plan
                <Icon size={15}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /></Icon>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── HOME PAGE ───────────────────────────────────────────────────── */
type HomePageProps = {
  user: any; goal: OnboardingGoal | null; timeline: OnboardingTimeline | null;
  onNavigate: (page: PageId) => void;
  appKey: string | null; userToken: string | null; sbx: Record<string, string>;
  scriptReady: boolean; tokenReady: boolean; tokenError: boolean;
  scrollToPayment?: boolean;
};

/* ── MANAGED CLIENT HOME ─────────────────────────────────────────── */
function ManagedClientHome({ user, onNavigate, scrollToPayment }: Pick<HomePageProps, "user" | "onNavigate"> & { scrollToPayment?: boolean }) {
  const displayName = user?.firstName || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const qc = useQueryClient();

  const { data: pkg, isLoading: pkgLoading } = useQuery<any>({ queryKey: ["/api/me/managed-package"] });
  const { data: activities = [], isLoading: activitiesLoading } = useQuery<any[]>({ queryKey: ["/api/me/case-activities"] });
  const { data: documents = [] } = useQuery<any[]>({ queryKey: ["/api/me/documents"] });
  const { data: clientStats } = useQuery<{ ptsGained: number | null; itemsRemoved: number; topScore: number | null; startingScore: number | null; currentScore: number | null; activeIssues: number; disputesInProgress: number; itemsResolved: number }>({ queryKey: ["/api/client/stats"] });

  useEffect(() => {
    if (scrollToPayment) {
      const t = setTimeout(() => document.getElementById("payment-center")?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
      return () => clearTimeout(t);
    }
  }, [scrollToPayment]);

  const caseStatus = pkg?.caseStatus || "active";
  const statusBadge: Record<string, { color: string; bg: string }> = {
    active: { color: "var(--cp-accent)", bg: "var(--cp-accent-light)" },
    completed: { color: "var(--cp-sage)", bg: "var(--cp-sage-light)" },
    waiting_on_client: { color: "var(--cp-clay)", bg: "var(--cp-clay-light)" },
    pending: { color: "var(--cp-text-muted)", bg: "rgba(110,106,99,0.1)" },
    on_hold: { color: "var(--cp-clay)", bg: "var(--cp-clay-light)" },
    cancelled: { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  };
  const statusStyle = statusBadge[caseStatus] || statusBadge.active;

  const activityStatusBadge: Record<string, { color: string; bg: string }> = {
    completed: { color: "var(--cp-sage)", bg: "var(--cp-sage-light)" },
    in_progress: { color: "var(--cp-accent)", bg: "var(--cp-accent-light)" },
    pending: { color: "var(--cp-text-muted)", bg: "rgba(110,106,99,0.1)" },
    waiting: { color: "var(--cp-clay)", bg: "var(--cp-clay-light)" },
  };
  const activityIcons: Record<string, string> = {
    letter_sent: "✉", dispute_filed: "📋", document_reviewed: "📄",
    call_completed: "📞", score_update: "📈", note_added: "📝", follow_up_scheduled: "📅",
  };

  const completedCount = (activities as any[]).filter((a: any) => a.status === "completed").length;
  const totalActivities = activities.length;
  const readinessPct = totalActivities > 0 ? Math.round((completedCount / totalActivities) * 100) : 0;

  const totalInvestment = parseFloat(pkg?.totalInvestment || "0");
  const amountPaid = parseFloat(pkg?.amountPaid || "0");
  const remaining = Math.max(0, totalInvestment - amountPaid);
  const paidPct = totalInvestment > 0 ? Math.round((amountPaid / totalInvestment) * 100) : 0;

  const docStatusBadge: Record<string, { color: string; bg: string }> = {
    needed: { color: "var(--cp-clay)", bg: "var(--cp-clay-light)" },
    uploaded: { color: "var(--cp-text-muted)", bg: "rgba(110,106,99,0.1)" },
    reviewed: { color: "var(--cp-accent)", bg: "var(--cp-accent-light)" },
    approved: { color: "var(--cp-sage)", bg: "var(--cp-sage-light)" },
  };

  return (
    <div>
      {/* Credit Success Plan hero card */}
      <div className="cp-home-hero cp-mb-24">
        <div className="cp-home-hero-left">
          <div className="cp-welcome-eyebrow">{greeting.toUpperCase()} · YOUR CREDIT SUCCESS PLAN</div>
          <div className="cp-welcome-name">{greeting}, {displayName}.</div>
          <div className="cp-welcome-sub">
            {pkgLoading ? "Loading your case…" : pkg
              ? <>Program: <strong style={{ color: "var(--cp-text-primary)" }}>{pkg.packageName}</strong>{pkg.assignedSpecialist ? <> · Specialist: <strong style={{ color: "var(--cp-text-primary)" }}>{pkg.assignedSpecialist}</strong></> : ""}</>
              : "Your managed credit repair program is being set up. We'll reach out soon."}
          </div>
          {pkg && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <span style={{ background: statusStyle.bg, border: `1px solid ${statusStyle.color}40`, borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 700, color: statusStyle.color, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {caseStatus.replace(/_/g, " ")}
              </span>
              {totalActivities > 0 && (
                <span style={{ fontSize: 11, color: "var(--cp-text-muted)", fontWeight: 500 }}>
                  {readinessPct}% readiness · {completedCount} of {totalActivities} actions done
                </span>
              )}
              {pkg.enrollmentDate && (
                <span style={{ fontSize: 11, color: "var(--cp-text-muted)" }}>
                  Enrolled {new Date(pkg.enrollmentDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              )}
            </div>
          )}
          {pkg?.casesSummary && (
            <div style={{ marginTop: 10, fontSize: 12.5, color: "var(--cp-text-secondary)", lineHeight: 1.6, fontStyle: "italic", borderLeft: "3px solid var(--cp-accent)", paddingLeft: 10 }}>
              "{pkg.casesSummary}"
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 }}>
          {totalActivities > 0 && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: "var(--cp-text-muted)", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 2 }}>Readiness</div>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 30, fontWeight: 800, color: "var(--cp-accent)", letterSpacing: -1.5, lineHeight: 1 }}>
                <CountUp to={readinessPct} animKey="managed-hero-readiness" /><span style={{ fontSize: 14, fontWeight: 500, letterSpacing: 0, color: "var(--cp-text-muted)" }}>%</span>
              </div>
            </div>
          )}
          {!pkg && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "var(--cp-text-muted)", lineHeight: 1.5 }}>Your specialist is<br />setting up your plan.</div>
            </div>
          )}
        </div>
      </div>

      {/* Team Activity + Case Overview */}
      <div className="cp-grid-2 cp-mb-24">
        <div className="cp-card">
          <div className="cp-card-header">
            <div><div className="cp-card-title">Team Activity</div><div className="cp-card-subtitle">Recent work on your case</div></div>
          </div>
          {activitiesLoading ? (
            <div style={{ padding: "20px 0", textAlign: "center" }}><div className="cp-array-spinner" style={{ margin: "0 auto" }} /></div>
          ) : activities.length === 0 ? (
            <div className="cp-empty-state" style={{ padding: "24px 12px" }}>
              <div className="cp-empty-title" style={{ fontSize: 13 }}>No activity yet</div>
              <div className="cp-empty-desc" style={{ fontSize: 12 }}>Your team will start working on your case soon.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(activities as any[]).slice(0, 8).map((a: any) => {
                const s = activityStatusBadge[a.status] || activityStatusBadge.pending;
                return (
                  <div key={a.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>
                      {activityIcons[a.activityType] || "✦"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--cp-text-primary)", lineHeight: 1.3 }}>{a.description}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20, background: s.bg, color: s.color, textTransform: "capitalize" }}>
                          {a.status.replace(/_/g, " ")}
                        </span>
                        <span style={{ fontSize: 10, color: "var(--cp-text-muted)" }}>
                          {new Date(a.occurredAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="cp-card">
          <div className="cp-card-header">
            <div><div className="cp-card-title">Case Overview</div><div className="cp-card-subtitle">Your program at a glance</div></div>
            {pkg && <span className="cp-badge" style={{ background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.color}30` }}>{caseStatus.replace(/_/g, " ")}</span>}
          </div>
          {pkgLoading ? (
            <div style={{ padding: "20px 0", textAlign: "center" }}><div className="cp-array-spinner" style={{ margin: "0 auto" }} /></div>
          ) : !pkg ? (
            <div className="cp-empty-state" style={{ padding: "24px 12px" }}>
              <div className="cp-empty-title" style={{ fontSize: 13 }}>Plan being configured</div>
              <div className="cp-empty-desc" style={{ fontSize: 12 }}>Your credit specialist will set up your plan shortly.</div>
            </div>
          ) : (
            <div>
              {pkg.assignedSpecialist && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, padding: "10px 12px", background: "var(--cp-bg)", borderRadius: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, var(--cp-accent), #7B6AAB)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "white", fontWeight: 700, flexShrink: 0 }}>
                    {pkg.assignedSpecialist.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--cp-text-primary)" }}>{pkg.assignedSpecialist}</div>
                    <div style={{ fontSize: 11, color: "var(--cp-text-muted)" }}>Assigned specialist</div>
                  </div>
                </div>
              )}
              {totalActivities > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: "var(--cp-text-muted)" }}>Overall readiness</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--cp-accent)" }}>{readinessPct}%</span>
                  </div>
                  <div className="cp-progress-bar"><div className="cp-progress-fill" style={{ width: `${readinessPct}%` }} /></div>
                </div>
              )}
              {pkg.casesSummary && (
                <div style={{ fontSize: 13, color: "var(--cp-text-muted)", lineHeight: 1.6, marginBottom: 12 }}>{pkg.casesSummary}</div>
              )}
              {pkg.enrollmentDate && (
                <div style={{ fontSize: 11, color: "var(--cp-text-muted)", marginBottom: 10 }}>
                  Enrolled: <strong style={{ color: "var(--cp-text-primary)" }}>{new Date(pkg.enrollmentDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong>
                </div>
              )}
              {Array.isArray(pkg.servicesIncluded) && pkg.servicesIncluded.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--cp-text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 }}>Services Included</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {(pkg.servicesIncluded as string[]).map((s, i) => (
                      <span key={i} style={{ background: "var(--cp-accent-light)", color: "var(--cp-accent)", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 12 }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Payment Center */}
      <div id="payment-center" className="cp-card cp-mb-24">
        <div className="cp-card-header">
          <div><div className="cp-card-title">Payment Center</div><div className="cp-card-subtitle">{pkg?.packageName || "Managed Credit Repair"}</div></div>
          {pkg?.paymentStatus && (
            <span className="cp-badge" style={{
              background: pkg.paymentStatus === "current" ? "var(--cp-sage-light)" : pkg.paymentStatus === "paid_off" ? "var(--cp-accent-light)" : "var(--cp-clay-light)",
              color: pkg.paymentStatus === "current" ? "var(--cp-sage)" : pkg.paymentStatus === "paid_off" ? "var(--cp-accent)" : "var(--cp-clay)",
            }}>{pkg.paymentStatus.replace(/_/g, " ")}</span>
          )}
        </div>
        {!pkg ? (
          <div className="cp-empty-state" style={{ padding: "20px 12px" }}>
            <div className="cp-empty-title" style={{ fontSize: 13 }}>No billing information yet</div>
            <div className="cp-empty-desc" style={{ fontSize: 12 }}>Your specialist will configure your payment plan shortly.</div>
          </div>
        ) : (
          <div>
            <div className="cp-grid-3" style={{ gap: 12, marginBottom: 16 }}>
              {[
                { label: "Total Investment", val: totalInvestment > 0 ? `$${totalInvestment.toLocaleString("en-US", { minimumFractionDigits: 0 })}` : "—", color: "var(--cp-text-primary)" },
                { label: "Amount Paid", val: amountPaid > 0 ? `$${amountPaid.toLocaleString("en-US", { minimumFractionDigits: 0 })}` : "$0", color: "var(--cp-sage)" },
                { label: "Remaining", val: totalInvestment > 0 ? `$${remaining.toLocaleString("en-US", { minimumFractionDigits: 0 })}` : "—", color: remaining > 0 ? "var(--cp-clay)" : "var(--cp-sage)" },
              ].map(s => (
                <div key={s.label} style={{ background: "var(--cp-bg)", borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: -1 }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: "var(--cp-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {totalInvestment > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: "var(--cp-text-muted)" }}>Payment progress</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--cp-sage)" }}>{paidPct}% paid</span>
                </div>
                <div className="cp-progress-bar"><div className="cp-progress-fill" style={{ width: `${paidPct}%`, background: "var(--cp-sage)" }} /></div>
              </div>
            )}
            {pkg.nextPaymentAmount && pkg.nextPaymentDue && (
              <div style={{ background: "var(--cp-clay-light)", border: "1px solid rgba(239,162,111,0.3)", borderRadius: 9, padding: "10px 14px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--cp-clay)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>Next Payment Due</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cp-text-primary)" }}>
                    ${parseFloat(pkg.nextPaymentAmount).toLocaleString("en-US", { minimumFractionDigits: 0 })} · {new Date(pkg.nextPaymentDue).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </div>
                </div>
                {pkg.paymentPlanType && <span style={{ fontSize: 11, color: "var(--cp-clay)", fontWeight: 600, textTransform: "capitalize" }}>{pkg.paymentPlanType.replace(/_/g, " ")}</span>}
              </div>
            )}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="cp-btn cp-btn-primary cp-btn-sm" disabled style={{ opacity: 0.7 }}>
                <Icon size={12}><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></Icon>
                Make Payment
              </button>
              <button className="cp-btn cp-btn-secondary cp-btn-sm" disabled style={{ opacity: 0.7 }}>
                <Icon size={12}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></Icon>
                View Agreement
              </button>
              <button className="cp-btn cp-btn-secondary cp-btn-sm" disabled style={{ opacity: 0.7 }}>
                <Icon size={12}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></Icon>
                Download Receipt
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Documents Needed */}
      <div className="cp-card cp-mb-24">
        <div className="cp-card-header">
          <div><div className="cp-card-title">My Documents</div><div className="cp-card-subtitle">Files requested for your case</div></div>
          {(documents as any[]).filter((d: any) => d.status === "needed").length > 0 && (
            <span className="cp-badge warning">{(documents as any[]).filter((d: any) => d.status === "needed").length} needed</span>
          )}
        </div>
        {(documents as any[]).length === 0 ? (
          <div className="cp-empty-state" style={{ padding: "20px 12px" }}>
            <div className="cp-empty-title" style={{ fontSize: 13 }}>No documents requested yet</div>
            <div className="cp-empty-desc" style={{ fontSize: 12 }}>Your specialist will request documents as your case progresses.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {(documents as any[]).map((doc: any, i) => {
              const ds = docStatusBadge[doc.status] || docStatusBadge.needed;
              return (
                <div key={doc.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < documents.length - 1 ? "1px solid var(--cp-border-light)" : "none" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cp-text-primary)" }}>{doc.label}</div>
                    <div style={{ fontSize: 11, color: "var(--cp-text-muted)", textTransform: "capitalize" }}>{(doc.documentType || "").replace(/_/g, " ")}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: ds.bg, color: ds.color, textTransform: "capitalize", flexShrink: 0 }}>
                    {doc.status.replace(/_/g, " ")}
                  </span>
                  {doc.status === "needed" && (
                    <>
                      <input
                        type="file"
                        id={`upload-${doc.id}`}
                        style={{ display: "none" }}
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const fd = new FormData();
                          fd.append("file", file);
                          try {
                            const r = await fetch(`/api/me/documents/${doc.id}/upload`, {
                              method: "POST",
                              headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
                              body: fd,
                            });
                            if (r.ok) {
                              qc.invalidateQueries({ queryKey: ["/api/me/documents"] });
                            }
                          } catch { /* ignore */ }
                        }}
                      />
                      <label
                        htmlFor={`upload-${doc.id}`}
                        className="cp-btn cp-btn-primary cp-btn-sm"
                        style={{ flexShrink: 0, fontSize: 11, padding: "4px 12px", cursor: "pointer" }}
                      >Upload</label>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ways to Improve Faster */}
      <div className="cp-card cp-mb-24">
        <div className="cp-card-header">
          <div><div className="cp-card-title">Ways to Improve Faster</div><div className="cp-card-subtitle">Tools available to you while our team works on your case</div></div>
        </div>
        <div className="cp-grid-2" style={{ gap: 10 }}>
          {([
            { icon: "💳", label: "Debt Navigator", detail: "Reducing utilization could improve your readiness while our team works on reporting issues.", color: "var(--cp-accent)", page: "debt" as PageId },
            { icon: "📄", label: "Credit Report", detail: "Review all three bureaus for items being disputed and track reporting differences.", color: "var(--cp-accent)", page: "report" as PageId },
            { icon: "🛡️", label: "Protection Center", detail: "Protect your identity and reduce future credit risks while your disputes are active.", color: "var(--cp-sage)", page: "protection" as PageId },
            { icon: "🔒", label: "Privacy Protection", detail: "Monitor and remove your personal data from data broker sites to prevent new fraud.", color: "var(--cp-sage)", page: "protection" as PageId },
            { icon: "📈", label: "Score Simulator", detail: "See how paying off balances or removing items could affect your scores.", color: "var(--cp-clay)", page: "report" as PageId },
            { icon: "🔔", label: "Credit Alerts", detail: "Get notified of new inquiries or changes on your report between bureau responses.", color: "var(--cp-clay)", page: "report" as PageId },
            { icon: "🎓", label: "Student Loan Aid", detail: "Review possible student loan options that may support your monthly affordability.", color: "var(--cp-accent)", page: "progress" as PageId },
            { icon: "💰", label: "Subscription Manager", detail: "We found recurring expenses that may be redirected toward your credit goals while our team works on your file.", color: "var(--cp-sage)", page: "subscriptions" as PageId },
            { icon: "🔍", label: "PIP Scan", detail: "Scan for personally identifiable information exposures that may affect your credit file.", color: "var(--cp-accent)", page: "protection" as PageId },
            { icon: "🆔", label: "Identity Protection", detail: "Monitor for signs of identity theft and new account fraud across the major bureaus.", color: "var(--cp-sage)", page: "protection" as PageId },
          ] as { icon: string; label: string; detail: string; color: string; page: PageId }[]).map((a, i) => (
            <div
              key={i}
              style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "var(--cp-bg)", borderRadius: 10, padding: "12px 14px", cursor: "pointer" }}
              onClick={() => onNavigate(a.page)}
            >
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `${a.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{a.icon}</div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--cp-text-primary)", marginBottom: 2 }}>{a.label} <span style={{ fontSize: 10, color: a.color }}>→</span></div>
                <div style={{ fontSize: 11.5, color: "var(--cp-text-muted)", lineHeight: 1.5 }}>{a.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Case Timeline */}
      {activities.length > 0 && (
        <div className="cp-card cp-mb-24">
          <div className="cp-card-header">
            <div><div className="cp-card-title">Case Timeline</div><div className="cp-card-subtitle">Full chronological history of your case</div></div>
          </div>
          <div style={{ position: "relative", paddingLeft: 22 }}>
            <div style={{ position: "absolute", left: 8, top: 6, bottom: 6, width: 1, background: "var(--cp-border)" }} />
            {(activities as any[]).map((a: any, i) => {
              const s = activityStatusBadge[a.status] || activityStatusBadge.pending;
              return (
                <div key={a.id} style={{ position: "relative", paddingBottom: i < activities.length - 1 ? 16 : 0 }}>
                  <div style={{ position: "absolute", left: -18, top: 4, width: 8, height: 8, borderRadius: "50%", background: s.color, border: "2px solid var(--cp-surface)", zIndex: 1 }} />
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--cp-text-primary)", lineHeight: 1.35 }}>{a.description}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 3, alignItems: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: s.color, textTransform: "capitalize" }}>{a.status.replace(/_/g, " ")}</span>
                    <span style={{ fontSize: 10, color: "var(--cp-text-muted)" }}>· {new Date(a.occurredAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* My Results — always shown; empty states for unavailable data */}
      {pkg && (
        <div className="cp-card cp-mb-24">
          <div className="cp-card-header">
            <div><div className="cp-card-title">My Results</div><div className="cp-card-subtitle">What we've achieved together so far</div></div>
          </div>
          {(amountPaid === 0 && completedCount === 0) ? (
            <div className="cp-empty-state" style={{ padding: "20px 0" }}>
              <div className="cp-empty-title" style={{ fontSize: 13 }}>Results will appear here as your case progresses</div>
              <div className="cp-empty-desc" style={{ fontSize: 12 }}>Your specialist is working on your file. Check back after your first round of activities is completed.</div>
            </div>
          ) : (
            <>
              <div className="cp-grid-3" style={{ gap: 10, marginBottom: 12 }}>
                {[
                  {
                    label: "Activities Resolved",
                    val: completedCount > 0 ? `${completedCount}` : "—",
                    sub: totalActivities > 0 ? `of ${totalActivities} total` : null,
                    color: "var(--cp-sage)",
                  },
                  {
                    label: "Letters Sent",
                    val: (() => { const n = (activities as any[]).filter((a: any) => a.activityType === "letter_sent").length; return n > 0 ? `${n}` : "—"; })(),
                    sub: null,
                    color: "var(--cp-accent)",
                  },
                  {
                    label: "Bureau Responses",
                    val: (() => { const n = (activities as any[]).filter((a: any) => a.activityType === "document_reviewed" || (a.description || "").toLowerCase().includes("response")).length; return n > 0 ? `${n}` : "—"; })(),
                    sub: null,
                    color: "var(--cp-accent)",
                  },
                  {
                    label: "Amount Invested",
                    val: amountPaid > 0 ? `$${amountPaid.toLocaleString("en-US", { minimumFractionDigits: 0 })}` : "—",
                    sub: totalInvestment > 0 ? `of $${totalInvestment.toLocaleString("en-US", { minimumFractionDigits: 0 })} total` : null,
                    color: "var(--cp-clay)",
                  },
                  {
                    label: "Case Readiness",
                    val: totalActivities > 0 ? `${readinessPct}%` : "—",
                    sub: pkg.caseStatus ? pkg.caseStatus.replace(/_/g, " ") : "active",
                    color: readinessPct >= 75 ? "var(--cp-sage)" : readinessPct >= 40 ? "var(--cp-accent)" : "var(--cp-clay)",
                  },
                  {
                    label: "Starting Score",
                    val: clientStats?.startingScore ? `${clientStats.startingScore}` : "—",
                    sub: clientStats?.startingScore ? "when enrolled" : "Not yet recorded",
                    color: "var(--cp-text-muted)",
                  },
                  {
                    label: "Current Score",
                    val: clientStats?.currentScore ? `${clientStats.currentScore}` : "—",
                    sub: clientStats?.ptsGained != null && clientStats.ptsGained !== 0
                      ? `${clientStats.ptsGained > 0 ? "▲ +" : "▼ "}${clientStats.ptsGained} pts`
                      : clientStats?.currentScore ? "as of latest pull" : "Pull report to track",
                    color: clientStats?.currentScore
                      ? (clientStats.currentScore >= 740 ? "var(--cp-sage)" : clientStats.currentScore >= 580 ? "var(--cp-accent)" : "var(--cp-clay)")
                      : "var(--cp-text-muted)",
                  },
                ].map(s => (
                  <div key={s.label} style={{ background: "var(--cp-bg)", borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: s.color, letterSpacing: -0.5 }}><AnimatedStatVal val={s.val} label={s.label} /></div>
                    <div style={{ fontSize: 9.5, color: "var(--cp-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>{s.label}</div>
                    {s.sub && <div style={{ fontSize: 10, color: "var(--cp-text-muted)", marginTop: 2, textTransform: "capitalize" }}>{s.sub}</div>}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function HomePage({ user, goal, timeline, onNavigate, appKey, userToken, sbx, scriptReady, tokenReady, tokenError, scrollToPayment }: HomePageProps) {
  if (user?.accountType === "MANAGED_CLIENT") {
    return <ManagedClientHome user={user} onNavigate={onNavigate} scrollToPayment={scrollToPayment} />;
  }
  const displayName = user?.firstName || user?.username || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const { data: profile } = useScoreShiftProfile();
  const utilizationPct = profile?.utilization?.overallPercent ?? null;
  const profileActiveDisputes = (profile?.disputes ?? []).filter(d => ["PENDING", "SENT", "DELIVERED", "FOLLOW_UP_REQUIRED"].includes(d.status));

  const { data: activeRaw, isLoading: disputesLoading } = useQuery<EnrichedDispute[]>({
    queryKey: ["/api/client/disputes?status=active"],
  });
  const activeDisputes: EnrichedDispute[] = Array.isArray(activeRaw) ? activeRaw : [];
  const topDispute = activeDisputes[0] ?? null;

  const { data: ssStats } = useQuery<{ ptsGained: number | null; itemsRemoved: number; topScore: number | null; startingScore: number | null; currentScore: number | null; activeIssues: number; disputesInProgress: number; itemsResolved: number }>({
    queryKey: ["/api/client/stats"],
  });
  const totalKnownItems = (ssStats?.itemsResolved ?? 0) + (ssStats?.disputesInProgress ?? 0) + (ssStats?.activeIssues ?? 0);
  const readinessPct = totalKnownItems > 0
    ? Math.round(((ssStats?.itemsResolved ?? 0) / totalKnownItems) * 100)
    : goal ? 5 : 0;

  return (
    <div>
      {/* Welcome hero */}
      <div className="cp-home-hero cp-mb-24">
        <div className="cp-home-hero-left">
          <div className="cp-welcome-eyebrow">{greeting.toUpperCase()}</div>
          <div className="cp-welcome-name">{greeting}, {displayName}.</div>
          <div className="cp-welcome-sub">
            {disputesLoading ? "Loading your plan…" :
             activeDisputes.length > 0
               ? <><strong style={{ color: "var(--cp-accent)" }}>{activeDisputes.length} dispute{activeDisputes.length !== 1 ? "s" : ""} in progress</strong> — check Dispute IQ for updates.</>
               : "Pull your credit report to start identifying issues and building your action plan."}
          </div>
        </div>
        <div className="cp-home-hero-scores">
          <button
            className="cp-btn cp-btn-secondary cp-btn-sm"
            style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}
            onClick={() => onNavigate("report")}
          >
            <Icon size={13}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></Icon>
            Check your scores →
          </button>
        </div>
      </div>

      {/* ScoreShift Plan — goal card + readiness */}
      <div className="cp-card cp-mb-24" style={{ borderLeft: "4px solid var(--cp-accent)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div className="cp-card-eyebrow">YOUR SCORESHIFT PLAN</div>
            {goal ? (
              <>
                <div className="cp-card-title" style={{ margin: "4px 0 2px" }}>
                  {GOALS.find(g => g.id === goal)?.icon} {GOALS.find(g => g.id === goal)?.label}
                </div>
                {timeline && (
                  <div className="cp-card-subtitle" style={{ marginBottom: 8 }}>Timeline: {TIMELINES.find(t => t.id === timeline)?.label}</div>
                )}
                <p style={{ fontSize: 13, color: "var(--cp-text-secondary)", lineHeight: 1.6, margin: 0 }}>
                  {GOAL_SUMMARIES[goal]}
                </p>
              </>
            ) : (
              <>
                <div className="cp-card-title" style={{ margin: "4px 0 8px" }}>Set your credit goal</div>
                <p style={{ fontSize: 13, color: "var(--cp-text-muted)", lineHeight: 1.6, margin: 0 }}>
                  Tell us what you're working toward and we'll build a personalized action plan for you.
                </p>
                <button className="cp-btn cp-btn-secondary cp-btn-sm" style={{ marginTop: 10 }} onClick={() => onNavigate("plan")}>
                  Set My Goal →
                </button>
              </>
            )}
          </div>
          {/* Readiness ring */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <div style={{ position: "relative", width: 68, height: 68 }}>
              <svg viewBox="0 0 68 68" style={{ width: 68, height: 68, transform: "rotate(-90deg)" }}>
                <circle cx="34" cy="34" r="28" fill="none" stroke="var(--cp-border)" strokeWidth="6" />
                <circle cx="34" cy="34" r="28" fill="none" stroke="var(--cp-accent)" strokeWidth="6"
                  strokeDasharray={`${(readinessPct / 100) * 175.9} 175.9`}
                  strokeLinecap="round" style={{ transition: "stroke-dasharray 0.6s ease" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, color: "var(--cp-accent)", letterSpacing: -0.5 }}><CountUp to={readinessPct} animKey="home-hero-readiness" />%</span>
              </div>
            </div>
            <div style={{ fontSize: 9.5, color: "var(--cp-text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center" }}>
              Plan<br />Readiness
            </div>
            {ssStats && (
              <div style={{ fontSize: 10, color: "var(--cp-text-muted)", textAlign: "center", lineHeight: 1.4 }}>
                {ssStats.itemsResolved > 0 && <div style={{ color: "var(--cp-sage)", fontWeight: 600 }}>{ssStats.itemsResolved} resolved</div>}
                {ssStats.disputesInProgress > 0 && <div>{ssStats.disputesInProgress} in progress</div>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Next Best Action — profile.planSuggestions[0] → active dispute → goal static */}
      {(() => {
        const GOAL_NBA: Record<OnboardingGoal, { title: string; detail: string; cta: string; page: PageId; secondary?: string; secondaryPage?: PageId }> = {
          "remove-negatives": { title: "Analyze your report for disputable items", detail: "Dispute IQ scans for FCRA violations and Metro 2 errors, then generates a personalized dispute strategy and certified letters.", cta: "Open Dispute IQ", page: "dispute-iq", secondary: "View My Plan", secondaryPage: "plan" },
          "reduce-debt": { title: "Review your utilization and debt plan", detail: "Debt Navigator shows your live account balances, calculates a payoff strategy, and identifies which accounts to prioritize.", cta: "Open Debt Navigator", page: "debt", secondary: "Review My Scores", secondaryPage: "report" },
          "build-credit": { title: "Pull your 3-bureau credit report", detail: "See your full credit file, identify thin-file gaps, and get personalized guidance on building a strong credit profile from scratch.", cta: "Open Credit Report", page: "report", secondary: "View My Plan", secondaryPage: "plan" },
          "improve-score": { title: "Analyze your report for score-impact issues", detail: "Dispute IQ identifies the reporting errors and derogatory items most likely to be dragging your score down across all three bureaus.", cta: "Open Dispute IQ", page: "dispute-iq", secondary: "Check Scores", secondaryPage: "report" },
        };
        const SUG_CTA: Record<string, { cta: string; page: PageId }> = {
          "dispute": { cta: "Open Dispute IQ", page: "dispute-iq" },
          "charge-off": { cta: "Open Dispute IQ", page: "dispute-iq" },
          "paydown": { cta: "Open Debt Navigator", page: "debt" },
          "inquiry-dispute": { cta: "Open Dispute IQ", page: "dispute-iq" },
          "public-record": { cta: "Open Dispute IQ", page: "dispute-iq" },
        };
        const topSuggestion = (profile?.planSuggestions ?? []).find(s => s.status === "open" || s.status === "in_progress");
        const sugCta = topSuggestion ? (SUG_CTA[topSuggestion.type] ?? { cta: "View My Plan", page: "plan" as PageId }) : null;
        const nba = goal ? GOAL_NBA[goal] : GOAL_NBA["remove-negatives"];
        return (
          <div className="cp-nba-card cp-mb-24">
            <div className="cp-nba-label">
              <span style={{ background: "var(--cp-accent)", width: 7, height: 7, borderRadius: "50%", display: "inline-block", marginRight: 6, animation: "cp-pulse-dot 2s infinite" }} />
              NEXT BEST ACTION
            </div>
            {disputesLoading ? (
              <div style={{ color: "var(--cp-text-muted)", fontSize: 13 }}>Loading your action plan…</div>
            ) : topDispute ? (
              <>
                <div className="cp-nba-title">Dispute in progress: {topDispute.issueTitle}</div>
                <div className="cp-nba-detail">{topDispute.creditor} · {topDispute.bureau} · {topDispute.status === "SENT" ? "Awaiting delivery" : topDispute.status === "FOLLOW_UP_REQUIRED" ? "Follow-up required" : topDispute.status === "DELIVERED" ? "Bureau reviewing" : topDispute.status}</div>
                <div className="cp-nba-footer">
                  <button className="cp-btn cp-btn-primary" onClick={() => onNavigate("dispute-iq")}>Track in Dispute IQ <Icon size={15}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></Icon></button>
                  <button className="cp-btn cp-btn-secondary cp-btn-sm" onClick={() => onNavigate("plan")}>View full plan</button>
                </div>
              </>
            ) : topSuggestion && sugCta ? (
              <>
                <div className="cp-nba-title">{topSuggestion.title}</div>
                <div className="cp-nba-detail">{topSuggestion.detail}</div>
                <div className="cp-nba-footer">
                  <button className="cp-btn cp-btn-primary" onClick={() => onNavigate(sugCta.page)}>
                    {sugCta.cta} <Icon size={15}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></Icon>
                  </button>
                  <button className="cp-btn cp-btn-secondary cp-btn-sm" onClick={() => onNavigate("plan")}>View full plan</button>
                </div>
              </>
            ) : (
              <>
                <div className="cp-nba-title">{nba.title}</div>
                <div className="cp-nba-detail">{nba.detail}</div>
                <div className="cp-nba-footer">
                  <button className="cp-btn cp-btn-primary" onClick={() => onNavigate(nba.page)}>
                    {nba.cta} <Icon size={15}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></Icon>
                  </button>
                  {nba.secondary && nba.secondaryPage && (
                    <button className="cp-btn cp-btn-secondary cp-btn-sm" onClick={() => onNavigate(nba.secondaryPage!)}>{nba.secondary}</button>
                  )}
                </div>
              </>
            )}
          </div>
        );
      })()}

      {/* Biggest score drag — profile.negativeTradelines[0] */}
      {profile && profile.meta.source !== "none" && profile.negativeTradelines.length > 0 && (() => {
        const drag = profile.negativeTradelines[0];
        const lateTotal = (drag.latePayments?.days30 || 0) + (drag.latePayments?.days60 || 0) + (drag.latePayments?.days90 || 0);
        const label = (drag.accountType || "").toLowerCase().includes("collection") ? "Collection" : (drag.status || "").toLowerCase().includes("charge") ? "Charge-off" : lateTotal > 0 ? `${lateTotal} Late Payment${lateTotal !== 1 ? "s" : ""}` : "Derogatory Item";
        return (
          <div className="cp-card cp-mb-24" style={{ borderLeft: "4px solid var(--cp-red)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1 }}>
                <div className="cp-card-eyebrow" style={{ color: "var(--cp-red)" }}>BIGGEST SCORE IMPACT</div>
                <div className="cp-card-title" style={{ margin: "4px 0 6px" }}>{drag.creditor}</div>
                <div style={{ fontSize: 12, color: "var(--cp-text-muted)", display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className="cp-badge negative" style={{ fontSize: 10 }}>{label}</span>
                  {drag.bureau && <span className="cp-badge" style={{ fontSize: 10 }}>{drag.bureau}</span>}
                  {drag.violations.length > 0 && <span className="cp-badge warning" style={{ fontSize: 10 }}>{drag.violations.length} violation{drag.violations.length !== 1 ? "s" : ""}</span>}
                </div>
                <p style={{ fontSize: 12, color: "var(--cp-text-secondary)", marginTop: 6, marginBottom: 0, lineHeight: 1.5 }}>
                  {drag.violations.length > 0 ? drag.violations[0].label : "This derogatory item is impacting your score. Filing a dispute may have it removed or corrected."}
                </p>
              </div>
              <button className="cp-btn cp-btn-primary cp-btn-sm" style={{ flexShrink: 0 }} onClick={() => onNavigate("dispute-iq")}>
                Dispute It →
              </button>
            </div>
          </div>
        );
      })()}

      {/* Utilization callout — shown when profile data reveals > 30% utilization */}
      {utilizationPct !== null && utilizationPct > 30 && (
        <div className="cp-card cp-mb-24" style={{ borderLeft: "4px solid var(--cp-amber)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <div className="cp-card-eyebrow">CREDIT UTILIZATION ALERT</div>
              <div className="cp-card-title" style={{ margin: "4px 0 6px", color: "var(--cp-amber)" }}>
                {utilizationPct}% utilization — above the 30% threshold
              </div>
              <p style={{ fontSize: 13, color: "var(--cp-text-secondary)", lineHeight: 1.6, margin: 0 }}>
                High utilization can drag your score by 30–50 points. Paying down revolving balances is often the fastest score boost available.
              </p>
            </div>
            <button className="cp-btn cp-btn-secondary cp-btn-sm" style={{ flexShrink: 0 }} onClick={() => onNavigate("debt")}>
              View Debt Navigator →
            </button>
          </div>
        </div>
      )}

      {/* Priority Actions — top 3 from real dispute data */}
      {!disputesLoading && (activeDisputes.length > 0 || profileActiveDisputes.length > 0) && (
        <div className="cp-card cp-mb-24">
          <div className="cp-card-header" style={{ marginBottom: 14 }}>
            <div>
              <div className="cp-card-eyebrow">REQUIRES YOUR ATTENTION</div>
              <div className="cp-card-title" style={{ marginTop: 2 }}>Priority Actions</div>
            </div>
            <span className="cp-badge warning">{activeDisputes.length} active</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {activeDisputes.slice(0, 3).map((d, i) => {
              const isFollowUp = d.status === "FOLLOW_UP_REQUIRED";
              const dotColor = isFollowUp ? "var(--cp-clay)" : d.status === "DELIVERED" ? "var(--cp-sage)" : "var(--cp-accent)";
              const label = isFollowUp ? "Follow-up required" : d.status === "DELIVERED" ? "Bureau reviewing" : d.status === "SENT" ? "Awaiting delivery" : d.status;
              return (
                <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--cp-bg)", borderRadius: 10, padding: "11px 13px", cursor: "pointer", borderLeft: `3px solid ${dotColor}` }} onClick={() => onNavigate("dispute-iq")}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cp-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.issueTitle}</div>
                    <div style={{ fontSize: 11.5, color: "var(--cp-text-muted)", marginTop: 2 }}>{d.creditor} · {d.bureau}</div>
                  </div>
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: dotColor, background: `${dotColor}18`, padding: "2px 9px", borderRadius: 20, flexShrink: 0, whiteSpace: "nowrap" }}>{label}</span>
                </div>
              );
            })}
          </div>
          {activeDisputes.length > 3 && (
            <button className="cp-btn cp-btn-secondary cp-btn-sm" style={{ marginTop: 12 }} onClick={() => onNavigate("dispute-iq")}>
              View all {activeDisputes.length} disputes →
            </button>
          )}
        </div>
      )}

      {/* Active disputes + Recommended tools */}
      <div className="cp-grid-2 cp-mb-24">
        <div className="cp-card">
          <div className="cp-card-header">
            <div>
              <div className="cp-card-title">Active Disputes</div>
              <div className="cp-card-subtitle">Ranked by priority</div>
            </div>
            {activeDisputes.length > 0 && <span className="cp-badge warning">{activeDisputes.length} active</span>}
          </div>
          {disputesLoading ? (
            <div style={{ padding: "24px 0", textAlign: "center" }}><div className="cp-array-spinner" style={{ margin: "0 auto" }} /></div>
          ) : activeDisputes.length === 0 ? (
            <div className="cp-empty-state" style={{ padding: "28px 12px" }}>
              <div className="cp-empty-title" style={{ fontSize: 13 }}>No active disputes yet</div>
              <div className="cp-empty-desc" style={{ fontSize: 12 }}>Open Dispute IQ to analyze your report and file your first dispute.</div>
              <button className="cp-btn cp-btn-primary cp-btn-sm" style={{ marginTop: 14 }} onClick={() => onNavigate("dispute-iq")}>Open Dispute IQ</button>
            </div>
          ) : (
            <>
              {activeDisputes.slice(0, 5).map((d, i) => (
                <div key={d.id} className="cp-action-row" style={{ cursor: "pointer" }} onClick={() => onNavigate("dispute-iq")}>
                  <div className="cp-action-rank">{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="cp-action-label">{d.issueTitle}</div>
                    <div className="cp-action-detail">{d.creditor} · {d.bureau}</div>
                  </div>
                  <span className={`cp-pill ${
                    d.status === "FOLLOW_UP_REQUIRED" ? "warning" :
                    d.status === "RESOLVED" ? "resolved" :
                    d.status === "REJECTED" ? "negative" : "pending"
                  }`} style={{ flexShrink: 0, fontSize: 10 }}>
                    {d.status === "PENDING" ? "Letter Ready" : d.status === "SENT" ? "Sent" : d.status === "DELIVERED" ? "Delivered" : d.status === "FOLLOW_UP_REQUIRED" ? "Follow-up" : d.status}
                  </span>
                </div>
              ))}
              <div style={{ marginTop: 14 }}>
                <button className="cp-btn cp-btn-secondary cp-btn-sm" onClick={() => onNavigate("dispute-iq")}>View all in Dispute IQ →</button>
              </div>
            </>
          )}
        </div>

        <div className="cp-card">
          <div className="cp-card-header">
            <div>
              <div className="cp-card-title">Recommended Tools</div>
              <div className="cp-card-subtitle">Goal-based routing for your plan</div>
            </div>
          </div>
          {([
            { label: "Dispute IQ", detail: "Fix FCRA violations & Metro 2 errors", page: "dispute-iq" as PageId },
            { label: "Debt Navigator", detail: "Reduce utilization and build payoff strategy", page: "debt" as PageId },
            { label: "Subscription Manager", detail: "Find monthly savings to fund your payoff strategy", page: "subscriptions" as PageId },
            { label: "Protection Center", detail: "Guard identity and monitor for fraud alerts", page: "protection" as PageId },
            { label: "Credit Report", detail: "Review 3-bureau scores, alerts & simulator", page: "report" as PageId },
            { label: "Progress", detail: "Track your score history and repair milestones", page: "progress" as PageId },
            { label: "My Plan", detail: "See your personalized action list and timeline", page: "plan" as PageId },
          ] as { label: string; detail: string; page: PageId }[]).map((a, i) => (
            <div key={i} className="cp-action-row" style={{ cursor: "pointer" }} onClick={() => onNavigate(a.page)}>
              <div className="cp-action-rank">{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="cp-action-label">{a.label}</div>
                <div className="cp-action-detail">{a.detail}</div>
              </div>
              <Icon size={12}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></Icon>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── MY PLAN PAGE ────────────────────────────────────────────────── */
const PRIORITY_COLORS: Record<string, string> = {
  high: "var(--cp-red)",
  medium: "var(--cp-amber)",
  low: "var(--cp-teal)",
};
const PRIORITY_LABELS: Record<string, string> = {
  high: "High Priority",
  medium: "Medium",
  low: "Low",
};
const TYPE_LABELS: Record<string, string> = {
  dispute: "Dispute",
  "charge-off": "Charge-Off",
  paydown: "Pay Down",
  "inquiry-dispute": "Inquiry",
  "public-record": "Public Record",
};

function SuggestionCard({ s, onNavigate }: { s: PlanSuggestion; onNavigate: (p: PageId) => void }) {
  const color = PRIORITY_COLORS[s.priority] ?? "var(--cp-accent)";
  return (
    <div className="cp-plan-action-card" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="cp-plan-action-header">
        <div style={{ display: "flex", alignItems: "center", gap: 7, flex: 1, flexWrap: "wrap" }}>
          <span className="cp-plan-category">{TYPE_LABELS[s.type] ?? s.type}</span>
          {s.bureau && <span className="cp-plan-bureau">{s.bureau}</span>}
          <span style={{ fontSize: 10.5, fontWeight: 700, color, background: `${color}15`, padding: "1px 8px", borderRadius: 10 }}>
            {PRIORITY_LABELS[s.priority]}
          </span>
        </div>
      </div>
      <div className="cp-plan-action-title">{s.title}</div>
      <div className="cp-plan-action-detail">{s.detail}</div>
      <div style={{ marginTop: 14 }}>
        <button className="cp-btn cp-btn-primary cp-btn-sm" onClick={() => onNavigate("dispute-iq")}>
          Open Dispute IQ
          <Icon size={13}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></Icon>
        </button>
      </div>
    </div>
  );
}

function PlanPage({ goal, timeline, onNavigate }: { goal: OnboardingGoal | null; timeline: OnboardingTimeline | null; onNavigate: (page: PageId) => void }) {
  const { data: profile, isLoading } = useScoreShiftProfile();

  const goalLabel = goal ? GOALS.find(g => g.id === goal)?.label : null;
  const timelineLabel = timeline ? TIMELINES.find(t => t.id === timeline)?.label : null;

  const PLAN_ACTIVE = ["PENDING", "SENT", "DELIVERED", "FOLLOW_UP_REQUIRED"];
  const PLAN_RESOLVED = ["RESOLVED", "REJECTED"];
  const openSuggestions = (profile?.planSuggestions ?? []).filter(s => s.status === "open");
  const inProgressSuggestions = (profile?.planSuggestions ?? []).filter(s => s.status === "in_progress");
  const activeDisputes: ProfileDispute[] = (profile?.disputes ?? []).filter(d => PLAN_ACTIVE.includes(d.status));
  const resolvedDisputes: ProfileDispute[] = (profile?.disputes ?? []).filter(d => PLAN_RESOLVED.includes(d.status));
  const totalActions = openSuggestions.length + inProgressSuggestions.length;

  return (
    <div>
      <div className="cp-page-header">
        <div>
          <span className="cp-page-eyebrow">Personalized Strategy</span>
          <h1 className="cp-page-title">My Action Plan</h1>
          <p className="cp-page-subtitle">
            {goalLabel ? `Goal: ${goalLabel}${timelineLabel ? ` · ${timelineLabel}` : ""}` : "Your prioritized credit repair action list."}
          </p>
        </div>
        {totalActions > 0 && <span className="cp-badge warning">{totalActions} action{totalActions !== 1 ? "s" : ""}</span>}
      </div>

      {isLoading ? (
        <div className="cp-card" style={{ padding: "48px 20px", textAlign: "center" }}>
          <div className="cp-array-spinner" style={{ margin: "0 auto 12px" }} />
          <div style={{ fontSize: 13, color: "var(--cp-text-muted)" }}>Loading your plan…</div>
        </div>
      ) : profile?.meta?.source === "none" ? (
        <div className="cp-card cp-mb-24">
          <div className="cp-empty-state">
            <div className="cp-empty-icon">
              <Icon size={22}><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></Icon>
            </div>
            <div className="cp-empty-title">No credit data yet</div>
            <div className="cp-empty-desc">Open Dispute IQ to pull your credit report, identify disputable items, and generate your first dispute letters. Your plan will build automatically.</div>
            <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="cp-btn cp-btn-primary" onClick={() => onNavigate("dispute-iq")}>
                Open Dispute IQ
                <Icon size={14}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></Icon>
              </button>
              <button className="cp-btn cp-btn-secondary" onClick={() => onNavigate("report")}>Review My Scores</button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* ── Credit Readiness Snapshot ─────────────────────────── */}
          {(() => {
            const sc = profile?.scores;
            const hasAnyScore = sc && (sc.transunion !== null || sc.equifax !== null || sc.experian !== null || sc.vantage !== null);
            const topSug = (profile?.planSuggestions ?? []).find(s => s.status === "open" || s.status === "in_progress");
            const SUG_CTA: Record<string, { cta: string; page: PageId }> = {
              "dispute": { cta: "Open Dispute IQ", page: "dispute-iq" },
              "charge-off": { cta: "Open Dispute IQ", page: "dispute-iq" },
              "paydown": { cta: "Open Debt Navigator", page: "debt" },
              "inquiry-dispute": { cta: "Open Dispute IQ", page: "dispute-iq" },
              "public-record": { cta: "Open Dispute IQ", page: "dispute-iq" },
            };
            const sugCta = topSug ? (SUG_CTA[topSug.type] ?? { cta: "View Full Plan", page: "plan" as PageId }) : null;
            const projGain = topSug ? (profile?.scoreSimulator?.projectedGains?.[0]?.estimatedPts ?? null) : null;
            return (
              <div className="cp-card cp-mb-24" style={{ borderTop: "3px solid var(--cp-accent)" }}>
                <div className="cp-card-header" style={{ marginBottom: 14 }}>
                  <div>
                    <div className="cp-card-eyebrow">CREDIT READINESS SNAPSHOT</div>
                    <div className="cp-card-title" style={{ marginTop: 4 }}>
                      {goalLabel ? `Goal: ${goalLabel}` : "Your Credit Overview"}
                    </div>
                    {timelineLabel && (
                      <div style={{ fontSize: 12, color: "var(--cp-text-muted)", marginTop: 2 }}>Timeline: {timelineLabel}</div>
                    )}
                  </div>
                  <span className="cp-badge" style={{ background: "var(--cp-accent)15", color: "var(--cp-accent)", border: "1px solid var(--cp-accent)30" }}>
                    {profile?.meta?.isLive ? "Live" : profile?.meta?.source === "array_cache" ? "Cached" : "From File"}
                  </span>
                </div>

                {hasAnyScore ? (
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                    {[
                      { label: "TransUnion", key: "transunion" as const },
                      { label: "Equifax", key: "equifax" as const },
                      { label: "Experian", key: "experian" as const },
                    ].map(({ label, key }) => (
                      sc?.[key] !== null && sc?.[key] !== undefined ? (
                        <div key={key} style={{ flex: 1, minWidth: 80, padding: "10px 12px", background: "var(--cp-bg)", borderRadius: 10, textAlign: "center" }}>
                          <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--cp-accent)", letterSpacing: -1 }}><CountUp to={sc[key] ?? null} animKey={`plan-score-${key}`} /></div>
                          <div style={{ fontSize: 10.5, color: "var(--cp-text-muted)", marginTop: 2, fontWeight: 600 }}>{label}</div>
                          <div style={{ fontSize: 9.5, color: "var(--cp-text-muted)", opacity: 0.7 }}>VantageScore 3.0</div>
                        </div>
                      ) : null
                    ))}
                    {sc?.vantage !== null && sc?.vantage !== undefined && !sc?.transunion && !sc?.equifax && !sc?.experian && (
                      <div style={{ flex: 1, minWidth: 80, padding: "10px 12px", background: "var(--cp-bg)", borderRadius: 10, textAlign: "center" }}>
                        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--cp-accent)", letterSpacing: -1 }}><CountUp to={sc.vantage ?? null} animKey="plan-score-vantage" /></div>
                        <div style={{ fontSize: 10.5, color: "var(--cp-text-muted)", marginTop: 2, fontWeight: 600 }}>VantageScore</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: "10px 0", marginBottom: 16, fontSize: 12.5, color: "var(--cp-text-muted)" }}>
                    Score data loading — connect Array for live 3-bureau scores.
                  </div>
                )}

                {topSug && sugCta && (
                  <div style={{ padding: "12px 14px", background: "var(--cp-bg)", borderRadius: 10, marginBottom: 14 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", color: "var(--cp-text-muted)", textTransform: "uppercase", marginBottom: 6 }}>Next Best Action</div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--cp-text-primary)", marginBottom: 4 }}>{topSug.title}</div>
                    <div style={{ fontSize: 12, color: "var(--cp-text-secondary)", lineHeight: 1.55, marginBottom: 10 }}>
                      {topSug.detail}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <button className="cp-btn cp-btn-primary cp-btn-sm" onClick={() => onNavigate(sugCta.page)}>
                        {sugCta.cta} →
                      </button>
                      {projGain !== null && (
                        <span className="cp-badge success" style={{ fontSize: 10 }}>Est. +{projGain} pts</span>
                      )}
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="cp-btn cp-btn-secondary cp-btn-sm" onClick={() => onNavigate("report")}>
                    Review Full Credit Report
                  </button>
                  <button className="cp-btn cp-btn-secondary cp-btn-sm" onClick={() => onNavigate("dispute-iq")}>
                    Open Dispute IQ
                  </button>
                </div>
              </div>
            );
          })()}

          {/* ── Act Now ──────────────────────────────────────────── */}
          {openSuggestions.length > 0 && (
            <div className="cp-mb-24">
              <div className="cp-plan-section-header cp-mb-18">
                <div style={{ width: 4, height: 18, borderRadius: 2, background: "var(--cp-red)", flexShrink: 0 }} />
                <span className="cp-plan-section-title" style={{ color: "var(--cp-red)" }}>Act Now</span>
                <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: "rgba(239,68,68,0.1)", color: "var(--cp-red)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  {openSuggestions.length} item{openSuggestions.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {openSuggestions.map(s => <SuggestionCard key={s.id} s={s} onNavigate={onNavigate} />)}
              </div>
            </div>
          )}

          {/* ── In Progress ──────────────────────────────────────── */}
          {(inProgressSuggestions.length > 0 || activeDisputes.length > 0) && (
            <div className="cp-mb-24">
              <div className="cp-plan-section-header cp-mb-18">
                <div style={{ width: 4, height: 18, borderRadius: 2, background: "var(--cp-amber)", flexShrink: 0 }} />
                <span className="cp-plan-section-title" style={{ color: "var(--cp-amber)" }}>In Progress</span>
                <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: "rgba(245,158,11,0.1)", color: "var(--cp-amber)", border: "1px solid rgba(245,158,11,0.2)" }}>
                  {inProgressSuggestions.length + activeDisputes.length} active
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {inProgressSuggestions.map(s => <SuggestionCard key={s.id} s={s} onNavigate={onNavigate} />)}
                {activeDisputes.map(d => (
                  <div key={d.id} className="cp-plan-action-card" style={{ borderLeft: "4px solid var(--cp-amber)" }}>
                    <div className="cp-plan-action-header">
                      <div style={{ display: "flex", alignItems: "center", gap: 7, flex: 1, flexWrap: "wrap" }}>
                        <span className="cp-plan-category">Dispute</span>
                        <span className="cp-plan-bureau">{d.bureau}</span>
                      </div>
                      <span className={`cp-pill ${
                        d.status === "PENDING" || d.status === "SENT" ? "pending" :
                        d.status === "DELIVERED" ? "active" :
                        d.status === "FOLLOW_UP_REQUIRED" ? "warning" : "pending"
                      }`}>
                        {d.status === "PENDING" ? "Letter Ready" : d.status === "SENT" ? "Awaiting Delivery" : d.status === "DELIVERED" ? "Bureau Reviewing" : d.status === "FOLLOW_UP_REQUIRED" ? "Follow-up Required" : d.status}
                      </span>
                    </div>
                    <div className="cp-plan-action-title">{(d as any).issueTitle || "Dispute"}</div>
                    <div className="cp-plan-action-detail">{(d as any).creditor} · {d.bureau} · Sent {fmtDate(d.dateSent)}</div>
                    <div style={{ marginTop: 14 }}>
                      <button className="cp-btn cp-btn-primary cp-btn-sm" onClick={() => onNavigate("dispute-iq")}>
                        Track in Dispute IQ
                        <Icon size={13}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></Icon>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Completed ────────────────────────────────────────── */}
          {resolvedDisputes.length > 0 && (
            <div className="cp-mb-24">
              <div className="cp-plan-section-header cp-mb-18">
                <div style={{ width: 4, height: 18, borderRadius: 2, background: "var(--cp-green)", flexShrink: 0 }} />
                <span className="cp-plan-section-title" style={{ color: "var(--cp-green)" }}>Completed</span>
                <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: "rgba(34,197,94,0.1)", color: "var(--cp-green)", border: "1px solid rgba(34,197,94,0.2)" }}>
                  {resolvedDisputes.length} resolved
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {resolvedDisputes.map(d => (
                  <div key={d.id} className="cp-plan-action-card" style={{ borderLeft: "4px solid var(--cp-green)", opacity: 0.85 }}>
                    <div className="cp-plan-action-header">
                      <div style={{ display: "flex", alignItems: "center", gap: 7, flex: 1, flexWrap: "wrap" }}>
                        <span className="cp-plan-category">Dispute</span>
                        <span className="cp-plan-bureau">{d.bureau}</span>
                      </div>
                      <span className={`cp-pill ${d.status === "RESOLVED" ? "resolved" : "negative"}`}>
                        {d.status === "RESOLVED" ? "Resolved" : "Rejected"}
                      </span>
                    </div>
                    <div className="cp-plan-action-title">{(d as any).issueTitle || "Dispute"}</div>
                    <div className="cp-plan-action-detail">{(d as any).creditor} · {d.bureau}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Recommended tools (always shown at bottom) ──────────── */}
      <div className="cp-plan-section-header cp-mb-18" style={{ marginTop: (totalActions > 0 || activeDisputes.length > 0) ? 28 : 0 }}>
        <div style={{ width: 4, height: 18, borderRadius: 2, background: "var(--cp-accent)", flexShrink: 0 }} />
        <span className="cp-plan-section-title" style={{ color: "var(--cp-accent)" }}>Recommended Next Steps</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          { title: "Review your full 3-bureau report", detail: "Check for new items, inquiries, and bureau reporting differences.", tool: "Credit Report", page: "report" as PageId, color: "var(--cp-accent)" },
          { title: "Analyze debt and utilization", detail: "High utilization is one of the biggest score drags. Review your current levels.", tool: "Debt Navigator", page: "debt" as PageId, color: "var(--cp-amber)" },
          { title: "Monitor for new alerts", detail: "Check credit alerts and identity protection for any new bureau activity.", tool: "Protection Center", page: "protection" as PageId, color: "var(--cp-teal)" },
        ].map((a, i) => (
          <div key={i} className="cp-plan-action-card" style={{ borderLeft: `4px solid ${a.color}` }}>
            <div className="cp-plan-action-header">
              <span style={{ fontSize: 10.5, fontWeight: 700, color: a.color, background: `${a.color}15`, padding: "1px 8px", borderRadius: 10 }}>{a.tool}</span>
            </div>
            <div className="cp-plan-action-title">{a.title}</div>
            <div className="cp-plan-action-detail">{a.detail}</div>
            <div style={{ marginTop: 14 }}>
              <button className="cp-btn cp-btn-secondary cp-btn-sm" onClick={() => onNavigate(a.page)}>
                Open {a.tool}
                <Icon size={13}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></Icon>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── DISPUTE IQ PAGE ─────────────────────────────────────────────── */
type EnrichedDispute = {
  id: number; bureau: string; status: string; dateSent: string;
  expectedResponse: string; actualResponse: string | null;
  creditor: string; issueType: string; issueTitle: string; outcome: string | null;
};

function fmtDate(val: string | null | undefined): string {
  if (!val) return "—";
  const d = new Date(val);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Local DisputeIQPage removed — using RealDisputeIQPage from dispute-iq.tsx instead.
// EnrichedDispute type and fmtDate helper above are used by PlanPage/ProgressPage.

// (placeholder removed — real DisputeIQ lives in dispute-iq.tsx)

/* ── DEBT NAVIGATOR PAGE ─────────────────────────────────────────── */
/* ── SUBSCRIPTION MANAGER ────────────────────────────────────────── */
function SubscriptionManagerPage({
  goal,
  isManaged,
  onNavigate,
  onSavingsApply,
  appKey, userToken, sbx, scriptReady, tokenReady, tokenError,
}: {
  goal: OnboardingGoal | null;
  isManaged: boolean;
  onNavigate: (page: PageId) => void;
  onSavingsApply: (amount: number) => void;
} & ArrayPageProps) {
  const insightText = isManaged
    ? "While our team works on your file, reducing unnecessary subscriptions may help you move faster toward your credit goal."
    : goal === "reduce-debt" || goal === "improve-score"
    ? "Redirecting monthly subscription spend toward revolving balances could help improve your utilization and accelerate your ScoreShift Plan."
    : goal === "build-credit"
    ? "Reducing recurring expenses can free up cash for payoff strategies that support your ScoreShift credit-building plan."
    : "Freeing up recurring monthly spend can accelerate your financial readiness and support your credit repair progress.";

  return (
    <div>
      <div className="cp-page-header">
        <div>
          <span className="cp-page-eyebrow">Financial Optimization</span>
          <h1 className="cp-page-title">Subscription Manager</h1>
          <p className="cp-page-subtitle">Find recurring expenses that may be slowing down your financial progress.</p>
        </div>
        <span className="cp-badge live">Live</span>
      </div>

      {/* ScoreShift Insight card */}
      <div className="cp-card cp-mb-24" style={{ borderLeft: "4px solid var(--cp-sage)" }}>
        <div className="cp-card-eyebrow" style={{ color: "var(--cp-sage)" }}>SCORESHIFT INSIGHT</div>
        <div className="cp-card-title" style={{ margin: "6px 0 8px", fontSize: 14 }}>How subscriptions connect to your goal</div>
        <p style={{ fontSize: 13, color: "var(--cp-text-secondary)", lineHeight: 1.65, margin: "0 0 16px" }}>{insightText}</p>
        <button className="cp-btn cp-btn-primary cp-btn-sm" onClick={() => { onSavingsApply(0); onNavigate("debt"); }}>
          Go to Debt Navigator →
        </button>
      </div>

      {/* Array Subscription Manager component */}
      <ArrayWrapper
        title="Subscription Manager"
        sub="Your recurring subscriptions identified from your credit profile"
        badge={<span className="cp-badge live">Live</span>}
        loading={!scriptReady || (!tokenReady && !tokenError)}
        locked={false}
      >
        {tokenError ? (
          <div className="cp-empty-state" style={{ padding: "32px 20px" }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>💳</div>
            <div className="cp-empty-title">Subscription data is not connected yet</div>
            <div className="cp-empty-desc" style={{ maxWidth: 340, margin: "6px auto 16px" }}>
              Connect your credit profile to unlock subscription tracking and optimization.
            </div>
            <button className="cp-btn cp-btn-secondary cp-btn-sm" onClick={() => onNavigate("report")}>
              Connect Credit Profile
            </button>
          </div>
        ) : (
          <array-subscription-manager appKey={appKey} userToken={userToken} {...sbx} />
        )}
      </ArrayWrapper>
    </div>
  );
}

/* ── STUDENT LOAN AID PAGE ────────────────────────────────────────── */
function StudentLoanPage({ appKey, userToken, sbx, scriptReady, tokenReady, tokenError, onNavigate }: ArrayPageProps & { onNavigate: (page: PageId) => void }) {
  const [subTab, setSubTab] = useState("navigator");

  return (
    <div>
      <div className="cp-page-header">
        <div>
          <span className="cp-page-eyebrow">Student Loan Tools</span>
          <h1 className="cp-page-title">Student Loan Aid</h1>
          <p className="cp-page-subtitle">Understand your student loan options, repayment paths, and potential aid opportunities.</p>
        </div>
        <span className="cp-badge live">Live</span>
      </div>

      <SubTabs
        tabs={[
          { id: "navigator", label: "Student Loan Navigator" },
          { id: "aid", label: "Student Loan Aid" },
        ]}
        active={subTab}
        onChange={setSubTab}
      />

      {subTab === "navigator" && (
        <ArrayWrapper
          title="Student Loan Navigator"
          sub="Explore your repayment options, income-driven plans, and forgiveness programs"
          badge={<span className="cp-badge live">Live</span>}
          loading={!scriptReady || (!tokenReady && !tokenError)}
          locked={false}
        >
          {tokenError ? (
            <div className="cp-empty-state" style={{ padding: "40px 20px" }}>
              <div style={{ fontSize: 32, marginBottom: 14 }}>🎓</div>
              <div className="cp-empty-title">Student loan tools are not connected yet</div>
              <div className="cp-empty-desc" style={{ maxWidth: 360, margin: "6px auto 16px" }}>
                Connect your credit profile to unlock loan navigation and aid options.
              </div>
              <button className="cp-btn cp-btn-secondary cp-btn-sm" onClick={() => onNavigate("report")}>
                Review My Credit Report
              </button>
            </div>
          ) : (
            <ArrayErrorBoundary fallback={
              <div className="cp-empty-state" style={{ padding: "48px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 14 }}>🎓</div>
                <div className="cp-empty-title" style={{ marginBottom: 8 }}>Student Loan Navigator</div>
                <div className="cp-empty-desc" style={{ maxWidth: 380, margin: "0 auto 20px" }}>
                  This feature is being activated for your account. Please check back shortly or contact your credit advisor to enable student loan tools.
                </div>
                <button className="cp-btn cp-btn-primary cp-btn-sm" onClick={() => onNavigate("report")}>
                  View My Credit Report
                </button>
              </div>
            }>
              <array-student-loan-navigator appKey={STUDENT_LOAN_APP_KEY} userToken={STUDENT_LOAN_TOKEN} apiUrl="https://mock.array.io" sandbox="true" autolaunch="true" />
            </ArrayErrorBoundary>
          )}
        </ArrayWrapper>
      )}

      {subTab === "aid" && (
        <ArrayWrapper
          title="Student Loan Aid"
          sub="Discover aid opportunities, grants, and loan forgiveness programs you may qualify for"
          badge={<span className="cp-badge live">Live</span>}
          loading={!scriptReady || (!tokenReady && !tokenError)}
          locked={false}
        >
          {tokenError ? (
            <div className="cp-empty-state" style={{ padding: "40px 20px" }}>
              <div style={{ fontSize: 32, marginBottom: 14 }}>💰</div>
              <div className="cp-empty-title">Student loan tools are not connected yet</div>
              <div className="cp-empty-desc" style={{ maxWidth: 360, margin: "6px auto 16px" }}>
                Connect your credit profile to unlock loan navigation and aid options.
              </div>
              <button className="cp-btn cp-btn-secondary cp-btn-sm" onClick={() => onNavigate("report")}>
                Review My Credit Report
              </button>
            </div>
          ) : (
            <array-student-loan-navigator appKey={STUDENT_LOAN_APP_KEY} userToken={STUDENT_LOAN_TOKEN} apiUrl="https://mock.array.io" sandbox="true" autolaunch="true" />
          )}
        </ArrayWrapper>
      )}
    </div>
  );
}

function DebtPage({ appKey, userToken, sbx, scriptReady, tokenReady, tokenError, suggestedSavings, onDismissSavings }: ArrayPageProps & { suggestedSavings?: number | null; onDismissSavings?: () => void }) {
  const [subTab, setSubTab] = useState("analysis");
  const { data: profile } = useScoreShiftProfile();
  const utilization = profile?.utilization;
  const showUtilPanel = utilization && (utilization.overallPercent !== null || utilization.byAccount.length > 0);

  return (
    <div>
      <div className="cp-page-header">
        <div>
          <span className="cp-page-eyebrow">Debt Intelligence</span>
          <h1 className="cp-page-title">Debt Navigator</h1>
          <p className="cp-page-subtitle">Live debt analysis, utilization breakdown, and personalized payoff strategies — powered by your real credit data.</p>
        </div>
        <span className="cp-badge live">Live</span>
      </div>

      {/* Profile-derived utilization summary */}
      {showUtilPanel && profile?.meta?.source !== "none" && (
        <div className="cp-card cp-mb-24">
          <div className="cp-card-header" style={{ marginBottom: 14 }}>
            <div>
              <div className="cp-card-eyebrow">FROM YOUR CREDIT PROFILE</div>
              <div className="cp-card-title" style={{ marginTop: 2 }}>Utilization Snapshot</div>
            </div>
            {utilization.overallPercent !== null && (
              <span className={`cp-badge ${utilization.overallPercent > 50 ? "negative" : utilization.overallPercent > 30 ? "warning" : "success"}`}>
                {utilization.overallPercent}% overall
              </span>
            )}
          </div>
          {utilization.byAccount.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {utilization.byAccount.slice(0, 5).map((acct, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--cp-text-primary)" }}>{acct.creditor}</div>
                    <div style={{ fontSize: 11, color: "var(--cp-text-muted)" }}>${acct.balance.toLocaleString()} of ${acct.limit.toLocaleString()} limit</div>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: "right" }}>
                    <div style={{ height: 4, width: 80, background: "var(--cp-border)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.min(acct.utilizationPct, 100)}%`, background: acct.utilizationPct > 50 ? "var(--cp-red)" : acct.utilizationPct > 30 ? "var(--cp-amber)" : "var(--cp-sage)", borderRadius: 2 }} />
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: acct.utilizationPct > 50 ? "var(--cp-red)" : acct.utilizationPct > 30 ? "var(--cp-amber)" : "var(--cp-sage)", marginTop: 2 }}>{acct.utilizationPct}%</div>
                  </div>
                </div>
              ))}
              {utilization.overallPercent !== null && utilization.overallPercent > 30 && (
                <div style={{ marginTop: 8, padding: "10px 12px", background: "rgba(245,158,11,0.08)", borderRadius: 8, fontSize: 12, color: "var(--cp-amber)" }}>
                  Reducing to 30% could add an estimated <strong>+{Math.round((utilization.overallPercent - 30) * 0.8)} pts</strong> to your score.
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: 12.5, color: "var(--cp-text-muted)" }}>Overall utilization: <strong>{utilization.overallPercent}%</strong> — no revolving account detail available.</div>
          )}
        </div>
      )}

      {suggestedSavings != null && suggestedSavings > 0 && (
        <div style={{ marginBottom: 20, padding: "14px 18px", borderRadius: 12, background: "var(--cp-sage)15", border: "1px solid var(--cp-sage)35", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>💰</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--cp-text-primary)" }}>
                Apply <span style={{ color: "var(--cp-sage)" }}>${suggestedSavings}/month</span> toward your highest-impact balance?
              </div>
              <div style={{ fontSize: 11.5, color: "var(--cp-text-muted)" }}>Redirected from Subscription Manager savings</div>
            </div>
          </div>
          <button className="cp-btn cp-btn-secondary cp-btn-sm" onClick={onDismissSavings} style={{ flexShrink: 0 }}>Dismiss</button>
        </div>
      )}

      <SubTabs
        tabs={[
          { id: "analysis", label: "Debt Analysis" },
          { id: "navigator", label: "Payoff Planner" },
        ]}
        active={subTab}
        onChange={setSubTab}
      />

      {subTab === "analysis" && (
        <ArrayWrapper title="Debt & Utilization Breakdown" sub="Live account balances, utilization rates, and interest analysis" badge={<span className="cp-badge live">Live</span>} loading={!scriptReady || (!tokenReady && !tokenError)} locked={tokenError}>
          <array-credit-debt-analysis appKey={appKey} userToken={userToken} {...sbx} />
        </ArrayWrapper>
      )}

      {subTab === "navigator" && (
        <ArrayWrapper title="Debt Payoff Planner" sub="Avalanche, snowball, and custom payoff strategies — based on your real balances" loading={!scriptReady || (!tokenReady && !tokenError)} locked={tokenError}>
          <array-debt-navigator appKey={appKey} userToken={userToken} {...sbx} />
        </ArrayWrapper>
      )}
    </div>
  );
}

/* ── PROTECTION CENTER ───────────────────────────────────────────── */
function ProtectionPage({ appKey, userToken, sbx, scriptReady, tokenReady, tokenError }: ArrayPageProps) {
  const [subTab, setSubTab] = useState("alerts");
  const { data: profile } = useScoreShiftProfile();
  const sixMonthsAgo = Date.now() - 6 * 30 * 24 * 60 * 60 * 1000;
  const recentHardInquiries = (profile?.inquiries ?? []).filter(inq => (inq.inquiryType || "").toLowerCase() === "hard" && inq.inquiryDate && new Date(inq.inquiryDate).getTime() > sixMonthsAgo);
  const publicRecords = profile?.publicRecords ?? [];
  // Profile alerts excluding types already shown above (inquiries, public records)
  const extraAlerts = (profile?.alerts ?? []).filter(a => a.type !== "public_record" && a.type !== "hard_inquiry");
  const hasProfileAlerts = (profile?.meta?.source !== "none") && (recentHardInquiries.length > 0 || publicRecords.length > 0 || extraAlerts.length > 0);

  return (
    <div>
      <div className="cp-page-header">
        <div>
          <span className="cp-page-eyebrow">Identity & Privacy</span>
          <h1 className="cp-page-title">Protection Center</h1>
          <p className="cp-page-subtitle">Identity monitoring, credit alerts, and privacy protection — all in one place.</p>
        </div>
        <span className="cp-badge live">Monitoring Active</span>
      </div>

      {/* Profile-derived risk panel */}
      {hasProfileAlerts && (
        <div className="cp-card cp-mb-24" style={{ borderLeft: "4px solid var(--cp-red)" }}>
          <div className="cp-card-header" style={{ marginBottom: 14 }}>
            <div>
              <div className="cp-card-eyebrow">FROM YOUR CREDIT PROFILE</div>
              <div className="cp-card-title" style={{ marginTop: 2 }}>Detected Risk Items</div>
            </div>
            <span className="cp-badge negative">{recentHardInquiries.length + publicRecords.length} item{(recentHardInquiries.length + publicRecords.length) !== 1 ? "s" : ""}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recentHardInquiries.map((inq, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", background: "var(--cp-bg)", borderRadius: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--cp-amber)", flexShrink: 0, marginTop: 5 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--cp-text-primary)" }}>Hard Inquiry: {inq.creditor}</div>
                  <div style={{ fontSize: 11, color: "var(--cp-text-muted)", marginTop: 2 }}>
                    {inq.inquiryDate ? new Date(inq.inquiryDate).toLocaleDateString() : "Recent"} · Impacts score for 12 months
                  </div>
                </div>
                <span className="cp-badge warning" style={{ flexShrink: 0, fontSize: 10 }}>Hard Pull</span>
              </div>
            ))}
            {publicRecords.map((pr, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", background: "var(--cp-bg)", borderRadius: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--cp-red)", flexShrink: 0, marginTop: 5 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--cp-text-primary)" }}>Public Record: {pr.creditor}</div>
                  <div style={{ fontSize: 11, color: "var(--cp-text-muted)", marginTop: 2 }}>
                    {pr.type}{pr.dateReported ? ` · ${new Date(pr.dateReported).toLocaleDateString()}` : ""}
                  </div>
                </div>
                <span className="cp-badge negative" style={{ flexShrink: 0, fontSize: 10 }}>High Impact</span>
              </div>
            ))}
            {extraAlerts.map((alert, i) => (
              <div key={`alert-${i}`} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", background: "var(--cp-bg)", borderRadius: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: alert.severity === "high" ? "var(--cp-red)" : alert.severity === "medium" ? "var(--cp-amber)" : "var(--cp-blue)", flexShrink: 0, marginTop: 5 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--cp-text-primary)", textTransform: "capitalize" }}>{alert.type.replace(/_/g, " ")}</div>
                  <div style={{ fontSize: 11, color: "var(--cp-text-muted)", marginTop: 2 }}>{alert.message}</div>
                </div>
                <span className={`cp-badge ${alert.severity === "high" ? "negative" : alert.severity === "medium" ? "warning" : ""}`} style={{ flexShrink: 0, fontSize: 10, textTransform: "capitalize" }}>{alert.severity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <SubTabs
        tabs={[
          { id: "alerts", label: "Credit Alerts" },
          { id: "identity", label: "Identity Protection" },
          { id: "privacy", label: "Privacy Scan" },
        ]}
        active={subTab}
        onChange={setSubTab}
      />

      {subTab === "alerts" && (
        <ArrayWrapper title="Live Credit Alerts" sub="Real-time changes across all 3 bureaus" badge={<span className="cp-badge live">Live</span>} accentTop loading={!scriptReady || (!tokenReady && !tokenError)} locked={tokenError}>
          <array-credit-alerts appKey={appKey} userToken={userToken} {...sbx} />
        </ArrayWrapper>
      )}

      {subTab === "identity" && (
        <ArrayWrapper title="Identity Protection" sub="Continuous monitoring for new accounts, address changes, and dark web exposure" badge={<span className="cp-badge live">Live</span>} loading={!scriptReady || (!tokenReady && !tokenError)} locked={tokenError}>
          <array-identity-protect appKey={appKey} userToken={userToken} {...sbx} />
        </ArrayWrapper>
      )}

      {subTab === "privacy" && (
        <ArrayWrapper title="Data Broker Scan" sub="Sites that have your personal information listed" loading={!scriptReady || (!tokenReady && !tokenError)} locked={tokenError}>
          <array-pip-scan appKey={appKey} userToken={userToken} {...sbx} />
        </ArrayWrapper>
      )}
    </div>
  );
}

/* ── CREDIT REPORT PAGE ──────────────────────────────────────────── */
type ArrayPageProps = {
  appKey: string | null; userToken: string | null;
  sbx: Record<string, string>; scriptReady: boolean;
  tokenReady: boolean; tokenError: boolean;
};

function ReportPage({ appKey, userToken, sbx, scriptReady, tokenReady, tokenError }: ArrayPageProps) {
  const [subTab, setSubTab] = useState("tracker");
  const scoreLoading = !scriptReady || (!tokenReady && !tokenError);
  const { data: profile } = useScoreShiftProfile();
  const profileScore = profile?.scores?.vantage ?? profile?.scores?.experian ?? profile?.scores?.equifax ?? profile?.scores?.transunion ?? null;
  const profileTradelineCount = (profile?.tradelines?.length ?? 0) + (profile?.negativeTradelines?.length ?? 0);
  const hasProfileData = profile?.meta?.source !== "none" && (profileScore !== null || profileTradelineCount > 0);

  return (
    <div>
      <div className="cp-page-header">
        <div>
          <span className="cp-page-eyebrow">Credit Intelligence</span>
          <h1 className="cp-page-title">Credit Report</h1>
          <p className="cp-page-subtitle">Full 3-bureau report, score tracker, and score simulator — all live data.</p>
        </div>
        <span className="cp-badge blue-bureaus">All Bureaus</span>
      </div>

      {/* ── Live score header ──────────────────────────────────────── */}
      <div className="cp-score-header cp-mb-24">
        <div className="cp-score-header-label">
          <span className="cp-score-header-dot" />
          LIVE VANTAGESCORE 3.0
        </div>
        {scoreLoading ? (
          <div className="cp-score-header-loading">
            <div className="cp-array-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
            <span>Loading score data…</span>
          </div>
        ) : tokenError ? (
          <div className="cp-score-header-locked">
            <Icon size={15}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></Icon>
            {hasProfileData ? (
              <span>
                Profile data loaded ({profileTradelineCount} account{profileTradelineCount !== 1 ? "s" : ""}
                {profileScore !== null ? `, score ~${profileScore}` : ""}) — connect Array for live 3-bureau scores.
              </span>
            ) : (
              <span>Credit data not yet connected — pull your report to see live scores.</span>
            )}
            <button className="cp-btn cp-btn-primary cp-btn-sm" onClick={() => setSubTab("report")}>Pull My Report</button>
          </div>
        ) : (
          <div className="cp-score-header-component">
            <array-credit-score appKey={appKey} userToken={userToken} bureau="all" {...sbx} />
          </div>
        )}
      </div>

      <SubTabs
        tabs={[
          { id: "tracker", label: "Review My Scores" },
          { id: "report", label: "Full Credit Report" },
          { id: "simulator", label: "Score Simulator" },
        ]}
        active={subTab}
        onChange={setSubTab}
      />

      {subTab === "report" && (
        <ArrayWrapper title="3-Bureau Credit Report" sub="All accounts, inquiries, and history — live data" badge={<span className="cp-badge blue-bureaus">All Bureaus</span>} loading={!scriptReady || (!tokenReady && !tokenError)} locked={tokenError}>
          <array-credit-report appKey={appKey} userToken={userToken} defaultBureau="all" {...sbx} />
        </ArrayWrapper>
      )}

      {subTab === "tracker" && (
        <ArrayWrapper title="Score History" sub="VantageScore 3.0 — updated with every report pull" badge={<span className="cp-badge live">Live</span>} accentTop loading={!scriptReady || (!tokenReady && !tokenError)} locked={tokenError}>
          <array-credit-score appKey={appKey} userToken={userToken} bureau="all" scoreTracker="true" {...sbx} />
        </ArrayWrapper>
      )}

      {subTab === "simulator" && (
        <ArrayWrapper title="Score Impact Simulator" sub="See projected effect of paying down debt, removing items, and more" loading={!scriptReady || (!tokenReady && !tokenError)} locked={tokenError}>
          <array-credit-score-simulator appKey={appKey} userToken={userToken} {...sbx} />
        </ArrayWrapper>
      )}
    </div>
  );
}

/* ── PROGRESS PAGE ───────────────────────────────────────────────── */
type LifecycleEvent = {
  id: string;
  date: string | null;
  label: string;
  desc: string;
  kind: "filed" | "sent" | "delivered" | "followup" | "resolved" | "rejected" | "pending";
};

function buildLifecycleEvents(disputes: EnrichedDispute[]): LifecycleEvent[] {
  const events: LifecycleEvent[] = [];
  for (const d of disputes) {
    const prefix = `${d.creditor} · ${d.bureau}`;
    const title = d.issueTitle || "Dispute";
    // Filed / Letter Generated
    events.push({ id: `${d.id}-filed`, date: d.dateSent, label: `Letter generated: ${title}`, desc: `${prefix} — dispute letter created and ready to send`, kind: "filed" });
    // Sent
    if (d.status === "SENT" || d.status === "DELIVERED" || d.status === "FOLLOW_UP_REQUIRED" || d.status === "RESOLVED" || d.status === "REJECTED") {
      events.push({ id: `${d.id}-sent`, date: d.dateSent, label: `Letter sent: ${title}`, desc: `${prefix} — certified mail dispatched to bureau`, kind: "sent" });
    }
    // Delivered
    if (d.status === "DELIVERED" || d.status === "FOLLOW_UP_REQUIRED" || d.status === "RESOLVED" || d.status === "REJECTED") {
      events.push({ id: `${d.id}-delivered`, date: d.dateDelivered ?? d.dateSent, label: `Letter delivered: ${title}`, desc: `${prefix} — bureau received certified mail; 30-day review window started`, kind: "delivered" });
    }
    // Follow-up required
    if (d.status === "FOLLOW_UP_REQUIRED") {
      events.push({ id: `${d.id}-followup`, date: d.dateDelivered ?? d.dateSent, label: `Follow-up required: ${title}`, desc: `${prefix} — 30 days elapsed, escalation letter may be needed`, kind: "followup" });
    }
    // Resolved
    if (d.status === "RESOLVED") {
      const outcomeText = d.outcome === "removed" ? "✓ Item removed from report" : d.outcome === "verified" ? "Bureau verified item (not removed)" : "Case closed";
      events.push({ id: `${d.id}-resolved`, date: d.dateDelivered ?? d.dateSent, label: `Resolved: ${title}`, desc: `${prefix} — ${outcomeText}`, kind: d.outcome === "removed" ? "resolved" : "rejected" });
    }
    // Rejected
    if (d.status === "REJECTED") {
      events.push({ id: `${d.id}-rejected`, date: d.dateDelivered ?? d.dateSent, label: `Rejected: ${title}`, desc: `${prefix} — bureau rejected dispute; consider escalation`, kind: "rejected" });
    }
  }
  // Sort by date desc (most recent first), nulls last
  events.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  return events;
}

function ProgressPage() {
  const { data: profile, isLoading: profileLoading } = useScoreShiftProfile();
  const { data: ssStats } = useQuery<{ ptsGained: number | null; itemsRemoved: number; topScore: number | null; startingScore: number | null; currentScore: number | null; activeIssues: number; disputesInProgress: number; itemsResolved: number }>({ queryKey: ["/api/client/stats"] });
  const { data: activeRaw = [], isLoading: loadA } = useQuery<EnrichedDispute[]>({ queryKey: ["/api/client/disputes?status=active"] });
  const { data: resolvedRaw = [], isLoading: loadR } = useQuery<EnrichedDispute[]>({ queryKey: ["/api/client/disputes?status=resolved"] });
  const isLoading = profileLoading || loadA || loadR;

  const currentScore = profile?.scores?.vantage ?? profile?.scores?.experian ?? profile?.scores?.equifax ?? profile?.scores?.transunion ?? ssStats?.currentScore ?? null;
  const startingScore = ssStats?.startingScore ?? null;
  const scoreDelta = currentScore !== null && startingScore !== null ? currentScore - startingScore : null;

  const PROGRESS_ACTIVE = ["PENDING", "SENT", "DELIVERED", "FOLLOW_UP_REQUIRED"];
  const PROGRESS_RESOLVED = ["RESOLVED", "REJECTED"];

  // Prefer profile disputes (richer data); fall back to direct queries
  const allDisputes: EnrichedDispute[] = (profile?.disputes && profile.disputes.length > 0)
    ? (profile.disputes as any[])
    : [...(Array.isArray(activeRaw) ? activeRaw : []), ...(Array.isArray(resolvedRaw) ? resolvedRaw : [])];

  const active: EnrichedDispute[] = allDisputes.filter(d => PROGRESS_ACTIVE.includes(d.status));
  const resolved: EnrichedDispute[] = allDisputes.filter(d => PROGRESS_RESOLVED.includes(d.status));
  const removedCount = resolved.filter(d => (d as any).outcome === "removed").length;
  const hasData = allDisputes.length > 0;
  const events = buildLifecycleEvents(allDisputes as any[]);

  const eventKindDot: Record<string, { bg: string; icon: React.ReactNode }> = {
    filed:    { bg: "var(--cp-accent)",  icon: <Icon size={11}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></Icon> },
    sent:     { bg: "var(--cp-blue)",    icon: <Icon size={11}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></Icon> },
    delivered:{ bg: "var(--cp-teal)",    icon: <Icon size={11}><polyline points="20 6 9 17 4 12" /></Icon> },
    followup: { bg: "var(--cp-amber)",   icon: <Icon size={11}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></Icon> },
    resolved: { bg: "var(--cp-green)",   icon: <Icon size={11}><polyline points="20 6 9 17 4 12" /></Icon> },
    rejected: { bg: "var(--cp-red)",     icon: <Icon size={11}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Icon> },
    pending:  { bg: "var(--cp-text-muted)", icon: <Icon size={11}><circle cx="12" cy="12" r="10" /></Icon> },
  };

  return (
    <div>
      <div className="cp-page-header">
        <div>
          <span className="cp-page-eyebrow">Your Journey</span>
          <h1 className="cp-page-title">Progress Tracker</h1>
          <p className="cp-page-subtitle">Every dispute action tracked — from filing to resolution.</p>
        </div>
      </div>

      {/* Score delta row — sourced from profile + ssStats */}
      {(startingScore !== null || currentScore !== null) && (
        <div className="cp-card cp-mb-24">
          <div className="cp-card-header" style={{ marginBottom: 14 }}>
            <div>
              <div className="cp-card-eyebrow">SCORE PROGRESS</div>
              <div className="cp-card-title" style={{ marginTop: 2 }}>Credit Score Journey</div>
            </div>
            {scoreDelta !== null && (
              <span className={`cp-badge ${scoreDelta >= 0 ? "success" : "negative"}`}>
                {scoreDelta >= 0 ? "+" : ""}{scoreDelta} pts
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {startingScore !== null && (
              <div style={{ flex: 1, minWidth: 100, padding: "10px 14px", background: "var(--cp-bg)", borderRadius: 10 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "var(--cp-text-muted)" }}><CountUp to={startingScore} animKey="progress-starting-score" /></div>
                <div style={{ fontSize: 11, color: "var(--cp-text-muted)", marginTop: 2 }}>Starting Score</div>
              </div>
            )}
            {currentScore !== null && (
              <div style={{ flex: 1, minWidth: 100, padding: "10px 14px", background: "var(--cp-bg)", borderRadius: 10 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "var(--cp-accent)" }}><CountUp to={currentScore} animKey="progress-current-score" /></div>
                <div style={{ fontSize: 11, color: "var(--cp-text-muted)", marginTop: 2 }}>Current Score</div>
              </div>
            )}
            {scoreDelta !== null && (
              <div style={{ flex: 1, minWidth: 100, padding: "10px 14px", background: scoreDelta >= 0 ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", borderRadius: 10 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: scoreDelta >= 0 ? "var(--cp-green)" : "var(--cp-red)" }}>
                  {scoreDelta >= 0 ? "+" : "−"}<CountUp to={Math.abs(scoreDelta)} animKey="progress-score-delta" />
                </div>
                <div style={{ fontSize: 11, color: "var(--cp-text-muted)", marginTop: 2 }}>Points {scoreDelta >= 0 ? "Gained" : "Lost"}</div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="cp-grid-4 cp-mb-24">
        {[
          { label: "Total Disputes", num: isLoading ? null : allDisputes.length, color: "var(--cp-accent)" },
          { label: "Active", num: isLoading ? null : active.length, color: "var(--cp-amber)" },
          { label: "Items Removed", num: isLoading ? null : removedCount, color: "var(--cp-green)" },
          { label: "Resolved", num: isLoading ? null : resolved.length, color: "var(--cp-teal)" },
        ].map(s => (
          <div key={s.label} className="cp-stat-card">
            <div>
              <div className="cp-stat-value" style={{ color: s.color }}>
                <CountUp to={s.num} animKey={`progress-stat-${s.label}`} />
              </div>
              <div className="cp-stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="cp-card">
        <div className="cp-card-header">
          <div className="cp-card-title">Dispute Timeline</div>
          {hasData && <span className="cp-badge success">{events.length} event{events.length !== 1 ? "s" : ""}</span>}
        </div>
        {isLoading ? (
          <div style={{ padding: "32px 0", textAlign: "center" }}>
            <div className="cp-array-spinner" style={{ margin: "0 auto 10px" }} />
            <div style={{ fontSize: 12.5, color: "var(--cp-text-muted)" }}>Loading your timeline…</div>
          </div>
        ) : !hasData ? (
          <div className="cp-empty-state">
            <div className="cp-empty-icon">
              <Icon size={28}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></Icon>
            </div>
            <div className="cp-empty-title">Your timeline starts here</div>
            <div className="cp-empty-desc">Once disputes are filed, your full credit repair journey will be tracked here — every letter sent, every delivery confirmed, every item resolved.</div>
          </div>
        ) : (
          <div className="cp-milestone-list">
            {events.map((ev, i) => {
              const dot = eventKindDot[ev.kind] ?? eventKindDot.pending;
              const isDone = ev.kind === "resolved" || ev.kind === "delivered" || ev.kind === "sent";
              return (
                <div key={ev.id} className={`cp-milestone${isDone || ev.kind === "rejected" ? " done" : " upcoming"}`}>
                  <div className="cp-milestone-dot" style={{ background: dot.bg, border: "none" }}>
                    {dot.icon}
                  </div>
                  {i < events.length - 1 && <div className="cp-milestone-line" />}
                  <div className="cp-milestone-content">
                    {ev.date && <div className="cp-milestone-date">{fmtDate(ev.date)}</div>}
                    <div className="cp-milestone-label">{ev.label}</div>
                    <div className="cp-milestone-desc">{ev.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── PROFILE PAGE ────────────────────────────────────────────────── */
function ProfilePage({ user, logout, featureAccess }: { user: any; logout: () => void; featureAccess: ReturnType<typeof useFeatureAccess> }) {
  const [subTab, setSubTab] = useState("info");
  const [notifPrefs, setNotifPrefs] = useState({ scoreChanges: true, newAlerts: true, disputeUpdates: true, marketing: false });

  const initials = user ? ((user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? user.username?.[0] ?? "")).toUpperCase() || "U" : "U";
  const displayName = user ? (user.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : user.username) : "User";

  return (
    <div>
      <div className="cp-page-header">
        <div>
          <span className="cp-page-eyebrow">Account</span>
          <h1 className="cp-page-title">Profile & Settings</h1>
          <p className="cp-page-subtitle">Your personal information, billing, and account preferences.</p>
        </div>
      </div>

      <SubTabs
        tabs={[
          { id: "info", label: "Personal Info" },
          { id: "billing", label: "Billing & Plan" },
          { id: "notifications", label: "Notifications" },
          { id: "security", label: "Security" },
        ]}
        active={subTab}
        onChange={setSubTab}
      />

      {subTab === "info" && (
        <div className="cp-card">
          <div className="cp-card-header" style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "linear-gradient(135deg,#9B89C8,#7B6AAB)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={avatarUrl} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  onError={(e) => { const el = e.currentTarget; el.style.display = "none"; if (el.parentElement) el.parentElement.textContent = initials; }} />
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "var(--cp-text-primary)" }}>{displayName}</div>
                <div style={{ fontSize: 12.5, color: "var(--cp-text-muted)", marginTop: 2 }}>{user?.email ?? "No email on file"}</div>
                <span style={{ display: "inline-block", marginTop: 6, background: "linear-gradient(135deg,#9B89C8,#7B6AAB)", color: "white", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>{featureAccess.tierLabel}</span>
              </div>
            </div>
          </div>
          <div className="cp-card-title cp-mb-18">Personal Information</div>
          <div className="cp-grid-2" style={{ gap: 14, marginBottom: 18 }}>
            <div><label className="cp-form-label">First Name</label><input className="cp-form-input" defaultValue={user?.firstName ?? ""} placeholder="First name" /></div>
            <div><label className="cp-form-label">Last Name</label><input className="cp-form-input" defaultValue={user?.lastName ?? ""} placeholder="Last name" /></div>
            <div><label className="cp-form-label">Email Address</label><input className="cp-form-input" defaultValue={user?.email ?? ""} placeholder="your@email.com" type="email" /></div>
            <div><label className="cp-form-label">Phone Number</label><input className="cp-form-input" defaultValue="" placeholder="+1 (555) 000-0000" type="tel" /></div>
          </div>
          <button className="cp-btn cp-btn-primary cp-btn-sm">Save Changes</button>
        </div>
      )}

      {subTab === "billing" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="cp-card">
            <div className="cp-flex-between cp-mb-18">
              <div>
                <div className="cp-card-title">Current Plan</div>
                <div className="cp-card-subtitle">Your active ScoreShift subscription</div>
              </div>
              <span style={{ background: "linear-gradient(135deg,#9B89C8,#7B6AAB)", color: "white", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>
                {featureAccess.tier === "none" ? "Free" : featureAccess.tier.charAt(0).toUpperCase() + featureAccess.tier.slice(1)}
              </span>
            </div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 34, fontWeight: 800, letterSpacing: -2, marginBottom: 6 }}>
              <span className="cp-grad-text">
                {featureAccess.tier === "starter" ? "$29" : featureAccess.tier === "pro" ? "$79" : featureAccess.tier === "elite" ? "$149" : "$0"}
              </span>
              <span style={{ fontSize: 15, fontWeight: 400, color: "var(--cp-text-muted)", letterSpacing: 0 }}>/month</span>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--cp-text-muted)" }}>Next billing date: <strong style={{ color: "var(--cp-text-primary)" }}>June 6, 2026</strong></div>
          </div>
          <div className="cp-grid-2">
            <div className="cp-card">
              <div className="cp-card-title cp-mb-18">Payment Method</div>
              <div className="cp-flex-between cp-mb-18">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 44, height: 28, background: "linear-gradient(135deg,#1a1a2e,#16213e)", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "white", fontSize: 9, fontWeight: 700 }}>VISA</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>•••• •••• •••• 4242</div>
                    <div style={{ fontSize: 12, color: "var(--cp-text-muted)" }}>Expires 08/28</div>
                  </div>
                </div>
                <span className="cp-badge success">Active</span>
              </div>
              <button className="cp-btn cp-btn-secondary cp-btn-sm">Update Card</button>
            </div>
            <div className="cp-card">
              <div className="cp-card-title cp-mb-18">Upgrade Your Plan</div>
              <div style={{ fontSize: 13.5, color: "var(--cp-text-muted)", marginBottom: 16, lineHeight: 1.6 }}>Unlock more features, more monitoring, and full identity protection.</div>
              <button className="cp-btn cp-btn-primary" onClick={() => window.location.href = "/pricing"}>View Plans</button>
            </div>
          </div>
        </div>
      )}

      {subTab === "notifications" && (
        <div className="cp-card">
          <div className="cp-card-title cp-mb-18">Notification Preferences</div>
          {[
            { key: "scoreChanges" as const, label: "Score Changes", sub: "Get notified when your score moves" },
            { key: "newAlerts" as const, label: "New Alerts", sub: "Receive alerts for new items on your report" },
            { key: "disputeUpdates" as const, label: "Dispute Updates", sub: "Updates on your active disputes" },
            { key: "marketing" as const, label: "Marketing Emails", sub: "Tips, guides, and product updates" },
          ].map(({ key, label, sub }) => (
            <div key={key} className="cp-settings-row">
              <div>
                <div className="cp-settings-row-label">{label}</div>
                <div className="cp-settings-row-sub">{sub}</div>
              </div>
              <Toggle on={notifPrefs[key]} onToggle={() => setNotifPrefs(p => ({ ...p, [key]: !p[key] }))} />
            </div>
          ))}
        </div>
      )}

      {subTab === "security" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="cp-card">
            <div className="cp-card-title cp-mb-18">Security</div>
            <div className="cp-settings-row">
              <div>
                <div className="cp-settings-row-label">Change Password</div>
                <div className="cp-settings-row-sub">Last changed 30 days ago</div>
              </div>
              <button className="cp-btn cp-btn-secondary cp-btn-sm">Update</button>
            </div>
            <div className="cp-settings-row">
              <div>
                <div className="cp-settings-row-label">Two-Factor Authentication</div>
                <div className="cp-settings-row-sub">Add an extra layer of security</div>
              </div>
              <button className="cp-btn cp-btn-secondary cp-btn-sm">Enable</button>
            </div>
          </div>
          <div className="cp-card" style={{ borderColor: "var(--cp-red-light)" }}>
            <div className="cp-card-title cp-mb-18" style={{ color: "var(--cp-red)" }}>Sign Out</div>
            <div className="cp-settings-row">
              <div>
                <div className="cp-settings-row-label">Sign out of your account</div>
                <div className="cp-settings-row-sub">You'll need to log back in to access ScoreShift</div>
              </div>
              <button className="cp-btn cp-btn-secondary cp-btn-sm" onClick={logout}>Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIL WALLET PAGE
   ═══════════════════════════════════════════════════════════════════ */

interface MailPackage {
  id: string;
  credits: number;
  priceCents: number;
  label: string;
  priceDisplay: string;
  savings?: string;
  popular?: boolean;
}

interface MailWalletData {
  wallet: { id: number; userId: number; balance: number; updatedAt: string };
  transactions: {
    id: number; type: string; credits: number; balanceAfter: number;
    description: string; createdAt: string; amountCents?: number;
  }[];
  packages: MailPackage[];
}

interface MailedLetterItem {
  id: number;
  letterName: string;
  recipient: string;
  recipientType: string;
  creditsUsed: number;
  status: string;
  trackingNumber: string | null;
  expectedDelivery: string | null;
  deliveryConfirmedAt: string | null;
  mailedAt: string | null;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  QUEUED: "#8b8fa8",
  MAILED: "#4f6ef7",
  IN_TRANSIT: "#f59e0b",
  DELIVERED: "#10b981",
  RETURNED: "#ef4444",
  FAILED: "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
  QUEUED: "Queued",
  MAILED: "Mailed",
  IN_TRANSIT: "In Transit",
  DELIVERED: "Delivered",
  RETURNED: "Returned",
  FAILED: "Failed",
};

function MailStatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || "#8b8fa8";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: color + "18", color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />
      {STATUS_LABELS[status] || status}
    </span>
  );
}

// ─── Concierge Page ──────────────────────────────────────────────────────────

const CONCIERGE_PKGS = [
  {
    type: "fast-track",
    name: "Fast-Track",
    price: "$800",
    tag: "Most Popular",
    tagColor: "#7B6AAB",
    momentumMonths: 3,
    features: ["3-bureau credit analysis", "Professional dispute submission", "FCRA violation detection", "Monthly progress reports", "3 months Momentum included"],
    tradeline: false,
  },
  {
    type: "rush",
    name: "Fast-Track Rush",
    price: "$1,500",
    tag: "Priority Service",
    tagColor: "#EFA26F",
    momentumMonths: 6,
    features: ["All Fast-Track features", "Priority dispute processing", "Bureau escalation support", "Bi-weekly specialist check-ins", "6 months Momentum included"],
    tradeline: false,
  },
  {
    type: "elite",
    name: "Fast-Track Elite",
    price: "$2,500",
    tag: "Best Results",
    tagColor: "#22c55e",
    momentumMonths: 12,
    features: ["All Rush features", "Premium Tradeline Network Access", "1 Authorized User Tradeline included", "Funding readiness coaching", "12 months Momentum included"],
    tradeline: true,
  },
] as const;

type ConciergePackageType = "fast-track" | "rush" | "elite";

function ConciergeStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    pending_signature: { label: "Awaiting Signature", color: "var(--cp-clay)", bg: "var(--cp-clay-light)" },
    signed: { label: "Signed — Awaiting Payment", color: "var(--cp-accent)", bg: "var(--cp-accent-light)" },
    active: { label: "Service Active", color: "var(--cp-sage)", bg: "var(--cp-sage-light)" },
    completed: { label: "Service Completed", color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
    cancelled: { label: "Cancelled", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  };
  const s = map[status] || { label: status, color: "var(--cp-text-muted)", bg: "rgba(110,106,99,0.1)" };
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}30`, borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "inline-block" }}>
      {s.label}
    </span>
  );
}

function ConciergePage({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  const qc = useQueryClient();
  const { data: contract, isLoading: contractLoading } = useQuery<any>({ queryKey: ["/api/me/concierge"] });

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedPkg, setSelectedPkg] = useState<ConciergePackageType | null>(null);
  const [paymentOption, setPaymentOption] = useState<"full" | "flexible" | null>(null);
  const [contractText, setContractText] = useState("");
  const [contractData, setContractData] = useState<any>(null);
  const [sigName, setSigName] = useState("");
  const [loadingContract, setLoadingContract] = useState(false);
  const [signing, setSigning] = useState(false);
  const [paying, setPaying] = useState(false);
  const [sigError, setSigError] = useState("");

  // Handle Stripe return URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("concierge_paid") === "1" && params.get("session_id")) {
      const sessionId = params.get("session_id")!;
      fetch("/api/concierge/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
        body: JSON.stringify({ sessionId }),
      }).then(() => {
        qc.invalidateQueries({ queryKey: ["/api/me/concierge"] });
        qc.invalidateQueries({ queryKey: ["/api/user"] });
        window.history.replaceState({}, "", "/portal?page=concierge");
      });
    }
  }, [qc]);

  async function startContract() {
    if (!selectedPkg || !paymentOption) return;
    setLoadingContract(true);
    try {
      await fetch("/api/concierge/start", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
        body: JSON.stringify({ packageType: selectedPkg, paymentOption }),
      });
      const r = await fetch("/api/concierge/contract-text", {
        headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
      });
      const data = await r.json();
      setContractText(data.text || "");
      setContractData(data.contract);
      qc.invalidateQueries({ queryKey: ["/api/me/concierge"] });
      setStep(3);
    } catch {
      /* noop */
    } finally {
      setLoadingContract(false);
    }
  }

  async function loadContractText() {
    setLoadingContract(true);
    try {
      const r = await fetch("/api/concierge/contract-text", {
        headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
      });
      const data = await r.json();
      setContractText(data.text || "");
      setContractData(data.contract);
    } finally {
      setLoadingContract(false);
    }
  }

  async function signContract() {
    if (!sigName.trim() || sigName.trim().length < 2) { setSigError("Please enter your full legal name to sign."); return; }
    setSigError("");
    setSigning(true);
    try {
      const r = await fetch("/api/concierge/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
        body: JSON.stringify({ signatureName: sigName }),
      });
      if (!r.ok) { setSigError("Failed to sign contract. Please try again."); return; }
      qc.invalidateQueries({ queryKey: ["/api/me/concierge"] });
      setStep(4);
    } catch { setSigError("Failed to sign. Please try again."); }
    finally { setSigning(false); }
  }

  async function startPayment() {
    setPaying(true);
    try {
      const r = await fetch("/api/concierge/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
        body: "{}",
      });
      const data = await r.json();
      if (data.url) window.location.href = data.url;
    } catch { /* noop */ }
    finally { setPaying(false); }
  }

  if (contractLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
        <div className="cp-spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
      </div>
    );
  }

  const status = contract?.contractStatus;

  // Active or Completed state
  if (status === "active" || status === "completed") {
    const pkg = CONCIERGE_PKGS.find(p => p.type === contract.packageType);
    const schedule: any[] = contract.paymentSchedule || [];
    const paidCents = contract.amountPaidCents || 0;
    const totalCents = contract.totalPriceCents || 0;
    const paidPct = totalCents > 0 ? Math.round((paidCents / totalCents) * 100) : 0;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Status hero */}
        <div className="cp-card" style={{ background: status === "completed" ? "linear-gradient(135deg,rgba(99,102,241,0.08),rgba(99,102,241,0.03))" : "linear-gradient(135deg,rgba(123,106,171,0.08),rgba(123,106,171,0.03))", borderColor: status === "completed" ? "rgba(99,102,241,0.2)" : "rgba(123,106,171,0.2)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div className="cp-welcome-eyebrow">SCORESHIFT CONCIERGE</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--cp-text-primary)", marginTop: 4, marginBottom: 8, letterSpacing: -0.5 }}>{pkg?.name || contract.packageType}</div>
              <ConciergeStatusBadge status={status} />
              {status === "completed" && (
                <div style={{ marginTop: 12, padding: "12px 16px", background: "rgba(99,102,241,0.08)", borderRadius: 10, border: "1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#6366f1", marginBottom: 4 }}>🎉 Service Complete — Momentum Unlocked!</div>
                  <div style={{ fontSize: 12.5, color: "var(--cp-text-secondary)", lineHeight: 1.6 }}>Your {contract.momentumMonths}-month Momentum plan is now active. Dispute IQ, Smart Letters, and all platform tools are unlocked.</div>
                  <button className="cp-btn cp-btn-primary cp-btn-sm" style={{ marginTop: 10 }} onClick={() => onNavigate("dispute-iq")}>Open Dispute IQ →</button>
                </div>
              )}
              {status === "active" && (
                <div style={{ marginTop: 12, fontSize: 12.5, color: "var(--cp-text-secondary)", lineHeight: 1.6 }}>
                  Your ScoreShift Concierge team is actively working on your case. Dispute IQ editing is managed by your team while service is active.
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
              <div style={{ fontSize: 10, color: "var(--cp-text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>Payment Progress</div>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: "var(--cp-accent)", letterSpacing: -1 }}>{paidPct}%</div>
              <div style={{ fontSize: 11, color: "var(--cp-text-muted)" }}>${(paidCents / 100).toFixed(0)} of ${(totalCents / 100).toFixed(0)}</div>
            </div>
          </div>
        </div>

        {/* Dispute IQ lock banner (active only) */}
        {status === "active" && (
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: "rgba(239,162,111,0.08)", borderRadius: 12, border: "1px solid rgba(239,162,111,0.3)" }}>
            <span style={{ fontSize: 22 }}>🔒</span>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#C07050", marginBottom: 2 }}>Dispute IQ — Managed by Your Team</div>
              <div style={{ fontSize: 12.5, color: "var(--cp-text-secondary)" }}>Your concierge specialists handle all dispute activity. You'll see progress updates in real time below.</div>
            </div>
          </div>
        )}

        {/* Payment schedule */}
        {schedule.length > 0 && (
          <div className="cp-card">
            <div className="cp-card-title cp-mb-18">Payment Schedule</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {schedule.map((s: any, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: s.paid ? "rgba(132,204,22,0.06)" : "rgba(110,106,99,0.04)", borderRadius: 10, border: `1px solid ${s.paid ? "rgba(132,204,22,0.2)" : "rgba(110,106,99,0.12)"}` }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cp-text-primary)" }}>{s.label}</div>
                    <div style={{ fontSize: 11.5, color: "var(--cp-text-muted)", marginTop: 2 }}>Due {s.dueDate ? new Date(s.dueDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 800, color: "var(--cp-text-primary)" }}>${(s.amountCents / 100).toFixed(0)}</span>
                    <span className={`cp-badge ${s.paid ? "success" : ""}`}>{s.paid ? "Paid" : "Pending"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contract details */}
        <div className="cp-card">
          <div className="cp-card-title cp-mb-18">Contract Details</div>
          <div className="cp-grid-2" style={{ gap: 12 }}>
            {[
              { label: "Package", value: pkg?.name || contract.packageType },
              { label: "Total Investment", value: `$${(totalCents / 100).toFixed(0)}` },
              { label: "Payment Option", value: contract.paymentOption === "full" ? "Payment in Full" : "Flexible Pay" },
              { label: "Momentum Included", value: `${contract.momentumMonths} months` },
              { label: "Signed", value: contract.signedAt ? new Date(contract.signedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—" },
              { label: "Signature", value: contract.signatureName || "—" },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: "10px 14px", background: "rgba(110,106,99,0.04)", borderRadius: 10, border: "1px solid rgba(110,106,99,0.1)" }}>
                <div style={{ fontSize: 10, color: "var(--cp-text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--cp-text-primary)" }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Signed, awaiting payment
  if (status === "signed") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="cp-card" style={{ textAlign: "center", padding: "40px 24px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✍️</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--cp-text-primary)", marginBottom: 8 }}>Contract Signed</div>
          <div style={{ fontSize: 13.5, color: "var(--cp-text-secondary)", lineHeight: 1.7, marginBottom: 24 }}>
            Your contract is signed. Complete your first payment to activate your Concierge service and unlock your dashboard.
          </div>
          <ConciergeStatusBadge status="signed" />
          <div style={{ marginTop: 24 }}>
            <button className="cp-btn cp-btn-primary" onClick={startPayment} disabled={paying} style={{ minWidth: 200 }}>
              {paying ? "Redirecting…" : "Complete Payment →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Contract review + e-signature
  if (step === 3 || status === "pending_signature") {
    if (status === "pending_signature" && !contractText) {
      loadContractText();
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="cp-card">
          <div className="cp-card-title" style={{ marginBottom: 6 }}>Review Your Agreement</div>
          <div className="cp-card-subtitle cp-mb-18">Read the full contract carefully before signing. Scroll to the bottom to sign.</div>
          {loadingContract ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><div className="cp-spinner" /></div>
          ) : (
            <pre style={{ background: "rgba(110,106,99,0.05)", border: "1px solid rgba(110,106,99,0.12)", borderRadius: 12, padding: "20px 22px", fontSize: 11.5, lineHeight: 1.75, color: "var(--cp-text-secondary)", overflowX: "auto", whiteSpace: "pre-wrap", maxHeight: 420, overflowY: "auto", fontFamily: "'Courier New', monospace" }}>
              {contractText}
            </pre>
          )}
        </div>

        <div className="cp-card">
          <div className="cp-card-title cp-mb-18">Electronic Signature</div>
          <div style={{ fontSize: 13, color: "var(--cp-text-secondary)", lineHeight: 1.7, marginBottom: 18 }}>
            By typing your full legal name below and clicking "Sign Agreement", you agree to be legally bound by all terms in this contract pursuant to the E-SIGN Act.
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="cp-form-label">Your Full Legal Name</label>
            <input
              className="cp-form-input"
              placeholder="e.g. Jane Marie Smith"
              value={sigName}
              onChange={e => setSigName(e.target.value)}
              style={{ fontSize: 15 }}
            />
            {sigError && <div style={{ fontSize: 12, color: "#ef4444", marginTop: 6 }}>{sigError}</div>}
          </div>
          <div style={{ padding: "10px 14px", background: "rgba(110,106,99,0.04)", borderRadius: 8, border: "1px solid rgba(110,106,99,0.12)", fontSize: 12, color: "var(--cp-text-muted)", marginBottom: 16, lineHeight: 1.6 }}>
            ✍️ Signature preview: <em style={{ color: "var(--cp-text-primary)", fontFamily: "cursive", fontSize: 15 }}>{sigName || "Your name will appear here"}</em>
          </div>
          <button className="cp-btn cp-btn-primary" onClick={signContract} disabled={signing || !sigName.trim()} style={{ width: "100%" }}>
            {signing ? "Signing…" : "Sign Agreement →"}
          </button>
          <div style={{ fontSize: 11, color: "var(--cp-text-muted)", marginTop: 12, textAlign: "center" }}>
            Your IP address and timestamp are recorded for legal purposes.
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Signed, awaiting payment redirect
  if (step === 4) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="cp-card" style={{ textAlign: "center", padding: "40px 24px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--cp-text-primary)", marginBottom: 8 }}>Agreement Signed!</div>
          <div style={{ fontSize: 13.5, color: "var(--cp-text-secondary)", lineHeight: 1.7, marginBottom: 24 }}>
            Your contract is signed and secure. Complete your first payment to activate your Concierge service.
          </div>
          <button className="cp-btn cp-btn-primary" onClick={startPayment} disabled={paying} style={{ minWidth: 220, fontSize: 15 }}>
            {paying ? "Redirecting to payment…" : "Proceed to Payment →"}
          </button>
          <div style={{ fontSize: 11.5, color: "var(--cp-text-muted)", marginTop: 16 }}>Secured by Stripe · SSL encrypted</div>
        </div>
      </div>
    );
  }

  // Step 2: Payment option
  if (step === 2 && selectedPkg) {
    const pkg = CONCIERGE_PKGS.find(p => p.type === selectedPkg)!;
    const total = { "fast-track": 800, "rush": 1500, "elite": 2500 }[selectedPkg];
    const flexAmounts = {
      "fast-track": ["$400 today", "$200 in 2 weeks", "$200 in 4 weeks"],
      "rush": ["$750 today", "$375 in 2 weeks", "$375 in 4 weeks"],
      "elite": ["$1,250 today", "$625 in 2 weeks", "$625 in 4 weeks"],
    }[selectedPkg];

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="cp-btn cp-btn-secondary cp-btn-sm" onClick={() => setStep(1)}>← Back</button>
          <div>
            <div className="cp-welcome-eyebrow">STEP 2 OF 3 · {pkg.name}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--cp-text-primary)" }}>Choose your payment option</div>
          </div>
        </div>

        <div className="cp-grid-2" style={{ gap: 16 }}>
          {/* Full pay */}
          <div
            className="cp-card"
            onClick={() => setPaymentOption("full")}
            style={{ cursor: "pointer", borderColor: paymentOption === "full" ? "var(--cp-accent)" : undefined, background: paymentOption === "full" ? "rgba(123,106,171,0.06)" : undefined, transition: "all 0.2s" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--cp-text-primary)" }}>Pay in Full</div>
              <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${paymentOption === "full" ? "var(--cp-accent)" : "rgba(110,106,99,0.3)"}`, background: paymentOption === "full" ? "var(--cp-accent)" : "transparent", flexShrink: 0 }} />
            </div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: "var(--cp-accent)", letterSpacing: -1, marginBottom: 8 }}>${total}</div>
            <div style={{ fontSize: 12.5, color: "var(--cp-text-secondary)", lineHeight: 1.6 }}>One payment today. Simple and complete.</div>
          </div>

          {/* Flexible pay */}
          <div
            className="cp-card"
            onClick={() => setPaymentOption("flexible")}
            style={{ cursor: "pointer", borderColor: paymentOption === "flexible" ? "var(--cp-accent)" : undefined, background: paymentOption === "flexible" ? "rgba(123,106,171,0.06)" : undefined, transition: "all 0.2s" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--cp-text-primary)" }}>Flexible Pay</div>
              <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${paymentOption === "flexible" ? "var(--cp-accent)" : "rgba(110,106,99,0.3)"}`, background: paymentOption === "flexible" ? "var(--cp-accent)" : "transparent", flexShrink: 0 }} />
            </div>
            <div style={{ marginBottom: 10 }}>
              {flexAmounts.map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: i < flexAmounts.length - 1 ? "1px solid rgba(110,106,99,0.08)" : "none" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--cp-accent)", flexShrink: 0, display: "inline-block" }} />
                  <span style={{ fontSize: 12.5, color: "var(--cp-text-secondary)" }}>{a}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "var(--cp-text-muted)" }}>Same total · 3 installments</div>
          </div>
        </div>

        <button
          className="cp-btn cp-btn-primary"
          disabled={!paymentOption || loadingContract}
          onClick={startContract}
          style={{ width: "100%", fontSize: 15, padding: "14px 0" }}
        >
          {loadingContract ? "Generating contract…" : "Review Agreement →"}
        </button>
      </div>
    );
  }

  // Step 1: Package selection
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div className="cp-welcome-eyebrow">STEP 1 OF 3</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "var(--cp-text-primary)", letterSpacing: -0.5, marginBottom: 6 }}>Choose your Concierge plan</div>
        <div style={{ fontSize: 13.5, color: "var(--cp-text-secondary)", lineHeight: 1.6 }}>
          Our specialists handle everything — disputes, strategy, and bureau follow-ups. You watch the progress.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {CONCIERGE_PKGS.map(pkg => (
          <div
            key={pkg.type}
            className="cp-card"
            onClick={() => setSelectedPkg(pkg.type)}
            style={{ cursor: "pointer", borderColor: selectedPkg === pkg.type ? "var(--cp-accent)" : undefined, background: selectedPkg === pkg.type ? "rgba(123,106,171,0.06)" : undefined, transition: "all 0.2s" }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--cp-text-primary)" }}>{pkg.name}</div>
                  <span style={{ background: pkg.tagColor, color: "white", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>{pkg.tag}</span>
                  {pkg.tradeline && <span style={{ background: "rgba(34,197,94,0.12)", color: "#16a34a", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, border: "1px solid rgba(34,197,94,0.3)" }}>+ Tradeline</span>}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", marginBottom: 10 }}>
                  {pkg.features.map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                      <span style={{ color: "var(--cp-sage)", fontWeight: 700 }}>✓</span>
                      <span style={{ color: "var(--cp-text-secondary)" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: "var(--cp-text-muted)" }}>Includes {pkg.momentumMonths} months Momentum after completion</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 800, color: "var(--cp-accent)", letterSpacing: -1 }}>{pkg.price}</div>
                  <div style={{ fontSize: 11, color: "var(--cp-text-muted)" }}>or 3 installments</div>
                </div>
                <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${selectedPkg === pkg.type ? "var(--cp-accent)" : "rgba(110,106,99,0.3)"}`, background: selectedPkg === pkg.type ? "var(--cp-accent)" : "transparent", flexShrink: 0 }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        className="cp-btn cp-btn-primary"
        disabled={!selectedPkg}
        onClick={() => setStep(2)}
        style={{ width: "100%", fontSize: 15, padding: "14px 0" }}
      >
        Continue — Choose Payment Option →
      </button>

      <div style={{ padding: "14px 18px", background: "rgba(110,106,99,0.04)", borderRadius: 12, border: "1px solid rgba(110,106,99,0.1)", fontSize: 12.5, color: "var(--cp-text-muted)", lineHeight: 1.7 }}>
        🔒 <strong style={{ color: "var(--cp-text-secondary)" }}>Protected by CROA.</strong> You have a 3-day right to cancel under the Credit Repair Organizations Act. All agreements are fully digital and legally binding.
      </div>
    </div>
  );
}

function MailWalletPage({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"wallet" | "history" | "transactions">("wallet");
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Handle Stripe return with purchased credits
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const purchased = params.get("purchased");
    const sessionId = params.get("session_id");
    if (purchased && sessionId) {
      apiRequest("POST", "/api/mail-wallet/confirm-purchase", { sessionId })
        .then(() => {
          qc.invalidateQueries({ queryKey: ["/api/mail-wallet"] });
          setSuccessBanner(`${purchased} certified mail credit${Number(purchased) > 1 ? "s" : ""} added to your wallet!`);
          // Clean URL without reload
          const clean = window.location.pathname;
          window.history.replaceState({}, "", `${clean}?page=mail-wallet`);
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data, isLoading } = useQuery<MailWalletData>({
    queryKey: ["/api/mail-wallet"],
  });

  const { data: history = [], isLoading: historyLoading } = useQuery<MailedLetterItem[]>({
    queryKey: ["/api/mail-wallet/history"],
    enabled: tab === "history",
  });

  async function handlePurchase(pkg: MailPackage) {
    setPurchaseLoading(pkg.id);
    try {
      const res = await apiRequest("POST", "/api/mail-wallet/checkout", { packageId: pkg.id });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      }
    } catch {
      setPurchaseLoading(null);
    }
  }

  const balance = data?.wallet.balance ?? 0;
  const packages = data?.packages ?? [];
  const transactions = data?.transactions ?? [];

  return (
    <div style={{ padding: "0 0 40px", maxWidth: 860, margin: "0 auto" }}>
      {/* Success banner */}
      {successBanner && (
        <div style={{
          background: "linear-gradient(90deg, #10b98118, #10b98108)",
          border: "1px solid #10b98140",
          borderRadius: 12, padding: "14px 20px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 12,
          color: "#10b981", fontWeight: 600, fontSize: 14,
        }}>
          <span style={{ fontSize: 20 }}>✓</span>
          {successBanner}
          <button onClick={() => setSuccessBanner(null)}
            style={{ marginLeft: "auto", background: "none", border: "none", color: "#10b981", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
        </div>
      )}

      {/* Balance hero card */}
      <div className="cp-card" style={{
        background: "linear-gradient(135deg, #1e2a5a 0%, #2d3b7a 60%, #3d4d9a 100%)",
        border: "none", borderRadius: 18, padding: "28px 32px", marginBottom: 24,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -20, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                Mail Wallet Balance
              </div>
              {isLoading ? (
                <div style={{ height: 52, width: 80, background: "rgba(255,255,255,0.1)", borderRadius: 8 }} />
              ) : (
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontSize: 52, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{balance}</span>
                  <span style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                    certified mail credit{balance !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
              <div style={{ marginTop: 10, fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
                1 credit = 1 certified USPS letter to any bureau or recipient
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                className="cp-btn"
                style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(4px)" }}
                onClick={() => setTab("history")}
              >
                <Icon size={14}><path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></Icon>
                View History
              </button>
              <button
                className="cp-btn cp-btn-primary"
                style={{ background: "rgba(255,255,255,0.95)", color: "#1e2a5a", fontWeight: 700 }}
                onClick={() => setTab("wallet")}
              >
                <Icon size={14}><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></Icon>
                Buy Credits
              </button>
            </div>
          </div>
          {balance > 0 && (
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.12)", display: "flex", gap: 20 }}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                <span style={{ color: "#fff", fontWeight: 700 }}>{transactions.filter(t => t.type === "DEDUCTION").length}</span> letters sent
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                <span style={{ color: "#fff", fontWeight: 700 }}>{transactions.filter(t => t.type === "PURCHASE").length}</span> purchases
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <SubTabs
        tabs={[
          { id: "wallet", label: "Buy Credits" },
          { id: "history", label: "Mail History" },
          { id: "transactions", label: "Transaction Log" },
        ]}
        active={tab}
        onChange={t => setTab(t as "wallet" | "history" | "transactions")}
      />

      {/* ── Buy Credits Tab ── */}
      {tab === "wallet" && (
        <div>
          <div style={{ marginBottom: 16, fontSize: 14, color: "var(--cp-text-muted)", lineHeight: 1.6 }}>
            Purchase certified mail credits to send your dispute letters directly to Experian, Equifax, and TransUnion via USPS Certified Mail with tracking.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16 }}>
            {packages.map(pkg => (
              <div key={pkg.id} className="cp-card" style={{
                position: "relative", cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s",
                border: pkg.popular ? "2px solid var(--cp-accent)" : undefined,
                paddingTop: pkg.popular ? 36 : undefined,
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
              >
                {pkg.popular && (
                  <div style={{
                    position: "absolute", top: 0, left: "50%", transform: "translateX(-50%) translateY(-50%)",
                    background: "var(--cp-accent)", color: "#fff", fontSize: 10, fontWeight: 700,
                    padding: "3px 14px", borderRadius: 20, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap",
                  }}>Most Popular</div>
                )}
                <div style={{ fontSize: 32, fontWeight: 800, color: "var(--cp-text-primary)", lineHeight: 1.1 }}>
                  {pkg.credits}
                </div>
                <div style={{ fontSize: 13, color: "var(--cp-text-muted)", marginTop: 2, marginBottom: 14 }}>
                  Certified Mail Credit{pkg.credits > 1 ? "s" : ""}
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--cp-accent)", marginBottom: 4 }}>
                  {pkg.priceDisplay}
                </div>
                {pkg.savings && (
                  <div style={{ fontSize: 11, color: "#10b981", fontWeight: 600, marginBottom: 14 }}>{pkg.savings}</div>
                )}
                {!pkg.savings && <div style={{ marginBottom: 14 }} />}
                <div style={{ fontSize: 11, color: "var(--cp-text-muted)", marginBottom: 16, lineHeight: 1.5 }}>
                  ${(pkg.priceCents / 100 / pkg.credits).toFixed(2)} per letter
                </div>
                <button
                  className="cp-btn cp-btn-primary"
                  style={{ width: "100%", justifyContent: "center", fontSize: 13, opacity: purchaseLoading && purchaseLoading !== pkg.id ? 0.5 : 1 }}
                  disabled={!!purchaseLoading}
                  onClick={() => handlePurchase(pkg)}
                >
                  {purchaseLoading === pkg.id ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="cp-array-spinner" style={{ width: 14, height: 14 }} />
                      Redirecting…
                    </span>
                  ) : "Buy Now"}
                </button>
              </div>
            ))}
          </div>

          <div className="cp-card" style={{ marginTop: 20, background: "var(--cp-surface-alt, rgba(0,0,0,0.04))" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cp-text-primary)", marginBottom: 12 }}>
              How Certified Mail Credits Work
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {[
                ["1 Credit = 1 Letter", "Each certified mail credit sends one physical letter with USPS tracking."],
                ["Bureau Disputes", "Sending to Experian, Equifax, and TransUnion at once uses 3 credits."],
                ["Tracking Included", "Get a real USPS tracking number for every certified letter sent."],
                ["Credits Never Expire", "Use your credits anytime — they stay in your wallet until used."],
              ].map(([title, desc]) => (
                <div key={title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--cp-accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <Icon size={10}><polyline points="20 6 9 17 4 12" /></Icon>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cp-text-primary)" }}>{title}</div>
                    <div style={{ fontSize: 12, color: "var(--cp-text-muted)", marginTop: 2 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Mail History Tab ── */}
      {tab === "history" && (
        <div>
          {historyLoading ? (
            <div className="cp-card" style={{ textAlign: "center", padding: 40 }}>
              <div className="cp-array-spinner" style={{ margin: "0 auto 12px" }} />
              <div style={{ color: "var(--cp-text-muted)", fontSize: 14 }}>Loading mail history…</div>
            </div>
          ) : history.length === 0 ? (
            <div className="cp-card" style={{ textAlign: "center", padding: 48 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--cp-text-primary)", marginBottom: 8 }}>No letters mailed yet</div>
              <div style={{ fontSize: 13, color: "var(--cp-text-muted)", marginBottom: 20 }}>
                Use your mail credits from Dispute IQ to send certified letters to the bureaus.
              </div>
              <button className="cp-btn cp-btn-primary" onClick={() => onNavigate("dispute-iq")}>
                Go to Dispute IQ
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {history.map(letter => (
                <div key={letter.id} className="cp-card" style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: "linear-gradient(135deg, #1e2a5a20, #3d4d9a20)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Icon size={18}><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" /><polyline points="22 6 12 13 2 6" /></Icon>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--cp-text-primary)" }}>{letter.letterName}</div>
                        <MailStatusBadge status={letter.status} />
                      </div>
                      <div style={{ fontSize: 12, color: "var(--cp-text-muted)", marginTop: 4 }}>
                        To: <strong style={{ color: "var(--cp-text-secondary)" }}>{letter.recipient}</strong>
                        {" · "}
                        {letter.creditsUsed} credit{letter.creditsUsed !== 1 ? "s" : ""}
                        {letter.mailedAt && ` · Mailed ${new Date(letter.mailedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                      </div>
                      {letter.trackingNumber && (
                        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                          <Icon size={12}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></Icon>
                          <span style={{ fontSize: 11, color: "var(--cp-text-muted)" }}>Tracking: </span>
                          <code style={{ fontSize: 11, color: "var(--cp-accent)", fontFamily: "monospace" }}>{letter.trackingNumber}</code>
                        </div>
                      )}
                      {letter.expectedDelivery && (
                        <div style={{ marginTop: 4, fontSize: 12, color: "var(--cp-text-muted)" }}>
                          Expected delivery: {new Date(letter.expectedDelivery).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          {letter.deliveryConfirmedAt && (
                            <span style={{ color: "#10b981", fontWeight: 600 }}> · Delivered {new Date(letter.deliveryConfirmedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Transaction Log Tab ── */}
      {tab === "transactions" && (
        <div>
          {transactions.length === 0 ? (
            <div className="cp-card" style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 14, color: "var(--cp-text-muted)" }}>No transactions yet.</div>
            </div>
          ) : (
            <div className="cp-card" style={{ padding: 0, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--cp-border)" }}>
                    {["Date", "Description", "Credits", "Balance"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--cp-text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn, i) => (
                    <tr key={txn.id} style={{ borderBottom: i < transactions.length - 1 ? "1px solid var(--cp-border)" : "none" }}>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--cp-text-muted)", whiteSpace: "nowrap" }}>
                        {new Date(txn.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--cp-text-primary)" }}>{txn.description}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: txn.credits > 0 ? "#10b981" : "#ef4444", whiteSpace: "nowrap" }}>
                        {txn.credits > 0 ? "+" : ""}{txn.credits}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "var(--cp-text-primary)" }}>{txn.balanceAfter}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Array component error boundary ─────────────────────────────── */
class ArrayErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN CLIENT PORTAL
   ═══════════════════════════════════════════════════════════════════ */
export default function ClientPortal({ initialPage }: { initialPage?: PageId } = {}) {
  const { user, logout } = useUserContext();
  const featureAccess = useFeatureAccess();
  const { appKey, token: userToken, isReady: tokenReady, error: tokenError, apiUrl, sandboxMode } = useArrayToken();
  const { loaded: scriptReady } = useArrayScript(appKey || undefined);
  useArrayThemeInjector();

  const [activePage, setActivePage] = useState<PageId>(() => {
    // Read ?page= from Stripe return URL or direct navigation
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get("page");
    const validPages: PageId[] = ["home","plan","dispute-iq","debt","subscriptions","student-loans","protection","report","progress","profile","payment-center","mail-wallet","concierge"];
    if (pageParam && validPages.includes(pageParam as PageId)) return pageParam as PageId;
    return initialPage ?? "home";
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [suggestedSavings, setSuggestedSavings] = useState<number | null>(null);

  const bgVideoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = bgVideoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
  }, []);

  /* ── Onboarding state ─────────────────────────────────────────── */
  const [onboardingDone, setOnboardingDone] = useState(() =>
    localStorage.getItem("ss_portal_onboarding_done") === "1"
  );
  const [onboardingGoal, setOnboardingGoal] = useState<OnboardingGoal | null>(
    () => (localStorage.getItem("ss_portal_goal") as OnboardingGoal | null) ?? null
  );
  const [onboardingTimeline, setOnboardingTimeline] = useState<OnboardingTimeline | null>(
    () => (localStorage.getItem("ss_portal_timeline") as OnboardingTimeline | null) ?? null
  );

  function finishOnboarding(goal: OnboardingGoal, timeline: OnboardingTimeline) {
    setOnboardingGoal(goal);
    setOnboardingTimeline(timeline);
    localStorage.setItem("ss_portal_onboarding_done", "1");
    localStorage.setItem("ss_portal_goal", goal);
    localStorage.setItem("ss_portal_timeline", timeline);
    setOnboardingDone(true);
    setActivePage("home");
  }

  /* ── Sandbox props for Array components ───────────────────────── */
  const sbx: Record<string, string> = sandboxMode && apiUrl ? { apiUrl, sandbox: "true" } : {};

  /* ── Array page props ─────────────────────────────────────────── */
  const arrayProps: ArrayPageProps = { appKey, userToken, sbx, scriptReady, tokenReady, tokenError };

  /* ── User info ────────────────────────────────────────────────── */
  const initials = user
    ? ((user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? user.username?.[0] ?? "")).toUpperCase() || "U"
    : "U";
  const displayName = user ? (user.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : user.username) : "User";
  const avatarUrl = "https://randomuser.me/api/portraits/men/32.jpg";

  /* ── Nav items ────────────────────────────────────────────────── */
  const isManaged = user?.accountType === "MANAGED_CLIENT";
  const NAV: { id: PageId; label: string; icon: React.ReactNode; badge?: string; customClick?: () => void }[] = [
    { id: "home", label: isManaged ? "My Plan" : "Home", icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></> },
    { id: "plan" as PageId, label: isManaged ? "Action Plan" : "My Plan", icon: <><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></> as React.ReactNode, badge: isManaged ? undefined : "2" },
    ...(isManaged ? [{ id: "payment-center" as PageId, label: "Payment Center", icon: <><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></> as React.ReactNode }] : []),
    { id: "dispute-iq", label: "Dispute IQ", icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></> },
    { id: "debt", label: "Debt Navigator", icon: <><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></> },
    { id: "student-loans" as PageId, label: "Student Loan Aid", icon: <><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></> as React.ReactNode },
    { id: "subscriptions", label: "Subscription Manager", icon: <><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /><line x1="7" y1="15" x2="7" y2="15" /><line x1="11" y1="15" x2="13" y2="15" /></> },
    { id: "protection", label: "Protection Center", icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></> },
    { id: "report", label: "Credit Report", icon: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></> },
    { id: "progress", label: "Progress", icon: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></> },
    { id: "mail-wallet" as PageId, label: "Mail Wallet", icon: <><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" /><polyline points="22 6 12 13 2 6" /></> as React.ReactNode },
    { id: "concierge" as PageId, label: "Concierge", icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> as React.ReactNode },
    { id: "profile", label: "Profile", icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></> },
  ];

  const PAGE_TITLES: Record<PageId, string> = {
    home: isManaged ? "My Plan" : "Home",
    plan: "My Plan",
    "dispute-iq": "Dispute IQ",
    debt: "Debt Navigator",
    "student-loans": "Student Loan Aid",
    subscriptions: "Subscription Manager",
    protection: "Protection Center",
    report: "Credit Report",
    progress: "Progress",
    profile: "Profile & Settings",
    "payment-center": "Payment Center",
    "mail-wallet": "Mail Wallet",
    "concierge": "Concierge Service",
  };

  /* ── Render ───────────────────────────────────────────────────── */
  /* Shared ambient background video (rendered once, reused for onboarding too) */
  const BgVideo = (
    <div className="cp-bg-layer" aria-hidden="true">
      <video ref={bgVideoRef} className="cp-bg-video" autoPlay muted loop playsInline preload="metadata">
        <source src="/videos/scoreshift-world.webm" type="video/webm" />
        <source src="/videos/scoreshift-world.mp4" type="video/mp4" />
      </video>
      <div className="cp-bg-overlay" />
      <div className="cp-bg-glass" />
    </div>
  );

  if (!onboardingDone) {
    return (
      <div className="cp-portal">
        {BgVideo}
        <OnboardingScreen onDone={finishOnboarding} />
      </div>
    );
  }

  return (
    <div className="cp-portal">
      {BgVideo}
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className={`cp-sidebar${mobileNavOpen ? " open" : ""}`}>
        <a className="cp-sidebar-logo" href="#" onClick={(e) => { e.preventDefault(); setActivePage("home"); setMobileNavOpen(false); }}>
          <img src={scoreshiftLogo} alt="ScoreShift" style={{ width: 38, height: 38, objectFit: "contain", flexShrink: 0 }} />
          <span className="cp-logo-text">ScoreShift</span>
        </a>

        <nav className="cp-sidebar-nav">
          {NAV.map(item => (
            <button
              key={item.id}
              className={`cp-nav-item${activePage === item.id ? " active" : ""}`}
              onClick={() => { setActivePage(item.id); setMobileNavOpen(false); }}
            >
              <Icon size={15}>{item.icon}</Icon>
              {item.label}
              {item.badge && (
                <span className="cp-nav-badge amber">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="cp-sidebar-user">
          <div className="cp-user-avatar" style={{ padding: 0, overflow: "hidden" }}>
            <img src={avatarUrl} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; (e.currentTarget.parentElement as HTMLElement).innerText = initials; }} />
          </div>
          <div className="cp-user-info">
            <div className="cp-user-name">{displayName}</div>
            <div className="cp-user-plan">{featureAccess.tierLabel}</div>
          </div>
          <button className="cp-signout-btn" title="Sign out" onClick={logout}>
            <Icon size={15}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></Icon>
          </button>
        </div>
      </aside>

      {/* Mobile nav overlay */}
      {mobileNavOpen && <div className="cp-mobile-overlay" onClick={() => setMobileNavOpen(false)} />}

      {/* ── Main ────────────────────────────────────────────────── */}
      <div className="cp-main">
        {/* Topbar */}
        <header className="cp-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="cp-mobile-menu-btn" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
              <Icon size={18}><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></Icon>
            </button>
            <span className="cp-topbar-title">{PAGE_TITLES[activePage]}</span>
          </div>
          <div className="cp-topbar-right">
            <span className="cp-plan-chip">{featureAccess.tierLabel}</span>
            <button className="cp-icon-btn" title="Notifications">
              <Icon size={15}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></Icon>
              <span className="cp-notif-dot" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="cp-content">
          {(activePage === "home" || activePage === "payment-center") && <HomePage user={user} goal={onboardingGoal} timeline={onboardingTimeline} onNavigate={setActivePage} appKey={appKey} userToken={userToken} sbx={sbx} scriptReady={scriptReady} tokenReady={tokenReady} tokenError={tokenError} scrollToPayment={activePage === "payment-center"} />}
          {activePage === "plan" && <PlanPage goal={onboardingGoal} timeline={onboardingTimeline} onNavigate={setActivePage} />}
          {activePage === "dispute-iq" && !isManaged && <RealDisputeIQPage />}
          {activePage === "debt" && <DebtPage {...arrayProps} suggestedSavings={suggestedSavings} onDismissSavings={() => setSuggestedSavings(null)} />}
          {activePage === "subscriptions" && <SubscriptionManagerPage goal={onboardingGoal} isManaged={isManaged} onNavigate={(p) => { setActivePage(p); }} onSavingsApply={(amt) => { setSuggestedSavings(amt > 0 ? amt : null); setActivePage("debt"); }} {...arrayProps} />}
          {activePage === "student-loans" && <StudentLoanPage {...arrayProps} onNavigate={(p) => { setActivePage(p); }} />}
          {activePage === "protection" && <ProtectionPage {...arrayProps} />}
          {activePage === "report" && <ReportPage {...arrayProps} />}
          {activePage === "progress" && <ProgressPage />}
          {activePage === "mail-wallet" && <MailWalletPage onNavigate={setActivePage} />}
          {activePage === "concierge" && <ConciergePage onNavigate={setActivePage} />}
          {activePage === "dispute-iq" && isManaged && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="cp-page-header">
                <div>
                  <span className="cp-page-eyebrow">Credit Repair</span>
                  <h1 className="cp-page-title">Dispute IQ</h1>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "20px 22px", background: "rgba(239,162,111,0.07)", borderRadius: 14, border: "1px solid rgba(239,162,111,0.25)" }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>🔒</span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#C07050", marginBottom: 6 }}>Managed by Your Concierge Team</div>
                  <div style={{ fontSize: 13.5, color: "var(--cp-text-secondary)", lineHeight: 1.7, marginBottom: 14 }}>
                    While your Concierge service is active, our specialists handle all dispute activity on your behalf — letter creation, bureau submissions, and follow-ups. You cannot edit or submit disputes during active service.
                  </div>
                  <div style={{ fontSize: 13, color: "var(--cp-text-secondary)", lineHeight: 1.6, marginBottom: 14 }}>
                    After service completion, Dispute IQ will automatically unlock with your included Momentum plan.
                  </div>
                  <button className="cp-btn cp-btn-secondary cp-btn-sm" onClick={() => setActivePage("concierge")}>View My Concierge Dashboard →</button>
                </div>
              </div>
            </div>
          )}
          {activePage === "profile" && <ProfilePage user={user} logout={logout} featureAccess={featureAccess} />}
        </div>
      </div>
    </div>
  );
}
