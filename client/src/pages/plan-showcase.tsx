import { useState, useEffect } from "react";
import { UserContext } from "@/hooks/use-user-context";
import { DEMO_USER, DEMO_PROFILE, DEMO_PACKAGE, DemoDataProvider } from "@/lib/demo-data.tsx";
import scoreshiftLogo from "@assets/scoreshift-logo.png";
import "../styles/plan-showcase.css";

function extractPts(detail: string): string {
  const m = detail.match(/\+(\d+)\s*pts/);
  return m ? `+${m[1]} pts` : "";
}

function statusLabel(status: string): string {
  if (status === "in_progress") return "In progress";
  if (status === "completed")   return "Completed";
  return "Action needed";
}

function navigateToAuth() {
  try {
    if (window.top && window.top !== window) {
      window.top.location.href = "/auth";
    } else {
      window.location.href = "/auth";
    }
  } catch {
    window.location.href = "/auth";
  }
}

function WifiIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
      <path d="M0.5 4.5C3.5 1.5 12.5 1.5 15.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M3 7c1.8-1.8 8.2-1.8 10 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5.5 9.5c1-.98 4-.98 5 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="8" cy="12" r="1.3" fill="currentColor"/>
    </svg>
  );
}
function BatteryIcon() {
  return (
    <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
      <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" strokeOpacity="0.35"/>
      <rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor"/>
      <path d="M23 4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.4"/>
    </svg>
  );
}
function SignalIcon() {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
      <rect x="0"  y="7" width="3" height="5" rx="1" fill="currentColor"/>
      <rect x="4.5" y="4.5" width="3" height="7.5" rx="1" fill="currentColor"/>
      <rect x="9" y="2" width="3" height="10" rx="1" fill="currentColor"/>
      <rect x="13.5" y="0" width="3" height="12" rx="1" fill="currentColor" opacity="0.35"/>
    </svg>
  );
}

const DEMO_USER_CTX = {
  user: DEMO_USER,
  isAdmin: false,
  isBetaTester: false,
  isClientViewer: true,
  canCreateDisputes: false,
  canAccessAI: false,
  canAccessCreditBuilding: false,
  canAccessEducation: false,
  setCurrentUserId: () => {},
  logout: () => {},
};

/* Palette-mapped bureau scores — brand tokens only */
const SCORE_DISPLAY = [
  { bureau: "EX", score: DEMO_PROFILE.scores.experian!,   color: "var(--ps-indigo)" },
  { bureau: "EQ", score: DEMO_PROFILE.scores.equifax!,    color: "var(--ps-charcoal)" },
  { bureau: "TU", score: DEMO_PROFILE.scores.transunion!, color: "var(--ps-sage)" },
];

/* Enrich each plan item with drawer detail — matched to demo tradeline data */
type CardDetail = {
  accountType: string;
  balance: string;
  bureau: string;
  statute?: string;
  why: string;
};

const CARD_DETAILS: Record<string, CardDetail> = {
  "Dispute MIDLAND FUNDING LLC": {
    accountType: "Collection Account",
    balance: "$847",
    bureau: "Experian",
    statute: "§1681e(b)",
    why: "Inaccurate reporting — balance does not match original creditor records.",
  },
  "Lower utilization on Amex": {
    accountType: "Credit Card",
    balance: "$2,140 / $3,000",
    bureau: "All 3 bureaus",
    why: "Utilization at 71% — dropping below 30% could add up to 18 pts.",
  },
  "Remove PORTFOLIO RECOVERY": {
    accountType: "Collection Account",
    balance: "$312",
    bureau: "TransUnion",
    statute: "§1681i",
    why: "Unverifiable debt — no signed agreement on file. Eligible for deletion request.",
  },
};

interface DrawerProps {
  item: typeof DEMO_PROFILE.planSuggestions[0];
  pts: string;
  ptsColor: string;
  onClose: () => void;
}

