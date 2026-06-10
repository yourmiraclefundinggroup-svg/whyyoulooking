import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { CheckCircle, ArrowLeft, Mail } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import "../styles/landing.css";

import splitPathImg from "@assets/ChatGPT_Image_Jun_9,_2026,_04_26_54_PM_1781047045828.png";
import windingPathImg from "@assets/ChatGPT_Image_Jun_9,_2026,_04_17_47_PM_1781047072844.png";
import creamEnvImg from "@assets/ChatGPT_Image_Jun_9,_2026,_03_48_17_PM_1781047080235.png";
import conciergePathImg from "@assets/ChatGPT_Image_Jun_9,_2026,_07_56_28_PM_1781051920048.png";
import mountainPersonImg from "@assets/ChatGPT_Image_Jun_9,_2026,_08_13_49_PM_1781051953003.png";

type ViewType = "choose" | "self-service" | "concierge";

/* ─── Landing nav height: 90px, no announcement bar ─────────────────────── */
const HEADER_H = 90;

const ArrowRight = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

/* ─── color tokens ───────────────────────────────────────────────────────── */
const C = {
  cream: "#F5EEE0",
  bone: "#EDE0CC",
  surface: "#FFFCF5",
  indigo: "#4a4e8c",
  indigoShadow: "rgba(74,78,140,0.45)",
  text: "#2A2725",
  muted: "#5B5652",
  faint: "#8B8480",
  glass: "rgba(255,252,245,0.13)",
  glassBorder: "rgba(255,252,245,0.28)",
  glassShadow: "rgba(20,15,10,0.35)",
};

/* ─── self-service plans ─────────────────────────────────────────────────── */
const selfServicePlans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    suffix: "/month",
    badge: null as string | null,
    badgeSub: null as string | null,
    description: "Start seeing your credit picture",
    featured: false,
    ctaText: "Get Started Free",
    ctaHref: "/signup",
    features: [
      "Credit overview & score tracker",
      "1 dispute letter / month",
      "Credit report viewer",
      "Email support",
    ],
  },
  {
    id: "path",
    name: "Path",
    price: 29,
    suffix: "/month",
    badge: null as string | null,
    badgeSub: null as string | null,
    description: "Guided tools for confident next steps",
    featured: false,
    ctaText: "Choose Path →",
    ctaHref: "/checkout?tier=starter",
    features: [
      "Everything in Free",
      "3 dispute letters / month",
      "ScoreMap™ roadmap",
      "Credit Coach AI (limited)",
      "Basic score simulator",
    ],
  },
  {
    id: "momentum",
    name: "Momentum",
    price: 55,
    suffix: "/month forever",
    badge: "Founding Member",
    badgeSub: "First 122 Members",
    description: "Full suite — locked in at founding pricing",
    featured: true,
    ctaText: "Claim Founding Rate →",
    ctaHref: "/checkout?tier=pro",
    features: [
      "Everything in Path",
      "Unlimited dispute letters",
      "Real-Time Credit Alerts",
      "Certified mail via ScoreShift Mail",
      "Score Simulator",
      "Debt Navigator",
      "Credit Coach AI — 24/7",
      "Priority support",
    ],
  },
  {
    id: "summit",
    name: "Summit",
    price: 149,
    suffix: "/month",
    badge: null as string | null,
    badgeSub: null as string | null,
    description: "Complete credit readiness & identity shield",
    featured: false,
    ctaText: "Choose Summit →",
    ctaHref: "/checkout?tier=elite",
    features: [
      "Everything in Momentum",
      "Identity Protect (dark web + fraud)",
      "Privacy Protect (data broker removal)",
      "Student Loan Aid",
      "LoanBridge™ DSCR connection",
      "Dedicated advisor",
    ],
  },
];

