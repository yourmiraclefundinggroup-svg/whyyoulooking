import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { CheckCircle, ArrowLeft, Mail } from "lucide-react";
import "../styles/landing.css";

import splitPathImg    from "@assets/ChatGPT_Image_Jun_9,_2026,_04_26_54_PM_1781047045828.png";
import windingPathImg  from "@assets/ChatGPT_Image_Jun_9,_2026,_04_17_47_PM_1781047072844.png";
import creamEnvImg     from "@assets/ChatGPT_Image_Jun_9,_2026,_03_48_17_PM_1781054065070.png";
import conciergePathImg from "@assets/ChatGPT_Image_Jun_9,_2026,_07_56_28_PM_1781051920048.png";
import mountainPersonImg from "@assets/ChatGPT_Image_Jun_9,_2026,_08_13_49_PM_1781051953003.png";

type ViewType = "choose" | "self-service" | "concierge";

const HEADER_H = 90;

/* ── tiny SVG arrow ─────────────────────────────────────────────────────── */
const ArrowRight = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

/* ── Design tokens ──────────────────────────────────────────────────────── */
const C = {
  cream:       "#F7F3EC",
  bone:        "#EDE8DF",
  surface:     "#FFFCF5",
  indigo:      "#4338CA",
  indigoDeep:  "#1E1B4B",
  indigoMid:   "#6366F1",
  indigoShadow:"rgba(67,56,202,0.32)",
  text:        "#1E1B18",
  muted:       "#8C7B6E",
  faint:       "#AFA49A",
  glass:       "rgba(255,252,245,0.10)",
  glassBorder: "rgba(255,252,245,0.22)",
  glassShadow: "rgba(10,8,5,0.40)",
};

/* ─── Self-Service plans ─────────────────────────────────────────────────── */
const selfServicePlans = [
  {
    id: "free", name: "Free", price: 0, suffix: "/month",
    badge: null as string | null, badgeSub: null as string | null,
    description: "Start seeing your credit picture",
    featured: false, ctaText: "Get Started Free", ctaHref: "/signup",
    features: ["Credit overview & score tracker","1 dispute letter / month","Credit report viewer","Email support"],
  },
  {
    id: "path", name: "Path", price: 19.99, suffix: "/month",
    badge: null as string | null, badgeSub: null as string | null,
    description: "Guided tools for confident next steps",
    featured: false, ctaText: "Choose Path", ctaHref: "/checkout?tier=starter",
    features: ["Everything in Free","3 dispute letters / month","ScoreMap™ roadmap","Credit Coach AI (limited)","Basic score simulator"],
  },
  {
    id: "momentum", name: "Momentum", price: 79.99, suffix: "/month",
    badge: "Founding Member", badgeSub: "$55/month forever · First 122 Members",
    description: "Full suite — locked in at founding pricing",
    featured: true, ctaText: "Claim Founding Rate", ctaHref: "/checkout?tier=pro",
    features: ["Everything in Path","Unlimited dispute letters","Real-Time Credit Alerts","Certified mail via ScoreShift Mail","Score Simulator","Debt Navigator","Credit Coach AI — 24/7","Priority support"],
  },
  {
    id: "summit", name: "Summit", price: 149.99, suffix: "/month",
    badge: null as string | null, badgeSub: null as string | null,
    description: "Complete credit readiness & identity shield",
    featured: false, ctaText: "Choose Summit", ctaHref: "/checkout?tier=elite",
    features: ["Everything in Momentum","Identity Protect (dark web + fraud)","Privacy Protect (data broker removal)","Student Loan Aid","LoanBridge™ DSCR connection","Dedicated advisor"],
  },
];

/* ─── Concierge plans ────────────────────────────────────────────────────── */
const conciergePlans = [
  {
    id: "fast-track", name: "Fast Track", price: 497, suffix: " flat",
    duration: "3-month program", badge: null as string | null,
    description: "Rapid results with focused execution",
    featured: false, ctaText: "Start Fast Track", ctaHref: "/concierge?package=fast-track",
    features: ["Dedicated credit strategist","Bureau dispute execution","Monthly progress reports","3 certified mail sends","Client dashboard access"],
  },
  {
    id: "rush", name: "Rush", price: 897, suffix: " flat",
    duration: "6-month program", badge: null as string | null,
    description: "Comprehensive strategy with full execution",
    featured: true, ctaText: "Start Rush", ctaHref: "/concierge?package=rush",
    features: ["Everything in Fast Track","6 certified mail sends","Bi-weekly strategy calls","Debt negotiation guidance","Score Simulator access","Identity monitoring"],
  },
  {
    id: "elite-concierge", name: "Elite", price: 1497, suffix: " flat",
    duration: "12-month program", badge: "Most Comprehensive",
    description: "Fully managed from first dispute to final goal",
    featured: false, ctaText: "Start Elite", ctaHref: "/concierge?package=elite",
    features: ["Everything in Rush","Unlimited certified mail","Weekly strategy sessions","Full identity protect suite","Privacy Protect (data brokers)","Student Loan Aid","LoanBridge™ DSCR connection","Dedicated account manager"],
  },
];