function CardDrawer({ item, pts, ptsColor, onClose }: DrawerProps) {
  const detail = CARD_DETAILS[item.title];
  return (
    <div className="ps-drawer-backdrop" onClick={onClose}>
      <div className="ps-drawer" onClick={e => e.stopPropagation()}>
        <div className="ps-drawer-handle" />

        <div className="ps-drawer-header">
          <div className="ps-drawer-title">{item.title}</div>
          <button className="ps-drawer-close" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {detail && (
          <div className="ps-drawer-body">
            <div className="ps-drawer-row">
              <span className="ps-drawer-key">Account type</span>
              <span className="ps-drawer-val">{detail.accountType}</span>
            </div>
            <div className="ps-drawer-row">
              <span className="ps-drawer-key">Balance</span>
              <span className="ps-drawer-val">{detail.balance}</span>
            </div>
            <div className="ps-drawer-row">
              <span className="ps-drawer-key">Reported on</span>
              <span className="ps-drawer-val">{detail.bureau}</span>
            </div>
            {detail.statute && (
              <div className="ps-drawer-row">
                <span className="ps-drawer-key">FCRA statute</span>
                <span className="ps-drawer-val ps-drawer-statute">{detail.statute}</span>
              </div>
            )}
            <div className="ps-drawer-divider" />
            <div className="ps-drawer-why">{detail.why}</div>
          </div>
        )}

        <div className="ps-drawer-footer">
          <div className={`ps-card-pts ${ptsColor}`} style={{ fontSize: 13, padding: "5px 14px" }}>
            {pts}
          </div>
          <button className="ps-drawer-cta" onClick={navigateToAuth}>
            Generate Dispute Letter
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ marginLeft: 6 }}>
              <path d="M2 6.5h9M7 2.5l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

interface FullPlanProps {
  onBack: () => void;
}

function FullPlanScreen({ onBack }: FullPlanProps) {
  const allItems = DEMO_PROFILE.planSuggestions;
  return (
    <div className="ps-fullplan">
      <div className="ps-fullplan-header">
        <button className="ps-fullplan-back" onClick={onBack} aria-label="Back">
          <svg width="10" height="17" viewBox="0 0 10 17" fill="none">
            <path d="M9 1L1 8.5L9 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="ps-fullplan-title">Full Action Plan</div>
        <div className="ps-fullplan-count">{allItems.length} items</div>
      </div>

      <div className="ps-fullplan-list">
        {allItems.map((item, i) => {
          const pts = extractPts(item.detail);
          const ptsColor = item.priority === "high" ? "indigo" : "sage";
          return (
            <div key={item.id} className="ps-fullplan-item" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="ps-fullplan-rank">{i + 1}</div>
              <div className="ps-fullplan-item-body">
                <div className="ps-fullplan-item-title">{item.title}</div>
                <div className="ps-fullplan-item-sub">
                  {item.detail.replace(/\s*·\s*Est\. \+\d+ pts/, "").replace(/\s*·\s*Ready to generate/, "")}
                </div>
              </div>
              {pts && <span className={`ps-card-pts ${ptsColor}`} style={{ fontSize: 10 }}>{pts}</span>}
            </div>
          );
        })}
      </div>

      <div className="ps-fullplan-cta-wrap">
        <button className="ps-cta" onClick={navigateToAuth}>
          Start My Free Trial
          <span className="ps-cta-arrow">→</span>
        </button>
        <p className="ps-fullplan-fine">No credit card required · Cancel anytime</p>
      </div>

      <div className="ps-home-bar">
        <div className="ps-home-bar-inner" />
      </div>
    </div>
  );
}

