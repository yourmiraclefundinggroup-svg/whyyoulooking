import { useState, useRef, useEffect } from "react";
import scoreshiftLogo from "@assets/scoreshift-logo.png";
import { useQuery } from "@tanstack/react-query";
import { useUserContext } from "@/hooks/use-user-context";
import { useArrayScript } from "@/hooks/use-array-script";
import { useArrayToken } from "@/hooks/use-array-token";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import "@/styles/portal.css";

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
      "array-student-loan-aid": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & Record<string, any>, HTMLElement>;
      "array-subscription-manager": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & Record<string, any>, HTMLElement>;
    }
  }
}

/* ── Types ────────────────────────────────────────────────────────── */
type PageId = "home" | "plan" | "dispute-iq" | "debt" | "protection" | "report" | "progress" | "profile";

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
function HomePage({ user, onNavigate }: { user: any; onNavigate: (page: PageId) => void }) {
  const displayName = user?.firstName || user?.username || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const actions = [
    { id: 1, priority: "high", label: "Dispute Capital One late payment", detail: "30-day late reported on Equifax — potential +28 pts", page: "dispute-iq" as PageId, color: "#ef4444" },
    { id: 2, priority: "high", label: "Validate Midland Credit collection", detail: "Unverified $847 collection on TransUnion — dispute now", page: "dispute-iq" as PageId, color: "#ef4444" },
    { id: 3, priority: "medium", label: "Reduce Chase card utilization", detail: "Current 74% utilization — target below 30% to gain ~18 pts", page: "debt" as PageId, color: "#f59e0b" },
    { id: 4, priority: "medium", label: "Review your full credit report", detail: "Last reviewed 14 days ago — new data available", page: "report" as PageId, color: "#6366f1" },
    { id: 5, priority: "low", label: "Enable identity protection", detail: "Monitor for new accounts opened in your name", page: "protection" as PageId, color: "#14b8a6" },
  ];

  const topAction = actions[0];

  return (
    <div>
      {/* Welcome hero */}
      <div className="cp-home-hero cp-mb-24">
        <div className="cp-home-hero-left">
          <div className="cp-welcome-eyebrow">{greeting.toUpperCase()}</div>
          <div className="cp-welcome-name">{greeting}, {displayName}.</div>
          <div className="cp-welcome-sub">Your credit plan has <strong style={{ color: "#2dd4bf" }}>2 urgent actions</strong> ready. Let's move.</div>
        </div>
        <div className="cp-home-hero-scores">
          {[
            { bureau: "EQ", score: 638, change: "+22", tier: "fair" },
            { bureau: "TU", score: 621, change: "+8", tier: "fair" },
            { bureau: "EX", score: 644, change: "+14", tier: "fair" },
          ].map(s => (
            <div key={s.bureau} className="cp-home-score-chip">
              <div className="cp-home-score-bureau">{s.bureau}</div>
              <div className="cp-home-score-val">{s.score}</div>
              <div className="cp-home-score-change">↑ {s.change}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Best Action */}
      <div className="cp-nba-card cp-mb-24">
        <div className="cp-nba-label">
          <span style={{ background: "#ef4444", width: 7, height: 7, borderRadius: "50%", display: "inline-block", marginRight: 6, animation: "cp-pulse-dot 2s infinite" }} />
          NEXT BEST ACTION
        </div>
        <div className="cp-nba-title">{topAction.label}</div>
        <div className="cp-nba-detail">{topAction.detail}</div>
        <div className="cp-nba-footer">
          <button className="cp-btn cp-btn-primary" onClick={() => onNavigate(topAction.page)}>
            Take Action
            <Icon size={15}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></Icon>
          </button>
          <button className="cp-btn cp-btn-secondary cp-btn-sm" onClick={() => onNavigate("plan")}>View full plan</button>
        </div>
      </div>

      {/* Action queue */}
      <div className="cp-grid-2 cp-mb-24">
        <div className="cp-card">
          <div className="cp-card-header">
            <div>
              <div className="cp-card-title">Your Action Queue</div>
              <div className="cp-card-subtitle">Ranked by credit impact</div>
            </div>
            <span className="cp-badge warning">5 actions</span>
          </div>
          {actions.map((a, i) => (
            <div key={a.id} className="cp-action-row" onClick={() => onNavigate(a.page)}>
              <div className="cp-action-rank">{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="cp-action-label">{a.label}</div>
                <div className="cp-action-detail">{a.detail}</div>
              </div>
              <span className={`cp-priority-dot ${a.priority}`} />
            </div>
          ))}
          <div style={{ marginTop: 14 }}>
            <button className="cp-btn cp-btn-secondary cp-btn-sm" onClick={() => onNavigate("plan")}>View full plan →</button>
          </div>
        </div>

        <div className="cp-card">
          <div className="cp-card-header">
            <div>
              <div className="cp-card-title">Recent Activity</div>
              <div className="cp-card-subtitle">Changes across all 3 bureaus</div>
            </div>
            <span className="cp-badge live">Live</span>
          </div>
          {[
            { type: "positive", text: "Score increased +22 pts on Equifax", meta: "Today, 8:14 AM" },
            { type: "negative", text: "New inquiry — Capital One", meta: "Yesterday, 3:40 PM · TransUnion" },
            { type: "positive", text: "Midland collection removed", meta: "May 4, 2026 · All Bureaus" },
            { type: "neutral", text: "Certified mail delivered", meta: "May 3, 2026 · Experian" },
            { type: "positive", text: "Chase utilization fell to 71%", meta: "May 1, 2026" },
          ].map((alert, i) => (
            <div key={i} className="cp-alert-item">
              <div className={`cp-alert-dot ${alert.type}`} />
              <div>
                <div className="cp-alert-text">{alert.text}</div>
                <div className="cp-alert-meta">{alert.meta}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Credit readiness */}
      <div className="cp-card cp-card-accent-top">
        <div className="cp-card-header">
          <div>
            <div className="cp-card-title">Credit Readiness Score</div>
            <div className="cp-card-subtitle">How your profile stacks up across 5 key factors</div>
          </div>
          <span className="cp-badge info">Updated today</span>
        </div>
        <div className="cp-readiness-grid">
          {[
            { label: "Payment History", pct: 85, color: "#22c55e" },
            { label: "Credit Utilization", pct: 34, color: "#f59e0b" },
            { label: "Account Age", pct: 60, color: "#6366f1" },
            { label: "Credit Mix", pct: 70, color: "#14b8a6" },
            { label: "New Credit", pct: 55, color: "#8b5cf6" },
          ].map(f => (
            <div key={f.label} className="cp-readiness-item">
              <div className="cp-flex-between" style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--cp-text-secondary)" }}>{f.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: f.color }}>{f.pct}%</span>
              </div>
              <div className="cp-progress-bar" style={{ height: 6 }}>
                <div style={{ width: `${f.pct}%`, height: "100%", borderRadius: 3, background: f.color, transition: "width 0.8s ease" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── MY PLAN PAGE ────────────────────────────────────────────────── */
function PlanPage({ goal, onNavigate }: { goal: OnboardingGoal | null; onNavigate: (page: PageId) => void }) {
  const allActions = [
    {
      category: "Dispute",
      urgency: "urgent",
      title: "Dispute Capital One 30-day late payment",
      impact: "+22–34 pts",
      bureau: "Equifax",
      detail: "30-day late from Jan 2024. Dispute under FCRA §1681i — bureau must verify within 30 days or remove.",
      page: "dispute-iq" as PageId,
      color: "var(--cp-red)",
      bg: "var(--cp-red-light)",
    },
    {
      category: "Dispute",
      urgency: "urgent",
      title: "Validate Midland Credit $847 collection",
      impact: "+18–28 pts",
      bureau: "TransUnion",
      detail: "Debt validation letter required. If Midland can't validate, they must remove the tradeline.",
      page: "dispute-iq" as PageId,
      color: "var(--cp-red)",
      bg: "var(--cp-red-light)",
    },
    {
      category: "Debt",
      urgency: "important",
      title: "Pay Chase card from 74% to below 30%",
      impact: "+15–22 pts",
      bureau: "All",
      detail: "High utilization is the #1 drag on your score. Paying $1,100 would bring Chase to 29%.",
      page: "debt" as PageId,
      color: "var(--cp-amber)",
      bg: "var(--cp-amber-light)",
    },
    {
      category: "Dispute",
      urgency: "important",
      title: "Challenge Chase hard inquiry",
      impact: "+3–6 pts",
      bureau: "Experian",
      detail: "Hard inquiries 12+ months old have minimal impact but can be disputed if unauthorized.",
      page: "dispute-iq" as PageId,
      color: "var(--cp-amber)",
      bg: "var(--cp-amber-light)",
    },
    {
      category: "Protection",
      urgency: "recommended",
      title: "Enable identity protection monitoring",
      impact: "Preventive",
      bureau: "All",
      detail: "Continuous monitoring for new accounts, address changes, and dark web data exposure.",
      page: "protection" as PageId,
      color: "var(--cp-teal)",
      bg: "var(--cp-teal-light)",
    },
    {
      category: "Credit",
      urgency: "recommended",
      title: "Review full 3-bureau credit report",
      impact: "Audit",
      bureau: "All",
      detail: "New report data available. Look for additional errors, duplicate accounts, or outdated info.",
      page: "report" as PageId,
      color: "var(--cp-accent)",
      bg: "var(--cp-accent-light)",
    },
  ];

  const urgencyOrder = { urgent: 0, important: 1, recommended: 2 };
  const sorted = [...allActions].sort((a, b) => urgencyOrder[a.urgency as keyof typeof urgencyOrder] - urgencyOrder[b.urgency as keyof typeof urgencyOrder]);

  return (
    <div>
      <div className="cp-page-header">
        <div>
          <span className="cp-page-eyebrow">Credit Action Intelligence</span>
          <h1 className="cp-page-title">Your ScoreShift Plan</h1>
          <p className="cp-page-subtitle">Actions ranked by credit impact — tackle in order for fastest results.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span className="cp-badge warning">2 Urgent</span>
          <span className="cp-badge info">4 Actions</span>
        </div>
      </div>

      {/* Impact summary */}
      <div className="cp-grid-4 cp-mb-24">
        {[
          { label: "Estimated gain", val: "+65–90 pts", color: "var(--cp-green)", icon: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></> },
          { label: "Items to dispute", val: "3", color: "var(--cp-red)", icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></> },
          { label: "Debt to target", val: "$1,100", color: "var(--cp-amber)", icon: <><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></> },
          { label: "Est. timeline", val: "4–8 wks", color: "var(--cp-teal)", icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> },
        ].map(s => (
          <div key={s.label} className="cp-stat-card">
            <div className="cp-stat-icon" style={{ background: `${s.color}18`, color: s.color }}>
              <Icon size={20}>{s.icon}</Icon>
            </div>
            <div>
              <div className="cp-stat-value" style={{ fontSize: 20, color: s.color }}>{s.val}</div>
              <div className="cp-stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Action cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {sorted.map((action, i) => (
          <div key={i} className="cp-plan-action-card" style={{ borderLeft: `4px solid ${action.color}` }}>
            <div className="cp-plan-action-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                <span className={`cp-plan-urgency-badge ${action.urgency}`}>{action.urgency}</span>
                <span className="cp-plan-category">{action.category}</span>
                <span className="cp-plan-bureau">{action.bureau}</span>
              </div>
              <span className="cp-plan-impact" style={{ color: action.color }}>{action.impact}</span>
            </div>
            <div className="cp-plan-action-title">{action.title}</div>
            <div className="cp-plan-action-detail">{action.detail}</div>
            <div style={{ marginTop: 14 }}>
              <button className="cp-btn cp-btn-primary cp-btn-sm" onClick={() => onNavigate(action.page)}>
                Take Action
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

function DisputeIQPage() {
  const [subTab, setSubTab] = useState("tracker");
  const { data: activeRaw = [] } = useQuery<EnrichedDispute[]>({ queryKey: ["/api/client/disputes?status=active"] });
  const { data: historyRaw = [] } = useQuery<EnrichedDispute[]>({ queryKey: ["/api/client/disputes?status=resolved"] });
  const active: EnrichedDispute[] = Array.isArray(activeRaw) ? activeRaw : [];
  const history: EnrichedDispute[] = Array.isArray(historyRaw) ? historyRaw : [];

  const SAMPLE_ACTIVE: EnrichedDispute[] = [
    { id: 1, bureau: "Equifax", status: "sent", dateSent: "2026-04-28", expectedResponse: "2026-05-28", actualResponse: null, creditor: "Capital One", issueType: "late_payment", issueTitle: "30-Day Late Payment", outcome: null },
    { id: 2, bureau: "TransUnion", status: "in_review", dateSent: "2026-04-22", expectedResponse: "2026-05-22", actualResponse: null, creditor: "Midland Credit Mgmt", issueType: "collection", issueTitle: "Unverified Collection $847", outcome: null },
  ];

  const displayActive = active.length > 0 ? active : SAMPLE_ACTIVE;

  return (
    <div>
      <div className="cp-page-header">
        <div>
          <span className="cp-page-eyebrow">Dispute Management</span>
          <h1 className="cp-page-title">Dispute IQ</h1>
          <p className="cp-page-subtitle">Track disputes, generate smart letters, and monitor results — all in one place.</p>
        </div>
        <span className="cp-badge warning">{displayActive.length} Active</span>
      </div>

      <SubTabs
        tabs={[
          { id: "tracker", label: "Active Disputes" },
          { id: "history", label: "History" },
          { id: "letters", label: "Smart Letters" },
          { id: "strategy", label: "Strategy" },
        ]}
        active={subTab}
        onChange={setSubTab}
      />

      {subTab === "tracker" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {displayActive.map(d => (
            <div key={d.id} className="cp-dispute-card">
              <div className="cp-dispute-card-header">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="cp-bureau-badge" data-bureau={d.bureau.toLowerCase().slice(0, 2)}>
                    {d.bureau.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <div className="cp-dispute-title">{d.issueTitle}</div>
                    <div className="cp-dispute-meta">{d.creditor} · Sent {fmtDate(d.dateSent)}</div>
                  </div>
                </div>
                <span className={`cp-pill ${d.status === "sent" ? "pending" : d.status === "in_review" ? "active" : "resolved"}`}>
                  {d.status === "sent" ? "Awaiting Response" : d.status === "in_review" ? "In Review" : "Resolved"}
                </span>
              </div>
              <div className="cp-dispute-timeline-row">
                {["Sent", "Received", "Under Review", "Resolved"].map((step, i) => {
                  const stepDone = d.status === "in_review" ? i <= 2 : d.status === "sent" ? i <= 0 : i <= 3;
                  const stepActive = d.status === "in_review" ? i === 2 : d.status === "sent" ? i === 1 : false;
                  return (
                    <div key={step} className={`cp-dtl-step${stepDone ? " done" : stepActive ? " active" : ""}`}>
                      <div className="cp-dtl-dot" />
                      <div className="cp-dtl-label">{step}</div>
                    </div>
                  );
                })}
              </div>
              <div className="cp-dispute-deadline">
                <Icon size={13}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></Icon>
                Response deadline: <strong>{fmtDate(d.expectedResponse)}</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      {subTab === "history" && (
        <div className="cp-card">
          <div className="cp-card-header">
            <div className="cp-card-title">Resolved Disputes</div>
          </div>
          {history.length === 0 ? (
            <div className="cp-empty-state">
              <div className="cp-empty-icon"><Icon size={24}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></Icon></div>
              <div className="cp-empty-title">No resolved disputes yet</div>
              <div className="cp-empty-desc">As your disputes are resolved, they'll appear here with outcomes and any score improvements.</div>
            </div>
          ) : (
            <div className="cp-table-scroll">
              <table className="cp-table">
                <thead><tr><th>Item</th><th>Bureau</th><th>Sent</th><th>Outcome</th></tr></thead>
                <tbody>
                  {history.map(d => (
                    <tr key={d.id}>
                      <td><strong>{d.issueTitle}</strong><br /><span style={{ fontSize: 12, color: "var(--cp-text-muted)" }}>{d.creditor}</span></td>
                      <td>{d.bureau}</td>
                      <td>{fmtDate(d.dateSent)}</td>
                      <td><span className={`cp-pill ${d.outcome === "removed" ? "resolved" : d.outcome === "verified" ? "negative" : "pending"}`}>{d.outcome || "Pending"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {subTab === "letters" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="cp-info-banner">
            <Icon size={15}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></Icon>
            <span>AI-generated dispute letters are reviewed and sent by your advisor on your behalf via certified USPS mail.</span>
          </div>
          {[
            { title: "Capital One — Late Payment Dispute", bureau: "Equifax", date: "Apr 28, 2026", status: "sent", tracking: "9400111899223456789012" },
            { title: "Midland Credit — Debt Validation", bureau: "TransUnion", date: "Apr 22, 2026", status: "sent", tracking: "9400111899223456789034" },
          ].map((letter, i) => (
            <div key={i} className="cp-card" style={{ borderLeft: "4px solid var(--cp-accent)" }}>
              <div className="cp-flex-between cp-mb-18">
                <div>
                  <div className="cp-card-title">{letter.title}</div>
                  <div className="cp-card-subtitle">{letter.bureau} · Sent {letter.date}</div>
                </div>
                <span className="cp-pill pending">Sent</span>
              </div>
              <div style={{ background: "var(--cp-bg)", borderRadius: 9, padding: "10px 14px", fontSize: 12, color: "var(--cp-text-muted)", fontFamily: "monospace", marginBottom: 14 }}>
                <span style={{ color: "var(--cp-text-secondary)", fontWeight: 600 }}>USPS Tracking: </span>{letter.tracking}
              </div>
              <button className="cp-btn cp-btn-secondary cp-btn-sm">View Letter</button>
            </div>
          ))}
        </div>
      )}

      {subTab === "strategy" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="cp-card cp-card-accent-top">
            <div className="cp-card-header">
              <div className="cp-card-title">Your Dispute Strategy</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { step: 1, title: "Pull & analyze your 3-bureau report", done: true },
                { step: 2, title: "Identify all disputable items", done: true },
                { step: 3, title: "Generate FCRA-compliant dispute letters", done: true },
                { step: 4, title: "Send via certified mail to each bureau", active: true },
                { step: 5, title: "Monitor response within 30-day window", done: false },
                { step: 6, title: "Escalate if bureau verifies incorrectly", done: false },
              ].map(s => (
                <div key={s.step} className="cp-strategy-step">
                  <div className={`cp-strategy-dot${s.done ? " done" : s.active ? " active" : ""}`}>
                    {s.done ? <Icon size={12}><polyline points="20 6 9 17 4 12" /></Icon> : s.step}
                  </div>
                  <div className={`cp-strategy-label${s.done ? " done" : s.active ? " active" : ""}`}>{s.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── DEBT NAVIGATOR PAGE ─────────────────────────────────────────── */
function DebtPage({ appKey, userToken, sbx, scriptReady, tokenReady, tokenError }: ArrayPageProps) {
  const [subTab, setSubTab] = useState("overview");
  return (
    <div>
      <div className="cp-page-header">
        <div>
          <span className="cp-page-eyebrow">Debt Intelligence</span>
          <h1 className="cp-page-title">Debt Navigator</h1>
          <p className="cp-page-subtitle">Payoff strategies, utilization analysis, and personalized debt reduction plans.</p>
        </div>
      </div>

      <div className="cp-grid-4 cp-mb-24">
        {[
          { label: "Total Debt", val: "$14,820", color: "var(--cp-red)", icon: <><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></> },
          { label: "Avg Utilization", val: "68%", color: "var(--cp-amber)", icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> },
          { label: "Monthly Payments", val: "$387", color: "var(--cp-accent)", icon: <><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></> },
          { label: "Pay-off Target", val: "28 mo", color: "var(--cp-teal)", icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
        ].map(s => (
          <div key={s.label} className="cp-stat-card">
            <div className="cp-stat-icon" style={{ background: `${s.color}18`, color: s.color }}>
              <Icon size={20}>{s.icon}</Icon>
            </div>
            <div>
              <div className="cp-stat-value" style={{ fontSize: 22, color: s.color }}>{s.val}</div>
              <div className="cp-stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <SubTabs
        tabs={[
          { id: "overview", label: "Debt Overview" },
          { id: "navigator", label: "Payoff Planner" },
          { id: "analysis", label: "Utilization Analysis" },
        ]}
        active={subTab}
        onChange={setSubTab}
      />

      {subTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { name: "Chase Sapphire", type: "Credit Card", balance: 5840, limit: 7900, util: 74, status: "high", color: "#ef4444" },
            { name: "Capital One Quicksilver", type: "Credit Card", balance: 2100, limit: 5000, util: 42, status: "medium", color: "#f59e0b" },
            { name: "Discover It", type: "Credit Card", balance: 880, limit: 4500, util: 20, status: "good", color: "#22c55e" },
            { name: "Auto Loan — Toyota", type: "Installment", balance: 6000, limit: 18000, util: 33, status: "good", color: "#22c55e" },
          ].map((acct, i) => (
            <div key={i} className="cp-debt-card">
              <div className="cp-flex-between" style={{ marginBottom: 12 }}>
                <div>
                  <div className="cp-debt-name">{acct.name}</div>
                  <div className="cp-debt-type">{acct.type}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 18, color: acct.color }}>${acct.balance.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: "var(--cp-text-muted)" }}>of ${acct.limit.toLocaleString()}</div>
                </div>
              </div>
              <div className="cp-flex-between" style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 11.5, color: "var(--cp-text-muted)" }}>Utilization</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: acct.color }}>{acct.util}%</span>
              </div>
              <div className="cp-progress-bar" style={{ height: 6 }}>
                <div style={{ width: `${acct.util}%`, height: "100%", borderRadius: 3, background: acct.color }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {subTab === "navigator" && (
        <ArrayWrapper title="Debt Payoff Planner" sub="Avalanche, snowball, and custom payoff strategies" loading={!scriptReady || (!tokenReady && !tokenError)} locked={tokenError}>
          <array-debt-navigator appKey={appKey} userToken={userToken} {...sbx} />
        </ArrayWrapper>
      )}

      {subTab === "analysis" && (
        <ArrayWrapper title="Debt & Utilization Breakdown" sub="Live data from all open accounts" badge={<span className="cp-badge live">Live</span>} loading={!scriptReady || (!tokenReady && !tokenError)} locked={tokenError}>
          <array-credit-debt-analysis appKey={appKey} userToken={userToken} {...sbx} />
        </ArrayWrapper>
      )}
    </div>
  );
}

/* ── PROTECTION CENTER ───────────────────────────────────────────── */
function ProtectionPage({ appKey, userToken, sbx, scriptReady, tokenReady, tokenError }: ArrayPageProps) {
  const [subTab, setSubTab] = useState("alerts");
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

      <div className="cp-grid-3 cp-mb-24">
        {[
          { label: "Identity Protection", val: "Active", color: "var(--cp-teal)", icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></> },
          { label: "Credit Alerts", val: "4 new", color: "var(--cp-amber)", icon: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></> },
          { label: "Privacy Score", val: "72/100", color: "var(--cp-accent)", icon: <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></> },
        ].map(s => (
          <div key={s.label} className="cp-stat-card">
            <div className="cp-stat-icon" style={{ background: `${s.color}18`, color: s.color }}>
              <Icon size={20}>{s.icon}</Icon>
            </div>
            <div>
              <div className="cp-stat-value" style={{ fontSize: 18, color: s.color }}>{s.val}</div>
              <div className="cp-stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

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
  const [subTab, setSubTab] = useState("report");
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

      <div className="cp-grid-3 cp-mb-24">
        {[
          { bureau: "Equifax", score: 638, change: "+22", cls: "fair" },
          { bureau: "TransUnion", score: 621, change: "+8", cls: "fair" },
          { bureau: "Experian", score: 644, change: "+14", cls: "fair" },
        ].map(s => (
          <div key={s.bureau} className={`cp-score-card ${s.cls}`}>
            <div className="cp-score-bureau">{s.bureau.toUpperCase()}</div>
            <div className={`cp-score-number ${s.cls}`}>{s.score}</div>
            <div className={`cp-score-rating ${s.cls}`}>Fair</div>
            <div className="cp-score-bar">
              <div className="cp-score-bar-fill" style={{ width: `${((s.score - 300) / 550) * 100}%` }} />
            </div>
            <div className="cp-score-change">
              <Icon size={12}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /></Icon>
              {s.change} this month
            </div>
          </div>
        ))}
      </div>

      <SubTabs
        tabs={[
          { id: "report", label: "Full Report" },
          { id: "tracker", label: "Score Tracker" },
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
function ProgressPage() {
  const milestones = [
    { date: "Mar 15, 2026", label: "Joined ScoreShift", desc: "Starting score: 588", done: true, score: 588 },
    { date: "Apr 1, 2026", label: "First dispute sent", desc: "Capital One late payment — Equifax", done: true, score: null },
    { date: "Apr 22, 2026", label: "Collection dispute filed", desc: "Midland Credit $847 — TransUnion", done: true, score: null },
    { date: "May 4, 2026", label: "Midland collection removed", desc: "Score jumped +18 pts on TransUnion", done: true, score: 621 },
    { date: "May 10, 2026", label: "Equifax score reached 638", desc: "+22 pts since last check", done: true, score: 638 },
    { date: "Estimated Jun, 2026", label: "Capital One dispute resolution", desc: "Awaiting bureau response", done: false, score: null },
    { date: "Estimated Jul, 2026", label: "Target: 680+ on all bureaus", desc: "With current trajectory", done: false, score: 680 },
  ];

  return (
    <div>
      <div className="cp-page-header">
        <div>
          <span className="cp-page-eyebrow">Your Journey</span>
          <h1 className="cp-page-title">Progress Tracker</h1>
          <p className="cp-page-subtitle">Every action, every improvement — your full credit repair timeline.</p>
        </div>
      </div>

      <div className="cp-grid-4 cp-mb-24">
        {[
          { label: "Score gain (since start)", val: "+56 pts", color: "var(--cp-green)" },
          { label: "Items disputed", val: "2", color: "var(--cp-accent)" },
          { label: "Items removed", val: "1", color: "var(--cp-teal)" },
          { label: "Days on program", val: "79", color: "var(--cp-amber)" },
        ].map(s => (
          <div key={s.label} className="cp-stat-card">
            <div>
              <div className="cp-stat-value" style={{ color: s.color }}>{s.val}</div>
              <div className="cp-stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Score chart */}
      <div className="cp-card cp-mb-24">
        <div className="cp-card-header">
          <div className="cp-card-title">Score History</div>
          <span className="cp-badge success">+56 pts total</span>
        </div>
        <div className="cp-score-chart">
          {[
            { month: "Mar", eq: 588, tu: 575, ex: 592 },
            { month: "Apr", eq: 601, tu: 588, ex: 610 },
            { month: "May", eq: 638, tu: 621, ex: 644 },
          ].map((m, i) => (
            <div key={i} className="cp-score-chart-col">
              <div className="cp-score-chart-bars">
                {[
                  { score: m.eq, color: "#ef4444", label: "EQ" },
                  { score: m.tu, color: "#a855f7", label: "TU" },
                  { score: m.ex, color: "#3b82f6", label: "EX" },
                ].map(b => (
                  <div key={b.label} className="cp-score-chart-bar-wrap">
                    <div style={{ fontSize: 10, fontWeight: 700, color: b.color, marginBottom: 3 }}>{b.score}</div>
                    <div className="cp-score-chart-bar-bg">
                      <div className="cp-score-chart-bar-fill" style={{ height: `${((b.score - 550) / 200) * 100}%`, background: b.color }} />
                    </div>
                    <div style={{ fontSize: 9, color: "var(--cp-text-muted)", marginTop: 3 }}>{b.label}</div>
                  </div>
                ))}
              </div>
              <div className="cp-score-chart-month">{m.month}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 18, marginTop: 14 }}>
          {[{ color: "#ef4444", label: "Equifax" }, { color: "#a855f7", label: "TransUnion" }, { color: "#3b82f6", label: "Experian" }].map(b => (
            <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--cp-text-muted)" }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: b.color, display: "inline-block" }} />{b.label}
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="cp-card">
        <div className="cp-card-header">
          <div className="cp-card-title">Repair Timeline</div>
        </div>
        <div className="cp-milestone-list">
          {milestones.map((m, i) => (
            <div key={i} className={`cp-milestone${m.done ? " done" : " upcoming"}`}>
              <div className="cp-milestone-dot">
                {m.done
                  ? <Icon size={12}><polyline points="20 6 9 17 4 12" /></Icon>
                  : <Icon size={12}><circle cx="12" cy="12" r="10" /></Icon>}
              </div>
              {i < milestones.length - 1 && <div className="cp-milestone-line" />}
              <div className="cp-milestone-content">
                <div className="cp-milestone-date">{m.date}</div>
                <div className="cp-milestone-label">{m.label}</div>
                <div className="cp-milestone-desc">
                  {m.desc}
                  {m.score && <span style={{ marginLeft: 8, fontWeight: 700, color: "var(--cp-green)" }}>→ {m.score}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
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
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "white", flexShrink: 0 }}>{initials}</div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "var(--cp-text-primary)" }}>{displayName}</div>
                <div style={{ fontSize: 12.5, color: "var(--cp-text-muted)", marginTop: 2 }}>{user?.email ?? "No email on file"}</div>
                <span style={{ display: "inline-block", marginTop: 6, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>{featureAccess.tierLabel}</span>
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
              <span style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>
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
   MAIN CLIENT PORTAL
   ═══════════════════════════════════════════════════════════════════ */
export default function ClientPortal() {
  const { user, logout } = useUserContext();
  const featureAccess = useFeatureAccess();
  const { appKey, userToken, tokenReady, tokenError } = useArrayToken();
  const { loaded: scriptReady } = useArrayScript(appKey || undefined);

  const [activePage, setActivePage] = useState<PageId>("home");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  /* ── Onboarding state ─────────────────────────────────────────── */
  const [onboardingDone, setOnboardingDone] = useState(() =>
    localStorage.getItem("ss_portal_onboarding_done") === "1"
  );
  const [onboardingGoal, setOnboardingGoal] = useState<OnboardingGoal | null>(null);
  const [onboardingTimeline, setOnboardingTimeline] = useState<OnboardingTimeline | null>(null);

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
  const sbx: Record<string, string> = {};

  /* ── Array page props ─────────────────────────────────────────── */
  const arrayProps: ArrayPageProps = { appKey, userToken, sbx, scriptReady, tokenReady, tokenError };

  /* ── Portal client ID for disputes ───────────────────────────── */
  const { data: sessionData } = useQuery<{ id: number }>({ queryKey: ["/api/session/user"] });
  const portalClientId = sessionData?.id ?? null;

  /* ── User info ────────────────────────────────────────────────── */
  const initials = user
    ? ((user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? user.username?.[0] ?? "")).toUpperCase() || "U"
    : "U";
  const displayName = user ? (user.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : user.username) : "User";

  /* ── Nav items ────────────────────────────────────────────────── */
  const NAV: { id: PageId; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "home", label: "Home", icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></> },
    { id: "plan", label: "My Plan", icon: <><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>, badge: "2" },
    { id: "dispute-iq", label: "Dispute IQ", icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></> },
    { id: "debt", label: "Debt Navigator", icon: <><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></> },
    { id: "protection", label: "Protection Center", icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></> },
    { id: "report", label: "Credit Report", icon: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></> },
    { id: "progress", label: "Progress", icon: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></> },
    { id: "profile", label: "Profile", icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></> },
  ];

  const PAGE_TITLES: Record<PageId, string> = {
    home: "Home",
    plan: "My Plan",
    "dispute-iq": "Dispute IQ",
    debt: "Debt Navigator",
    protection: "Protection Center",
    report: "Credit Report",
    progress: "Progress",
    profile: "Profile & Settings",
  };

  /* ── Render ───────────────────────────────────────────────────── */
  if (!onboardingDone) {
    return (
      <div className="cp-portal">
        <OnboardingScreen onDone={finishOnboarding} />
      </div>
    );
  }

  return (
    <div className="cp-portal">
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
          <div className="cp-user-avatar">{initials}</div>
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
          {activePage === "home" && <HomePage user={user} onNavigate={setActivePage} />}
          {activePage === "plan" && <PlanPage goal={onboardingGoal} onNavigate={setActivePage} />}
          {activePage === "dispute-iq" && <DisputeIQPage />}
          {activePage === "debt" && <DebtPage {...arrayProps} />}
          {activePage === "protection" && <ProtectionPage {...arrayProps} />}
          {activePage === "report" && <ReportPage {...arrayProps} />}
          {activePage === "progress" && <ProgressPage />}
          {activePage === "profile" && <ProfilePage user={user} logout={logout} featureAccess={featureAccess} />}
        </div>
      </div>
    </div>
  );
}