/* ─── Mail credits ───────────────────────────────────────────────────────── */
const mailCredits = [
  { qty: 1,  label: "1 Credit",   price: "$14.99"  },
  { qty: 5,  label: "5 Credits",  price: "$69.99"  },
  { qty: 10, label: "10 Credits", price: "$129.99" },
  { qty: 25, label: "25 Credits", price: "$299.99" },
];

/* ─── Comparison data ────────────────────────────────────────────────────── */
const ssCompare = [
  { label: "Credit overview & tracker",      values: [true, true, true, true] },
  { label: "Dispute letters",                 values: ["1/mo", "3/mo", "Unlimited", "Unlimited"] },
  { label: "Real-Time Alerts",                values: [false, false, true, true] },
  { label: "Certified mail (ScoreShift Mail)",values: [false, false, true, true] },
  { label: "Score Simulator",                 values: [false, false, true, true] },
  { label: "Debt Navigator",                  values: [false, false, true, true] },
  { label: "Credit Coach AI",                 values: [false, "Limited", "24/7", "24/7"] },
  { label: "Identity Protect",                values: [false, false, false, true] },
  { label: "Privacy Protect",                 values: [false, false, false, true] },
  { label: "Dedicated advisor",               values: [false, false, false, true] },
];

const ccCompare = [
  { label: "Program length",           values: ["3 months", "6 months", "12 months"] },
  { label: "Dedicated strategist",     values: [true, true, true] },
  { label: "Bureau dispute execution", values: [true, true, true] },
  { label: "Certified mail sends",     values: ["3 sends", "6 sends", "Unlimited"] },
  { label: "Strategy calls",           values: ["Monthly", "Bi-weekly", "Weekly"] },
  { label: "Debt negotiation",         values: [false, true, true] },
  { label: "Identity Protect",         values: [false, true, true] },
  { label: "Privacy Protect",          values: [false, false, true] },
  { label: "Dedicated account mgr",    values: [false, false, true] },
  { label: "LoanBridge™ connection",   values: [false, false, true] },
];

/* ════════════════════════════════════════════════════════════════════════════
   HERO GLASS CARD — with mouse-tracking tilt
   ════════════════════════════════════════════════════════════════════════════ */
