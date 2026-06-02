import { useState, useEffect } from "react";
import scoreshiftLogo from "@assets/scoreshift-logo.png";
import { useQuery } from "@tanstack/react-query";
import { useUserContext } from "@/hooks/use-user-context";
import { useArrayScript } from "@/hooks/use-array-script";
import { useArrayToken } from "@/hooks/use-array-token";
import { useFeatureAccess } from "@/hooks/use-feature-access";
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
};

function HomePage({ user, goal, timeline, onNavigate, appKey, userToken, sbx, scriptReady, tokenReady, tokenError }: HomePageProps) {
  const displayName = user?.firstName || user?.username || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const { data: activeRaw, isLoading: disputesLoading } = useQuery<EnrichedDispute[]>({
    queryKey: ["/api/client/disputes?status=active"],
  });
  const activeDisputes: EnrichedDispute[] = Array.isArray(activeRaw) ? activeRaw : [];
  const topDispute = activeDisputes[0] ?? null;

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
               ? <><strong style={{ color: "var(--cp-teal)" }}>{activeDisputes.length} dispute{activeDisputes.length !== 1 ? "s" : ""} in progress</strong> — check Dispute IQ for updates.</>
               : "Pull your credit report to start identifying issues and building your action plan."}
          </div>
        </div>
        <div className="cp-home-hero-scores">
          {!scriptReady || (!tokenReady && !tokenError) ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div className="cp-array-spinner" style={{ borderColor: "rgba(255,255,255,0.2)", borderTopColor: "rgba(255,255,255,0.85)", width: 28, height: 28, borderWidth: 2.5 }} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Loading scores…</span>
            </div>
          ) : tokenError ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.65)", marginBottom: 10, lineHeight: 1.5 }}>
                Credit data not connected yet.<br />Pull your report to see live scores.
              </div>
              <button className="cp-btn cp-btn-sm" style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.24)", color: "white", fontSize: 12 }} onClick={() => onNavigate("report")}>
                Get Started →
              </button>
            </div>
          ) : (
            <div style={{ minWidth: 160, maxWidth: 240 }}>
              <array-credit-score appKey={appKey} userToken={userToken} bureau="all" {...sbx} />
            </div>
          )}
        </div>
      </div>

      {/* Goal banner */}
      {goal && (
        <div className="cp-card cp-mb-24" style={{ borderLeft: "4px solid var(--cp-accent)" }}>
          <div className="cp-flex-between cp-mb-18">
            <div>
              <div className="cp-card-eyebrow">YOUR GOAL</div>
              <div className="cp-card-title" style={{ margin: "4px 0 2px" }}>
                {GOALS.find(g => g.id === goal)?.icon} {GOALS.find(g => g.id === goal)?.label}
              </div>
              {timeline && (
                <div className="cp-card-subtitle">Timeline: {TIMELINES.find(t => t.id === timeline)?.label}</div>
              )}
            </div>
          </div>
          <p style={{ fontSize: 13.5, color: "var(--cp-text-secondary)", lineHeight: 1.6, margin: 0 }}>
            {GOAL_SUMMARIES[goal]}
          </p>
        </div>
      )}

      {/* Next Best Action */}
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
              <button className="cp-btn cp-btn-primary" onClick={() => onNavigate("dispute-iq")}>
                Track in Dispute IQ
                <Icon size={15}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></Icon>
              </button>
              <button className="cp-btn cp-btn-secondary cp-btn-sm" onClick={() => onNavigate("plan")}>View full plan</button>
            </div>
          </>
        ) : (
          <>
            <div className="cp-nba-title">Analyze your credit report for disputes</div>
            <div className="cp-nba-detail">Dispute IQ scans your report for FCRA violations and Metro 2 errors, then generates a personalized dispute strategy and letters.</div>
            <div className="cp-nba-footer">
              <button className="cp-btn cp-btn-primary" onClick={() => onNavigate("dispute-iq")}>
                Open Dispute IQ
                <Icon size={15}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></Icon>
              </button>
              <button className="cp-btn cp-btn-secondary cp-btn-sm" onClick={() => onNavigate("report")}>Review My Scores</button>
            </div>
          </>
        )}
      </div>

      {/* Active disputes queue + Quick actions */}
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
              <div className="cp-card-title">Quick Actions</div>
              <div className="cp-card-subtitle">Tools for your credit journey</div>
            </div>
          </div>
          {[
            { label: "Analyze report for disputes", detail: "Find FCRA violations and Metro 2 errors", page: "dispute-iq" as PageId, color: "var(--cp-red)" },
            { label: "Review 3-bureau scores", detail: "Live VantageScore 3.0 across all bureaus", page: "report" as PageId, color: "var(--cp-accent)" },
            { label: "Analyze debt & utilization", detail: "Payoff strategies and live account breakdown", page: "debt" as PageId, color: "var(--cp-amber)" },
            { label: "Monitor identity & alerts", detail: "Real-time bureau monitoring", page: "protection" as PageId, color: "var(--cp-teal)" },
          ].map((a, i) => (
            <div key={i} className="cp-action-row" style={{ cursor: "pointer" }} onClick={() => onNavigate(a.page)}>
              <div className="cp-action-rank" style={{ background: `${a.color}15`, borderColor: `${a.color}40`, color: a.color }}>{i + 1}</div>
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
function PlanPage({ goal, timeline, onNavigate }: { goal: OnboardingGoal | null; timeline: OnboardingTimeline | null; onNavigate: (page: PageId) => void }) {
  const { data: activeRaw, isLoading: loadingActive } = useQuery<EnrichedDispute[]>({
    queryKey: ["/api/client/disputes?status=active"],
  });
  const { data: pendingRaw, isLoading: loadingPending } = useQuery<EnrichedDispute[]>({
    queryKey: ["/api/client/disputes?status=pending"],
  });
  const isLoading = loadingActive || loadingPending;
  const activeArr: EnrichedDispute[] = Array.isArray(activeRaw) ? activeRaw : [];
  const pendingArr: EnrichedDispute[] = Array.isArray(pendingRaw) ? pendingRaw : [];
  const active: EnrichedDispute[] = [...activeArr, ...pendingArr];
  const goalLabel = goal ? GOALS.find(g => g.id === goal)?.label : null;
  const timelineLabel = timeline ? TIMELINES.find(t => t.id === timeline)?.label : null;

  const RECOMMENDED = [
    { title: "Review your full 3-bureau report", detail: "Check for new items, inquiries, and bureau reporting differences.", tool: "Credit Report", page: "report" as PageId, color: "var(--cp-accent)" },
    { title: "Analyze debt and utilization", detail: "High utilization is one of the biggest score drags. Review your current levels.", tool: "Debt Navigator", page: "debt" as PageId, color: "var(--cp-amber)" },
    { title: "Monitor for new alerts", detail: "Check credit alerts and identity protection for any new bureau activity.", tool: "Protection Center", page: "protection" as PageId, color: "var(--cp-teal)" },
  ];

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
        {active.length > 0 && <span className="cp-badge warning">{active.length} active</span>}
      </div>

      {isLoading ? (
        <div className="cp-card" style={{ padding: "48px 20px", textAlign: "center" }}>
          <div className="cp-array-spinner" style={{ margin: "0 auto 12px" }} />
          <div style={{ fontSize: 13, color: "var(--cp-text-muted)" }}>Loading your plan…</div>
        </div>
      ) : active.length === 0 ? (
        <div className="cp-card cp-mb-24">
          <div className="cp-empty-state">
            <div className="cp-empty-icon">
              <Icon size={22}><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></Icon>
            </div>
            <div className="cp-empty-title">No active disputes yet</div>
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
        <div className="cp-mb-24">
          <div className="cp-plan-section-header cp-mb-18">
            <div style={{ width: 4, height: 18, borderRadius: 2, background: "var(--cp-red)", flexShrink: 0 }} />
            <span className="cp-plan-section-title" style={{ color: "var(--cp-red)" }}>Active Disputes</span>
            <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: "rgba(239,68,68,0.1)", color: "var(--cp-red)", border: "1px solid rgba(239,68,68,0.2)" }}>Act Now</span>
            <span style={{ fontSize: 11.5, color: "var(--cp-text-muted)", marginLeft: "auto" }}>{active.length} dispute{active.length !== 1 ? "s" : ""}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 10 }}>
            {active.map(d => (
              <div key={d.id} className="cp-plan-action-card" style={{ borderLeft: "4px solid var(--cp-red)" }}>
                <div className="cp-plan-action-header">
                  <div style={{ display: "flex", alignItems: "center", gap: 7, flex: 1, flexWrap: "wrap" }}>
                    <span className="cp-plan-category">Dispute</span>
                    <span className="cp-plan-bureau">{d.bureau}</span>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--cp-red)", background: "rgba(239,68,68,0.08)", padding: "1px 8px", borderRadius: 10 }}>Dispute IQ</span>
                  </div>
                  <span className={`cp-pill ${
                    d.status === "PENDING" || d.status === "SENT" ? "pending" :
                    d.status === "DELIVERED" ? "active" :
                    d.status === "FOLLOW_UP_REQUIRED" ? "warning" :
                    d.status === "RESOLVED" ? "resolved" : "negative"
                  }`}>
                    {d.status === "PENDING" ? "Letter Ready" : d.status === "SENT" ? "Awaiting Delivery" : d.status === "DELIVERED" ? "Bureau Reviewing" : d.status === "FOLLOW_UP_REQUIRED" ? "Follow-up Required" : d.status}
                  </span>
                </div>
                <div className="cp-plan-action-title">{d.issueTitle}</div>
                <div className="cp-plan-action-detail">{d.creditor} · Sent {fmtDate(d.dateSent)} · Deadline: {fmtDate(d.expectedResponse)}</div>
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

      <div className="cp-plan-section-header cp-mb-18" style={{ marginTop: active.length > 0 ? 28 : 0 }}>
        <div style={{ width: 4, height: 18, borderRadius: 2, background: "var(--cp-accent)", flexShrink: 0 }} />
        <span className="cp-plan-section-title" style={{ color: "var(--cp-accent)" }}>Recommended Next Steps</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {RECOMMENDED.map((a, i) => (
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
function DebtPage({ appKey, userToken, sbx, scriptReady, tokenReady, tokenError }: ArrayPageProps) {
  const [subTab, setSubTab] = useState("analysis");
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
            <span>Credit data not yet connected — pull your report to see live scores.</span>
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
  const { data: activeRaw = [], isLoading: loadA } = useQuery<EnrichedDispute[]>({ queryKey: ["/api/client/disputes?status=active"] });
  const { data: resolvedRaw = [], isLoading: loadR } = useQuery<EnrichedDispute[]>({ queryKey: ["/api/client/disputes?status=resolved"] });
  const isLoading = loadA || loadR;
  const active: EnrichedDispute[] = Array.isArray(activeRaw) ? activeRaw : [];
  const resolved: EnrichedDispute[] = Array.isArray(resolvedRaw) ? resolvedRaw : [];
  const allDisputes = [...active, ...resolved];
  const removedCount = resolved.filter(d => d.outcome === "removed").length;
  const hasData = allDisputes.length > 0;
  const events = buildLifecycleEvents(allDisputes);

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

      <div className="cp-grid-4 cp-mb-24">
        {[
          { label: "Total Disputes", val: isLoading ? "—" : allDisputes.length.toString(), color: "var(--cp-accent)" },
          { label: "Active", val: isLoading ? "—" : active.length.toString(), color: "var(--cp-amber)" },
          { label: "Items Removed", val: isLoading ? "—" : removedCount.toString(), color: "var(--cp-green)" },
          { label: "Resolved", val: isLoading ? "—" : resolved.length.toString(), color: "var(--cp-teal)" },
        ].map(s => (
          <div key={s.label} className="cp-stat-card">
            <div>
              <div className="cp-stat-value" style={{ color: s.color }}>{s.val}</div>
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
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg,#9B89C8,#7B6AAB)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "white", flexShrink: 0 }}>{initials}</div>
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
   MAIN CLIENT PORTAL
   ═══════════════════════════════════════════════════════════════════ */
export default function ClientPortal() {
  const { user, logout } = useUserContext();
  const featureAccess = useFeatureAccess();
  const { appKey, token: userToken, isReady: tokenReady, error: tokenError, apiUrl, sandboxMode } = useArrayToken();
  const { loaded: scriptReady } = useArrayScript(appKey || undefined);

  const [activePage, setActivePage] = useState<PageId>("home");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
          {activePage === "home" && <HomePage user={user} goal={onboardingGoal} timeline={onboardingTimeline} onNavigate={setActivePage} appKey={appKey} userToken={userToken} sbx={sbx} scriptReady={scriptReady} tokenReady={tokenReady} tokenError={tokenError} />}
          {activePage === "plan" && <PlanPage goal={onboardingGoal} timeline={onboardingTimeline} onNavigate={setActivePage} />}
          {activePage === "dispute-iq" && <RealDisputeIQPage />}
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
