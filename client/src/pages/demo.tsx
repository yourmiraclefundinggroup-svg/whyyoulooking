/**
 * /demo — Interactive ScoreShift client portal demo
 * Public page (no auth required). Uses Array sandbox credentials to show
 * Donald Blair's live tri-bureau credit data as a product showcase.
 */
import { useState, useEffect, useRef } from "react";
import scoreshiftLogo from "@assets/scoreshift-logo.png";
import { useArrayScript, ARRAY_SANDBOX_APP_KEY, ARRAY_SANDBOX_API_URL, ARRAY_SANDBOX_TOKENS } from "@/hooks/use-array-script";
import "@/styles/portal.css";

// ── Sandbox credentials ───────────────────────────────────────────────────────
const APP_KEY = ARRAY_SANDBOX_APP_KEY;
const API_URL = ARRAY_SANDBOX_API_URL;
const TOKEN   = ARRAY_SANDBOX_TOKENS.default;

// ── Custom element types ──────────────────────────────────────────────────────
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "array-credit-overview": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & Record<string, any>, HTMLElement>;
      "array-credit-score": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & Record<string, any>, HTMLElement>;
      "array-credit-alerts": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & Record<string, any>, HTMLElement>;
      "array-identity-protect": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & Record<string, any>, HTMLElement>;
      "array-pip-scan": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & Record<string, any>, HTMLElement>;
      "array-credit-score-simulator": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & Record<string, any>, HTMLElement>;
      "array-credit-report": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & Record<string, any>, HTMLElement>;
      "array-credit-debt-analysis": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & Record<string, any>, HTMLElement>;
      "array-debt-navigator": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & Record<string, any>, HTMLElement>;
      "array-student-loan-aid": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & Record<string, any>, HTMLElement>;
    }
  }
}

// ── Array custom element renderer ─────────────────────────────────────────────
function ArrayComp({ tag, attrs = {}, minHeight = 300 }: {
  tag: string;
  attrs?: Record<string, string>;
  minHeight?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = "";
    const el = document.createElement(tag);
    el.setAttribute("appKey",    APP_KEY);
    el.setAttribute("userToken", TOKEN);
    el.setAttribute("apiUrl",    API_URL);
    el.setAttribute("sandbox",   "true");
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    ref.current.appendChild(el);
    return () => { if (ref.current) ref.current.innerHTML = ""; };
  }, [tag]);
  return <div ref={ref} style={{ minHeight, width: "100%" }} />;
}

// ── ArrayWrapper card ─────────────────────────────────────────────────────────
function ArrayWrapper({
  title, sub, badge, accentTop = false, ready, children,
}: {
  title: string; sub?: string; badge?: React.ReactNode;
  accentTop?: boolean; ready: boolean; children: React.ReactNode;
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
        {!ready ? (
          <div className="cp-array-loading">
            <div className="cp-array-spinner" />Loading…
          </div>
        ) : children}
      </div>
    </div>
  );
}

// ── Page ID type ──────────────────────────────────────────────────────────────
type PageId =
  | "dashboard" | "issues" | "disputes"
  | "score-tracker" | "identity" | "privacy" | "pip-scan" | "credit-alerts"
  | "simulator" | "report" | "debt-analysis" | "debt-navigator" | "student-loan"
  | "messages" | "documents" | "billing" | "profile" | "settings";