/* ─── concierge plans ────────────────────────────────────────────────────── */
const conciergePlans = [
  {
    id: "fast-track",
    name: "Fast Track",
    price: 497,
    suffix: " flat",
    duration: "3-month program",
    badge: null as string | null,
    description: "Rapid results with focused execution",
    featured: false,
    ctaText: "Start Fast Track →",
    ctaHref: "/concierge?package=fast-track",
    features: [
      "Dedicated credit strategist",
      "Bureau dispute execution",
      "Monthly progress reports",
      "3 certified mail sends",
      "Client dashboard access",
    ],
  },
  {
    id: "rush",
    name: "Rush",
    price: 897,
    suffix: " flat",
    duration: "6-month program",
    badge: null as string | null,
    description: "Comprehensive strategy with full execution",
    featured: false,
    ctaText: "Start Rush →",
    ctaHref: "/concierge?package=rush",
    features: [
      "Everything in Fast Track",
      "6 certified mail sends",
      "Bi-weekly strategy calls",
      "Debt negotiation guidance",
      "Score Simulator access",
      "Identity monitoring",
    ],
  },
  {
    id: "elite-concierge",
    name: "Elite",
    price: 1497,
    suffix: " flat",
    duration: "12-month program",
    badge: "Most Comprehensive",
    description: "Fully managed from first dispute to final goal",
    featured: true,
    ctaText: "Start Elite →",
    ctaHref: "/concierge?package=elite",
    features: [
      "Everything in Rush",
      "Unlimited certified mail",
      "Weekly strategy sessions",
      "Full identity protect suite",
      "Privacy Protect (data brokers)",
      "Student Loan Aid",
      "LoanBridge™ DSCR connection",
      "Dedicated account manager",
    ],
  },
];

/* ─── mail wallet credits ────────────────────────────────────────────────── */
const mailCredits = [
  { qty: 1, label: "1 Credit", price: "$14.99" },
  { qty: 5, label: "5 Credits", price: "$69.99" },
  { qty: 10, label: "10 Credits", price: "$129.99" },
  { qty: 25, label: "25 Credits", price: "$299.99" },
];

/* ─── comparison rows ────────────────────────────────────────────────────── */
const ssCompare = [
  { label: "Credit overview & tracker", values: [true, true, true, true] },
  { label: "Dispute letters", values: ["1/mo", "3/mo", "Unlimited", "Unlimited"] },
  { label: "Real-Time Alerts", values: [false, false, true, true] },
  { label: "Certified mail (ScoreShift Mail)", values: [false, false, true, true] },
  { label: "Score Simulator", values: [false, false, true, true] },
  { label: "Debt Navigator", values: [false, false, true, true] },
  { label: "Credit Coach AI", values: [false, "Limited", "24/7", "24/7"] },
  { label: "Identity Protect", values: [false, false, false, true] },
  { label: "Privacy Protect", values: [false, false, false, true] },
  { label: "Dedicated advisor", values: [false, false, false, true] },
];

const ccCompare = [
  { label: "Program length", values: ["3 months", "6 months", "12 months"] },
  { label: "Dedicated strategist", values: [true, true, true] },
  { label: "Bureau dispute execution", values: [true, true, true] },
  { label: "Certified mail sends", values: ["3 sends", "6 sends", "Unlimited"] },
  { label: "Strategy calls", values: ["Monthly", "Bi-weekly", "Weekly"] },
  { label: "Debt negotiation guidance", values: [false, true, true] },
  { label: "Identity Protect", values: [false, true, true] },
  { label: "Privacy Protect", values: [false, false, true] },
  { label: "Dedicated account manager", values: [false, false, true] },
  { label: "LoanBridge™ connection", values: [false, false, true] },
];

/* ════════════════════════════════════════════════════════════════════════════
   GLASS CARD — mouse-tracking hero cards
   ════════════════════════════════════════════════════════════════════════════ */
