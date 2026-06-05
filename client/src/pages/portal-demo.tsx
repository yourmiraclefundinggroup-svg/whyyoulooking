import React, { useState, useRef, useEffect } from "react";
import scoreshiftLogo from "@assets/scoreshift-logo.png";
import "@/styles/portal.css";
import "@/styles/portal-demo.css";

/* ── Icon helper — mirrors client-portal.tsx exactly ──────── */
function Icon({ children, size = 16 }: { children: React.ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

/* ── Page types — mirrors client-portal.tsx ──────────────── */
type PageId = "home" | "plan" | "dispute-iq" | "debt" | "subscriptions" | "student-loans" | "protection" | "report" | "progress" | "profile" | "payment-center";

const PAGE_TITLES: Record<PageId, string> = {
  home: "Home",
  plan: "My Plan",
  "dispute-iq": "Dispute IQ",
  debt: "Debt Navigator",
  subscriptions: "Subscription Manager",
  "student-loans": "Student Loan Aid",
  protection: "Protection Center",
  report: "Credit Report",
  progress: "Progress",
  profile: "Profile & Settings",
  "payment-center": "Payment Center",
};

/* ── Hardcoded demo data ──────────────────────────────────── */
const DEMO = {
  scores: [
    { bureau: "EXPERIAN",   abbr: "EX", color: "#3B82F6", val: 712, change: "+12" },
    { bureau: "EQUIFAX",    abbr: "EQ", color: "#EF4444", val: 705, change: "+12" },
    { bureau: "TRANSUNION", abbr: "TU", color: "#8B5CF6", val: 718, change: "+12" },
  ],
  disputes: [
    { name: "MIDLAND FUNDING LLC",   type: "Collection",   bureau: "EX", bColor: "#3B82F6", status: "pending", pts: "+18", date: "Mar 2021" },
    { name: "CAPITAL ONE AUTO",      type: "Late 30d",     bureau: "EQ", bColor: "#EF4444", status: "won",     pts: "+12", date: "Aug 2023" },
    { name: "SYNC BANK CREDIT CARD", type: "Hard inquiry", bureau: "TU", bColor: "#8B5CF6", status: "sent",    pts: "+9",  date: "Mar 2024" },
    { name: "PORTFOLIO RECOVERY",    type: "Collection",   bureau: "EX", bColor: "#3B82F6", status: "won",     pts: "+22", date: "Jan 2023" },
  ],
  actions: [
    { rank: 1, done: true,  title: "Dispute CITI BANK collection",  sub: "Sent via certified mail",   pts: "+22" },
    { rank: 2, done: true,  title: "Lower utilization on Amex",     sub: "Paid down to 28%",          pts: "+18" },
    { rank: 3, done: true,  title: "Remove PORTFOLIO RECOVERY",     sub: "Removed from Experian",     pts: "+15" },
    { rank: 4, done: true,  title: "Add authorized user tradeline", sub: "Partner account added",     pts: "+11" },
    { rank: 5, done: false, title: "Dispute MIDLAND FUNDING",       sub: "Ready to generate letter",  pts: "+18" },
    { rank: 6, done: false, title: "Reduce Chase card utilization", sub: "Target: below 20%",         pts: "+12" },
  ],
  debts: [
    { name: "Chase Sapphire",     balance: 4200,  limit: 8000,  util: 53, rate: "19.9%", type: "Credit Card" },
    { name: "Capital One Venture",balance: 2100,  limit: 10000, util: 21, rate: "22.4%", type: "Credit Card" },
    { name: "Amex Blue Cash",     balance: 880,   limit: 6500,  util: 14, rate: "17.2%", type: "Credit Card" },
    { name: "Auto Loan - Ford",   balance: 14200, limit: 22000, util: 0,  rate: "6.8%",  type: "Auto Loan"  },
  ],
  subscriptions: [
    { name: "Netflix",        amount: 15.99, category: "Streaming", status: "active" },
    { name: "Spotify",        amount: 9.99,  category: "Music",     status: "active" },
    { name: "Amazon Prime",   amount: 14.99, category: "Shopping",  status: "active" },
    { name: "Gym Membership", amount: 49.99, category: "Fitness",   status: "unused" },
    { name: "Hulu",           amount: 17.99, category: "Streaming", status: "unused" },
  ],
  protectionAlerts: [
    { type: "New Account",   desc: "New credit card account opened at First National Bank",    date: "Jan 18", severity: "high"   },
    { type: "Hard Inquiry",  desc: "Credit inquiry from Capital One Auto Finance",             date: "Jan 12", severity: "medium" },
    { type: "Address Change",desc: "Address update detected on TransUnion file",               date: "Dec 28", severity: "low"    },
  ],
  milestones: [
    { month: "Sep 2024", score: 651, event: "Started ScoreShift",                icon: "🚀" },
    { month: "Oct 2024", score: 668, event: "First dispute sent to Experian",    icon: "✉️" },
    { month: "Nov 2024", score: 682, event: "PORTFOLIO RECOVERY removed",        icon: "✅" },
    { month: "Dec 2024", score: 694, event: "Utilization dropped to 28%",        icon: "📉" },
    { month: "Jan 2025", score: 712, event: "CITI collection resolved",          icon: "🏆" },
  ],
};

/* ══════════════════════════════════════════════════════════════
   SCREEN COMPONENTS — all use real .cp-* classes from portal.css
══════════════════════════════════════════════════════════════ */

function HomePage({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  return (
    <div>
      {/* Hero credit card */}
      <div className="cp-card cp-mb-24" style={{ background: "linear-gradient(135deg, rgba(143,122,255,0.12), rgba(107,95,212,0.06))", borderTop: "3px solid var(--cp-accent)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <span className="cp-page-eyebrow">CREDIT ACTION PLAN · DEMO MODE</span>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: "var(--cp-text-primary)", letterSpacing: -0.6, marginBottom: 4 }}>
              Good morning, Jordan.
            </div>
            <div style={{ fontSize: 13, color: "var(--cp-text-muted)", marginBottom: 8 }}>
              Pro Plan · 4 disputes in progress · Specialist: Sarah K.
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ background: "var(--cp-accent-light)", color: "var(--cp-accent)", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 12, textTransform: "uppercase", letterSpacing: "0.07em" }}>ACTIVE</span>
              <span style={{ fontSize: 12, color: "var(--cp-text-muted)" }}>68% readiness · 4 of 6 actions done</span>
              <span style={{ fontSize: 12, color: "var(--cp-text-muted)" }}>Enrolled Feb 12, 2025</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            {DEMO.scores.map(s => (
              <div key={s.abbr} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "var(--cp-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>{s.bureau.slice(0, 8)}</div>
                <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 800, color: s.color, letterSpacing: -1, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: "var(--cp-success)", marginTop: 2 }}>{s.change} ↑</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stat row */}
      <div className="cp-grid-4 cp-mb-24">
        {[
          { icon: <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /></>,           colorCls: "indigo", val: "+47",  label: "Points gained"       },
          { icon: <><polyline points="20 6 9 17 4 12" /></>,                          colorCls: "green",  val: "2",    label: "Items removed"       },
          { icon: <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></>,   colorCls: "amber",  val: "3",    label: "Active disputes"     },
          { icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>, colorCls: "teal", val: "38d", label: "Avg. response time" },
        ].map(s => (
          <div key={s.label} className="cp-stat-card">
            <div className={`cp-stat-icon ${s.colorCls}`}><Icon size={20}>{s.icon}</Icon></div>
            <div>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: "var(--cp-text-primary)", letterSpacing: -1, lineHeight: 1, marginBottom: 2 }}>{s.val}</div>
              <div style={{ fontSize: 12, color: "var(--cp-text-muted)" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Next action + progress */}
      <div className="cp-grid-2 cp-mb-24">
        <div className="cp-card">
          <div className="cp-card-header">
            <div><div className="cp-card-title">Next Best Action</div><div className="cp-card-subtitle">Highest priority item</div></div>
          </div>
          <div style={{ background: "var(--cp-accent-light)", borderRadius: 12, padding: "14px 16px", display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 22 }}>⚡</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--cp-text-primary)", marginBottom: 2 }}>Dispute MIDLAND FUNDING LLC</div>
              <div style={{ fontSize: 12, color: "var(--cp-text-muted)" }}>Collection · Est. +18 pts · Ready to generate</div>
            </div>
          </div>
          <button className="cp-btn cp-btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => onNavigate("dispute-iq")}>
            <Icon size={13}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></Icon>
            Generate Dispute Letter
          </button>
        </div>
        <div className="cp-card">
          <div className="cp-card-header">
            <div><div className="cp-card-title">Plan Progress</div><div className="cp-card-subtitle">4 of 6 actions complete</div></div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: "var(--cp-accent)", letterSpacing: -1 }}>68%</div>
          </div>
          <div className="cp-progress-bar" style={{ marginBottom: 12 }}>
            <div className="cp-progress-fill" style={{ width: "68%" }} />
          </div>
          {DEMO.actions.filter(a => a.done).map(a => (
            <div key={a.rank} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid var(--cp-border-light)" }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: "var(--cp-success)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "white" }}>
                <Icon size={9}><polyline points="20 6 9 17 4 12" /></Icon>
              </div>
              <div style={{ flex: 1, fontSize: 12, color: "var(--cp-text-muted)", textDecoration: "line-through" }}>{a.title}</div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--cp-success)" }}>{a.pts}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Disputes */}
      <div className="cp-card">
        <div className="cp-card-header">
          <div><div className="cp-card-title">Recent Disputes</div><div className="cp-card-subtitle">Last 30 days</div></div>
          <button className="cp-btn cp-btn-secondary cp-btn-sm" onClick={() => onNavigate("dispute-iq")}>View all →</button>
        </div>
        {DEMO.disputes.map(d => (
          <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 0", borderBottom: "1px solid var(--cp-border-light)" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: d.bColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "white", flexShrink: 0 }}>{d.bureau}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--cp-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</div>
              <div style={{ fontSize: 11, color: "var(--cp-text-muted)" }}>{d.type} · {d.date}</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: d.status === "won" ? "var(--cp-green-light)" : d.status === "sent" ? "var(--cp-accent-light)" : "var(--cp-amber-light)", color: d.status === "won" ? "var(--cp-green)" : d.status === "sent" ? "var(--cp-accent)" : "var(--cp-amber)", textTransform: "capitalize" }}>{d.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlanPage() {
  return (
    <div>
      <div className="cp-page-header">
        <div>
          <span className="cp-page-eyebrow">CREDIT ACTION INTELLIGENCE</span>
          <h1 className="cp-page-title">My Plan</h1>
          <p className="cp-page-subtitle">Personalized roadmap · Goal: Improve Score · Timeline: 6 months</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: "var(--cp-accent)", letterSpacing: -1 }}>68%</div>
          <div style={{ fontSize: 11, color: "var(--cp-text-muted)" }}>complete</div>
        </div>
      </div>
      <div className="cp-card cp-mb-24">
        <div className="cp-progress-bar" style={{ height: 8, marginBottom: 8 }}>
          <div className="cp-progress-fill" style={{ width: "68%" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--cp-text-muted)" }}>
          <span>4 of 6 actions complete</span><span>Est. +96 pts total</span>
        </div>
      </div>
      {DEMO.actions.map(a => (
        <div key={a.rank} className="cp-card" style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 14, opacity: a.done ? 0.72 : 1 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: a.done ? "var(--cp-success)" : "var(--cp-accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "white", fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 12 }}>
            {a.done ? <Icon size={13}><polyline points="20 6 9 17 4 12" /></Icon> : a.rank}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cp-text-primary)", textDecoration: a.done ? "line-through" : "none" }}>{a.title}</div>
            <div style={{ fontSize: 12, color: "var(--cp-text-muted)", marginTop: 2 }}>{a.sub}</div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--cp-success)" }}>{a.pts} pts</span>
        </div>
      ))}
    </div>
  );
}

function DisputeIQPage({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  return (
    <div>
      <div className="cp-page-header">
        <div>
          <span className="cp-page-eyebrow">AI-POWERED DISPUTE ENGINE</span>
          <h1 className="cp-page-title">Dispute IQ</h1>
          <p className="cp-page-subtitle">4 disputes in pipeline · Est. +61 pts combined</p>
        </div>
      </div>
      <div className="cp-card cp-mb-24" style={{ background: "var(--cp-accent-light)", borderTop: "3px solid var(--cp-accent)" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div className="cp-stat-icon indigo"><Icon size={20}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></Icon></div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--cp-accent)" }}>3 disputes ready to send · Est. +52 pts combined</div>
            <div style={{ fontSize: 12, color: "var(--cp-text-muted)", marginTop: 2 }}>ScoreShift AI has analyzed your credit report and prepared optimized dispute letters.</div>
          </div>
        </div>
      </div>
      {DEMO.disputes.map(d => (
        <div key={d.name} className="cp-card" style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: d.bColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "white", flexShrink: 0 }}>{d.bureau}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--cp-text-primary)", marginBottom: 2 }}>{d.name}</div>
              <div style={{ fontSize: 12, color: "var(--cp-text-muted)", marginBottom: 8 }}>{d.type} · {d.date} · FCRA §1681i</div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ background: d.status === "won" ? "var(--cp-green-light)" : d.status === "sent" ? "var(--cp-accent-light)" : "var(--cp-amber-light)", color: d.status === "won" ? "var(--cp-green)" : d.status === "sent" ? "var(--cp-accent)" : "var(--cp-amber)", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 12, textTransform: "capitalize" }}>{d.status}</span>
                <span style={{ background: "var(--cp-green-light)", color: "var(--cp-green)", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 12 }}>{d.pts} pts</span>
              </div>
            </div>
            <button className="cp-btn cp-btn-primary cp-btn-sm" style={{ flexShrink: 0 }} onClick={() => onNavigate("plan")}>
              <Icon size={11}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></Icon>
              {d.status === "pending" ? "Generate" : "View"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function DebtPage() {
  const total = DEMO.debts.reduce((s, d) => s + d.balance, 0);
  return (
    <div>
      <div className="cp-page-header">
        <div>
          <span className="cp-page-eyebrow">DEBT INTELLIGENCE</span>
          <h1 className="cp-page-title">Debt Navigator</h1>
          <p className="cp-page-subtitle">Payoff strategy optimized for maximum credit score impact</p>
        </div>
      </div>
      <div className="cp-grid-3 cp-mb-24">
        {[
          { label: "Total Debt",        val: `$${total.toLocaleString()}`, col: "var(--cp-text-primary)" },
          { label: "Avg. Utilization",  val: "32%",                       col: "var(--cp-amber)"        },
          { label: "Est. Score Impact", val: "+24 pts",                   col: "var(--cp-success)"      },
        ].map(s => (
          <div key={s.label} className="cp-card">
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 800, color: s.col, letterSpacing: -1, marginBottom: 4 }}>{s.val}</div>
            <div style={{ fontSize: 12, color: "var(--cp-text-muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>
      {DEMO.debts.map((d, i) => (
        <div key={d.name} className="cp-card" style={{ marginBottom: 10 }}>
          <div className="cp-card-header">
            <div><div className="cp-card-title">{d.name}</div><div className="cp-card-subtitle">{d.type} · {d.rate} APR</div></div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: "var(--cp-text-primary)" }}>${d.balance.toLocaleString()}</div>
              {d.limit > 0 && <div style={{ fontSize: 11, color: "var(--cp-text-muted)" }}>of ${d.limit.toLocaleString()}</div>}
            </div>
          </div>
          {d.limit > 0 && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 11, color: "var(--cp-text-muted)" }}>Utilization</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: d.util > 30 ? "var(--cp-amber)" : "var(--cp-success)" }}>{d.util}%</span>
              </div>
              <div className="cp-progress-bar">
                <div className="cp-progress-fill" style={{ width: `${d.util}%`, background: d.util > 30 ? "var(--cp-amber)" : "var(--cp-success)" }} />
              </div>
            </>
          )}
          {i === 0 && <div style={{ marginTop: 10, fontSize: 11, color: "var(--cp-accent)", fontWeight: 600 }}>⚡ Priority: Paying below 30% could add +12 pts</div>}
        </div>
      ))}
    </div>
  );
}

function SubscriptionsPage() {
  const total = DEMO.subscriptions.reduce((s, d) => s + d.amount, 0);
  const unused = DEMO.subscriptions.filter(d => d.status === "unused").reduce((s, d) => s + d.amount, 0);
  return (
    <div>
      <div className="cp-page-header">
        <div>
          <span className="cp-page-eyebrow">SUBSCRIPTION INTELLIGENCE</span>
          <h1 className="cp-page-title">Subscription Manager</h1>
          <p className="cp-page-subtitle">AI-detected recurring charges from your accounts</p>
        </div>
      </div>
      <div className="cp-grid-2 cp-mb-24">
        <div className="cp-card">
          <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 800, color: "var(--cp-text-primary)", letterSpacing: -1 }}>${total.toFixed(2)}<span style={{ fontSize: 13, fontWeight: 500, color: "var(--cp-text-muted)" }}>/mo</span></div>
          <div style={{ fontSize: 12, color: "var(--cp-text-muted)", marginTop: 4 }}>Total subscriptions detected</div>
        </div>
        <div className="cp-card" style={{ borderTop: "3px solid var(--cp-amber)" }}>
          <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 800, color: "var(--cp-amber)", letterSpacing: -1 }}>${unused.toFixed(2)}<span style={{ fontSize: 13, fontWeight: 500, color: "var(--cp-text-muted)" }}>/mo</span></div>
          <div style={{ fontSize: 12, color: "var(--cp-text-muted)", marginTop: 4 }}>Potentially unused — cancel to save</div>
        </div>
      </div>
      {DEMO.subscriptions.map(s => (
        <div key={s.name} className="cp-card" style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: s.status === "unused" ? "var(--cp-amber-light)" : "var(--cp-accent-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
            {s.category === "Streaming" ? "📺" : s.category === "Music" ? "🎵" : s.category === "Shopping" ? "📦" : "💪"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cp-text-primary)" }}>{s.name}</div>
            <div style={{ fontSize: 11, color: "var(--cp-text-muted)" }}>{s.category}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--cp-text-primary)" }}>${s.amount}/mo</div>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: s.status === "unused" ? "var(--cp-amber-light)" : "var(--cp-green-light)", color: s.status === "unused" ? "var(--cp-amber)" : "var(--cp-success)", textTransform: "capitalize" }}>{s.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function StudentLoanPage() {
  return (
    <div>
      <div className="cp-page-header">
        <div>
          <span className="cp-page-eyebrow">STUDENT LOAN INTELLIGENCE</span>
          <h1 className="cp-page-title">Student Loan Aid</h1>
          <p className="cp-page-subtitle">Repayment plans, forgiveness programs, and refinancing options</p>
        </div>
      </div>
      <div className="cp-card" style={{ padding: 36, textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 14 }}>🎓</div>
        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: "var(--cp-text-primary)", marginBottom: 8 }}>No student loans detected</div>
        <div style={{ fontSize: 13, color: "var(--cp-text-muted)", maxWidth: 380, margin: "0 auto 18px" }}>Connect your accounts or upload a statement to scan for balances, interest rates, and forgiveness eligibility.</div>
        <button className="cp-btn cp-btn-primary" style={{ margin: "0 auto" }}>
          <Icon size={13}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Icon>
          Connect Account
        </button>
      </div>
    </div>
  );
}

