import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUserContext } from "@/hooks/use-user-context";
import { useArrayScript } from "@/hooks/use-array-script";
import { useArrayToken } from "@/hooks/use-array-token";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import "@/styles/portal.css";

/* ── Custom element declarations ───────────────────────────────── */
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

/* ── Types ─────────────────────────────────────────────────────── */
type PageId =
  | "dashboard"
  | "score-tracker"
  | "issues"
  | "credit-alerts"
  | "identity"
  | "privacy"
  | "pip-scan"
  | "simulator"
  | "report"
  | "debt-analysis"
  | "debt-navigator"
  | "student-loan"
  | "subscription-manager"
  | "disputes"
  | "messages"
  | "documents"
  | "billing"
  | "profile"
  | "settings";

interface NavItem {
  id: PageId;
  label: string;
  badge?: string;
  badgeColor?: "indigo" | "amber";
  icon: React.ReactNode;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

/* ── Icon helper ────────────────────────────────────────────────── */
function Ico({ d, viewBox = "0 0 24 24" }: { d: string | React.ReactNode; viewBox?: string }) {
  return (
    <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {typeof d === "string" ? <path d={d} /> : d}
    </svg>
  );
}

/* ── Array wrapper component ───────────────────────────────────── */
function ArrayWrapper({
  title,
  sub,
  badge,
  accentTop,
  loading,
  locked,
  children,
}: {
  title: string;
  sub?: string;
  badge?: React.ReactNode;
  accentTop?: boolean;
  loading: boolean;
  locked?: boolean;
  children: React.ReactNode;
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
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <div className="cp-array-locked-title">Feature unavailable</div>
            <div className="cp-array-locked-sub">This feature requires a subscription. Contact your credit advisor to upgrade your plan.</div>
          </div>
        ) : loading ? (
          <div className="cp-array-loading">
            <div className="cp-array-spinner" />
            Loading…
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

/* ── Toggle component ───────────────────────────────────────────── */
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button className={`cp-toggle${on ? "" : " off"}`} onClick={onToggle} aria-pressed={on}>
      <div className="cp-toggle-thumb" />
    </button>
  );
}

/* ── Chat component ─────────────────────────────────────────────── */
function ChatScreen() {
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([
    { from: "advisor", text: "Hi! I'm reviewing your credit report now. I'll have an update for you by end of day." },
    { from: "client", text: "Thank you! I'm also wondering about the Capital One inquiry." },
    { from: "advisor", text: "Great question. Hard inquiries typically remain for 2 years but only impact your score for 12 months. I'll include a note about this in your next report." },
  ]);

  function send() {
    if (!msg.trim()) return;
    setMessages((prev) => [...prev, { from: "client", text: msg.trim() }]);
    setMsg("");
  }

  return (
    <div className="cp-chat-container">
      <div className="cp-chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`cp-chat-msg ${m.from}`}>
            {m.text}
          </div>
        ))}
      </div>
      <div className="cp-chat-input-row">
        <input
          className="cp-chat-input"
          placeholder="Type a message…"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button className="cp-btn cp-btn-primary cp-btn-sm" onClick={send}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
          Send
        </button>
      </div>
    </div>
  );
}

/* ── Disputes page ──────────────────────────────────────────────── */
type EnrichedDispute = {
  id: number;
  bureau: string;
  status: string;
  dateSent: string;
  expectedResponse: string;
  actualResponse: string | null;
  creditor: string;
  issueType: string;
  issueTitle: string;
  outcome: string | null;
};