function PlanShowcaseInner() {
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const [timeStr, setTimeStr] = useState(() => {
    const h = new Date().getHours() % 12 || 12;
    const m = new Date().getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  });

  const [activeCard, setActiveCard] = useState<typeof DEMO_PROFILE.planSuggestions[0] | null>(null);
  const [showFullPlan, setShowFullPlan] = useState(false);
  const [pressedId, setPressedId] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      const h = now.getHours() % 12 || 12;
      const m = now.getMinutes().toString().padStart(2, "0");
      setTimeStr(`${h}:${m}`);
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const planItems = DEMO_PROFILE.planSuggestions.slice(0, 3);

  return (
    <div className="ps-root">
      {/* Status bar */}
      <div className="ps-status-bar">
        <span className="ps-status-time">{timeStr}</span>
        <div className="ps-status-icons">
          <SignalIcon />
          <WifiIcon />
          <BatteryIcon />
        </div>
      </div>

      {/* Brand header */}
      <div className="ps-header">
        <img src={scoreshiftLogo} alt="ScoreShift" className="ps-header-logo" />
        <span className="ps-header-brand">ScoreShift</span>
        <span className="ps-header-badge">PRO</span>
      </div>

      {/* Body */}
      <div className="ps-body">
        {/* Eyebrow */}
        <div className="ps-eyebrow">Your Personalized Plan</div>

        {/* Greeting */}
        <h1 className="ps-greeting">
          Good {timeOfDay},<br />
          <em>Jordan.</em>
        </h1>

        {/* Score strip — brand palette: indigo / charcoal / sage */}
        <div className="ps-scores">
          {SCORE_DISPLAY.map(({ bureau, score, color }) => (
            <div key={bureau} className="ps-score-pill">
              <div className="ps-score-num" style={{ color }}>{score}</div>
              <div className="ps-score-bureau">{bureau}</div>
            </div>
          ))}
        </div>

        {/* Priority plan items */}
        <div className="ps-section-label">
          Priority Actions · {planItems.length} of {DEMO_PROFILE.planSuggestions.length}
        </div>
        <div className="ps-cards">
          {planItems.map((item) => {
            const pts = extractPts(item.detail);
            const ptsColor = item.priority === "high" ? "indigo" : "sage";
            return (
              <div
                key={item.id}
                className={`ps-card ps-card-interactive${pressedId === item.id ? " ps-card-pressed" : ""}`}
                onClick={() => setActiveCard(item)}
                onPointerDown={() => setPressedId(item.id)}
                onPointerUp={() => setPressedId(null)}
                onPointerLeave={() => setPressedId(null)}
                role="button"
                tabIndex={0}
              >
                <div className={`ps-card-dot ${item.priority}`} />
                <div className="ps-card-content">
                  <div className="ps-card-title">{item.title}</div>
                  <div className="ps-card-detail">
                    {item.detail.replace(/\s*·\s*Est\. \+\d+ pts/, "").replace(/\s*·\s*Ready to generate/, "")}
                  </div>
                </div>
                {pts && (
                  <div className="ps-card-right">
                    <span className={`ps-card-pts ${ptsColor}`}>{pts}</span>
                    <span className="ps-card-status">{statusLabel(item.status)}</span>
                  </div>
                )}
                <div className="ps-card-chevron">›</div>
              </div>
            );
          })}
        </div>

        {/* Status strip */}
        <div className="ps-status-strip">
          <div className="ps-status-live-dot" />
          <span>{DEMO_PACKAGE.casesSummary}</span>
        </div>

        {/* CTA */}
        <button className="ps-cta" onClick={() => setShowFullPlan(true)}>
          View Full Plan
          <span className="ps-cta-arrow">→</span>
        </button>
      </div>

      {/* Home indicator */}
      <div className="ps-home-bar">
        <div className="ps-home-bar-inner" />
      </div>

      {/* Card detail drawer */}
      {activeCard && (
        <CardDrawer
          item={activeCard}
          pts={extractPts(activeCard.detail)}
          ptsColor={activeCard.priority === "high" ? "indigo" : "sage"}
          onClose={() => setActiveCard(null)}
        />
      )}

      {/* Full plan second screen */}
      {showFullPlan && <FullPlanScreen onBack={() => setShowFullPlan(false)} />}
    </div>
  );
}

export default function PlanShowcase() {
  return (
    <UserContext.Provider value={DEMO_USER_CTX}>
      <DemoDataProvider>
        <PlanShowcaseInner />
      </DemoDataProvider>
    </UserContext.Provider>
  );
}