// ── Sidebar icon helper ───────────────────────────────────────────────────────
function Ico({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

interface NavItem { id: PageId; label: string; badge?: string; badgeColor?: "indigo" | "amber"; icon: React.ReactNode; }
interface NavSection { label: string; items: NavItem[]; }

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [{
      id: "dashboard", label: "Dashboard",
      icon: <Ico><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></Ico>,
    }],
  },
  {
    label: "Credit Repair",
    items: [
      {
        id: "issues", label: "Credit Issues & Alerts", badge: "3",
        icon: <Ico><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></Ico>,
      },
      {
        id: "disputes", label: "Disputes", badge: "2", badgeColor: "amber",
        icon: <Ico><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="15" x2="15" y2="15" /></Ico>,
      },
    ],
  },
  {
    label: "Monitoring",
    items: [
      { id: "score-tracker", label: "Score Tracker", icon: <Ico><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></Ico> },
      { id: "identity", label: "Identity Protection", icon: <Ico><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></Ico> },
      { id: "privacy", label: "Privacy Protection", icon: <Ico><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></Ico> },
      { id: "pip-scan", label: "PIP Scan Results", icon: <Ico><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></Ico> },
      { id: "credit-alerts", label: "Credit Alerts", icon: <Ico><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></Ico> },
    ],
  },
  {
    label: "Tools",
    items: [
      { id: "simulator", label: "Score Simulator", icon: <Ico><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></Ico> },
      { id: "report", label: "Full Report", icon: <Ico><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></Ico> },
      { id: "debt-analysis", label: "Debt Analysis", icon: <Ico><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></Ico> },
      { id: "debt-navigator", label: "Debt Navigator", icon: <Ico><polygon points="3 11 22 2 13 21 11 13 3 11" /></Ico> },
      { id: "student-loan", label: "Student Loan Aid", icon: <Ico><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></Ico> },
    ],
  },
  {
    label: "Communication",
    items: [
      { id: "messages", label: "Messages", icon: <Ico><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></Ico> },
      { id: "documents", label: "Documents", icon: <Ico><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></Ico> },
    ],
  },
  {
    label: "Account",
    items: [
      { id: "billing", label: "Billing", icon: <Ico><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></Ico> },
      { id: "profile", label: "Profile", icon: <Ico><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></Ico> },
      {
        id: "settings", label: "Settings",
        icon: <Ico><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></Ico>,
      },
    ],
  },
];

const PAGE_TITLES: Record<PageId, string> = {
  dashboard: "Dashboard", issues: "Credit Issues & Alerts", disputes: "Disputes",
  "score-tracker": "Score Tracker", identity: "Identity Protection",
  privacy: "Privacy Protection", "pip-scan": "PIP Scan Results",
  "credit-alerts": "Credit Alerts", simulator: "Score Simulator",
  report: "Full Credit Report", "debt-analysis": "Debt Analysis",
  "debt-navigator": "Debt Navigator", "student-loan": "Student Loan Aid",
  messages: "Messages", documents: "Documents",
  billing: "Billing & Plan", profile: "Profile", settings: "Settings",
};

// ── Sub-pages ─────────────────────────────────────────────────────────────────
function PageHeader({ eyebrow, title, sub, badge }: {
  eyebrow: string; title: string; sub: string; badge?: React.ReactNode;
}) {
  return (
    <div className="cp-page-header">
      <div>
        <span className="cp-page-eyebrow">{eyebrow}</span>
        <h1 className="cp-page-title">{title}</h1>
        <p className="cp-page-subtitle">{sub}</p>
      </div>
      {badge}
    </div>
  );
}

