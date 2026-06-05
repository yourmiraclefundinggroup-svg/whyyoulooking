import { useState } from "react";
import { Link } from "wouter";
import scoreshiftLogo from "@assets/scoreshift-logo.png";
import "../styles/portal-demo.css";

/* ── Types ─────────────────────────────────────────────── */
type DemoScreen = "dashboard" | "disputes" | "plan" | "report" | "letters" | "progress" | "identity" | "debt" | "monitoring" | "alerts";

const SCREEN_TITLE: Record<DemoScreen, string> = {
  dashboard: "Dashboard",
  disputes: "Dispute IQ",
  plan: "My Plan",
  report: "Credit Report",
  letters: "Smart Letters",
  progress: "Progress Tracker",
  identity: "Identity Guard",
  debt: "Debt Analysis",
  monitoring: "Credit Monitoring",
  alerts: "Score Alerts",
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
          <div className="pd-hero-name">Good morning, Jordan.</div>
          <div className="pd-hero-sub">Pro Plan · 4 disputes in progress · Specialist: Sarah K.</div>
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
            { name: "PORTFOLIO RECOVERY ASSOC", meta: "Collection · Opened Jan 2022", bureau: "EX", bColor: "#3B82F6", status: "pending", statusLabel: "Pending" },
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
        <div className="pd-disp-summary">4 disputes ready · Est. <strong style={{ color: "var(--pd-sage)" }}>+61 pts</strong> combined</div>
      </div>
      {[
        { name: "MIDLAND FUNDING LLC", meta: "Collection · Opened Mar 2021 · $1,240", priority: "high", pts: "+18 pts", bureau: "EX", bColor: "#3B82F6", law: "FCRA §1681e(b)" },
        { name: "CAPITAL ONE AUTO FINANCE", meta: "Late payment 30d · Aug 2023", priority: "medium", pts: "+12 pts", bureau: "EQ", bColor: "#EF4444", law: "FCRA §1681s-2(b)" },
        { name: "SYNC BANK CREDIT CARD", meta: "Hard inquiry · Mar 15, 2024", priority: "low", pts: "+9 pts", bureau: "TU", bColor: "#8B5CF6", law: "FCRA §1681b" },
        { name: "PORTFOLIO RECOVERY ASSOC", meta: "Collection · Opened Jan 2022 · $890", priority: "high", pts: "+22 pts", bureau: "EX", bColor: "#3B82F6", law: "FCRA §1681e(b)" },
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

/* ── Additional Screens ──────────────────────────────────── */
function ScreenReport() {
  return (
    <div className="pd-screen">
      <div className="pd-card" style={{ borderTop: "3px solid #3B82F6", marginBottom: 4 }}>
        <div className="pd-card-header">
          <div><div className="pd-card-title">Credit Report Summary</div><div className="pd-card-sub">Last updated June 3, 2025</div></div>
          <span className="pd-badge pd-badge-active">LIVE</span>
        </div>
      </div>
      <div className="pd-grid-2" style={{ marginBottom: 12 }}>
        {([["Experian","712","#3B82F6","Good"],["Equifax","705","#EF4444","Good"],["TransUnion","718","#8B5CF6","Good"]] as const).map(([bureau,score,color,rating]) => (
          <div key={bureau} className="pd-card" style={{ borderTop: `3px solid ${color}` }}>
            <div className="pd-score-bureau" style={{ color, fontWeight: 700, marginBottom: 4 }}>{bureau}</div>
            <div style={{ fontFamily: "var(--pd-font-display)", fontSize: 38, fontWeight: 800, color, letterSpacing: -2, lineHeight: 1 }}>{score}</div>
            <div style={{ fontSize: 11, color: "var(--pd-muted)", marginTop: 4 }}>{rating} · +12 pts since enrollment</div>
          </div>
        ))}
      </div>
      <div className="pd-card">
        <div className="pd-card-title" style={{ marginBottom: 12 }}>Negative Items</div>
        {[
          { name: "MIDLAND FUNDING LLC", type: "Collection", age: "Mar 2021", impact: "High", color: "#EF4444" },
          { name: "CAPITAL ONE AUTO", type: "Late Payment 30d", age: "Aug 2023", impact: "Med", color: "#F59E0B" },
          { name: "PORTFOLIO RECOVERY", type: "Collection", age: "Jan 2022", impact: "High", color: "#EF4444" },
        ].map(item => (
          <div key={item.name} className="pd-disp-row" style={{ marginBottom: 8 }}>
            <div className="pd-priority-dot high" style={{ background: item.color }} />
            <div style={{ flex: 1 }}>
              <div className="pd-disp-name">{item.name}</div>
              <div className="pd-disp-meta">{item.type} · {item.age}</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: item.color, background: `${item.color}18`, padding: "2px 7px", borderRadius: 20 }}>{item.impact}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScreenLetters() {
  return (
    <div className="pd-screen">
      <div className="pd-card" style={{ borderTop: "3px solid var(--pd-accent)", marginBottom: 4 }}>
        <div className="pd-card-header">
          <div><div className="pd-card-title">Smart Letters</div><div className="pd-card-sub">AI-generated, FCRA-compliant dispute packets</div></div>
          <button className="pd-btn pd-btn-primary" style={{ fontSize: 11 }}>+ New Letter</button>
        </div>
      </div>
      {[
        { name: "MIDLAND FUNDING LLC", bureau: "Experian", status: "draft", law: "FCRA §1681e(b)", date: "Jun 1, 2025" },
        { name: "CAPITAL ONE AUTO", bureau: "Equifax", status: "sent", law: "FCRA §1681s-2(b)", date: "May 22, 2025" },
        { name: "CITI BANK", bureau: "Experian", status: "won", law: "FCRA §1681i", date: "Apr 10, 2025" },
        { name: "PORTFOLIO RECOVERY", bureau: "Experian", status: "pending", law: "FCRA §1681e(b)", date: "May 30, 2025" },
      ].map(l => (
        <div key={l.name} className="pd-card" style={{ marginBottom: 8 }}>
          <div className="pd-disp-card-row">
            <div style={{ flex: 1 }}>
              <div className="pd-disp-card-name">{l.name}</div>
              <div className="pd-disp-card-meta">{l.bureau} · {l.date}</div>
              <span className="pd-law-cite">{l.law}</span>
            </div>
            <span className={`pd-status-badge ${l.status}`}>{l.status.charAt(0).toUpperCase() + l.status.slice(1)}</span>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button className="pd-btn pd-btn-secondary" style={{ fontSize: 11 }}>Preview</button>
            {l.status === "draft" && <button className="pd-btn pd-btn-primary" style={{ fontSize: 11 }}>Send via Mail</button>}
          </div>
        </div>
      ))}
    </div>
  );
}

function ScreenProgress() {
  return (
    <div className="pd-screen">
      <div className="pd-hero-card" style={{ padding: "16px 20px", marginBottom: 12 }}>
        <div>
          <div className="pd-hero-eye">PROGRESS TRACKER</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--pd-text)", marginTop: 4 }}>Score journey since enrollment</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: "var(--pd-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>Total gain</div>
          <div style={{ fontFamily: "var(--pd-font-display)", fontSize: 34, fontWeight: 800, color: "var(--pd-sage)", letterSpacing: -2, lineHeight: 1 }}>+47<span style={{ fontSize: 14 }}>pts</span></div>
        </div>
      </div>
      <div className="pd-grid-4" style={{ marginBottom: 12 }}>
        {[
          { label: "Start score", val: "665", color: "var(--pd-muted)" },
          { label: "Current", val: "712", color: "var(--pd-accent)" },
          { label: "Target", val: "760", color: "var(--pd-sage)" },
          { label: "Items removed", val: "2", color: "var(--pd-text)" },
        ].map(s => (
          <div key={s.label} className="pd-stat-card">
            <div style={{ fontFamily: "var(--pd-font-display)", fontSize: 28, fontWeight: 800, color: s.color, letterSpacing: -1.5 }}>{s.val}</div>
            <div className="pd-stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="pd-card">
        <div className="pd-card-title" style={{ marginBottom: 12 }}>Monthly milestones</div>
        {[
          { month: "Feb 2025", event: "Enrolled · Start score: 665", delta: "baseline" },
          { month: "Mar 2025", event: "CITI collection disputed + won", delta: "+22 pts" },
          { month: "Apr 2025", event: "Amex utilization reduced", delta: "+11 pts" },
          { month: "May 2025", event: "PORTFOLIO RECOVERY removed", delta: "+14 pts" },
          { month: "Jun 2025", event: "MIDLAND dispute in progress", delta: "pending" },
        ].map(m => (
          <div key={m.month} className="pd-disp-row" style={{ marginBottom: 8 }}>
            <div style={{ minWidth: 72, fontSize: 10, fontWeight: 700, color: "var(--pd-muted)" }}>{m.month}</div>
            <div className="pd-disp-meta" style={{ flex: 1 }}>{m.event}</div>
            <span style={{ fontSize: 11, fontWeight: 700, color: m.delta.startsWith("+") ? "var(--pd-sage)" : "var(--pd-muted)" }}>{m.delta}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScreenIdentity() {
  return (
    <div className="pd-screen">
      <div className="pd-card" style={{ borderTop: "3px solid var(--pd-sage)", marginBottom: 4 }}>
        <div className="pd-card-header">
          <div><div className="pd-card-title">Identity Guard</div><div className="pd-card-sub">Dark web + personal info monitoring</div></div>
          <span className="pd-badge pd-badge-active" style={{ background: "rgba(107,174,138,0.15)", color: "var(--pd-sage)" }}>Protected</span>
        </div>
      </div>
      <div className="pd-grid-2" style={{ marginBottom: 12 }}>
        <div className="pd-card">
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--pd-muted)", marginBottom: 6 }}>Dark Web Alerts</div>
          <div style={{ fontFamily: "var(--pd-font-display)", fontSize: 34, fontWeight: 800, color: "#F59E0B", letterSpacing: -2 }}>1</div>
          <div style={{ fontSize: 11, color: "var(--pd-muted)" }}>Email found in 1 breach · 2022</div>
        </div>
        <div className="pd-card">
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--pd-muted)", marginBottom: 6 }}>SSN Status</div>
          <div style={{ fontFamily: "var(--pd-font-display)", fontSize: 34, fontWeight: 800, color: "var(--pd-sage)", letterSpacing: -2 }}>Safe</div>
          <div style={{ fontSize: 11, color: "var(--pd-muted)" }}>No suspicious usage detected</div>
        </div>
      </div>
      <div className="pd-card">
        <div className="pd-card-title" style={{ marginBottom: 12 }}>Monitored items</div>
        {["Email address","Phone number","SSN (last 4)","Date of birth","Home address"].map(item => (
          <div key={item} className="pd-disp-row" style={{ marginBottom: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--pd-sage)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <div style={{ flex: 1, fontSize: 12, color: "var(--pd-text)" }}>{item}</div>
            <span style={{ fontSize: 10, color: "var(--pd-sage)", fontWeight: 600 }}>Monitored</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScreenDebt() {
  return (
    <div className="pd-screen">
      <div className="pd-card" style={{ borderTop: "3px solid var(--pd-accent)", marginBottom: 4 }}>
        <div className="pd-card-header">
          <div><div className="pd-card-title">Debt Analysis</div><div className="pd-card-sub">Smart payoff strategy</div></div>
        </div>
      </div>
      <div className="pd-grid-2" style={{ marginBottom: 12 }}>
        <div className="pd-card">
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--pd-muted)", marginBottom: 6 }}>Total tracked debt</div>
          <div style={{ fontFamily: "var(--pd-font-display)", fontSize: 28, fontWeight: 800, color: "var(--pd-text)", letterSpacing: -1.5 }}>$14,820</div>
        </div>
        <div className="pd-card">
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--pd-muted)", marginBottom: 6 }}>Credit utilization</div>
          <div style={{ fontFamily: "var(--pd-font-display)", fontSize: 28, fontWeight: 800, color: "#F59E0B", letterSpacing: -1.5 }}>38%</div>
          <div style={{ fontSize: 11, color: "var(--pd-muted)" }}>Target: below 30%</div>
        </div>
      </div>
      <div className="pd-card">
        <div className="pd-card-title" style={{ marginBottom: 12 }}>Payoff priority</div>
        {[
          { name: "Capital One Quicksilver", bal: "$2,100", apr: "24.9%", rec: "Pay first", color: "#EF4444" },
          { name: "Chase Freedom", bal: "$3,400", apr: "19.9%", rec: "Pay second", color: "#F59E0B" },
          { name: "Discover it", bal: "$980", apr: "14.9%", rec: "Minimum only", color: "var(--pd-sage)" },
        ].map(d => (
          <div key={d.name} className="pd-disp-row" style={{ marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <div className="pd-disp-name">{d.name}</div>
              <div className="pd-disp-meta">{d.bal} · APR {d.apr}</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: d.color }}>{d.rec}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScreenMonitoring() {
  return (
    <div className="pd-screen">
      <div className="pd-card" style={{ borderTop: "3px solid var(--pd-accent)", marginBottom: 4 }}>
        <div className="pd-card-header">
          <div><div className="pd-card-title">Credit Monitoring</div><div className="pd-card-sub">Real-time changes across all 3 bureaus</div></div>
          <span className="pd-badge pd-badge-active">Live</span>
        </div>
      </div>
      <div className="pd-grid-2" style={{ marginBottom: 12 }}>
        {([["Experian","712","+12","#3B82F6"],["Equifax","705","+12","#EF4444"],["TransUnion","718","+12","#8B5CF6"]] as const).map(([bureau,score,change,color]) => (
          <div key={bureau} className="pd-card" style={{ borderLeft: `3px solid ${color}` }}>
            <div style={{ fontWeight: 700, fontSize: 11, color, marginBottom: 4 }}>{bureau}</div>
            <div style={{ fontFamily: "var(--pd-font-display)", fontSize: 32, fontWeight: 800, color, letterSpacing: -1.5, lineHeight: 1 }}>{score}</div>
            <div style={{ fontSize: 11, color: "var(--pd-sage)", marginTop: 4 }}>{change} pts this month ↑</div>
          </div>
        ))}
      </div>
      <div className="pd-card">
        <div className="pd-card-title" style={{ marginBottom: 12 }}>Recent alerts</div>
        {[
          { date: "Jun 3", event: "Experian score updated: 700 → 712", type: "positive" },
          { date: "May 22", event: "Certified mail delivered to Experian", type: "info" },
          { date: "May 10", event: "New hard inquiry detected (Sync Bank)", type: "warning" },
          { date: "Apr 28", event: "PORTFOLIO RECOVERY removed from report", type: "positive" },
        ].map(a => (
          <div key={a.date} className="pd-disp-row" style={{ marginBottom: 8 }}>
            <div style={{ minWidth: 50, fontSize: 10, fontWeight: 700, color: "var(--pd-muted)" }}>{a.date}</div>
            <div className="pd-disp-meta" style={{ flex: 1 }}>{a.event}</div>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.type === "positive" ? "var(--pd-sage)" : a.type === "warning" ? "#F59E0B" : "var(--pd-accent)", flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ScreenAlerts() {
  return (
    <div className="pd-screen">
      <div className="pd-card" style={{ borderTop: "3px solid var(--pd-accent)", marginBottom: 4 }}>
        <div className="pd-card-header">
          <div><div className="pd-card-title">Score Alerts</div><div className="pd-card-sub">Instant notifications on score changes</div></div>
          <span className="pd-badge pd-badge-active">Active</span>
        </div>
      </div>
      <div className="pd-grid-4" style={{ marginBottom: 12 }}>
        {[
          { val: "3", label: "Alerts this month", color: "var(--pd-accent)" },
          { val: "+47", label: "Total pts gained", color: "var(--pd-sage)" },
          { val: "All 3", label: "Bureaus monitored", color: "var(--pd-text)" },
          { val: "< 2h", label: "Alert response time", color: "var(--pd-muted)" },
        ].map(s => (
          <div key={s.label} className="pd-stat-card">
            <div style={{ fontFamily: "var(--pd-font-display)", fontSize: 26, fontWeight: 800, color: s.color, letterSpacing: -1.5, lineHeight: 1 }}>{s.val}</div>
            <div className="pd-stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="pd-card">
        <div className="pd-card-title" style={{ marginBottom: 12 }}>Alert history</div>
        {[
          { icon: "↑", label: "Score increase", detail: "Experian: 700 → 712", date: "Jun 3, 2025", color: "var(--pd-sage)" },
          { icon: "!", label: "New inquiry", detail: "Sync Bank hard pull detected", date: "May 10, 2025", color: "#F59E0B" },
          { icon: "✓", label: "Item removed", detail: "PORTFOLIO RECOVERY off Experian", date: "Apr 28, 2025", color: "var(--pd-sage)" },
          { icon: "↑", label: "Score increase", detail: "Equifax: 688 → 705", date: "Apr 15, 2025", color: "var(--pd-sage)" },
        ].map(a => (
          <div key={a.detail} className="pd-disp-row" style={{ marginBottom: 10 }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: `${a.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: a.color, flexShrink: 0 }}>{a.icon}</div>
            <div style={{ flex: 1 }}>
              <div className="pd-disp-name">{a.label}</div>
              <div className="pd-disp-meta">{a.detail}</div>
            </div>
            <div style={{ fontSize: 10, color: "var(--pd-muted)" }}>{a.date}</div>
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
                    setScreen(n.id as DemoScreen);
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
            <div className="pd-user-av">JK</div>
            <div>
              <div className="pd-user-name">Jordan K.</div>
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
            {screen === "report" && <ScreenReport />}
            {screen === "letters" && <ScreenLetters />}
            {screen === "progress" && <ScreenProgress />}
            {screen === "identity" && <ScreenIdentity />}
            {screen === "debt" && <ScreenDebt />}
            {screen === "monitoring" && <ScreenMonitoring />}
            {screen === "alerts" && <ScreenAlerts />}
          </div>
        </div>
      </div>

      {mobileOpen && <div className="pd-overlay" onClick={() => setMobileOpen(false)} />}
    </div>
  );
}
