import { useState } from "react";
import { Link } from "wouter";
import scoreshiftLogo from "@assets/scoreshift-logo.png";
import "../styles/portal-demo.css";

/* ── Types ─────────────────────────────────────────────── */
type DemoScreen = "dashboard" | "disputes" | "plan";

const SCREEN_TITLE: Record<DemoScreen, string> = {
  dashboard: "Dashboard",
  disputes: "Dispute IQ",
  plan: "My Plan",
};

const ALL_NAV = [
  { id: "dashboard", section: "Overview", label: "Dashboard",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { id: "plan", section: null, label: "My Plan",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { id: "report", section: null, label: "Credit Report",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
  { id: "disputes", section: null, label: "Dispute IQ", badge: "3",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
  { id: "letters", section: "Tools", label: "Smart Letters",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
  { id: "progress", section: null, label: "Progress Tracker",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg> },
  { id: "identity", section: null, label: "Identity Guard",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  { id: "debt", section: null, label: "Debt Analysis",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
  { id: "monitoring", section: "Credit", label: "Credit Monitoring",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> },
  { id: "alerts", section: null, label: "Score Alerts",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
];

/* ── Screens ───────────────────────────────────────────── */
function ScreenDashboard({ onNavigate }: { onNavigate: (s: DemoScreen) => void }) {
  return (
    <div className="pd-screen">
      {/* Hero */}
      <div className="pd-hero-card">
        <div className="pd-hero-left">
          <div className="pd-hero-eye">CREDIT ACTION PLAN · DEMO MODE</div>
          <div className="pd-hero-name">Good morning, Alex.</div>
          <div className="pd-hero-sub">Pro Plan · 3 disputes in progress · Specialist: Sarah K.</div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <span className="pd-badge pd-badge-active">ACTIVE</span>
            <span style={{ fontSize: 11, color: "var(--pd-muted)", fontWeight: 500 }}>68% readiness · 4 of 6 actions done</span>
            <span style={{ fontSize: 11, color: "var(--pd-muted)" }}>Enrolled Feb 12, 2025</span>
          </div>
        </div>
        <div className="pd-hero-scores">
          {([["712","Experian","#3B82F6"],["705","Equifax","#EF4444"],["718","TransUnion","#8B5CF6"]] as const).map(([v,n,c]) => (
            <div key={n} className="pd-score-chip">
              <div className="pd-score-bureau">{n}</div>
              <div className="pd-score-val" style={{ color: c }}>{v}</div>
              <div className="pd-score-change">+12 ↑</div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="pd-grid-2">
        {/* Next best action */}
        <div className="pd-card">
          <div className="pd-card-header">
            <div><div className="pd-card-title">Next Best Action</div><div className="pd-card-sub">Highest priority item</div></div>
          </div>
          <div className="pd-nba">
            <span className="pd-nba-icon">⚡</span>
            <div className="pd-nba-body">
              <div className="pd-nba-title">Dispute MIDLAND FUNDING LLC</div>
              <div className="pd-nba-meta">Collection · Est. +18 pts · Ready to generate</div>
            </div>
          </div>
          <button className="pd-btn pd-btn-primary" onClick={() => onNavigate("disputes")} style={{ marginTop: 16, fontSize: 12 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            Generate Dispute Letter
          </button>
        </div>

        {/* Plan progress */}
        <div className="pd-card">
          <div className="pd-card-header">
            <div><div className="pd-card-title">Plan Progress</div><div className="pd-card-sub">4 of 6 actions complete</div></div>
            <span style={{ fontFamily: "var(--pd-font-display)", fontSize: 28, fontWeight: 800, color: "var(--pd-accent)", letterSpacing: -1.5 }}>68%</span>
          </div>
          <div className="pd-progress-track"><div className="pd-progress-fill" style={{ width: "68%" }} /></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 14 }}>
            {["Dispute CITI collection — Sent ✓","Lower Amex utilization — Done ✓","Remove PORTFOLIO RECOVERY — Won ✓","Add authorized tradeline — Done ✓"].map(a => (
              <div key={a} className="pd-done-row">{a}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="pd-grid-4">
        {[
          { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/></svg>, val: "+47", label: "Points gained", color: "indigo" },
          { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>, val: "2", label: "Items removed", color: "sage" },
          { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>, val: "3", label: "Active disputes", color: "amber" },
          { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, val: "38d", label: "Avg. response time", color: "indigo" },
        ].map(s => (
          <div key={s.label} className="pd-stat-card">
            <div className={`pd-stat-icon ${s.color}`}>{s.icon}</div>
            <div className="pd-stat-val">{s.val}</div>
            <div className="pd-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent disputes */}
      <div className="pd-card">
        <div className="pd-card-header">
          <div><div className="pd-card-title">Recent Disputes</div><div className="pd-card-sub">Last 30 days</div></div>
          <button className="pd-btn-text" onClick={() => onNavigate("disputes")}>View all →</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { name: "MIDLAND FUNDING LLC", meta: "Collection · Opened Mar 2021", bureau: "EX", bColor: "#3B82F6", status: "pending", statusLabel: "Pending" },
            { name: "CAPITAL ONE AUTO", meta: "Late payment 30d · Aug 2023", bureau: "EQ", bColor: "#EF4444", status: "won", statusLabel: "Won" },
            { name: "SYNC BANK CREDIT CARD", meta: "Hard inquiry · Mar 2024", bureau: "TU", bColor: "#8B5CF6", status: "sent", statusLabel: "Sent" },
          ].map(d => (
            <div key={d.name} className="pd-disp-row">
              <span className="pd-bureau-badge" style={{ background: d.bColor }}>{d.bureau}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="pd-disp-name">{d.name}</div>
                <div className="pd-disp-meta">{d.meta}</div>
              </div>
              <span className={`pd-status-badge ${d.status}`}>{d.statusLabel}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScreenDisputes() {
  return (
    <div className="pd-screen">
      <div className="pd-card" style={{ borderTop: "3px solid var(--pd-accent)", marginBottom: 4 }}>
        <div className="pd-disp-summary">3 disputes ready · Est. <strong style={{ color: "var(--pd-sage)" }}>+52 pts</strong> combined</div>
      </div>
      {[
        { name: "MIDLAND FUNDING LLC", meta: "Collection · Opened Mar 2021 · $1,240", priority: "high", pts: "+18 pts", bureau: "EX", bColor: "#3B82F6", law: "FCRA §1681e(b)" },
        { name: "CAPITAL ONE AUTO FINANCE", meta: "Late payment 30d · Aug 2023", priority: "medium", pts: "+12 pts", bureau: "EQ", bColor: "#EF4444", law: "FCRA §1681s-2(b)" },
        { name: "SYNC BANK CREDIT CARD", meta: "Hard inquiry · Mar 15, 2024", priority: "low", pts: "+9 pts", bureau: "TU", bColor: "#8B5CF6", law: "FCRA §1681b" },
      ].map(d => (
        <div key={d.name} className="pd-card pd-disp-card">
          <div className="pd-disp-card-row">
            <div className={`pd-priority-dot ${d.priority}`} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="pd-disp-card-name">{d.name}</div>
              <div className="pd-disp-card-meta">{d.meta}</div>
              <span className="pd-law-cite">{d.law}</span>
            </div>
            <span className="pd-bureau-badge" style={{ background: d.bColor }}>{d.bureau}</span>
            <span className="pd-pts-badge">{d.pts}</span>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="pd-btn pd-btn-primary" style={{ fontSize: 11 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Generate Letter
            </button>
            <button className="pd-btn pd-btn-secondary" style={{ fontSize: 11 }}>View Details</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ScreenPlan({ onNavigate }: { onNavigate: (s: DemoScreen) => void }) {
  return (
    <div className="pd-screen">
      <div className="pd-hero-card" style={{ padding: "16px 20px" }}>
        <div>
          <div className="pd-hero-eye">CREDIT ACTION PLAN</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--pd-text)", marginTop: 4 }}>6 prioritized actions · 68% complete</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: "var(--pd-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>Readiness</div>
          <div style={{ fontFamily: "var(--pd-font-display)", fontSize: 34, fontWeight: 800, color: "var(--pd-accent)", letterSpacing: -2, lineHeight: 1 }}>68<span style={{ fontSize: 14, fontWeight: 500, letterSpacing: 0, color: "var(--pd-muted)" }}>%</span></div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { rank: 1, done: true, title: "Dispute CITI BANK collection", sub: "Sent via certified mail · Won", pts: "+22 pts" },
          { rank: 2, done: true, title: "Lower Amex utilization", sub: "Paid down to 28% — completed", pts: "+18 pts" },
          { rank: 3, done: true, title: "Remove PORTFOLIO RECOVERY", sub: "Removed from Experian", pts: "+15 pts" },
          { rank: 4, done: true, title: "Add authorized user tradeline", sub: "Partner account added successfully", pts: "+11 pts" },
          { rank: 5, done: false, title: "Dispute MIDLAND FUNDING", sub: "Ready to generate letter", pts: "+18 pts" },
          { rank: 6, done: false, title: "Reduce Chase card utilization", sub: "Target: below 20%", pts: "+12 pts" },
        ].map(a => (
          <div key={a.rank} className={`pd-plan-item${a.done ? " done" : ""}`}>
            <div className={`pd-plan-rank${a.done ? " done" : ""}`}>
              {a.done
                ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                : a.rank}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="pd-plan-title">{a.title}</div>
              <div className="pd-plan-sub">{a.sub}</div>
            </div>
            <span className={`pd-plan-pts${a.done ? " done" : ""}`}>{a.pts}</span>
            {!a.done && (
              <button className="pd-btn pd-btn-primary" style={{ fontSize: 11, padding: "5px 12px" }} onClick={() => onNavigate("disputes")}>Start</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Demo Banner ─────────────────────────────────────────── */
function DemoBanner() {
  return (
    <div className="pd-demo-banner">
      <span className="pd-demo-dot" />
      <span>Demo mode — this is a preview of your ScoreShift portal</span>
      <Link href="/get-started" className="pd-demo-cta">Get started free →</Link>
    </div>
  );
}

/* ── Portal Demo Page ────────────────────────────────────── */
export default function PortalDemo() {
  const [screen, setScreen] = useState<DemoScreen>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="pd-root">
      <DemoBanner />
      <div className="pd-layout">
        {/* Sidebar */}
        <aside className={`pd-sidebar${mobileOpen ? " open" : ""}`}>
          <Link href="/" className="pd-sidebar-logo">
            <img src={scoreshiftLogo} alt="ScoreShift" width={24} height={24} style={{ objectFit: "contain" }} />
            ScoreShift
          </Link>
          <nav className="pd-sidebar-nav">
            {ALL_NAV.map(n => (
              <div key={n.id}>
                {n.section && <div className="pd-nav-section">{n.section}</div>}
                <button
                  className={`pd-nav-item${screen === n.id ? " active" : ""}`}
                  onClick={() => {
                    if (["dashboard", "disputes", "plan"].includes(n.id)) {
                      setScreen(n.id as DemoScreen);
                    }
                    setMobileOpen(false);
                  }}
                >
                  {n.icon}
                  {n.label}
                  {"badge" in n && n.badge && <span className="pd-nav-badge">{n.badge}</span>}
                </button>
              </div>
            ))}
          </nav>
          <div className="pd-sidebar-user">
            <div className="pd-user-av">AJ</div>
            <div>
              <div className="pd-user-name">Alex Johnson</div>
              <div className="pd-user-plan">Pro Plan · Demo</div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="pd-main">
          {/* Topbar */}
          <div className="pd-topbar">
            <button className="pd-mobile-btn" onClick={() => setMobileOpen(!mobileOpen)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <span className="pd-topbar-title">{SCREEN_TITLE[screen]}</span>
            <div className="pd-topbar-right">
              <span className="pd-plan-chip">Pro</span>
              <button className="pd-icon-btn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="pd-content">
            {screen === "dashboard" && <ScreenDashboard onNavigate={setScreen} />}
            {screen === "disputes" && <ScreenDisputes />}
            {screen === "plan" && <ScreenPlan onNavigate={setScreen} />}
          </div>
        </div>
      </div>

      {mobileOpen && <div className="pd-overlay" onClick={() => setMobileOpen(false)} />}
    </div>
  );
}