function HeroGlassCard({ title, tagline, description, ctaText, onClick }: {
  title: string; tagline: string; description: string; ctaText: string; onClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-8px)`;
  };
  const onLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = "perspective(1000px) rotateY(0) rotateX(0) translateY(0)";
  };

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} onClick={onClick}
      style={{
        backdropFilter: "blur(28px) saturate(1.3)",
        WebkitBackdropFilter: "blur(28px) saturate(1.3)",
        background: C.glass,
        border: `1px solid ${C.glassBorder}`,
        boxShadow: `0 24px 48px ${C.glassShadow}, inset 0 1px 0 rgba(255,252,245,0.12)`,
        borderRadius: "28px",
        padding: "44px 40px 40px",
        width: "400px",
        maxWidth: "calc(100vw - 48px)",
        transition: "transform 0.45s cubic-bezier(0.23,1,0.32,1)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h2 style={{ color: "#FFFCF5", fontSize: "32px", fontWeight: 500, letterSpacing: "-0.5px", marginBottom: "14px", lineHeight: 1.1 }}>
        {title}
      </h2>
      <p style={{ color: "rgba(245,232,210,0.65)", fontSize: "13px", lineHeight: "20px", marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
        {tagline}
      </p>
      <div style={{ height: "1px", background: "rgba(245,230,205,0.14)", margin: "0 0 20px" }} />
      <p style={{ color: "rgba(245,235,218,0.80)", fontSize: "15px", lineHeight: "24px", marginBottom: "36px", flex: 1 }}>
        {description}
      </p>
      <button
        style={{
          background: C.indigo, color: "#FFFCF5", border: "none",
          borderRadius: "14px", padding: "16px 0",
          fontSize: "14px", fontWeight: 600, width: "100%", cursor: "pointer",
          boxShadow: `0 8px 28px ${C.indigoShadow}`,
          transition: "background 0.22s, transform 0.22s",
          letterSpacing: "0.01em",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = C.indigoDeep; e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = C.indigo; e.currentTarget.style.transform = "none"; }}
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
    <div style={{
      background: featured ? "rgba(20,17,14,0.88)" : "rgba(255,252,245,0.82)",
      backdropFilter: "blur(32px) saturate(1.4)",
      WebkitBackdropFilter: "blur(32px) saturate(1.4)",
      border: featured ? "1px solid rgba(99,102,241,0.30)" : "1px solid rgba(255,252,245,0.70)",
      borderRadius: "24px",
      padding: featured ? "40px 34px" : "32px 30px",
      display: "flex", flexDirection: "column",
      position: "relative",
      transform: featured ? "translateY(-16px) scale(1.03)" : "none",
      boxShadow: featured
        ? "0 32px 64px rgba(10,8,5,0.28), 0 0 0 1px rgba(99,102,241,0.20)"
        : "0 8px 32px rgba(10,8,5,0.08), 0 1px 0 rgba(255,252,245,0.9) inset",
      transition: "box-shadow 0.2s",
      minWidth: 0,
    }}>
      {plan.badge && (
        <div style={{ marginBottom: "20px" }}>
          <span style={{
            display: "inline-block",
            background: C.indigo, color: "#FFFCF5",
            fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", padding: "5px 14px", borderRadius: "100px",
          }}>
            {plan.badge}
          </span>
          {badgeSub && (
            <div style={{ color: "rgba(160,165,220,0.80)", fontSize: "11px", marginTop: "6px", fontWeight: 500 }}>
              {badgeSub}
            </div>
          )}
        </div>
      )}

      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ color: featured ? "#FFFCF5" : C.text, fontSize: "22px", fontWeight: 600, marginBottom: "6px", letterSpacing: "-0.2px" }}>
          {plan.name}
        </h3>
        {duration && (
          <div style={{
            display: "inline-block",
            background: featured ? "rgba(99,102,241,0.15)" : "rgba(67,56,202,0.08)",
            color: featured ? "rgba(160,165,220,0.9)" : C.indigo,
            fontSize: "11px", fontWeight: 600, padding: "4px 12px",
            borderRadius: "100px", marginBottom: "8px", letterSpacing: "0.04em",
          }}>
            {duration}
          </div>
        )}
        <p style={{ color: featured ? "rgba(255,252,245,0.50)" : C.muted, fontSize: "13px", lineHeight: "1.5" }}>
          {plan.description}
        </p>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "5px" }}>
          <span style={{ color: featured ? "#FFFCF5" : C.text, fontSize: "44px", fontWeight: 700, letterSpacing: "-2px", lineHeight: 1 }}>
            ${plan.price.toLocaleString()}
          </span>
          <span style={{ color: featured ? "rgba(255,252,245,0.38)" : C.faint, fontSize: "13px", lineHeight: 1 }}>
            {plan.suffix}
          </span>
        </div>
        {featured && !isConcierge && (
          <div style={{ color: "rgba(130,136,210,0.9)", fontSize: "11px", marginTop: "6px", fontWeight: 500 }}>
            Price locked forever at founding rate
          </div>
        )}
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px 0", flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
        {plan.features.map((f) => (
          <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "9px", fontSize: "13px", color: featured ? "rgba(255,252,245,0.80)" : "#4A4541" }}>
            <CheckCircle size={14} style={{ color: featured ? "rgba(130,136,210,0.9)" : C.indigo, flexShrink: 0, marginTop: "2px" }} />
            {f}
          </li>
        ))}
      </ul>

      <Link href={plan.ctaHref}>
        <button
          style={{
            width: "100%", padding: "14px 0",
            borderRadius: "14px", fontSize: "13px", fontWeight: 600,
            cursor: "pointer", transition: "all 0.22s", letterSpacing: "0.01em",
            ...(featured
              ? { background: C.indigo, color: "#FFFCF5", border: "none", boxShadow: `0 8px 28px ${C.indigoShadow}` }
              : { background: "transparent", color: C.text, border: "1px solid rgba(30,27,24,0.20)" }),
          }}
          onMouseEnter={(e) => {
            if (featured) { e.currentTarget.style.background = C.indigoDeep; e.currentTarget.style.transform = "translateY(-1px)"; }
            else e.currentTarget.style.background = "rgba(30,27,24,0.05)";
          }}
          onMouseLeave={(e) => {
            if (featured) { e.currentTarget.style.background = C.indigo; e.currentTarget.style.transform = "none"; }
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
   COMPARISON TABLE — full-width premium
   ════════════════════════════════════════════════════════════════════════════ */
function ComparisonTable({ plans, rows }: {
  plans: string[];
  rows: { label: string; values: (boolean | string)[] }[];
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "520px" }}>
        <thead>
          <tr>
            <th style={{ padding: "18px 28px", textAlign: "left", fontSize: "12px", color: C.muted, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "1px solid rgba(30,27,24,0.10)" }}>Feature</th>
            {plans.map((p) => (
              <th key={p} style={{ padding: "18px 20px", textAlign: "center", fontSize: "13px", fontWeight: 700, color: C.text, borderBottom: "1px solid rgba(30,27,24,0.10)" }}>
                {p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.label} style={{ background: i % 2 === 0 ? "rgba(247,243,236,0.60)" : "rgba(255,252,245,0.90)" }}>
              <td style={{ padding: "14px 28px", fontSize: "13px", color: C.muted, borderBottom: "1px solid rgba(30,27,24,0.06)" }}>{row.label}</td>
              {row.values.map((val, j) => (
                <td key={j} style={{ padding: "14px 20px", textAlign: "center", fontSize: "13px", borderBottom: "1px solid rgba(30,27,24,0.06)" }}>
                  {typeof val === "boolean"
                    ? val
                      ? <span style={{ color: C.indigo, fontSize: "16px", fontWeight: 700 }}>✓</span>
                      : <span style={{ color: "#C8C0B8" }}>—</span>
                    : <span style={{ color: C.text, fontWeight: 500 }}>{val}</span>}
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
   BACK BUTTON — glass pill that sits just below the nav
   ════════════════════════════════════════════════════════════════════════════ */
function BackButton({ onClick, dark = true }: { onClick: () => void; dark?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "absolute",
        top: `${HEADER_H + 20}px`,
        left: "48px",
        display: "flex", alignItems: "center", gap: "6px",
        background: dark ? "rgba(255,252,245,0.14)" : "rgba(30,27,24,0.07)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        border: dark ? "1px solid rgba(255,252,245,0.26)" : "1px solid rgba(30,27,24,0.14)",
        borderRadius: "100px",
        color: dark ? "rgba(255,252,245,0.88)" : C.muted,
        fontSize: "13px", fontWeight: 500,
        padding: "9px 18px", cursor: "pointer", zIndex: 10,
        transition: "background 0.2s",
      }}
    >
      <ArrowLeft size={14} /> Back
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   SCENE 01 — CHOOSE YOUR PATH
   ════════════════════════════════════════════════════════════════════════════ */
function SceneChoosePath({ onSelect }: { onSelect: (v: "self-service" | "concierge") => void }) {
  return (
    <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <img src={splitPathImg} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(8,12,20,0.62) 0%, rgba(15,11,7,0.18) 55%, rgba(8,12,20,0.30) 100%)" }} />

      <div style={{
        position: "relative", zIndex: 5,
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        paddingTop: `${HEADER_H + 40}px`,
        paddingBottom: "80px", paddingLeft: "24px", paddingRight: "24px",
        minHeight: "100vh",
      }}>
        <p style={{ color: "rgba(245,232,210,0.55)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "28px" }}>
          ScoreShift Pricing
        </p>

        <h1 style={{
          color: "#FFFCF5", fontSize: "clamp(36px, 6vw, 68px)",
          fontWeight: 500, textAlign: "center",
          letterSpacing: "-1.5px", lineHeight: "1.08",
          maxWidth: "760px", marginBottom: "28px",
        }}>
          Choose how you'd like to move forward.
        </h1>

        <p style={{
          color: "rgba(245,235,215,0.72)", fontSize: "18px",
          lineHeight: "30px", textAlign: "center",
          maxWidth: "520px", marginBottom: "80px", fontWeight: 400,
        }}>
          Whether you prefer guided tools or hands-on support, ScoreShift helps you understand what matters and take the right next step.
        </p>

        <div style={{ display: "flex", gap: "32px", justifyContent: "center", flexWrap: "wrap" }}>
          <HeroGlassCard
            title="Self-Service"
            tagline="Explore at your own pace"
            description="Guided tools, monitoring, and AI-powered dispute letters designed for the client who wants to stay in control of their journey."
            ctaText="Explore Self-Service"
            onClick={() => onSelect("self-service")}
          />
          <HeroGlassCard
            title="Concierge"
            tagline="Work directly with our team"
            description="A fully managed program where ScoreShift strategists handle dispute execution, strategy, and progress tracking from start to finish."
            ctaText="Explore Concierge"
            onClick={() => onSelect("concierge")}
          />
        </div>

        <div style={{ marginTop: "72px", color: "rgba(255,252,245,0.28)", fontSize: "22px", letterSpacing: "0.05em" }}>
          <span style={{ display: "inline-block", animation: "floatArrow 2.8s ease-in-out infinite" }}>↓</span>
        </div>
      </div>

      <style>{`@keyframes floatArrow{0%,100%{transform:translateY(0)}50%{transform:translateY(10px)}}`}</style>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   SELF-SERVICE EXPERIENCE
   ════════════════════════════════════════════════════════════════════════════ */
function SelfServiceExperience({ onBack }: { onBack: () => void }) {
  return (
    <div>

      {/* ── SCENE 02A — Self-Service Hero ─────────────────────────────────── */}
      <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <img src={windingPathImg} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,8,5,0.50) 0%, rgba(10,8,5,0.10) 50%, rgba(247,243,236,1) 100%)" }} />

        <BackButton onClick={onBack} dark />

        <div style={{
          position: "relative", zIndex: 5,
          flex: 1, display: "flex", flexDirection: "column",
          justifyContent: "center", alignItems: "center",
          textAlign: "center",
          padding: `${HEADER_H + 40}px 32px 200px`,
          minHeight: "100vh",
        }}>
          <p style={{ color: "rgba(99,102,241,0.90)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "20px" }}>
            Self-Service
          </p>
          <h1 style={{
            color: "#FFFFFF", fontSize: "clamp(40px, 7vw, 80px)",
            fontWeight: 500, letterSpacing: "-2px", lineHeight: "1.05",
            maxWidth: "800px", textAlign: "center", margin: "0 auto 24px",
          }}>
            Your path.<br />Your pace.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "18px", lineHeight: "1.7", maxWidth: "480px", margin: "0 auto" }}>
            Tools, monitoring, and guidance designed to help you move forward with confidence — on your own timeline.
          </p>
        </div>
      </div>

      {/* ── SCENE 03A — Self-Service Pricing ──────────────────────────────── */}
      <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden", display: "flex", alignItems: "center" }}>
        <img src={creamEnvImg} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(247,243,236,0.12)" }} />

        <div style={{ position: "relative", zIndex: 2, width: "100%", padding: "100px 32px" }}>
          <div style={{ textAlign: "center", marginBottom: "72px" }}>
            <p style={{ color: C.indigo, fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "18px" }}>
              Self-Service Plans
            </p>
            <h2 style={{ color: C.text, fontSize: "clamp(40px, 6vw, 64px)", fontWeight: 500, letterSpacing: "-1.5px", lineHeight: "1.05", marginBottom: "18px" }}>
              Choose your plan.
            </h2>
            <p style={{ color: C.muted, fontSize: "17px", lineHeight: "1.7" }}>
              Start free. Upgrade when you're ready.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "20px",
            alignItems: "end",
            maxWidth: "1120px",
            margin: "0 auto",
          }}>
            {selfServicePlans.map((plan) => <PricingCard key={plan.id} plan={plan} />)}
          </div>
        </div>
      </div>

      {/* ── SCENE 04A — Comparison ────────────────────────────────────────── */}
      <div style={{ position: "relative", overflow: "hidden", padding: "120px 32px" }}>
        <img src={creamEnvImg} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(247,243,236,0.10)" }} />
      
        <div style={{ position: "relative", zIndex: 2, maxWidth: "960px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <p style={{ color: C.indigo, fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "16px" }}>
              Compare
            </p>
            <h2 style={{ color: C.text, fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 500, letterSpacing: "-1px", lineHeight: "1.08" }}>
              Everything, side by side.
            </h2>
          </div>
          <div style={{
            background: "rgba(255,252,245,0.88)",
            backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
            borderRadius: "24px", overflow: "hidden",
            border: "1px solid rgba(30,27,24,0.08)",
            boxShadow: "0 8px 48px rgba(10,8,5,0.07)",
          }}>
            <ComparisonTable plans={selfServicePlans.map((p) => p.name)} rows={ssCompare} />
          </div>
        </div>
      </div>

      {/* ── SCENE 05A — ScoreShift Mail Wallet ───────────────────────────── */}
      <MailWalletScene />

      {/* ── SCENE 06A — Closing CTA ──────────────────────────────────────── */}
      <CtaScene
        bg={windingPathImg}
        eyebrow="Self-Service"
        headline="Join the founding members."
        sub="Lock in your rate before the founding window closes. Your score journey starts now."
        cta="Get Started Free"
        href="/signup"
      />

      <footer className="ss-footer">
        <div className="ss-wrap ss-footer-inner">
          <Link href="/" className="ss-footer-logo">
            <img src="/images/scoreshift-logo-full.png" alt="ScoreShift" className="ss-footer-logo-img ss-footer-logo-bars" />
          </Link>
          <ul className="ss-footer-links">
            <li><Link href="/privacy-policy">Privacy</Link></li>
            <li><Link href="/terms">Terms</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
          <span className="ss-footer-copy">© {new Date().getFullYear()} ScoreShift, Inc.</span>
        </div>
      </footer>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   CONCIERGE EXPERIENCE
   ════════════════════════════════════════════════════════════════════════════ */
function ConciergeExperience({ onBack }: { onBack: () => void }) {
  return (
    <div>

      {/* ── SCENE 02B — Concierge Hero ────────────────────────────────────── */}
      <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <img src={conciergePathImg} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,8,5,0.48) 0%, rgba(10,8,5,0.08) 50%, rgba(247,243,236,1) 100%)" }} />

        <BackButton onClick={onBack} dark />

        <div style={{
          position: "relative", zIndex: 5,
          flex: 1, display: "flex", flexDirection: "column",
          justifyContent: "center", alignItems: "center",
          textAlign: "center",
          padding: `${HEADER_H + 40}px 32px 200px`,
          minHeight: "100vh",
        }}>
          <p style={{ color: "rgba(99,102,241,0.90)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "20px" }}>
            Concierge
          </p>
          <h1 style={{
            color: "#FFFFFF", fontSize: "clamp(38px, 6.5vw, 76px)",
            fontWeight: 500, letterSpacing: "-2px", lineHeight: "1.05",
            maxWidth: "860px", textAlign: "center", margin: "0 auto 24px",
          }}>
            Professional guidance<br />from start to finish.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "18px", lineHeight: "1.7", maxWidth: "500px", margin: "0 auto" }}>
            The ScoreShift team manages strategy and execution while you track every step through your private dashboard.
          </p>
        </div>
      </div>

      {/* ── SCENE 03B — Concierge Pricing ─────────────────────────────────── */}
      <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden", display: "flex", alignItems: "center" }}>
        <img src={creamEnvImg} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(247,243,236,0.12)" }} />

        <div style={{ position: "relative", zIndex: 2, width: "100%", padding: "100px 32px" }}>
          <div style={{ textAlign: "center", marginBottom: "72px" }}>
            <p style={{ color: C.indigo, fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "18px" }}>
              Concierge Programs
            </p>
            <h2 style={{ color: C.text, fontSize: "clamp(40px, 6vw, 64px)", fontWeight: 500, letterSpacing: "-1.5px", lineHeight: "1.05", marginBottom: "18px" }}>
              Choose your program.
            </h2>
            <p style={{ color: C.muted, fontSize: "17px", lineHeight: "1.7" }}>
              One flat investment. No recurring fees. We handle the execution.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
            alignItems: "end",
            maxWidth: "980px",
            margin: "0 auto",
          }}>
            {conciergePlans.map((plan) => <PricingCard key={plan.id} plan={plan} isConcierge />)}
          </div>
        </div>
      </div>

      {/* ── SCENE 04B — Concierge Comparison ──────────────────────────────── */}
      <div style={{ position: "relative", overflow: "hidden", padding: "120px 32px" }}>
        <img src={creamEnvImg} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(247,243,236,0.10)" }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: "880px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <p style={{ color: C.indigo, fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "16px" }}>
              What's Included
            </p>
            <h2 style={{ color: C.text, fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 500, letterSpacing: "-1px", lineHeight: "1.08" }}>
              Every program. Fully clear.
            </h2>
          </div>
          <div style={{
            background: "rgba(255,252,245,0.88)",
            backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
            borderRadius: "24px", overflow: "hidden",
            border: "1px solid rgba(30,27,24,0.08)",
            boxShadow: "0 8px 48px rgba(10,8,5,0.07)",
          }}>
            <ComparisonTable plans={conciergePlans.map((p) => p.name)} rows={ccCompare} />
          </div>
        </div>
      </div>

      {/* ── SCENE 05B — ScoreShift Mail Wallet ───────────────────────────── */}
      <MailWalletScene />

      {/* ── SCENE 06B — Closing CTA ──────────────────────────────────────── */}
      <CtaScene
        bg={conciergePathImg}
        eyebrow="Concierge"
        headline="Let us guide the process."
        sub="Speak with a ScoreShift specialist to find the right program for your goals."
        cta="Book a Strategy Call"
        href="/concierge"
      />

      <footer className="ss-footer">
        <div className="ss-wrap ss-footer-inner">
          <Link href="/" className="ss-footer-logo">
            <img src="/images/scoreshift-logo-full.png" alt="ScoreShift" className="ss-footer-logo-img ss-footer-logo-bars" />
          </Link>
          <ul className="ss-footer-links">
            <li><Link href="/privacy-policy">Privacy</Link></li>
            <li><Link href="/terms">Terms</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
          <span className="ss-footer-copy">© {new Date().getFullYear()} ScoreShift, Inc.</span>
        </div>
      </footer>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   SCENE 05 — SCORESHIFT MAIL WALLET  (shared between both paths)
   ════════════════════════════════════════════════════════════════════════════ */
function MailWalletScene() {
  const [selected, setSelected] = useState(5);
  const credit = mailCredits.find((c) => c.qty === selected)!;

  return (
    <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden", display: "flex", alignItems: "center" }}>
      {/* Background: cream stone image (same as pricing + compare scenes) */}
      <img src={creamEnvImg} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(247,243,236,0.10)" }} />

      <div style={{ position: "relative", zIndex: 2, width: "100%", padding: "100px 32px", display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* Section label + heading — dark text since background is light */}
        <p style={{ color: C.indigo, fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "20px" }}>
          Add-On Service
        </p>
        <h2 style={{
          color: C.text, fontSize: "clamp(36px, 6vw, 68px)",
          fontWeight: 500, letterSpacing: "-1.5px", lineHeight: "1.06",
          textAlign: "center", marginBottom: "20px", maxWidth: "700px",
        }}>
          ScoreShift<br />Mail Wallet
        </h2>
        <p style={{ color: C.muted, fontSize: "17px", lineHeight: "1.7", textAlign: "center", maxWidth: "480px", marginBottom: "72px" }}>
          Create your Smart Letter, then send it certified through ScoreShift Mail — no printing, envelopes, stamps, or post office trips.
        </p>

        {/* Wallet card — mountain person image inside the card, with gray filter */}
        <div style={{
          width: "100%", maxWidth: "680px",
          borderRadius: "28px", overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(30,27,24,0.12)",
          boxShadow: "0 32px 80px rgba(10,8,5,0.18), 0 4px 24px rgba(10,8,5,0.10)",
        }}>
          {/* Card base color */}
          <div style={{ position: "absolute", inset: 0, background: "#1A1612" }} />
          {/* Mountain person image at ~20% opacity */}
          <img src={mountainPersonImg} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%", opacity: 0.20 }} />
          <div style={{ position: "relative", zIndex: 2, padding: "36px 36px 32px" }}>
            {/* Card branding */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "36px" }}>
              <div>
                <div style={{ color: "rgba(255,252,245,0.92)", fontSize: "18px", fontWeight: 600, letterSpacing: "-0.3px" }}>ScoreShift</div>
                <div style={{ color: "rgba(255,252,245,0.35)", fontSize: "9px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", marginTop: "3px" }}>Mail Wallet</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Mail size={18} style={{ color: "rgba(255,252,245,0.40)" }} />
              </div>
            </div>

            {/* Credit options grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "10px", marginBottom: "28px" }}>
              {mailCredits.map((c) => {
                const isSel = c.qty === selected;
                return (
                  <button
                    key={c.qty}
                    onClick={() => setSelected(c.qty)}
                    style={{
                      background: isSel ? "rgba(99,102,241,0.80)" : "rgba(255,252,245,0.07)",
                      border: isSel ? "1px solid rgba(130,136,210,0.60)" : "1px solid rgba(255,252,245,0.12)",
                      borderRadius: "16px", padding: "18px 10px",
                      cursor: "pointer",
                      transition: "all 0.28s cubic-bezier(0.23,1,0.32,1)",
                      backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                      boxShadow: isSel ? "0 10px 32px rgba(67,56,202,0.45)" : "none",
                      transform: isSel ? "translateY(-3px)" : "none",
                    }}
                  >
                    <div style={{ color: isSel ? "rgba(255,252,245,0.60)" : "rgba(255,252,245,0.38)", fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>
                      {c.label}
                    </div>
                    <div style={{ color: isSel ? "#FFFCF5" : "rgba(255,252,245,0.80)", fontSize: "20px", fontWeight: 700, letterSpacing: "-0.5px", lineHeight: 1 }}>
                      {c.price}
                    </div>
                    {c.qty > 1 && (
                      <div style={{ color: isSel ? "rgba(255,252,245,0.45)" : "rgba(255,252,245,0.28)", fontSize: "10px", marginTop: "5px" }}>
                        ${(parseFloat(c.price.replace("$", "")) / c.qty).toFixed(2)}/ea
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* CTA */}
            <Link href="/checkout?addon=mail">
              <button
                style={{
                  width: "100%", background: C.indigo, color: "#FFFCF5",
                  border: "none", borderRadius: "16px", padding: "16px 0",
                  fontSize: "14px", fontWeight: 600, cursor: "pointer",
                  boxShadow: `0 10px 32px ${C.indigoShadow}`,
                  transition: "background 0.22s, transform 0.22s",
                  letterSpacing: "0.02em",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = C.indigoDeep; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = C.indigo; e.currentTarget.style.transform = "none"; }}
              >
                Purchase {credit.label} — {credit.price}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   SCENE 06 — CINEMATIC CTA CLOSE  (shared, bg varies)
   ════════════════════════════════════════════════════════════════════════════ */
function CtaScene({ bg, eyebrow, headline, sub, cta, href }: {
  bg: string; eyebrow: string; headline: string; sub: string; cta: string; href: string;
}) {
  return (
    <div style={{ position: "relative", minHeight: "80vh", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <img src={bg} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,8,5,0.70) 0%, rgba(10,8,5,0.60) 100%)" }} />

      <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "80px 32px" }}>
        <p style={{ color: "rgba(160,165,220,0.80)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "20px" }}>
          {eyebrow}
        </p>
        <h2 style={{
          color: "#FFFCF5", fontSize: "clamp(36px, 6vw, 68px)",
          fontWeight: 500, letterSpacing: "-1.5px", lineHeight: "1.06",
          maxWidth: "700px", margin: "0 auto 24px",
        }}>
          {headline}
        </h2>
        <p style={{ color: "rgba(245,235,218,0.65)", fontSize: "17px", lineHeight: "1.7", maxWidth: "420px", margin: "0 auto 52px" }}>
          {sub}
        </p>
        <Link href={href}>
          <button
            style={{
              background: C.indigo, color: "#FFFCF5", border: "none",
              borderRadius: "100px", padding: "18px 48px",
              fontSize: "15px", fontWeight: 600, cursor: "pointer",
              boxShadow: `0 12px 36px ${C.indigoShadow}`,
              transition: "background 0.22s, transform 0.22s",
              letterSpacing: "0.02em",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.indigoDeep; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.indigo; e.currentTarget.style.transform = "none"; }}
          >
            {cta} →
          </button>
        </Link>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   ROOT — single nav instance matching the landing page exactly
   ════════════════════════════════════════════════════════════════════════════ */
export default function PricingPage() {
  const [view, setView] = useState<ViewType>("choose");
  const [fading, setFading] = useState(false);

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
    }, 260);
  };

  return (
    <>
      {/* ── Navbar — exact landing page markup ───────────────────────────── */}
      <nav className="ss-nav">
        <div className="ss-wrap ss-nav-inner">
          <Link href="/" className="ss-nav-logo">
            <img src="/images/scoreshift-wordmark-transparent.png" alt="ScoreShift" className="ss-nav-logo-img" />
          </Link>
          <ul className="ss-nav-links">
            <li><Link href="/#product">Product</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/#trust">Results</Link></li>
          </ul>
          <div className="ss-nav-actions">
            <Link href="/login" className="ss-nav-ghost">Sign in</Link>
            <Link href="/pricing" className="ss-btn-nav">
              Start My Plan <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Page content — fades between views ───────────────────────────── */}
      <div style={{ opacity: fading ? 0 : 1, transition: "opacity 0.26s ease" }}>
        {view === "choose"       && <SceneChoosePath onSelect={(v) => navigateTo(v)} />}
        {view === "self-service" && <SelfServiceExperience onBack={() => navigateTo("choose")} />}
        {view === "concierge"    && <ConciergeExperience   onBack={() => navigateTo("choose")} />}
      </div>
    </>
  );
}
