import { useState, useEffect } from "react";
import scoreshiftLogo from "@assets/scoreshift-logo.png";
import "../styles/plan-showcase.css";

const SCORES = [
  { bureau: "EX", score: 712, color: "#3B82F6" },
  { bureau: "EQ", score: 705, color: "#EF4444" },
  { bureau: "TU", score: 718, color: "#8B5CF6" },
];

const PLAN_ITEMS = [
  {
    id: 1,
    priority: "high" as const,
    title: "Dispute MIDLAND FUNDING",
    detail: "Collection · Experian · Ready to file",
    pts: "+18 pts",
    ptsColor: "indigo" as const,
    status: "Action needed",
  },
  {
    id: 2,
    priority: "medium" as const,
    title: "Lower Amex utilization",
    detail: "Pay $800 to drop 43% → 15%",
    pts: "+18 pts",
    ptsColor: "sage" as const,
    status: "High impact",
  },
  {
    id: 3,
    priority: "medium" as const,
    title: "Remove PORTFOLIO RECOVERY",
    detail: "Collection · TransUnion · Dispute ready",
    pts: "+15 pts",
    ptsColor: "apricot" as const,
    status: "In review",
  },
];

function ClockIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
      <rect x="0" y="3" width="3" height="6" rx="1" fill="currentColor" opacity="0.35"/>
      <rect x="4.5" y="1.5" width="3" height="9" rx="1" fill="currentColor" opacity="0.6"/>
      <rect x="9" y="0" width="3" height="12" rx="1" fill="currentColor"/>
      <rect x="13.5" y="3" width="2.5" height="6" rx="1" fill="currentColor" opacity="0.6"/>
    </svg>
  );
}
function WifiIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
      <path d="M0.5 4.5 C3.5 1.5 12.5 1.5 15.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M3 7 C4.8 5.2 11.2 5.2 13 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5.5 9.5 C6.5 8.5 9.5 8.5 10.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="8" cy="12" r="1.5" fill="currentColor"/>
    </svg>
  );
}
function BatteryIcon() {
  return (
    <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
      <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" strokeOpacity="0.35"/>
      <rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor"/>
      <path d="M23 4 L23 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.4"/>
    </svg>
  );
}

export default function PlanShowcase() {
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const fmt = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes().toString().padStart(2, "0");
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 || 12;
      setTimeStr(`${h12}:${m}`);
    };
    fmt();
    const id = setInterval(fmt, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="ps-root">
      {/* Status bar */}
      <div className="ps-status-bar">
        <span className="ps-status-time">{timeStr}</span>
        <div className="ps-status-icons">
          <ClockIcon />
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

      {/* Scrollable body */}
      <div className="ps-body">
        {/* Eyebrow */}
        <div className="ps-eyebrow">Your Credit Success Plan</div>

        {/* Greeting */}
        <h1 className="ps-greeting">
          Good {timeOfDay},<br />
          <em>Jordan.</em>
        </h1>

        {/* Score strip */}
        <div className="ps-scores">
          {SCORES.map(({ bureau, score, color }) => (
            <div key={bureau} className="ps-score-pill">
              <div className="ps-score-num" style={{ color }}>{score}</div>
              <div className="ps-score-bureau">{bureau}</div>
            </div>
          ))}
        </div>

        {/* Plan items */}
        <div className="ps-section-label">Priority Actions · 3 of 7</div>
        <div className="ps-cards">
          {PLAN_ITEMS.map((item) => (
            <div key={item.id} className="ps-card">
              <div className={`ps-card-dot ${item.priority}`} />
              <div className="ps-card-content">
                <div className="ps-card-title">{item.title}</div>
                <div className="ps-card-detail">{item.detail}</div>
              </div>
              <div className="ps-card-right">
                <span className={`ps-card-pts ${item.ptsColor}`}>{item.pts}</span>
                <span className="ps-card-status">{item.status}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Status strip */}
        <div className="ps-status-strip">
          <div className="ps-status-live-dot" />
          <span>4 disputes active&nbsp;·&nbsp;Specialist: <strong style={{ color: "var(--ps-charcoal)", fontWeight: 600 }}>Sarah K.</strong></span>
        </div>

        {/* CTA */}
        <button className="ps-cta">
          View Full Plan
          <span className="ps-cta-arrow">→</span>
        </button>
      </div>

      {/* Home indicator */}
      <div className="ps-home-bar">
        <div className="ps-home-bar-inner" />
      </div>
    </div>
  );
}