function fmtDate(val: string | null | undefined): string {
  if (!val) return "—";
  const d = new Date(val);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function DisputesPage() {
  const { data: activeRaw, isLoading: loadingActive } = useQuery<EnrichedDispute[]>({
    queryKey: ["/api/client/disputes?status=active"],
  });
  const active: EnrichedDispute[] = Array.isArray(activeRaw) ? activeRaw : [];

  const { data: resolvedRaw, isLoading: loadingResolved } = useQuery<EnrichedDispute[]>({
    queryKey: ["/api/client/disputes?status=resolved"],
  });
  const resolved: EnrichedDispute[] = Array.isArray(resolvedRaw) ? resolvedRaw : [];

  const statusPillClass = (s: string) => {
    if (s === "PENDING") return "cp-pill pending";
    if (s === "SENT" || s === "DELIVERED") return "cp-pill sent";
    if (s === "FOLLOW_UP_REQUIRED") return "cp-pill warning";
    if (s === "RESOLVED") return "cp-pill resolved";
    if (s === "REJECTED") return "cp-pill error";
    return "cp-pill";
  };

  const statusLabel = (s: string) => {
    if (s === "FOLLOW_UP_REQUIRED") return "Follow-Up";
    return s.charAt(0) + s.slice(1).toLowerCase();
  };

  const bureauLabel = (b: string) =>
    b.charAt(0) + b.slice(1).toLowerCase();

  const typeLabel = (t: string) =>
    t.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div>
      <div className="cp-page-header">
        <div>
          <span className="cp-page-eyebrow">Credit Repair</span>
          <h1 className="cp-page-title">Disputes</h1>
          <p className="cp-page-subtitle">Track every dispute filed with the bureaus — in real time.</p>
        </div>
      </div>

      <div className="cp-disputes-section">
        <div className="cp-card" style={{ width: "100%" }}>
          <div className="cp-card-header">
            <div><div className="cp-card-title">Active Disputes</div></div>
            {!loadingActive && (
              <span className="cp-badge warning">{active.length} Pending</span>
            )}
          </div>
          {loadingActive ? (
            <div style={{ padding: "2rem", textAlign: "center", opacity: 0.5 }}>Loading…</div>
          ) : active.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", opacity: 0.5 }}>
              No active disputes found.
            </div>
          ) : (
            <div className="cp-table-scroll">
              <table className="cp-table">
                <thead>
                  <tr><th>Account</th><th>Bureau</th><th>Type</th><th>Sent</th><th>Status</th><th>Response Due</th></tr>
                </thead>
                <tbody>
                  {active.map(d => (
                    <tr key={d.id}>
                      <td><strong>{d.creditor}{d.issueType ? ` — ${typeLabel(d.issueType)}` : ""}</strong></td>
                      <td>{bureauLabel(d.bureau)}</td>
                      <td>{typeLabel(d.issueType)}</td>
                      <td>{fmtDate(d.dateSent)}</td>
                      <td><span className={statusPillClass(d.status)}>{statusLabel(d.status)}</span></td>
                      <td>{fmtDate(d.expectedResponse)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="cp-card" style={{ width: "100%" }}>
          <div className="cp-card-header">
            <div><div className="cp-card-title">Resolved</div></div>
            {!loadingResolved && (
              <span className="cp-badge success">{resolved.length} Resolved</span>
            )}
          </div>
          {loadingResolved ? (
            <div style={{ padding: "2rem", textAlign: "center", opacity: 0.5 }}>Loading…</div>
          ) : resolved.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", opacity: 0.5 }}>
              No resolved disputes yet.
            </div>
          ) : (
            <div className="cp-table-scroll">
              <table className="cp-table">
                <thead>
                  <tr><th>Account</th><th>Bureau</th><th>Resolved</th><th>Outcome</th></tr>
                </thead>
                <tbody>
                  {resolved.map(d => (
                    <tr key={d.id}>
                      <td><strong>{d.creditor}{d.issueType ? ` — ${typeLabel(d.issueType)}` : ""}</strong></td>
                      <td>{bureauLabel(d.bureau)}</td>
                      <td>{fmtDate(d.actualResponse ?? d.dateSent)}</td>
                      <td><span className="cp-pill resolved">{d.outcome ?? statusLabel(d.status)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────── */
export default function ClientPortal() {
  const { user, logout } = useUserContext();
  const { appKey, token: userToken, isReady: tokenReady, error: tokenError } = useArrayToken();
  const { loaded: scriptReady } = useArrayScript(appKey || undefined);
  const featureAccess = useFeatureAccess();
  const [activePage, setActivePage] = useState<PageId>("dashboard");
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({ scoreChanges: true, newAlerts: true, disputeUpdates: true, marketing: false });

  const tierLabel = featureAccess.tier === "none" ? "Free" : featureAccess.tier.charAt(0).toUpperCase() + featureAccess.tier.slice(1) + " Plan";

  /* ── Nav sections ───────────────────────────────────────────── */
  const NAV_SECTIONS: NavSection[] = [
    {
      label: "Overview",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          ),
        },
      ],
    },
    {
      label: "Credit Repair",
      items: [
        {
          id: "issues" as PageId,
          label: "Credit Issues & Alerts",
          badge: "3",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ),
        },
        {
          id: "disputes" as PageId,
          label: "Disputes",
          badge: "2",
          badgeColor: "amber" as const,
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" /><line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          ),
        },
      ],
    },
    {
      label: "Monitoring",
      items: [
        {
          id: "score-tracker" as PageId,
          label: "Score Tracker",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          ),
        },
        {
          id: "identity" as PageId,
          label: "Identity Protection",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          ),
        },
        {
          id: "privacy" as PageId,
          label: "Privacy Protection",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          ),
        },
        {
          id: "pip-scan" as PageId,
          label: "PIP Scan Results",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          ),
        },
        {
          id: "credit-alerts" as PageId,
          label: "Credit Alerts",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          ),
        },
      ],
    },
    {
      label: "Tools",
      items: [
        {
          id: "simulator" as PageId,
          label: "Score Simulator",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          ),
        },
        {
          id: "report" as PageId,
          label: "Full Report",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          ),
        },
        {
          id: "debt-analysis" as PageId,
          label: "Debt Analysis",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          ),
        },
        {
          id: "debt-navigator" as PageId,
          label: "Debt Navigator",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
          ),
        },
        {
          id: "student-loan" as PageId,
          label: "Student Loan Aid",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          ),
        },
        {
          id: "subscription-manager" as PageId,
          label: "Subscription Manager",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          ),
        },
      ],
    },
    {
      label: "Communication",
      items: [
        {
          id: "messages" as PageId,
          label: "Messages",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          ),
        },
        {
          id: "documents" as PageId,
          label: "Documents",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          ),
        },
      ],
    },
    {
      label: "Account",
      items: [
        {
          id: "billing" as PageId,
          label: "Billing",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          ),
        },
        {
          id: "profile" as PageId,
          label: "Profile",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          ),
        },
        {
          id: "settings" as PageId,
          label: "Settings",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          ),
        },
      ],
    },
  ];

  /* ── Page titles ────────────────────────────────────────────── */
  const PAGE_TITLES: Record<PageId, string> = {
    dashboard: "Dashboard",
    "score-tracker": "Score Tracker",
    issues: "Credit Issues & Alerts",
    "credit-alerts": "Credit Alerts",
    identity: "Identity Protection",
    privacy: "Privacy Protection",
    "pip-scan": "PIP Scan Results",
    simulator: "Score Simulator",
    report: "Full Credit Report",
    "debt-analysis": "Debt Analysis",
    "debt-navigator": "Debt Navigator",
    "student-loan": "Student Loan Aid",
    "subscription-manager": "Subscription Manager",
    disputes: "Disputes",
    messages: "Messages",
    documents: "Documents",
    billing: "Billing & Plan",
    profile: "Profile",
    settings: "Settings",
  };

  /* ── User initials ──────────────────────────────────────────── */
  const initials = user
    ? ((user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? user.username?.[0] ?? "")).toUpperCase() || "U"
    : "U";

  const displayName = user ? (user.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : user.username) : "User";

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="cp-portal">
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="cp-sidebar">
        <a className="cp-sidebar-logo" href="#" onClick={(e) => { e.preventDefault(); setActivePage("dashboard"); }}>
          <div className="cp-logo-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span className="cp-logo-text">ScoreShift</span>
        </a>

        <nav className="cp-sidebar-nav">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <div className="cp-nav-section-label">{section.label}</div>
              {section.items.map((item) => (
                <button
                  key={item.id}
                  className={`cp-nav-item${activePage === item.id ? " active" : ""}`}
                  onClick={() => setActivePage(item.id)}
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
          <div className="cp-user-avatar">{initials}</div>
          <div className="cp-user-info">
            <div className="cp-user-name">{displayName}</div>
            <div className="cp-user-plan">{tierLabel}</div>
          </div>
          <button className="cp-signout-btn" title="Sign out" onClick={logout}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────── */}
      <div className="cp-main">
        {/* Topbar */}
        <header className="cp-topbar">
          <span className="cp-topbar-title">{PAGE_TITLES[activePage]}</span>
          <div className="cp-topbar-right">
            <span className="cp-plan-chip">{tierLabel}</span>
            <button className="cp-icon-btn" title="Notifications" onClick={() => setNotifOpen(!notifOpen)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="cp-notif-dot" />
            </button>
            <button className="cp-icon-btn" title="Settings" onClick={() => setActivePage("settings")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Content area */}
        <div className="cp-content">

          {/* ══ DASHBOARD ══════════════════════════════════════ */}
          {activePage === "dashboard" && (
            <div>
              {/* Welcome Banner */}
              <div className="cp-welcome-banner cp-mb-24">
                <div className="cp-welcome-left">
                  <div className="cp-welcome-eyebrow">WELCOME BACK</div>
                  <div className="cp-welcome-name">Good morning, {user?.firstName || displayName}.</div>
                  <div className="cp-welcome-sub">Your credit health is trending up. Here's your snapshot for {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.</div>
                </div>
                <div className="cp-welcome-stats">
                  <div className="cp-welcome-stat">
                    <div className="cp-welcome-stat-value" style={{ color: "#2dd4bf" }}>+47</div>
                    <div className="cp-welcome-stat-label">pts gained</div>
                  </div>
                  <div className="cp-welcome-stat">
                    <div className="cp-welcome-stat-value">7</div>
                    <div className="cp-welcome-stat-label">items removed</div>
                  </div>
                  <div className="cp-welcome-stat">
                    <div className="cp-welcome-stat-value" style={{ color: "#2dd4bf" }}>802</div>
                    <div className="cp-welcome-stat-label">top score</div>
                  </div>
                </div>
              </div>

              {/* Array Credit Overview — full width */}
              <div className="cp-mb-24">
                <ArrayWrapper
                  title="Credit Overview"
                  sub="Live 3-bureau credit health summary"
                  badge={<span className="cp-badge live">Live</span>}
                  accentTop
                  loading={!scriptReady || (!tokenReady && !tokenError)}
                  locked={tokenError}
                >
                  <array-credit-overview appKey={appKey} userToken={userToken} />
                </ArrayWrapper>
              </div>

              {/* Stat cards */}
              <div className="cp-grid-4 cp-mb-24">
                <div className="cp-stat-card">
                  <div className="cp-stat-icon amber">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  </div>
                  <div><div className="cp-stat-value">3</div><div className="cp-stat-label">Active Issues</div></div>
                </div>
                <div className="cp-stat-card">
                  <div className="cp-stat-icon indigo">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                  </div>
                  <div><div className="cp-stat-value">2</div><div className="cp-stat-label">Disputes In Progress</div></div>
                </div>
                <div className="cp-stat-card">
                  <div className="cp-stat-icon green">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <div><div className="cp-stat-value">7</div><div className="cp-stat-label">Items Resolved</div></div>
                </div>
                <div className="cp-stat-card">
                  <div className="cp-stat-icon teal">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  </div>
                  <div><div className="cp-stat-value" style={{ fontSize: 16, color: "#14b8a6" }}>Active</div><div className="cp-stat-label">Identity Protection</div></div>
                </div>
              </div>

              {/* Pipeline + Recent Alerts side by side */}
              <div className="cp-grid-2">
                <div className="cp-card">
                  <div className="cp-card-header">
                    <div>
                      <div className="cp-card-title">Dispute Pipeline</div>
                      <div className="cp-card-subtitle">Your current repair workflow</div>
                    </div>
                    <span className="cp-badge info">2 Active</span>
                  </div>
                  <div className="cp-pipeline">
                    <div className="cp-pipeline-progress" />
                    {[
                      { label: "Pull Report", done: true, icon: <polyline points="20 6 9 17 4 12" /> },
                      { label: "Analyze", done: true, icon: <polyline points="20 6 9 17 4 12" /> },
                      { label: "Strategy", done: true, icon: <polyline points="20 6 9 17 4 12" /> },
                      {
                        label: "Letters",
                        active: true,
                        icon: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>,
                      },
                      {
                        label: "Mail",
                        icon: <><rect x="1" y="3" width="15" height="13" rx="1" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /></>,
                      },
                      { label: "Track", icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /> },
                    ].map((step) => (
                      <div key={step.label} className={`cp-pipeline-step${step.done ? " done" : step.active ? " active" : ""}`}>
                        <div className="cp-pipeline-dot">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {step.icon}
                          </svg>
                        </div>
                        <div className="cp-pipeline-label">{step.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="cp-divider" />
                  <div className="cp-flex-between">
                    <span style={{ fontSize: 12.5, color: "var(--cp-text-muted)" }}>Next: Send certified mail to Equifax</span>
                    <button className="cp-btn cp-btn-primary cp-btn-sm" onClick={() => setActivePage("disputes")}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                      Continue
                    </button>
                  </div>
                </div>

                {/* Recent Alerts */}
                <div className="cp-card">
                  <div className="cp-card-header">
                    <div>
                      <div className="cp-card-title">Recent Alerts</div>
                      <div className="cp-card-subtitle">Changes detected across all 3 bureaus</div>
                    </div>
                    <span className="cp-badge live">Live</span>
                  </div>
                  {[
                    { type: "positive", text: "Score increased by +22 points", meta: "Today, 8:14 AM · Equifax" },
                    { type: "negative", text: "New inquiry detected — Capital One", meta: "Yesterday, 3:40 PM · TransUnion" },
                    { type: "positive", text: "Collection account removed", meta: "May 4, 2026 · All Bureaus" },
                    { type: "neutral", text: "Certified mail delivered", meta: "May 3, 2026 · Experian" },
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
            </div>
          )}

          {/* ══ SCORE TRACKER ══════════════════════════════════ */}
          {activePage === "score-tracker" && (
            <div>
              <div className="cp-page-header">
                <div>
                  <span className="cp-page-eyebrow">Monitoring</span>
                  <h1 className="cp-page-title">Score Tracker</h1>
                  <p className="cp-page-subtitle">Live 3-bureau score history and trend analysis.</p>
                </div>
                <span className="cp-badge live">Live Monitoring</span>
              </div>
              <ArrayWrapper
                title="3-Bureau Score History"
                sub="VantageScore 3.0 — updated with every report pull"
                badge={<span className="cp-badge live">Live</span>}
                accentTop
                loading={!scriptReady || (!tokenReady && !tokenError)}
              locked={tokenError}
              >
                <array-credit-score appKey={appKey} userToken={userToken} bureau="all" scoreTracker="true" />
              </ArrayWrapper>
            </div>
          )}

          {/* ══ CREDIT ISSUES & ALERTS ══════════════════════════ */}
          {activePage === "issues" && (
            <div>
              <div className="cp-page-header">
                <div>
                  <span className="cp-page-eyebrow">Credit Repair</span>
                  <h1 className="cp-page-title">Credit Issues</h1>
                  <p className="cp-page-subtitle">Active negative items and live credit alerts — everything that's changed on your report.</p>
                </div>
                <span className="cp-badge live">Live Monitoring</span>
              </div>

              <div className="cp-info-banner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                <span><strong>Read-only view</strong> — your advisor manages all dispute submissions on your behalf.</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {/* Issues table */}
                <div className="cp-card cp-card-accent-top">
                  <div className="cp-card-header">
                    <div>
                      <div className="cp-card-title">Active Negative Items</div>
                      <div className="cp-card-subtitle">3 items identified across all bureaus</div>
                    </div>
                    <span className="cp-badge warning">3 Items</span>
                  </div>
                  <table className="cp-table">
                    <thead><tr><th>Account</th><th>Bureau</th><th>Impact</th><th>Status</th><th /></tr></thead>
                    <tbody>
                      <tr>
                        <td><strong>Capital One — Late Payment</strong></td>
                        <td>Equifax</td>
                        <td><span className="cp-pill negative">High</span></td>
                        <td><span className="cp-pill pending">In Dispute</span></td>
                        <td><button className="cp-btn cp-btn-secondary cp-btn-sm">View</button></td>
                      </tr>
                      <tr>
                        <td><strong>Midland Credit — Collection</strong></td>
                        <td>TransUnion</td>
                        <td><span className="cp-pill negative">High</span></td>
                        <td><span className="cp-pill pending">In Dispute</span></td>
                        <td><button className="cp-btn cp-btn-secondary cp-btn-sm">View</button></td>
                      </tr>
                      <tr>
                        <td><strong>Chase — Hard Inquiry</strong></td>
                        <td>Experian</td>
                        <td><span className="cp-pill info">Low</span></td>
                        <td><span className="cp-pill info">Identified</span></td>
                        <td><button className="cp-btn cp-btn-secondary cp-btn-sm">View</button></td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="cp-divider" />
                  <div className="cp-flex-between" style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--cp-text-secondary)" }}>Repair Progress</span>
                    <span className="cp-grad-text" style={{ fontSize: 12, fontWeight: 700 }}>70%</span>
                  </div>
                  <div className="cp-progress-bar"><div className="cp-progress-fill" style={{ width: "70%" }} /></div>
                  <div style={{ fontSize: 11.5, color: "var(--cp-text-muted)", marginTop: 8 }}>7 of 10 items resolved — 3 remaining</div>
                </div>

                {/* Live alerts */}
                <ArrayWrapper
                  title="Live Credit Alerts"
                  sub="Real-time changes detected across all 3 bureaus"
                  badge={<span className="cp-badge live">Live</span>}
                  accentTop
                  loading={!scriptReady || (!tokenReady && !tokenError)}
                locked={tokenError}
                >
                  <array-credit-alerts appKey={appKey} userToken={userToken} />
                </ArrayWrapper>
              </div>
            </div>
          )}

          {/* ══ IDENTITY PROTECTION ════════════════════════════ */}
          {activePage === "identity" && (
            <div>
              <div className="cp-page-header">
                <div>
                  <span className="cp-page-eyebrow">Monitoring</span>
                  <h1 className="cp-page-title">Identity Protection</h1>
                  <p className="cp-page-subtitle">Dark web monitoring, SSN alerts, and fraud protection — active 24/7.</p>
                </div>
              </div>
              <ArrayWrapper
                title="Identity Protection Dashboard"
                sub="Monitoring dark web, data breaches, and SSN usage"
                badge={<span className="cp-badge live">Live</span>}
                loading={!scriptReady || (!tokenReady && !tokenError)}
                locked={tokenError}
              >
                <array-identity-protect appKey={appKey} userToken={userToken} />
              </ArrayWrapper>
            </div>
          )}

          {/* ══ PRIVACY PROTECTION ═════════════════════════════ */}
          {activePage === "privacy" && (
            <div>
              <div className="cp-page-header">
                <div>
                  <span className="cp-page-eyebrow">Monitoring</span>
                  <h1 className="cp-page-title">Privacy Protection</h1>
                  <p className="cp-page-subtitle">Remove your personal information from data broker sites automatically.</p>
                </div>
              </div>
              <ArrayWrapper
                title="Privacy Protection Dashboard"
                sub="Data broker removal — opt-out requests managed for you"
                loading={!scriptReady || (!tokenReady && !tokenError)}
                locked={tokenError}
              >
                <array-pip-dashboard appKey={appKey} userToken={userToken} />
              </ArrayWrapper>
            </div>
          )}

          {/* ══ PIP SCAN ════════════════════════════════════════ */}
          {activePage === "pip-scan" && (
            <div>
              <div className="cp-page-header">
                <div>
                  <span className="cp-page-eyebrow">Monitoring</span>
                  <h1 className="cp-page-title">PIP Scan Results</h1>
                  <p className="cp-page-subtitle">See exactly where your personal information has been found online.</p>
                </div>
              </div>
              <ArrayWrapper
                title="Data Broker Scan"
                sub="Sites that have your personal information listed"
                loading={!scriptReady || (!tokenReady && !tokenError)}
                locked={tokenError}
              >
                <array-pip-scan appKey={appKey} userToken={userToken} />
              </ArrayWrapper>
            </div>
          )}

          {/* ══ CREDIT ALERTS ════════════════════════════════════ */}
          {activePage === "credit-alerts" && (
            <div>
              <div className="cp-page-header">
                <div>
                  <span className="cp-page-eyebrow">Monitoring</span>
                  <h1 className="cp-page-title">Credit Alerts</h1>
                  <p className="cp-page-subtitle">Real-time alerts for any change detected across all three credit bureaus.</p>
                </div>
              </div>
              <ArrayWrapper
                title="Live Credit Alerts"
                sub="New inquiries, account openings, derogatory marks, and more — instant notifications"
                badge={<span className="cp-badge live">Live</span>}
                accentTop
                loading={!scriptReady || (!tokenReady && !tokenError)}
                locked={tokenError}
              >
                <array-credit-alerts appKey={appKey} userToken={userToken} />
              </ArrayWrapper>
            </div>
          )}

          {/* ══ SCORE SIMULATOR ═════════════════════════════════ */}
          {activePage === "simulator" && (
            <div>
              <div className="cp-page-header">
                <div>
                  <span className="cp-page-eyebrow">Tools</span>
                  <h1 className="cp-page-title">Score Simulator</h1>
                  <p className="cp-page-subtitle">Model how credit actions would impact your score before you take them.</p>
                </div>
              </div>
              <ArrayWrapper
                title="Score Impact Simulator"
                sub="See the projected effect of paying down debt, removing items, and more"
                loading={!scriptReady || (!tokenReady && !tokenError)}
                locked={tokenError}
              >
                <array-credit-score-simulator appKey={appKey} userToken={userToken} />
              </ArrayWrapper>
            </div>
          )}

          {/* ══ FULL REPORT ═════════════════════════════════════ */}
          {activePage === "report" && (
            <div>
              <div className="cp-page-header">
                <div>
                  <span className="cp-page-eyebrow">Tools</span>
                  <h1 className="cp-page-title">Full Credit Report</h1>
                  <p className="cp-page-subtitle">Complete 3-bureau credit report — all accounts, inquiries, and history.</p>
                </div>
              </div>
              <ArrayWrapper
                title="3-Bureau Credit Report"
                sub="Live data — all three bureaus in one view"
                badge={<span className="cp-badge blue-bureaus">All Bureaus</span>}
                loading={!scriptReady || (!tokenReady && !tokenError)}
                locked={tokenError}
              >
                <array-credit-report appKey={appKey} userToken={userToken} defaultBureau="all" />
              </ArrayWrapper>
            </div>
          )}

          {/* ══ DEBT ANALYSIS ═══════════════════════════════════ */}
          {activePage === "debt-analysis" && (
            <div>
              <div className="cp-page-header">
                <div>
                  <span className="cp-page-eyebrow">Tools</span>
                  <h1 className="cp-page-title">Debt Analysis</h1>
                  <p className="cp-page-subtitle">Full breakdown of your balances, utilization, and monthly obligations.</p>
                </div>
              </div>
              <ArrayWrapper
                title="Debt & Utilization Breakdown"
                sub="Live data from all open accounts across all bureaus"
                badge={<span className="cp-badge live">Live</span>}
                loading={!scriptReady || (!tokenReady && !tokenError)}
                locked={tokenError}
              >
                <array-credit-debt-analysis appKey={appKey} userToken={userToken} />
              </ArrayWrapper>
            </div>
          )}

          {/* ══ DEBT NAVIGATOR ══════════════════════════════════ */}
          {activePage === "debt-navigator" && (
            <div>
              <div className="cp-page-header">
                <div>
                  <span className="cp-page-eyebrow">Tools</span>
                  <h1 className="cp-page-title">Debt Navigator</h1>
                  <p className="cp-page-subtitle">Personalized payoff strategies to eliminate debt faster and boost your score.</p>
                </div>
              </div>
              <ArrayWrapper
                title="Debt Payoff Planner"
                sub="Avalanche, snowball, and custom payoff strategies"
                loading={!scriptReady || (!tokenReady && !tokenError)}
                locked={tokenError}
              >
                <array-debt-navigator appKey={appKey} userToken={userToken} />
              </ArrayWrapper>
            </div>
          )}

          {/* ══ STUDENT LOAN AID ════════════════════════════════ */}
          {activePage === "student-loan" && (
            <div>
              <div className="cp-page-header">
                <div>
                  <span className="cp-page-eyebrow">Tools</span>
                  <h1 className="cp-page-title">Student Loan Aid</h1>
                  <p className="cp-page-subtitle">Find repayment plans, forgiveness programs, and refinancing options.</p>
                </div>
              </div>
              <ArrayWrapper
                title="Student Loan Management"
                sub="Repayment options, IDR plans, and forgiveness eligibility"
                loading={!scriptReady || (!tokenReady && !tokenError)}
                locked={tokenError}
              >
                <array-student-loan-aid appKey={appKey} userToken={userToken} />
              </ArrayWrapper>
            </div>
          )}

          {/* ══ SUBSCRIPTION MANAGER ════════════════════════════ */}
          {activePage === "subscription-manager" && (
            <div>
              <div className="cp-page-header">
                <div>
                  <span className="cp-page-eyebrow">Tools</span>
                  <h1 className="cp-page-title">Subscription Manager</h1>
                  <p className="cp-page-subtitle">Manage your plan, payment method, and billing history.</p>
                </div>
              </div>
              <ArrayWrapper
                title="Subscription Manager"
                sub="Update your plan, add a payment method, and view billing history"
                badge={<span className="cp-badge live">Live</span>}
                loading={!scriptReady || (!tokenReady && !tokenError)}
                locked={tokenError}
              >
                <array-subscription-manager appKey={appKey} userToken={userToken} provider="plaid" mode="premium" />
              </ArrayWrapper>
            </div>
          )}

          {/* ══ DISPUTES ════════════════════════════════════════ */}
          {activePage === "disputes" && <DisputesPage />}

          {/* ══ MESSAGES ════════════════════════════════════════ */}
          {activePage === "messages" && (
            <div>
              <div className="cp-page-header">
                <div>
                  <span className="cp-page-eyebrow">Communication</span>
                  <h1 className="cp-page-title">Messages</h1>
                  <p className="cp-page-subtitle">Chat directly with your credit advisor.</p>
                </div>
              </div>
              <ChatScreen />
            </div>
          )}

          {/* ══ DOCUMENT VAULT ══════════════════════════════════ */}
          {activePage === "documents" && (
            <div>
              <div className="cp-page-header">
                <div>
                  <span className="cp-page-eyebrow">Communication</span>
                  <h1 className="cp-page-title">Document Vault</h1>
                  <p className="cp-page-subtitle">Securely upload and access your credit-related documents.</p>
                </div>
                <button className="cp-btn cp-btn-primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  Upload Document
                </button>
              </div>

              <div className="cp-grid-3 cp-mb-24">
                {[
                  { label: "Government ID", sub: "Uploaded May 1, 2026", icon: "🪪", status: "verified" },
                  { label: "Credit Report", sub: "Uploaded Apr 28, 2026", icon: "📄", status: "on-file" },
                  { label: "Bureau Response", sub: "Received May 4, 2026", icon: "📬", status: "received" },
                ].map((doc, i) => (
                  <div key={i} className="cp-card cp-flex-between" style={{ flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ fontSize: 28 }}>{doc.icon}</div>
                    <div>
                      <div className="cp-card-title">{doc.label}</div>
                      <div className="cp-card-subtitle">{doc.sub}</div>
                    </div>
                    <div className="cp-flex-between" style={{ width: "100%" }}>
                      <span className="cp-pill active">{doc.status}</span>
                      <button className="cp-btn cp-btn-secondary cp-btn-sm">View</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cp-card">
                <div className="cp-empty-state">
                  <div className="cp-empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                  </div>
                  <div className="cp-empty-title">Upload additional documents</div>
                  <div className="cp-empty-desc">Drag and drop files here, or click "Upload Document" above to add police reports, FTC reports, SSN cards, and more.</div>
                </div>
              </div>
            </div>
          )}

          {/* ══ BILLING & PLAN ══════════════════════════════════ */}
          {activePage === "billing" && (
            <div>
              <div className="cp-page-header">
                <div>
                  <span className="cp-page-eyebrow">Account</span>
                  <h1 className="cp-page-title">Billing & Plan</h1>
                  <p className="cp-page-subtitle">Manage your ScoreShift subscription and payment method.</p>
                </div>
              </div>

              <div className="cp-card cp-mb-24">
                <div className="cp-card-header">
                  <div>
                    <div className="cp-card-title">Current Plan</div>
                    <div className="cp-card-subtitle">Your active ScoreShift subscription</div>
                  </div>
                  <span style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, boxShadow: "0 2px 8px rgba(99,102,241,0.3)" }}>
                    {featureAccess.tier === "none" ? "Free" : featureAccess.tier.charAt(0).toUpperCase() + featureAccess.tier.slice(1)}
                  </span>
                </div>
                <div className="cp-font-sora" style={{ fontSize: 36, fontWeight: 800, letterSpacing: -2, marginBottom: 4 }}>
                  <span className="cp-grad-text">
                    {featureAccess.tier === "starter" ? "$29" : featureAccess.tier === "pro" ? "$79" : featureAccess.tier === "elite" ? "$149" : "$0"}
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 400, color: "var(--cp-text-muted)", letterSpacing: 0 }}>/month</span>
                </div>
                <div className="cp-text-muted cp-text-sm">
                  Next billing date: <strong style={{ color: "var(--cp-text-primary)" }}>June 6, 2026</strong>
                </div>
              </div>

              <div className="cp-grid-2">
                <div className="cp-card">
                  <div className="cp-card-title cp-mb-18">Payment Method</div>
                  <div className="cp-flex-between cp-mb-18">
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 44, height: 30, background: "linear-gradient(135deg,#1a1a2e,#16213e)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "white", fontSize: 9, fontWeight: 700 }}>VISA</span>
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--cp-text-primary)" }}>•••• •••• •••• 4242</div>
                        <div className="cp-text-muted cp-text-sm">Expires 08/28</div>
                      </div>
                    </div>
                    <span className="cp-badge success">Active</span>
                  </div>
                  <button className="cp-btn cp-btn-secondary cp-btn-sm">Update Card</button>
                </div>

                <div className="cp-card">
                  <div className="cp-card-title cp-mb-18">Upgrade Your Plan</div>
                  <div style={{ fontSize: 13.5, color: "var(--cp-text-muted)", marginBottom: 16, lineHeight: 1.6 }}>
                    Unlock more features, more monitoring, and full identity protection with a higher tier.
                  </div>
                  <button className="cp-btn cp-btn-primary" onClick={() => window.location.href = "/pricing"}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                    View Plans
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══ PROFILE ═════════════════════════════════════════ */}
          {activePage === "profile" && (
            <div>
              <div className="cp-page-header">
                <div>
                  <span className="cp-page-eyebrow">Account</span>
                  <h1 className="cp-page-title">Profile</h1>
                  <p className="cp-page-subtitle">Your personal information and contact details.</p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div className="cp-card">
                  <div className="cp-card-header" style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "white", flexShrink: 0 }}>
                        {((user?.firstName?.[0] ?? "") + (user?.lastName?.[0] ?? user?.username?.[0] ?? "")).toUpperCase() || "U"}
                      </div>
                      <div>
                        <div style={{ fontSize: 17, fontWeight: 700, color: "var(--cp-text-primary)", marginBottom: 2 }}>
                          {user?.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : user?.username}
                        </div>
                        <div className="cp-text-muted cp-text-sm">{user?.email ?? "No email on file"}</div>
                        <span style={{ display: "inline-block", marginTop: 6, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20, letterSpacing: "0.05em" }}>
                          {tierLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="cp-card-title cp-mb-18">Personal Information</div>
                  <div className="cp-grid-2" style={{ gap: 14, marginBottom: 14 }}>
                    <div>
                      <label className="cp-form-label">First Name</label>
                      <input className="cp-form-input" defaultValue={user?.firstName ?? ""} placeholder="First name" />
                    </div>
                    <div>
                      <label className="cp-form-label">Last Name</label>
                      <input className="cp-form-input" defaultValue={user?.lastName ?? ""} placeholder="Last name" />
                    </div>
                    <div>
                      <label className="cp-form-label">Email Address</label>
                      <input className="cp-form-input" defaultValue={user?.email ?? ""} placeholder="your@email.com" type="email" />
                    </div>
                    <div>
                      <label className="cp-form-label">Phone Number</label>
                      <input className="cp-form-input" defaultValue="" placeholder="+1 (555) 000-0000" type="tel" />
                    </div>
                  </div>
                  <button className="cp-btn cp-btn-primary cp-btn-sm">Save Changes</button>
                </div>
              </div>
            </div>
          )}

          {/* ══ SETTINGS ════════════════════════════════════════ */}
          {activePage === "settings" && (
            <div>
              <div className="cp-page-header">
                <div>
                  <span className="cp-page-eyebrow">Account</span>
                  <h1 className="cp-page-title">Settings</h1>
                  <p className="cp-page-subtitle">Manage your notifications, security, and preferences.</p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {/* Security */}
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
                      <div className="cp-settings-row-sub">Add an extra layer of security to your account</div>
                    </div>
                    <button className="cp-btn cp-btn-secondary cp-btn-sm">Enable</button>
                  </div>
                </div>

                {/* Notifications */}
                <div className="cp-card">
                  <div className="cp-card-title cp-mb-18">Notification Preferences</div>
                  <div className="cp-settings-row">
                    <div>
                      <div className="cp-settings-row-label">Score Changes</div>
                      <div className="cp-settings-row-sub">Get notified when your score moves</div>
                    </div>
                    <Toggle on={notifPrefs.scoreChanges} onToggle={() => setNotifPrefs(p => ({ ...p, scoreChanges: !p.scoreChanges }))} />
                  </div>
                  <div className="cp-settings-row">
                    <div>
                      <div className="cp-settings-row-label">New Alerts</div>
                      <div className="cp-settings-row-sub">Receive alerts for new items on your report</div>
                    </div>
                    <Toggle on={notifPrefs.newAlerts} onToggle={() => setNotifPrefs(p => ({ ...p, newAlerts: !p.newAlerts }))} />
                  </div>
                  <div className="cp-settings-row">
                    <div>
                      <div className="cp-settings-row-label">Dispute Updates</div>
                      <div className="cp-settings-row-sub">Updates on your active disputes</div>
                    </div>
                    <Toggle on={notifPrefs.disputeUpdates} onToggle={() => setNotifPrefs(p => ({ ...p, disputeUpdates: !p.disputeUpdates }))} />
                  </div>
                  <div className="cp-settings-row">
                    <div>
                      <div className="cp-settings-row-label">Marketing Emails</div>
                      <div className="cp-settings-row-sub">Tips, guides, and product updates</div>
                    </div>
                    <Toggle on={notifPrefs.marketing} onToggle={() => setNotifPrefs(p => ({ ...p, marketing: !p.marketing }))} />
                  </div>
                </div>

                {/* Danger zone */}
                <div className="cp-card" style={{ borderColor: "var(--cp-red-light)" }}>
                  <div className="cp-card-title cp-mb-18" style={{ color: "var(--cp-red)" }}>Danger Zone</div>
                  <div className="cp-settings-row">
                    <div>
                      <div className="cp-settings-row-label">Sign Out</div>
                      <div className="cp-settings-row-sub">Sign out of your account on this device</div>
                    </div>
                    <button className="cp-btn cp-btn-secondary cp-btn-sm" onClick={logout}>Sign Out</button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