function ProtectionPage() {
  return (
    <div>
      <div className="cp-page-header">
        <div>
          <span className="cp-page-eyebrow">IDENTITY INTELLIGENCE</span>
          <h1 className="cp-page-title">Protection Center</h1>
          <p className="cp-page-subtitle">Real-time dark web monitoring and identity threat detection</p>
        </div>
      </div>
      <div className="cp-grid-3 cp-mb-24">
        {[
          { icon: "🛡️", val: "0",  label: "Dark web items found",  col: "var(--cp-success)" },
          { icon: "🔍", val: "12", label: "Accounts monitored",     col: "var(--cp-accent)"  },
          { icon: "⚠️", val: "3",  label: "Alerts this month",      col: "var(--cp-amber)"   },
        ].map(s => (
          <div key={s.label} className="cp-stat-card">
            <div style={{ fontSize: 24, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: s.col, letterSpacing: -1 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "var(--cp-text-muted)" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="cp-card">
        <div className="cp-card-header">
          <div><div className="cp-card-title">Recent Alerts</div><div className="cp-card-subtitle">Identity events on your profile</div></div>
        </div>
        {DEMO.protectionAlerts.map(a => (
          <div key={a.desc} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--cp-border-light)" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.severity === "high" ? "var(--cp-red)" : a.severity === "medium" ? "var(--cp-amber)" : "var(--cp-success)", marginTop: 4, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--cp-text-primary)", marginBottom: 2 }}>{a.type}</div>
              <div style={{ fontSize: 11, color: "var(--cp-text-muted)" }}>{a.desc}</div>
            </div>
            <div style={{ fontSize: 11, color: "var(--cp-text-muted)", flexShrink: 0 }}>{a.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportPage() {
  return (
    <div>
      <div className="cp-page-header">
        <div>
          <span className="cp-page-eyebrow">3-BUREAU CREDIT REPORT</span>
          <h1 className="cp-page-title">Credit Report</h1>
          <p className="cp-page-subtitle">Last pulled Jan 18, 2025 · Next pull available Feb 18, 2025</p>
        </div>
      </div>
      <div className="cp-grid-3 cp-mb-24">
        {DEMO.scores.map(s => (
          <div key={s.abbr} className="cp-card" style={{ textAlign: "center", borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--cp-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{s.bureau}</div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 44, fontWeight: 800, color: s.color, letterSpacing: -2, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 12, color: "var(--cp-success)", marginTop: 4, fontWeight: 700 }}>{s.change} this month</div>
            <div className="cp-progress-bar" style={{ marginTop: 10 }}>
              <div className="cp-progress-fill" style={{ width: `${((s.val - 300) / 550) * 100}%`, background: s.color }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "var(--cp-text-muted)", marginTop: 3 }}>
              <span>300 Poor</span><span>850 Excellent</span>
            </div>
          </div>
        ))}
      </div>
      <div className="cp-card">
        <div className="cp-card-header">
          <div><div className="cp-card-title">Negative Items</div><div className="cp-card-subtitle">Requiring attention</div></div>
          <span className="cp-badge warning">4 items</span>
        </div>
        {DEMO.disputes.map(d => (
          <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--cp-border-light)" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: d.bColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "white", flexShrink: 0 }}>{d.bureau}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--cp-text-primary)" }}>{d.name}</div>
              <div style={{ fontSize: 11, color: "var(--cp-text-muted)" }}>{d.type} · {d.date}</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--cp-accent)" }}>{d.pts} if removed</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressPage() {
  return (
    <div>
      <div className="cp-page-header">
        <div>
          <span className="cp-page-eyebrow">SCORE JOURNEY</span>
          <h1 className="cp-page-title">Progress</h1>
          <p className="cp-page-subtitle">+61 points since you joined ScoreShift</p>
        </div>
      </div>
      <div className="cp-grid-4 cp-mb-24">
        {[
          { label: "Starting Score",  val: "651",  col: "var(--cp-amber)"   },
          { label: "Current Score",   val: "712",  col: "var(--cp-accent)"  },
          { label: "Points Gained",   val: "+61",  col: "var(--cp-success)" },
          { label: "Items Removed",   val: "2",    col: "var(--cp-success)" },
        ].map(s => (
          <div key={s.label} className="cp-stat-card">
            <div>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: s.col, letterSpacing: -1, lineHeight: 1, marginBottom: 3 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "var(--cp-text-muted)" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="cp-card">
        <div className="cp-card-header">
          <div><div className="cp-card-title">Score Journey</div><div className="cp-card-subtitle">Monthly milestones</div></div>
        </div>
        {DEMO.milestones.map((m, i) => (
          <div key={m.month} style={{ display: "flex", gap: 14, padding: "12px 0", position: "relative" }}>
            {i < DEMO.milestones.length - 1 && (
              <div style={{ position: "absolute", left: 19, top: 44, width: 2, height: "calc(100% - 12px)", background: "var(--cp-border-light)" }} />
            )}
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--cp-accent-light)", border: "2px solid var(--cp-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, zIndex: 1 }}>{m.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "var(--cp-text-muted)", marginBottom: 2 }}>{m.month}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cp-text-primary)", marginBottom: 2 }}>{m.event}</div>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 800, color: "var(--cp-accent)" }}>{m.score}</div>
            </div>
            {i > 0 && (
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--cp-success)", alignSelf: "center" }}>
                +{m.score - DEMO.milestones[i-1].score} pts
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PaymentCenterPage() {
  return (
    <div>
      <div className="cp-page-header">
        <div>
          <span className="cp-page-eyebrow">BILLING & PAYMENTS</span>
          <h1 className="cp-page-title">Payment Center</h1>
          <p className="cp-page-subtitle">Managed Credit Repair · Pro Plan</p>
        </div>
        <span style={{ background: "var(--cp-green-light)", color: "var(--cp-green)", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>Current</span>
      </div>
      <div className="cp-grid-3 cp-mb-24">
        {[
          { label: "Total Investment", val: "$1,200", col: "var(--cp-text-primary)" },
          { label: "Amount Paid",      val: "$600",   col: "var(--cp-success)"      },
          { label: "Remaining",        val: "$600",   col: "var(--cp-amber)"        },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--cp-bg)", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: s.col, letterSpacing: -1 }}>{s.val}</div>
            <div style={{ fontSize: 10, color: "var(--cp-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="cp-card cp-mb-24">
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: "var(--cp-text-muted)" }}>Payment progress</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--cp-success)" }}>50% paid</span>
          </div>
          <div className="cp-progress-bar"><div className="cp-progress-fill" style={{ width: "50%", background: "var(--cp-success)" }} /></div>
        </div>
        <div style={{ background: "var(--cp-amber-light)", border: "1px solid rgba(239,162,111,0.3)", borderRadius: 9, padding: "10px 14px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--cp-amber)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>Next Payment Due</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cp-text-primary)" }}>$200 · February 12, 2025</div>
          </div>
          <span style={{ fontSize: 11, color: "var(--cp-amber)", fontWeight: 600 }}>Monthly</span>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="cp-btn cp-btn-primary cp-btn-sm">
            <Icon size={12}><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></Icon>
            Make Payment
          </button>
          <button className="cp-btn cp-btn-secondary cp-btn-sm">
            <Icon size={12}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></Icon>
            View Agreement
          </button>
          <button className="cp-btn cp-btn-secondary cp-btn-sm">
            <Icon size={12}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></Icon>
            Download Receipt
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfilePage() {
  return (
    <div>
      <div className="cp-page-header">
        <div>
          <span className="cp-page-eyebrow">ACCOUNT SETTINGS</span>
          <h1 className="cp-page-title">Profile & Settings</h1>
          <p className="cp-page-subtitle">Manage your account and preferences</p>
        </div>
      </div>
      <div className="cp-grid-2">
        <div className="cp-card">
          <div className="cp-card-header"><div><div className="cp-card-title">Personal Information</div></div></div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div className="cp-user-avatar" style={{ width: 52, height: 52, fontSize: 16 }}>JK</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--cp-text-primary)" }}>Jordan K.</div>
              <div style={{ fontSize: 12, color: "var(--cp-text-muted)" }}>Pro Plan · Member since Feb 2025</div>
            </div>
          </div>
          {[
            { label: "Email",   val: "jordan@example.com"  },
            { label: "Phone",   val: "(555) 867-5309"       },
            { label: "Address", val: "Houston, TX"          },
          ].map(f => (
            <div key={f.label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--cp-border-light)" }}>
              <span style={{ fontSize: 12, color: "var(--cp-text-muted)" }}>{f.label}</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: "var(--cp-text-primary)" }}>{f.val}</span>
            </div>
          ))}
        </div>
        <div className="cp-card">
          <div className="cp-card-header"><div><div className="cp-card-title">Plan & Billing</div></div></div>
          <div style={{ background: "var(--cp-accent-light)", borderRadius: 12, padding: 16, marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--cp-accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Current Plan</div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: "var(--cp-accent)", marginBottom: 2 }}>Pro</div>
            <div style={{ fontSize: 12, color: "var(--cp-text-muted)" }}>$79/mo · Next billing Feb 12, 2025</div>
          </div>
          <button className="cp-btn cp-btn-secondary" style={{ width: "100%", justifyContent: "center", marginBottom: 8 }}>Manage Subscription</button>
          <button className="cp-btn cp-btn-primary" style={{ width: "100%", justifyContent: "center" }}>Upgrade to Elite →</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PORTAL DEMO — exact same shell structure as client-portal.tsx
══════════════════════════════════════════════════════════════ */
export default function PortalDemo() {
  const [activePage, setActivePage] = useState<PageId>("home");
  const bgVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = bgVideoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
  }, []);

  /* Same NAV definition as client-portal.tsx */
  const NAV: { id: PageId; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "home",           label: "Home",                 icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>  },
    { id: "plan",           label: "My Plan",              icon: <><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>, badge: "2" },
    { id: "payment-center", label: "Payment Center",       icon: <><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />           </> },
    { id: "dispute-iq",     label: "Dispute IQ",           icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></>, badge: "3" },
    { id: "debt",           label: "Debt Navigator",       icon: <><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />    </> },
    { id: "subscriptions",  label: "Subscription Manager", icon: <><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /><line x1="7" y1="15" x2="7" y2="15" /><line x1="11" y1="15" x2="13" y2="15" /></> },
    { id: "student-loans",  label: "Student Loan Aid",     icon: <><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />                              </> },
    { id: "protection",     label: "Protection Center",    icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />                                                     </> },
    { id: "report",         label: "Credit Report",        icon: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />                                                         </> },
    { id: "progress",       label: "Progress",             icon: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />                       </> },
    { id: "profile",        label: "Profile",              icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />                        </> },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
      {/* Portal shell — pixel-identical to /portal (no demo chrome inside iframe) */}
      <div className="cp-portal">

        {/* Background (matches client-portal.tsx BgVideo) */}
        <div className="cp-bg-layer" aria-hidden="true">
          <video ref={bgVideoRef} className="cp-bg-video" autoPlay muted loop playsInline preload="metadata">
            <source src="/videos/scoreshift-world.webm" type="video/webm" />
            <source src="/videos/scoreshift-world.mp4" type="video/mp4" />
          </video>
          <div className="cp-bg-overlay" />
          <div className="cp-bg-glass" />
        </div>

        {/* Sidebar — matches client-portal.tsx <aside> */}
        <aside className="cp-sidebar">
          <a className="cp-sidebar-logo" href="#" onClick={(e) => { e.preventDefault(); setActivePage("home"); }}>
            <img src={scoreshiftLogo} alt="ScoreShift" style={{ width: 38, height: 38, objectFit: "contain", flexShrink: 0 }} />
            <span className="cp-logo-text">ScoreShift</span>
          </a>
          <nav className="cp-sidebar-nav">
            {NAV.map(item => (
              <button
                key={item.id}
                className={`cp-nav-item${activePage === item.id ? " active" : ""}`}
                onClick={() => setActivePage(item.id)}
              >
                <Icon size={15}>{item.icon}</Icon>
                {item.label}
                {item.badge && <span className="cp-nav-badge amber">{item.badge}</span>}
              </button>
            ))}
          </nav>
          <div className="cp-sidebar-user">
            <div className="cp-user-avatar">JK</div>
            <div className="cp-user-info">
              <div className="cp-user-name">Jordan K.</div>
              <div className="cp-user-plan">Pro Plan · Demo</div>
            </div>
          </div>
        </aside>

        {/* Main — matches client-portal.tsx <div className="cp-main"> */}
        <div className="cp-main">
          <header className="cp-topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="cp-topbar-title">{PAGE_TITLES[activePage]}</span>
            </div>
            <div className="cp-topbar-right">
              <span className="cp-plan-chip">PRO</span>
              <button className="cp-icon-btn" title="Notifications">
                <Icon size={15}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></Icon>
                <span className="cp-notif-dot" />
              </button>
            </div>
          </header>
          <div className="cp-content">
            {activePage === "home"           && <HomePage onNavigate={setActivePage} />}
            {activePage === "plan"           && <PlanPage />}
            {activePage === "payment-center" && <PaymentCenterPage />}
            {activePage === "dispute-iq"     && <DisputeIQPage onNavigate={setActivePage} />}
            {activePage === "debt"           && <DebtPage />}
            {activePage === "subscriptions"  && <SubscriptionsPage />}
            {activePage === "student-loans"  && <StudentLoanPage />}
            {activePage === "protection"     && <ProtectionPage />}
            {activePage === "report"         && <ReportPage />}
            {activePage === "progress"       && <ProgressPage />}
            {activePage === "profile"        && <ProfilePage />}
          </div>
        </div>
      </div>
    </div>
  );
}