function HeroGlassCard({
  title, tagline, description, ctaText, onClick,
}: {
  title: string; tagline: string; description: string; ctaText: string; onClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `perspective(900px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-6px)`;
  };
  const onLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = "perspective(900px) rotateY(0) rotateX(0) translateY(0)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={{
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        background: C.glass,
        border: `1px solid ${C.glassBorder}`,
        boxShadow: `0 20px 30px ${C.glassShadow}`,
        borderRadius: "24px",
        padding: "36px 32px",
        width: "380px",
        maxWidth: "calc(100vw - 48px)",
        transition: "transform 0.35s cubic-bezier(0.23,1,0.32,1)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h2 style={{ color: "#FFFCF5", fontSize: "28px", fontWeight: 500, letterSpacing: "-0.14px", marginBottom: "16px" }}>
        {title}
      </h2>
      <p style={{ color: "rgba(245,230,205,0.75)", fontSize: "14px", lineHeight: "22px", marginBottom: "12px" }}>
        {tagline}
      </p>
      <div style={{ height: "1px", background: "rgba(245,230,205,0.2)", margin: "8px 0 16px" }} />
      <p style={{ color: "rgba(245,230,205,0.80)", fontSize: "14px", lineHeight: "22px", marginBottom: "32px", flex: 1 }}>
        {description}
      </p>
      <button
        style={{
          background: C.indigo,
          color: "#FFFCF5",
          border: "none",
          borderRadius: "12px",
          padding: "14px 0",
          fontSize: "15px",
          fontWeight: 500,
          width: "100%",
          cursor: "pointer",
          boxShadow: `0 8px 24px -4px ${C.indigoShadow}`,
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#5a5ea8")}
        onMouseLeave={(e) => (e.currentTarget.style.background = C.indigo)}
      >
        {ctaText}
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   PRICING CARD
   ════════════════════════════════════════════════════════════════════════════ */
function PricingCard({ plan, isConcierge = false }: {
  plan: typeof selfServicePlans[number] | typeof conciergePlans[number];
  isConcierge?: boolean;
}) {
  const { featured } = plan;
  const badgeSub = "badgeSub" in plan ? plan.badgeSub : null;
  const duration = "duration" in plan ? plan.duration : null;

  return (
    <div
      style={{
        background: featured ? "#2A2725" : C.surface,
        border: featured ? "1px solid rgba(74,78,140,0.30)" : "1px solid rgba(42,39,37,0.12)",
        borderRadius: "20px",
        padding: featured ? "36px 30px" : "28px 26px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        transform: featured ? "translateY(-10px) scale(1.02)" : "none",
        boxShadow: featured
          ? "0 24px 48px rgba(20,15,10,0.18), 0 0 0 1px rgba(74,78,140,0.20)"
          : "0 2px 16px rgba(42,39,37,0.06)",
        transition: "box-shadow 0.2s",
        minWidth: 0,
      }}
    >
      {plan.badge && (
        <div style={{ marginBottom: "16px" }}>
          <span style={{
            display: "inline-block",
            background: C.indigo,
            color: "#FFFCF5",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "4px 12px",
            borderRadius: "100px",
          }}>
            {plan.badge}
          </span>
          {badgeSub && (
            <div style={{ color: "rgba(245,230,205,0.5)", fontSize: "11px", marginTop: "4px" }}>
              {badgeSub}
            </div>
          )}
        </div>
      )}

      <div style={{ marginBottom: "18px" }}>
        <h3 style={{ color: featured ? "#FFFCF5" : C.text, fontSize: "21px", fontWeight: 600, marginBottom: "6px" }}>
          {plan.name}
        </h3>
        {duration && (
          <div style={{
            display: "inline-block",
            background: "rgba(74,78,140,0.12)",
            color: C.indigo,
            fontSize: "11px",
            fontWeight: 500,
            padding: "3px 10px",
            borderRadius: "100px",
            marginBottom: "6px",
          }}>
            {duration}
          </div>
        )}
        <p style={{ color: featured ? "rgba(255,252,245,0.55)" : C.muted, fontSize: "13px", lineHeight: "1.5" }}>
          {plan.description}
        </p>
      </div>

      <div style={{ marginBottom: "22px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
          <span style={{ color: featured ? "#FFFCF5" : C.text, fontSize: "40px", fontWeight: 700, letterSpacing: "-1px" }}>
            ${plan.price}
          </span>
          <span style={{ color: featured ? "rgba(255,252,245,0.45)" : C.faint, fontSize: "13px" }}>
            {plan.suffix}
          </span>
        </div>
        {featured && !isConcierge && (
          <div style={{ color: "rgba(110,116,196,0.9)", fontSize: "11px", marginTop: "4px", fontWeight: 500 }}>
            Price locked forever at founding rate
          </div>
        )}
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0", flex: 1, display: "flex", flexDirection: "column", gap: "9px" }}>
        {plan.features.map((f) => (
          <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", color: featured ? "rgba(255,252,245,0.82)" : "#4A4541" }}>
            <CheckCircle size={14} style={{ color: featured ? "rgba(149,154,210,0.9)" : C.indigo, flexShrink: 0, marginTop: "2px" }} />
            {f}
          </li>
        ))}
      </ul>

      <Link href={plan.ctaHref}>
        <button
          style={{
            width: "100%",
            padding: "12px 0",
            borderRadius: "12px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
            ...(featured
              ? { background: C.indigo, color: "#FFFCF5", border: "none", boxShadow: `0 8px 24px -4px ${C.indigoShadow}` }
              : { background: "transparent", color: C.text, border: "1px solid rgba(42,39,37,0.22)" }),
          }}
          onMouseEnter={(e) => {
            if (featured) e.currentTarget.style.background = "#5a5ea8";
            else e.currentTarget.style.background = "rgba(42,39,37,0.05)";
          }}
          onMouseLeave={(e) => {
            if (featured) e.currentTarget.style.background = C.indigo;
            else e.currentTarget.style.background = "transparent";
          }}
        >
          {plan.ctaText}
        </button>
      </Link>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MAIL WALLET
   ════════════════════════════════════════════════════════════════════════════ */
function MailWallet() {
  const [selected, setSelected] = useState(5);
  const credit = mailCredits.find((c) => c.qty === selected)!;
  const stackColors = ["#c9bea6", "#d5cab3", "#dfd5be", "#e8dfc9"];

  return (
    <section style={{
      background: C.surface,
      borderRadius: "28px",
      padding: "52px 44px",
      maxWidth: "820px",
      margin: "0 auto",
      border: "1px solid rgba(42,39,37,0.09)",
      boxShadow: "0 4px 32px rgba(42,39,37,0.06)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "28px" }}>
        <Mail size={26} style={{ color: C.indigo, flexShrink: 0, marginTop: "3px" }} />
        <div>
          <h3 style={{ color: C.text, fontSize: "24px", fontWeight: 600, marginBottom: "6px" }}>ScoreShift Mail</h3>
          <p style={{ color: C.muted, fontSize: "14px", lineHeight: "1.6", maxWidth: "480px" }}>
            Create your Smart Letter, then send it certified — no printing, envelopes, stamps, or post office trips.
          </p>
        </div>
      </div>

      {/* Stacked wallet cards */}
      <div style={{ position: "relative", height: "176px", marginBottom: "28px" }}>
        {mailCredits.map((c, idx) => {
          const isSelected = c.qty === selected;
          const offset = idx * 10;
          return (
            <div
              key={c.qty}
              onClick={() => setSelected(c.qty)}
              style={{
                position: "absolute",
                left: 0, right: 0,
                top: 0,
                background: isSelected ? C.indigo : stackColors[idx],
                borderRadius: "16px",
                padding: "22px 28px",
                cursor: "pointer",
                zIndex: isSelected ? 10 : idx + 1,
                transform: isSelected
                  ? "translateY(-8px)"
                  : `translateY(${offset}px) scale(${1 - (3 - idx) * 0.018})`,
                boxShadow: isSelected
                  ? "0 16px 40px rgba(74,78,140,0.35)"
                  : "0 4px 12px rgba(42,39,37,0.10)",
                transition: "all 0.38s cubic-bezier(0.23,1,0.32,1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: isSelected ? "rgba(255,252,245,0.55)" : C.faint, textTransform: "uppercase", marginBottom: "6px" }}>
                  ScoreShift Mail
                </div>
                <div style={{ fontSize: "20px", fontWeight: 700, color: isSelected ? "#FFFCF5" : C.text }}>
                  {c.label}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "26px", fontWeight: 700, color: isSelected ? "#FFFCF5" : C.text }}>
                  {c.price}
                </div>
                {c.qty > 1 && (
                  <div style={{ fontSize: "11px", color: isSelected ? "rgba(255,252,245,0.55)" : C.faint }}>
                    ${(parseFloat(c.price.replace("$", "")) / c.qty).toFixed(2)} / letter
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selector */}
      <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "24px", flexWrap: "wrap" }}>
        {mailCredits.map((c) => (
          <button
            key={c.qty}
            onClick={() => setSelected(c.qty)}
            style={{
              padding: "7px 18px",
              borderRadius: "100px",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
              border: "none",
              background: selected === c.qty ? C.indigo : C.bone,
              color: selected === c.qty ? "#FFFCF5" : C.muted,
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div style={{ textAlign: "center" }}>
        <Link href="/checkout?addon=mail">
          <button
            style={{
              background: C.indigo, color: "#FFFCF5", border: "none",
              borderRadius: "12px", padding: "13px 36px", fontSize: "14px",
              fontWeight: 600, cursor: "pointer",
              boxShadow: `0 8px 24px -4px ${C.indigoShadow}`,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#5a5ea8")}
            onMouseLeave={(e) => (e.currentTarget.style.background = C.indigo)}
          >
            Purchase {credit.label} — {credit.price}
          </button>
        </Link>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   COMPARISON TABLE
   ════════════════════════════════════════════════════════════════════════════ */
function ComparisonTable({ plans, rows }: {
  plans: string[];
  rows: { label: string; values: (boolean | string)[] }[];
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "480px" }}>
        <thead>
          <tr style={{ background: C.bone }}>
            <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "13px", color: C.muted, fontWeight: 500 }}>Feature</th>
            {plans.map((p) => (
              <th key={p} style={{ padding: "14px 20px", textAlign: "center", fontSize: "13px", fontWeight: 700, color: C.text }}>
                {p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.label} style={{ background: i % 2 === 0 ? "rgba(42,39,37,0.02)" : C.surface, borderTop: "1px solid rgba(42,39,37,0.07)" }}>
              <td style={{ padding: "12px 20px", fontSize: "13px", color: C.muted }}>{row.label}</td>
              {row.values.map((val, j) => (
                <td key={j} style={{ padding: "12px 20px", textAlign: "center", fontSize: "13px" }}>
                  {typeof val === "boolean"
                    ? val
                      ? <span style={{ color: C.indigo, fontSize: "15px", fontWeight: 700 }}>✓</span>
                      : <span style={{ color: "#C5BDB6" }}>—</span>
                    : <span style={{ color: C.text }}>{val}</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   SECTION 1 — CHOOSE YOUR PATH  (no Navbar rendered here)
   ════════════════════════════════════════════════════════════════════════════ */
function ChooseYourPath({ onSelect }: { onSelect: (v: "self-service" | "concierge") => void }) {
  return (
    <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      {/* Full-bleed background — goes behind fixed navbar */}
      <img
        src={splitPathImg}
        alt="Two paths"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
      />
      {/* Gradient */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(8,12,20,0.55) 0%, rgba(20,15,10,0.12) 60%)" }} />

      {/* Content — pushed below the 100px fixed header */}
      <div style={{
        position: "relative",
        zIndex: 5,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: `${HEADER_H + 64}px`,
        paddingBottom: "80px",
        paddingLeft: "24px",
        paddingRight: "24px",
      }}>
        <h1 style={{
          color: "#FFFCF5",
          fontSize: "clamp(32px, 5vw, 52px)",
          fontWeight: 500,
          textAlign: "center",
          letterSpacing: "-0.78px",
          lineHeight: "1.15",
          maxWidth: "700px",
          marginBottom: "22px",
        }}>
          Choose how you'd like to move forward.
        </h1>
        <p style={{
          color: "rgba(245,235,215,0.85)",
          fontSize: "17px",
          lineHeight: "28px",
          textAlign: "center",
          maxWidth: "560px",
          marginBottom: "64px",
        }}>
          Whether you prefer guided tools or hands-on support, ScoreShift helps you understand what matters, know what to do next, and move forward with confidence.
        </p>

        <div style={{ display: "flex", gap: "28px", justifyContent: "center", flexWrap: "wrap" }}>
          <HeroGlassCard
            title="Self-Service"
            tagline="Explore at your own pace."
            description="Guidance, monitoring, and tools designed to help you move forward on your own timeline."
            ctaText="Explore Self-Service →"
            onClick={() => onSelect("self-service")}
          />
          <HeroGlassCard
            title="Concierge"
            tagline="Work directly with our team."
            description="A managed experience where ScoreShift helps guide strategy, execution, and progress tracking from start to finish."
            ctaText="Explore Concierge →"
            onClick={() => onSelect("concierge")}
          />
        </div>

        <div style={{ marginTop: "56px", color: "rgba(255,252,245,0.38)", fontSize: "20px", animation: "floatArrow 2.5s ease-in-out infinite" }}>
          ↓
        </div>
      </div>

      <style>{`@keyframes floatArrow { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }`}</style>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   SELF-SERVICE EXPERIENCE  (no Navbar rendered here)
   ════════════════════════════════════════════════════════════════════════════ */
function SelfServiceExperience({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>

      {/* Hero — full bleed image sits behind fixed navbar, content starts at HEADER_H */}
      <div style={{ position: "relative", height: "68vh", minHeight: "440px", overflow: "hidden" }}>
        <img
          src={windingPathImg}
          alt="Winding path"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(20,15,10,0.20) 0%, rgba(245,238,224,1) 100%)" }} />

        {/* Back button — sits just below the fixed navbar */}
        <button
          onClick={onBack}
          style={{
            position: "absolute",
            top: `${HEADER_H + 16}px`,
            left: "40px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(255,252,245,0.18)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,252,245,0.3)",
            borderRadius: "100px",
            color: "#FFFCF5",
            fontSize: "13px",
            padding: "8px 16px",
            cursor: "pointer",
            zIndex: 5,
          }}
        >
          <ArrowLeft size={14} /> Back
        </button>

        {/* Hero copy */}
        <div style={{
          position: "absolute",
          bottom: "64px",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          width: "100%",
          padding: "0 24px",
          zIndex: 2,
        }}>
          <p style={{ color: "rgba(74,78,140,0.9)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>
            Self-Service
          </p>
          <h1 style={{ color: C.text, fontSize: "clamp(30px, 5vw, 46px)", fontWeight: 600, letterSpacing: "-0.5px", marginBottom: "14px", lineHeight: "1.1" }}>
            Your path. Your pace.
          </h1>
          <p style={{ color: C.muted, fontSize: "16px", lineHeight: "1.6", maxWidth: "460px", margin: "0 auto" }}>
            Tools, monitoring, and guidance designed to help you move forward with confidence.
          </p>
        </div>
      </div>

      {/* Pricing cards */}
      <div style={{ position: "relative", overflow: "hidden", paddingTop: "56px", paddingBottom: "80px" }}>
        <img src={creamEnvImg} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.35 }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: "44px" }}>
            <h2 style={{ color: C.text, fontSize: "30px", fontWeight: 600, marginBottom: "10px" }}>Choose your plan</h2>
            <p style={{ color: C.muted, fontSize: "15px" }}>Start free. Upgrade when ready. Founding Member pricing locked forever.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", alignItems: "start" }}>
            {selfServicePlans.map((plan) => <PricingCard key={plan.id} plan={plan} />)}
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div style={{ maxWidth: "880px", margin: "0 auto", padding: "0 24px 80px" }}>
        <h2 style={{ color: C.text, fontSize: "24px", fontWeight: 600, textAlign: "center", marginBottom: "28px" }}>Compare plans</h2>
        <div style={{ background: C.surface, borderRadius: "20px", overflow: "hidden", border: "1px solid rgba(42,39,37,0.09)", boxShadow: "0 4px 24px rgba(42,39,37,0.06)" }}>
          <ComparisonTable plans={selfServicePlans.map((p) => p.name)} rows={ssCompare} />
        </div>
      </div>

      {/* Mail Wallet */}
      <div style={{ padding: "0 24px 80px" }}><MailWallet /></div>

      {/* Mountain person */}
      <div style={{ maxWidth: "900px", margin: "0 auto 72px", padding: "0 24px", display: "flex", justifyContent: "center" }}>
        <div style={{ borderRadius: "28px", overflow: "hidden", width: "340px", maxWidth: "100%", boxShadow: "0 24px 64px rgba(42,39,37,0.12)" }}>
          <img src={mountainPersonImg} alt="Working from anywhere" style={{ width: "100%", display: "block" }} />
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: C.bone, padding: "80px 24px", textAlign: "center" }}>
        <h2 style={{ color: C.text, fontSize: "34px", fontWeight: 600, marginBottom: "14px" }}>Start your guided plan.</h2>
        <p style={{ color: C.muted, fontSize: "16px", maxWidth: "380px", margin: "0 auto 32px" }}>
          Join the founding members who moved forward before everyone else.
        </p>
        <Link href="/signup">
          <button
            style={{ background: C.indigo, color: "#FFFCF5", border: "none", borderRadius: "14px", padding: "15px 48px", fontSize: "16px", fontWeight: 600, cursor: "pointer", boxShadow: `0 12px 32px -4px ${C.indigoShadow}`, transition: "background 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#5a5ea8")}
            onMouseLeave={(e) => (e.currentTarget.style.background = C.indigo)}
          >
            Get Started
          </button>
        </Link>
      </div>

      <Footer />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   CONCIERGE EXPERIENCE  (no Navbar rendered here)
   ════════════════════════════════════════════════════════════════════════════ */
function ConciergeExperience({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>

      {/* Hero */}
      <div style={{ position: "relative", height: "70vh", minHeight: "480px", overflow: "hidden" }}>
        <img
          src={conciergePathImg}
          alt="ScoreShift Concierge path"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(20,15,10,0.18) 0%, rgba(245,238,224,1) 100%)" }} />

        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            position: "absolute",
            top: `${HEADER_H + 16}px`,
            left: "40px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(255,252,245,0.18)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,252,245,0.3)",
            borderRadius: "100px",
            color: "#FFFCF5",
            fontSize: "13px",
            padding: "8px 16px",
            cursor: "pointer",
            zIndex: 5,
          }}
        >
          <ArrowLeft size={14} /> Back
        </button>

        {/* Hero copy */}
        <div style={{
          position: "absolute",
          bottom: "64px",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          width: "100%",
          padding: "0 24px",
          zIndex: 2,
        }}>
          <p style={{ color: "rgba(74,78,140,0.9)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>
            Concierge
          </p>
          <h1 style={{ color: C.text, fontSize: "clamp(28px, 4.5vw, 42px)", fontWeight: 600, letterSpacing: "-0.5px", marginBottom: "14px", lineHeight: "1.1" }}>
            Professional guidance from start to finish.
          </h1>
          <p style={{ color: C.muted, fontSize: "16px", lineHeight: "1.6", maxWidth: "500px", margin: "0 auto" }}>
            The ScoreShift team manages the strategy and execution while you track progress through your dashboard.
          </p>
        </div>
      </div>

      {/* Pricing cards */}
      <div style={{ position: "relative", overflow: "hidden", paddingTop: "56px", paddingBottom: "80px" }}>
        <img src={creamEnvImg} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.35 }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: "960px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: "44px" }}>
            <h2 style={{ color: C.text, fontSize: "30px", fontWeight: 600, marginBottom: "10px" }}>Managed programs</h2>
            <p style={{ color: C.muted, fontSize: "15px" }}>One flat investment. No recurring fees. We handle the execution.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px", alignItems: "start" }}>
            {conciergePlans.map((plan) => <PricingCard key={plan.id} plan={plan} isConcierge />)}
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 24px 80px" }}>
        <h2 style={{ color: C.text, fontSize: "24px", fontWeight: 600, textAlign: "center", marginBottom: "28px" }}>What's included</h2>
        <div style={{ background: C.surface, borderRadius: "20px", overflow: "hidden", border: "1px solid rgba(42,39,37,0.09)", boxShadow: "0 4px 24px rgba(42,39,37,0.06)" }}>
          <ComparisonTable plans={conciergePlans.map((p) => p.name)} rows={ccCompare} />
        </div>
      </div>

      {/* Mail Wallet */}
      <div style={{ padding: "0 24px 80px" }}><MailWallet /></div>

      {/* CTA */}
      <div style={{ background: C.bone, padding: "80px 24px", textAlign: "center" }}>
        <h2 style={{ color: C.text, fontSize: "34px", fontWeight: 600, marginBottom: "14px" }}>Let us help guide the process.</h2>
        <p style={{ color: C.muted, fontSize: "16px", maxWidth: "420px", margin: "0 auto 32px" }}>
          Speak with a ScoreShift specialist to find the right program for your goals.
        </p>
        <Link href="/concierge">
          <button
            style={{ background: C.indigo, color: "#FFFCF5", border: "none", borderRadius: "14px", padding: "15px 48px", fontSize: "16px", fontWeight: 600, cursor: "pointer", boxShadow: `0 12px 32px -4px ${C.indigoShadow}`, transition: "background 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#5a5ea8")}
            onMouseLeave={(e) => (e.currentTarget.style.background = C.indigo)}
          >
            Start Concierge
          </button>
        </Link>
      </div>

      <Footer />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   ROOT — single nav instance matching the landing page exactly
   ════════════════════════════════════════════════════════════════════════════ */
export default function PricingPage() {
  const [view, setView] = useState<ViewType>("choose");
  const [fading, setFading] = useState(false);

  /* Attach the same scroll-class toggle as landing.tsx */
  useEffect(() => {
    const nav = document.querySelector(".ss-nav") as HTMLElement | null;
    const handler = () => nav?.classList.toggle("scrolled", window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, [view]);

  const navigateTo = (next: ViewType) => {
    setFading(true);
    setTimeout(() => {
      setView(next);
      setFading(false);
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }, 280);
  };

  return (
    <>
      {/* ── Nav — exact landing page markup ─────────────────────── */}
      <nav className="ss-nav">
        <div className="ss-wrap ss-nav-inner">
          <Link href="/" className="ss-nav-logo">
            <img
              src="/images/scoreshift-wordmark-transparent.png"
              alt="ScoreShift"
              className="ss-nav-logo-img"
            />
          </Link>
          <ul className="ss-nav-links">
            <li><Link href="/#product">Product</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/#trust">Results</Link></li>
          </ul>
          <div className="ss-nav-actions">
            <Link href="/login" className="ss-nav-ghost">Sign in</Link>
            <Link href="/signup" className="ss-btn-nav">
              Start My Plan <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      <div style={{ opacity: fading ? 0 : 1, transition: "opacity 0.28s ease" }}>
        {view === "choose" && <ChooseYourPath onSelect={(v) => navigateTo(v)} />}
        {view === "self-service" && <SelfServiceExperience onBack={() => navigateTo("choose")} />}
        {view === "concierge" && <ConciergeExperience onBack={() => navigateTo("choose")} />}
      </div>
    </>
  );
}