function IssuesPage({ nav }: { nav: (p: PageId) => void }) {
  const issues = [
    { account: "Midland Credit Management", bureau: "Equifax", type: "Collections", amount: "$847", impact: "High", color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
    { account: "Capital One — Auto", bureau: "Experian", type: "Late Payment (90-day)", amount: "—", impact: "High", color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
    { account: "Hard Inquiry — Capital One", bureau: "TransUnion", type: "Hard Inquiry", amount: "—", impact: "Low", color: "#3b82f6", bg: "rgba(59,130,246,0.08)" },
  ];
  return (
    <div>
      <PageHeader eyebrow="Credit Repair" title="Credit Issues" sub="Active negative items and live credit alerts." badge={<span className="cp-badge live">Live Monitoring</span>} />
      <div className="cp-info-banner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        3 negative items detected. Click Dispute to begin the resolution process.
      </div>
      <div className="cp-card">
        <div className="cp-card-header">
          <div><div className="cp-card-title">Active Negative Items</div></div>
          <span className="cp-badge warning">3 Items</span>
        </div>
        {issues.map((iss, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0", borderBottom: i < issues.length - 1 ? "1px solid #eef0f6" : "none" }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: iss.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={iss.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0f1220", marginBottom: 2 }}>{iss.account}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{iss.type} · {iss.bureau}{iss.amount !== "—" ? ` · ${iss.amount}` : ""}</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: iss.color, background: iss.bg, padding: "3px 10px", borderRadius: 20 }}>{iss.impact} Impact</span>
            <button className="cp-btn cp-btn-primary cp-btn-sm" onClick={() => nav("disputes")}>Dispute</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function DisputesPage() {
  const active = [
    { creditor: "Midland Credit Management", bureau: "Equifax", type: "Collections", status: "PENDING", dateSent: "May 1, 2026", due: "May 31, 2026" },
    { creditor: "Capital One — Auto", bureau: "Experian", type: "Late Payment", status: "SENT", dateSent: "May 14, 2026", due: "Jun 13, 2026" },
  ];
  const resolved = [
    { creditor: "Portfolio Recovery", bureau: "TransUnion", resolved: "Apr 10, 2026", outcome: "Deleted" },
    { creditor: "First Premier Bank", bureau: "Equifax", resolved: "Mar 22, 2026", outcome: "Updated" },
  ];
  return (
    <div>
      <PageHeader eyebrow="Credit Repair" title="Disputes" sub="Track every dispute filed with the bureaus — in real time." />
      <div className="cp-disputes-section">
        <div className="cp-card" style={{ width: "100%" }}>
          <div className="cp-card-header">
            <div><div className="cp-card-title">Active Disputes</div></div>
            <span className="cp-badge warning">{active.length} Pending</span>
          </div>
          <div className="cp-table-scroll">
            <table className="cp-table">
              <thead><tr><th>Account</th><th>Bureau</th><th>Type</th><th>Sent</th><th>Status</th><th>Response Due</th></tr></thead>
              <tbody>
                {active.map((d, i) => (
                  <tr key={i}>
                    <td><strong>{d.creditor}</strong></td>
                    <td>{d.bureau}</td>
                    <td>{d.type}</td>
                    <td>{d.dateSent}</td>
                    <td><span className={`cp-pill ${d.status === "PENDING" ? "pending" : "active"}`}>{d.status === "PENDING" ? "Pending" : "Sent"}</span></td>
                    <td>{d.due}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="cp-card" style={{ width: "100%" }}>
          <div className="cp-card-header">
            <div><div className="cp-card-title">Resolved</div></div>
            <span className="cp-badge success">{resolved.length} Resolved</span>
          </div>
          <div className="cp-table-scroll">
            <table className="cp-table">
              <thead><tr><th>Account</th><th>Bureau</th><th>Resolved</th><th>Outcome</th></tr></thead>
              <tbody>
                {resolved.map((d, i) => (
                  <tr key={i}>
                    <td><strong>{d.creditor}</strong></td>
                    <td>{d.bureau}</td>
                    <td>{d.resolved}</td>
                    <td><span className="cp-pill resolved">{d.outcome}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessagesPage() {
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([
    { from: "advisor", text: "Hi Donald! I'm reviewing your credit report now. I'll have an update for you by end of day." },
    { from: "client", text: "Thank you! I'm also wondering about the Capital One inquiry." },
    { from: "advisor", text: "Great question. Hard inquiries typically remain for 2 years but only impact your score for 12 months. I'll include a note about this in your next report." },
  ]);
  function send() {
    if (!msg.trim()) return;
    setMessages(prev => [...prev, { from: "client", text: msg.trim() }]);
    setMsg("");
  }
  return (
    <div>
      <PageHeader eyebrow="Communication" title="Messages" sub="Secure channel with your credit advisor." />
      <div className="cp-chat-container">
        <div className="cp-chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`cp-chat-msg ${m.from}`}>{m.text}</div>
          ))}
        </div>
        <div className="cp-chat-input-row">
          <input className="cp-chat-input" placeholder="Type a message…" value={msg}
            onChange={e => setMsg(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()} />
          <button className="cp-btn cp-btn-primary cp-btn-sm" onClick={send}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function DocumentsPage() {
  const docs = [
    { name: "Government ID — Front", type: "Identity", date: "Apr 28, 2026", size: "2.4 MB" },
    { name: "Dispute Letter — Equifax", type: "Dispute", date: "May 1, 2026", size: "89 KB" },
    { name: "FTC Identity Theft Report", type: "Legal", date: "Mar 15, 2026", size: "1.1 MB" },
    { name: "Credit Report — March 2026", type: "Report", date: "Mar 10, 2026", size: "3.2 MB" },
  ];
  return (
    <div>
      <PageHeader eyebrow="Communication" title="Documents" sub="Securely uploaded files and dispute packets." />
      <div className="cp-card">
        <div className="cp-card-header">
          <div><div className="cp-card-title">Uploaded Files</div></div>
          <button className="cp-btn cp-btn-secondary cp-btn-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Upload
          </button>
        </div>
        <div className="cp-table-scroll">
          <table className="cp-table">
            <thead><tr><th>File Name</th><th>Type</th><th>Date</th><th>Size</th></tr></thead>
            <tbody>
              {docs.map((d, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(99,102,241,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                      <strong>{d.name}</strong>
                    </div>
                  </td>
                  <td><span className="cp-pill info">{d.type}</span></td>
                  <td>{d.date}</td>
                  <td>{d.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BillingPage() {
  return (
    <div>
      <PageHeader eyebrow="Account" title="Billing & Plan" sub="Manage your subscription and payment method." />
      <div className="cp-grid-2">
        <div className="cp-card cp-card-accent-top">
          <div className="cp-card-header">
            <div><div className="cp-card-title">Current Plan</div><div className="cp-card-subtitle">Active since Jan 1, 2026</div></div>
            <span className="cp-badge live">Active</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div style={{ fontSize: 40, fontFamily: "'Sora', sans-serif", fontWeight: 800, letterSpacing: -2, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Elite</div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#0f1220", fontFamily: "'Sora', sans-serif" }}>$149<span style={{ fontSize: 14, fontWeight: 500, color: "#6b7280" }}>/mo</span></div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>Next billing: Jun 1, 2026</div>
            </div>
          </div>
          <div className="cp-divider" />
          {["3-Bureau Credit Monitoring", "AI Dispute Generation (unlimited)", "Identity & Privacy Protection", "Debt Navigator & Simulator", "Priority Support"].map(f => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", fontSize: 13, color: "#374151" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
              {f}
            </div>
          ))}
        </div>
        <div className="cp-card">
          <div className="cp-card-header"><div><div className="cp-card-title">Payment Method</div></div></div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", border: "1px solid #e4e7ef", borderRadius: 10, background: "#f8f9fb" }}>
            <div style={{ width: 44, height: 28, background: "#1a1f71", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>VISA</span>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0f1220" }}>Visa ending in 4242</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>Expires 08/2027</div>
            </div>
            <button className="cp-btn cp-btn-secondary cp-btn-sm" style={{ marginLeft: "auto" }}>Update</button>
          </div>
          <div className="cp-divider" />
          <div className="cp-card-title" style={{ marginBottom: 14 }}>Recent Invoices</div>
          {[
            { date: "May 1, 2026", amount: "$149.00" },
            { date: "Apr 1, 2026", amount: "$149.00" },
            { date: "Mar 1, 2026", amount: "$149.00" },
          ].map((inv, i) => (
            <div key={i} className="cp-flex-between" style={{ padding: "10px 0", borderBottom: "1px solid #eef0f6", fontSize: 13 }}>
              <span style={{ color: "#374151" }}>{inv.date}</span>
              <span style={{ fontWeight: 600, color: "#0f1220" }}>{inv.amount}</span>
              <span className="cp-pill active">Paid</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfilePage() {
  return (
    <div>
      <PageHeader eyebrow="Account" title="Profile" sub="Your personal information and case details." />
      <div className="cp-grid-2">
        <div className="cp-card">
          <div className="cp-card-header"><div><div className="cp-card-title">Personal Information</div></div><button className="cp-btn cp-btn-secondary cp-btn-sm">Edit</button></div>
          {[
            ["First Name", "Donald"], ["Last Name", "Blair"],
            ["Email", "donald.blair@email.com"], ["Phone", "(555) 012-3456"],
            ["Address", "1234 Main St, Dallas, TX 75201"],
            ["Date of Birth", "Mar 15, 1985"], ["SSN (last 4)", "••••"],
          ].map(([label, val]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid #eef0f6", fontSize: 13 }}>
              <span style={{ color: "#6b7280", fontWeight: 500 }}>{label}</span>
              <span style={{ color: "#0f1220", fontWeight: 600 }}>{val}</span>
            </div>
          ))}
        </div>
        <div className="cp-card">
          <div className="cp-card-header"><div><div className="cp-card-title">Case Details</div></div></div>
          {[
            ["Case Type", "Standard Credit Repair"], ["Advisor", "ScoreShift AI Team"],
            ["Status", "Active"], ["Started", "Jan 1, 2026"],
            ["Plan", "Elite"], ["Disputes Filed", "4"], ["Items Removed", "2"],
          ].map(([label, val]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid #eef0f6", fontSize: 13 }}>
              <span style={{ color: "#6b7280", fontWeight: 500 }}>{label}</span>
              <span style={{ color: "#0f1220", fontWeight: 600 }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button className={`cp-toggle${on ? "" : " off"}`} onClick={onToggle}>
      <div className="cp-toggle-thumb" />
    </button>
  );
}

function SettingsPage() {
  const [prefs, setPrefs] = useState({ scoreChanges: true, newAlerts: true, disputeUpdates: true, marketing: false, twoFactor: true, smsAlerts: false });
  const tog = (k: keyof typeof prefs) => setPrefs(p => ({ ...p, [k]: !p[k] }));
  return (
    <div>
      <PageHeader eyebrow="Account" title="Settings" sub="Manage your notification preferences and security." />
      <div className="cp-grid-2">
        <div className="cp-card">
          <div className="cp-card-header"><div><div className="cp-card-title">Notifications</div></div></div>
          {[
            { key: "scoreChanges" as const, label: "Score Changes", sub: "Get notified when your score changes" },
            { key: "newAlerts" as const, label: "New Alerts", sub: "Bureau alerts and monitoring updates" },
            { key: "disputeUpdates" as const, label: "Dispute Updates", sub: "Status changes on your disputes" },
            { key: "marketing" as const, label: "Marketing Emails", sub: "Tips, offers, and platform updates" },
          ].map(item => (
            <div key={item.key} className="cp-settings-row">
              <div><div className="cp-settings-row-label">{item.label}</div><div className="cp-settings-row-sub">{item.sub}</div></div>
              <Toggle on={prefs[item.key]} onToggle={() => tog(item.key)} />
            </div>
          ))}
        </div>
        <div className="cp-card">
          <div className="cp-card-header"><div><div className="cp-card-title">Security</div></div></div>
          {[
            { key: "twoFactor" as const, label: "Two-Factor Authentication", sub: "Add an extra layer of security" },
            { key: "smsAlerts" as const, label: "SMS Alerts", sub: "Receive security alerts via text" },
          ].map(item => (
            <div key={item.key} className="cp-settings-row">
              <div><div className="cp-settings-row-label">{item.label}</div><div className="cp-settings-row-sub">{item.sub}</div></div>
              <Toggle on={prefs[item.key]} onToggle={() => tog(item.key)} />
            </div>
          ))}
          <div className="cp-divider" />
          <div className="cp-card-title" style={{ marginBottom: 14, fontSize: 13 }}>Change Password</div>
          {["Current Password", "New Password", "Confirm Password"].map(p => (
            <div key={p} style={{ marginBottom: 12 }}>
              <label className="cp-form-label">{p}</label>
              <input type="password" className="cp-form-input" placeholder="••••••••" />
            </div>
          ))}
          <button className="cp-btn cp-btn-primary cp-btn-sm">Update Password</button>
        </div>
      </div>
    </div>
  );
}

// ── Demo banner (top strip) ───────────────────────────────────────────────────
function DemoBanner() {
  const [visible, setVisible] = useState(true);
  const isEmbedded = window.self !== window.top;
  if (!visible || isEmbedded) return null;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
      background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
      color: "#fff", fontSize: 12.5, fontWeight: 600,
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 12, padding: "9px 20px", letterSpacing: 0.1,
    }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      Interactive Demo — Showing live Array sandbox data for Donald Blair (Elite plan). All features are fully functional.
      <a href="/auth" style={{ color: "#fff", textDecoration: "underline", marginLeft: 4 }}>Sign up free →</a>
      <button onClick={() => setVisible(false)} style={{ marginLeft: 8, background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>×</button>
    </div>
  );
}

// ── Root component ────────────────────────────────────────────────────────────
export default function Demo() {
  const [activePage, setActivePage] = useState<PageId>("dashboard");
  const [animating, setAnimating] = useState(false);
  const [displayPage, setDisplayPage] = useState<PageId>("dashboard");
  const { loaded: scriptReady } = useArrayScript(APP_KEY);

  const navigate = (page: PageId) => {
    if (page === activePage || animating) return;
    setAnimating(true);
    setTimeout(() => {
      setActivePage(page);
      setDisplayPage(page);
      setAnimating(false);
    }, 140);
  };

  const renderContent = () => {
    switch (displayPage) {

      case "dashboard": return (
        <div>
          <div className="cp-welcome-banner cp-mb-24">
            <div className="cp-welcome-left">
              <div className="cp-welcome-eyebrow">WELCOME BACK</div>
              <div className="cp-welcome-name">Good morning, Donald.</div>
              <div className="cp-welcome-sub">Your credit health is trending up. Here's your snapshot for {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.</div>
            </div>
            <div className="cp-welcome-stats">
              <div className="cp-welcome-stat"><div className="cp-welcome-stat-value" style={{ color: "#2dd4bf" }}>+22</div><div className="cp-welcome-stat-label">pts gained</div></div>
              <div className="cp-welcome-stat"><div className="cp-welcome-stat-value">2</div><div className="cp-welcome-stat-label">items removed</div></div>
              <div className="cp-welcome-stat"><div className="cp-welcome-stat-value" style={{ color: "#2dd4bf" }}>802</div><div className="cp-welcome-stat-label">top score</div></div>
            </div>
          </div>

          <div className="cp-mb-24">
            <ArrayWrapper title="Credit Overview" sub="Live 3-bureau credit health summary"
              badge={<span className="cp-badge live">Live</span>} accentTop ready={scriptReady}>
              <ArrayComp tag="array-credit-overview" minHeight={200} />
            </ArrayWrapper>
          </div>

          <div className="cp-grid-4 cp-mb-24">
            {[
              { icon: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>, cls: "amber", val: "3", label: "Active Issues" },
              { icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>, cls: "indigo", val: "2", label: "Disputes In Progress" },
              { icon: <polyline points="20 6 9 17 4 12" />, cls: "green", val: "4", label: "Items Resolved" },
              { icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />, cls: "teal", val: "Active", label: "Identity Protection" },
            ].map((s, i) => (
              <div key={i} className="cp-stat-card">
                <div className={`cp-stat-icon ${s.cls}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
                </div>
                <div><div className="cp-stat-value" style={i === 3 ? { fontSize: 16, color: "#14b8a6" } : {}}>{s.val}</div><div className="cp-stat-label">{s.label}</div></div>
              </div>
            ))}
          </div>

          <div className="cp-grid-2">
            <div className="cp-card">
              <div className="cp-card-header">
                <div><div className="cp-card-title">Dispute Pipeline</div><div className="cp-card-subtitle">Your current repair workflow</div></div>
                <span className="cp-badge info">2 Active</span>
              </div>
              <div className="cp-pipeline">
                <div className="cp-pipeline-progress" />
                {[
                  { label: "Pull Report", done: true, icon: <polyline points="20 6 9 17 4 12" /> },
                  { label: "Analyze",     done: true, icon: <polyline points="20 6 9 17 4 12" /> },
                  { label: "Strategy",   done: true, icon: <polyline points="20 6 9 17 4 12" /> },
                  { label: "Letters", active: true, icon: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></> },
                  { label: "Mail",   icon: <><rect x="1" y="3" width="15" height="13" rx="1" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /></> },
                  { label: "Track",  icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /> },
                ].map(step => (
                  <div key={step.label} className={`cp-pipeline-step${step.done ? " done" : (step as any).active ? " active" : ""}`}>
                    <div className="cp-pipeline-dot">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{step.icon}</svg>
                    </div>
                    <div className="cp-pipeline-label">{step.label}</div>
                  </div>
                ))}
              </div>
              <div className="cp-divider" />
              <div className="cp-flex-between">
                <span style={{ fontSize: 12.5, color: "var(--cp-text-muted)" }}>Next: Send certified mail to Equifax</span>
                <button className="cp-btn cp-btn-primary cp-btn-sm" onClick={() => navigate("disputes")}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                  Continue
                </button>
              </div>
            </div>

            <div className="cp-card">
              <div className="cp-card-header">
                <div><div className="cp-card-title">Recent Alerts</div><div className="cp-card-subtitle">Changes detected across all 3 bureaus</div></div>
                <span className="cp-badge live">Live</span>
              </div>
              {[
                { type: "positive", text: "Score increased by +22 points", meta: "Today, 8:14 AM · Equifax" },
                { type: "negative", text: "New inquiry detected — Capital One", meta: "Yesterday, 3:40 PM · TransUnion" },
                { type: "positive", text: "Collection account removed", meta: "May 4, 2026 · All Bureaus" },
                { type: "neutral",  text: "Certified mail delivered",     meta: "May 3, 2026 · Experian" },
              ].map((alert, i) => (
                <div key={i} className="cp-alert-item">
                  <div className={`cp-alert-dot ${alert.type}`} />
                  <div><div className="cp-alert-text">{alert.text}</div><div className="cp-alert-meta">{alert.meta}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

      case "score-tracker": return (
        <div>
          <PageHeader eyebrow="Monitoring" title="Score Tracker" sub="Live 3-bureau score history and trend analysis." badge={<span className="cp-badge live">Live Monitoring</span>} />
          <ArrayWrapper title="3-Bureau Score History" sub="VantageScore 3.0 — updated with every report pull"
            badge={<span className="cp-badge live">Live</span>} accentTop ready={scriptReady}>
            <ArrayComp tag="array-credit-score" attrs={{ bureau: "all", scoreTracker: "true" }} minHeight={340} />
          </ArrayWrapper>
        </div>
      );

      case "issues": return <IssuesPage nav={navigate} />;
      case "disputes": return <DisputesPage />;

      case "identity": return (
        <div>
          <PageHeader eyebrow="Monitoring" title="Identity Protection" sub="Real-time monitoring for identity theft and fraud." badge={<span className="cp-badge live">Live</span>} />
          <ArrayWrapper title="Identity Monitoring" sub="Dark web scans, breach detection, and real-time alerts"
            badge={<span className="cp-badge live">Active</span>} accentTop ready={scriptReady}>
            <ArrayComp tag="array-identity-protect" minHeight={420} />
          </ArrayWrapper>
        </div>
      );

      case "privacy": return (
        <div>
          <PageHeader eyebrow="Monitoring" title="Privacy Protection" sub="Monitor and remove your personal info from data brokers." badge={<span className="cp-badge live">Live</span>} />
          <div className="cp-info-banner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            Privacy removal scans your personal information from hundreds of data broker sites and removes it automatically.
          </div>
          <ArrayWrapper title="Privacy Scan & Removal" sub="Automated data broker opt-outs and removal requests"
            badge={<span className="cp-badge live">Active</span>} accentTop ready={scriptReady}>
            <ArrayComp tag="array-pip-scan" minHeight={420} />
          </ArrayWrapper>
        </div>
      );

      case "pip-scan": return (
        <div>
          <PageHeader eyebrow="Monitoring" title="PIP Scan Results" sub="Personal information protection scan results." badge={<span className="cp-badge live">Live</span>} />
          <ArrayWrapper title="PIP Scan Dashboard" sub="Monitors your personal data across the web"
            badge={<span className="cp-badge live">Live</span>} accentTop ready={scriptReady}>
            <ArrayComp tag="array-pip-scan" minHeight={420} />
          </ArrayWrapper>
        </div>
      );

      case "credit-alerts": return (
        <div>
          <PageHeader eyebrow="Monitoring" title="Credit Alerts" sub="Real-time bureau change notifications." badge={<span className="cp-badge live">Live Monitoring</span>} />
          <ArrayWrapper title="Live Credit Alerts" sub="Changes detected across TransUnion, Equifax, and Experian"
            badge={<span className="cp-badge live">Live</span>} accentTop ready={scriptReady}>
            <ArrayComp tag="array-credit-alerts" minHeight={340} />
          </ArrayWrapper>
        </div>
      );

      case "simulator": return (
        <div>
          <PageHeader eyebrow="Tools" title="Score Simulator" sub="See how financial actions would impact your score." />
          <ArrayWrapper title="Credit Score Simulator" sub="Model different scenarios and see projected score changes"
            accentTop ready={scriptReady}>
            <ArrayComp tag="array-credit-score-simulator" minHeight={400} />
          </ArrayWrapper>
        </div>
      );

      case "report": return (
        <div>
          <PageHeader eyebrow="Tools" title="Full Credit Report" sub="Complete 3-bureau credit report with all tradelines." badge={<span className="cp-badge live">Live</span>} />
          <ArrayWrapper title="3-Bureau Credit Report" sub="Full account history, inquiries, and public records"
            badge={<span className="cp-badge live">Live</span>} accentTop ready={scriptReady}>
            <ArrayComp tag="array-credit-report" minHeight={600} />
          </ArrayWrapper>
        </div>
      );

      case "debt-analysis": return (
        <div>
          <PageHeader eyebrow="Tools" title="Debt Analysis" sub="Visualize your debt breakdown and utilization." />
          <ArrayWrapper title="Debt Overview" sub="Balances, utilization, and payoff projections"
            accentTop ready={scriptReady}>
            <ArrayComp tag="array-credit-debt-analysis" minHeight={400} />
          </ArrayWrapper>
        </div>
      );

      case "debt-navigator": return (
        <div>
          <PageHeader eyebrow="Tools" title="Debt Navigator" sub="Strategic payoff planning and optimization." />
          <ArrayWrapper title="Debt Payoff Planner" sub="Avalanche vs. snowball strategies for your accounts"
            accentTop ready={scriptReady}>
            <ArrayComp tag="array-debt-navigator" minHeight={400} />
          </ArrayWrapper>
        </div>
      );

      case "student-loan": return (
        <div>
          <PageHeader eyebrow="Tools" title="Student Loan Aid" sub="Repayment options and forgiveness programs." />
          <ArrayWrapper title="Student Loan Dashboard" sub="Income-driven repayment and forgiveness eligibility"
            accentTop ready={scriptReady}>
            <ArrayComp tag="array-student-loan-aid" minHeight={400} />
          </ArrayWrapper>
        </div>
      );

      case "messages":  return <MessagesPage />;
      case "documents": return <DocumentsPage />;
      case "billing":   return <BillingPage />;
      case "profile":   return <ProfilePage />;
      case "settings":  return <SettingsPage />;

      default: return null;
    }
  };

  return (
    <>
      <DemoBanner />
      <div className="cp-portal" style={{ paddingTop: 38 }}>

        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <aside className="cp-sidebar" style={{ top: 38, height: "calc(100vh - 38px)" }}>
          <a className="cp-sidebar-logo" href="/" style={{ textDecoration: "none" }}>
            <img src={scoreshiftLogo} alt="ScoreShift" style={{ width: 36, height: 36, objectFit: "contain", flexShrink: 0 }} />
            <span className="cp-logo-text">ScoreShift</span>
          </a>

          <nav className="cp-sidebar-nav">
            {NAV_SECTIONS.map(section => (
              <div key={section.label}>
                <div className="cp-nav-section-label">{section.label}</div>
                {section.items.map(item => (
                  <button
                    key={item.id}
                    className={`cp-nav-item${activePage === item.id ? " active" : ""}`}
                    onClick={() => navigate(item.id)}
                  >
                    {item.icon}
                    {item.label}
                    {item.badge && (
                      <span className={`cp-nav-badge${item.badgeColor === "amber" ? " amber" : ""}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <div className="cp-sidebar-user">
            <div className="cp-user-avatar">DB</div>
            <div className="cp-user-info">
              <div className="cp-user-name">Donald Blair</div>
              <div className="cp-user-plan">Elite Plan · Demo</div>
            </div>
            <a href="/auth" className="cp-signout-btn" title="Sign up">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            </a>
          </div>
        </aside>

        {/* ── Main ─────────────────────────────────────────────────────── */}
        <div className="cp-main">
          <header className="cp-topbar">
            <span className="cp-topbar-title">{PAGE_TITLES[activePage]}</span>
            <div className="cp-topbar-right">
              <span className="cp-plan-chip">Elite Plan</span>
              <button className="cp-icon-btn" title="Notifications">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span className="cp-notif-dot" />
              </button>
              <button className="cp-icon-btn" title="Settings" onClick={() => navigate("settings")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
            </div>
          </header>

          <div className="cp-content" style={{
            opacity: animating ? 0 : 1,
            transform: animating ? "translateY(6px)" : "translateY(0)",
            transition: "opacity 0.14s ease, transform 0.14s ease",
          }}>
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
}
