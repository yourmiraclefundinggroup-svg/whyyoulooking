import { useState, useRef } from "react";
import { Link } from "wouter";
import { CheckCircle, ArrowLeft, Mail } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

import splitPathImg from "@assets/ChatGPT_Image_Jun_9,_2026,_04_26_54_PM_1781047045828.png";
import windingPathImg from "@assets/ChatGPT_Image_Jun_9,_2026,_04_17_47_PM_1781047072844.png";
import creamEnvImg from "@assets/ChatGPT_Image_Jun_9,_2026,_03_48_17_PM_1781047080235.png";
import conciergePathImg from "@assets/ChatGPT_Image_Jun_9,_2026,_07_56_28_PM_1781051920048.png";
import mountainPersonImg from "@assets/ChatGPT_Image_Jun_9,_2026,_08_13_49_PM_1781051953003.png";

type ViewType = "choose" | "self-service" | "concierge";

/* ─── color tokens ───────────────────────────────────────────────────────── */
const C = {
  cream: "#F5EEE0",
  bone: "#EDE0CC",
  surface: "#FFFCF5",
  indigo: "#4a4e8c",
  indigoLight: "rgba(74,78,140,0.15)",
  indigoShadow: "rgba(74,78,140,0.45)",
  text: "#2A2725",
  muted: "#5B5652",
  faint: "#8B8480",
  glass: "rgba(255,252,245,0.13)",
  glassBorder: "rgba(255,252,245,0.28)",
  glassShadow: "rgba(20,15,10,0.35)",
  overlay: "rgba(20,15,10,0.42)",
};

/* ─── self-service plans ─────────────────────────────────────────────────── */
const selfServicePlans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    suffix: "/month",
    badge: null,
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
    badge: null,
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
    badge: null,
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
    badge: null,
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
    badge: null,
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

/* ─── self-service comparison rows ──────────────────────────────────────── */
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

/* ─── concierge comparison rows ─────────────────────────────────────────── */
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
  title,
  tagline,
  description,
  ctaText,
  onClick,
}: {
  title: string;
  tagline: string;
  description: string;
  ctaText: string;
  onClick: () => void;
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
    ref.current.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) translateY(0)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        background: C.glass,
        border: `1px solid ${C.glassBorder}`,
        boxShadow: `0 20px 30px ${C.glassShadow}`,
        borderRadius: "24px",
        padding: "36px 32px",
        width: "380px",
        transition: "transform 0.35s cubic-bezier(0.23,1,0.32,1)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: "0",
      }}
      onClick={onClick}
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
   PRICING CARD — self-service and concierge
   ════════════════════════════════════════════════════════════════════════════ */
function PricingCard({
  plan,
  isConcierge = false,
}: {
  plan: (typeof selfServicePlans)[number] | (typeof conciergePlans)[number];
  isConcierge?: boolean;
}) {
  const featured = plan.featured;
  const hasBadgeSub = "badgeSub" in plan && plan.badgeSub;

  return (
    <div
      style={{
        background: featured ? "#2A2725" : C.surface,
        border: featured ? `1px solid rgba(74,78,140,0.30)` : "1px solid rgba(42,39,37,0.12)",
        borderRadius: "20px",
        padding: featured ? "36px 32px" : "28px 28px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        transform: featured ? "translateY(-10px) scale(1.02)" : "none",
        boxShadow: featured
          ? "0 24px 48px rgba(20,15,10,0.18), 0 0 0 1px rgba(74,78,140,0.20)"
          : "0 2px 16px rgba(42,39,37,0.06)",
        transition: "box-shadow 0.2s, transform 0.2s",
        flex: featured ? "0 0 auto" : "1",
        minWidth: 0,
      }}
    >
      {/* Badge */}
      {plan.badge && (
        <div style={{ marginBottom: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
          <span
            style={{
              display: "inline-block",
              background: C.indigo,
              color: "#FFFCF5",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "4px 12px",
              borderRadius: "100px",
            }}
          >
            {plan.badge}
          </span>
          {hasBadgeSub && (
            <span style={{ color: "rgba(245,230,205,0.5)", fontSize: "11px" }}>
              {(plan as typeof selfServicePlans[number]).badgeSub}
            </span>
          )}
        </div>
      )}

      {/* Name + description */}
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ color: featured ? "#FFFCF5" : C.text, fontSize: "22px", fontWeight: 600, marginBottom: "6px" }}>
          {plan.name}
        </h3>
        {"duration" in plan && (
          <div
            style={{
              display: "inline-block",
              background: "rgba(74,78,140,0.12)",
              color: C.indigo,
              fontSize: "11px",
              fontWeight: 500,
              padding: "3px 10px",
              borderRadius: "100px",
              marginBottom: "6px",
            }}
          >
            {(plan as typeof conciergePlans[number]).duration}
          </div>
        )}
        <p style={{ color: featured ? "rgba(255,252,245,0.55)" : C.muted, fontSize: "13px", lineHeight: "1.5" }}>
          {plan.description}
        </p>
      </div>

      {/* Price */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
          <span style={{ color: featured ? "#FFFCF5" : C.text, fontSize: "42px", fontWeight: 700, letterSpacing: "-1px" }}>
            ${plan.price}
          </span>
          <span style={{ color: featured ? "rgba(255,252,245,0.45)" : C.faint, fontSize: "14px" }}>{plan.suffix}</span>
        </div>
        {featured && !isConcierge && (
          <div style={{ color: "rgba(74,78,140,0.85)", fontSize: "12px", marginTop: "4px", fontWeight: 500 }}>
            Price locked forever at founding rate
          </div>
        )}
      </div>

      {/* Features */}
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px 0", flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
        {plan.features.map((f) => (
          <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", color: featured ? "rgba(255,252,245,0.82)" : "#4A4541" }}>
            <CheckCircle
              size={15}
              style={{ color: featured ? "rgba(149,154,210,0.9)" : C.indigo, flexShrink: 0, marginTop: "1px" }}
            />
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link href={plan.ctaHref}>
        <button
          style={{
            width: "100%",
            padding: "13px 0",
            borderRadius: "12px",
            fontSize: "14px",
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
  const [selected, setSelected] = useState(1);

  const selectedCredit = mailCredits.find((c) => c.qty === selected) ?? mailCredits[1];

  return (
    <section
      style={{
        background: C.surface,
        borderRadius: "28px",
        padding: "56px 48px",
        maxWidth: "860px",
        margin: "0 auto",
        border: "1px solid rgba(42,39,37,0.09)",
        boxShadow: "0 4px 32px rgba(42,39,37,0.06)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "28px" }}>
        <Mail size={28} style={{ color: C.indigo, flexShrink: 0, marginTop: "2px" }} />
        <div>
          <h3 style={{ color: C.text, fontSize: "26px", fontWeight: 600, marginBottom: "6px" }}>ScoreShift Mail</h3>
          <p style={{ color: C.muted, fontSize: "14px", lineHeight: "1.6", maxWidth: "520px" }}>
            Create your Smart Letter, then send it certified through ScoreShift Mail — no printing, envelopes, stamps, or post office trips.
          </p>
        </div>
      </div>

      {/* Wallet card stack */}
      <div style={{ position: "relative", height: "180px", marginBottom: "32px" }}>
        {[...mailCredits].reverse().map((credit, i) => {
          const isSelected = credit.qty === selected;
          const idx = mailCredits.length - 1 - i;
          const baseOffset = idx * 12;
          const hues = ["#e8dfc9", "#dfd5be", "#d5cab3", "#c9bea6"];

          return (
            <div
              key={credit.qty}
              onClick={() => setSelected(credit.qty)}
              style={{
                position: "absolute",
                left: "50%",
                transform: `translateX(-50%) translateY(${isSelected ? -8 : baseOffset}px) scale(${isSelected ? 1 : 0.96 - (mailCredits.length - 1 - idx) * 0.015})`,
                width: "100%",
                maxWidth: "520px",
                background: isSelected ? C.indigo : hues[idx],
                borderRadius: "18px",
                padding: "22px 28px",
                cursor: "pointer",
                transition: "all 0.38s cubic-bezier(0.23,1,0.32,1)",
                boxShadow: isSelected
                  ? "0 16px 40px rgba(74,78,140,0.35)"
                  : `0 4px 12px rgba(42,39,37,0.10)`,
                zIndex: isSelected ? 10 : idx,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", color: isSelected ? "rgba(255,252,245,0.6)" : C.faint, textTransform: "uppercase", marginBottom: "4px" }}>
                  ScoreShift Mail
                </div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: isSelected ? "#FFFCF5" : C.text }}>
                  {credit.label}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "28px", fontWeight: 700, color: isSelected ? "#FFFCF5" : C.text }}>
                  {credit.price}
                </div>
                {credit.qty > 1 && (
                  <div style={{ fontSize: "11px", color: isSelected ? "rgba(255,252,245,0.55)" : C.faint }}>
                    ${(parseFloat(credit.price.replace("$", "")) / credit.qty).toFixed(2)} / letter
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selector tabs */}
      <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "28px" }}>
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
              background: C.indigo,
              color: "#FFFCF5",
              border: "none",
              borderRadius: "12px",
              padding: "13px 36px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: `0 8px 24px -4px ${C.indigoShadow}`,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#5a5ea8")}
            onMouseLeave={(e) => (e.currentTarget.style.background = C.indigo)}
          >
            Purchase {selectedCredit.label} — {selectedCredit.price}
          </button>
        </Link>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   COMPARISON TABLE
   ════════════════════════════════════════════════════════════════════════════ */
function ComparisonTable({
  plans,
  rows,
}: {
  plans: string[];
  rows: { label: string; values: (boolean | string)[] }[];
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "480px" }}>
        <thead>
          <tr style={{ background: C.bone }}>
            <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "13px", color: C.muted, fontWeight: 500, borderRadius: "12px 0 0 0" }}>
              Feature
            </th>
            {plans.map((p, i) => (
              <th
                key={p}
                style={{
                  padding: "14px 20px",
                  textAlign: "center",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: C.text,
                  borderRadius: i === plans.length - 1 ? "0 12px 0 0" : undefined,
                }}
              >
                {p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.label}
              style={{ background: i % 2 === 0 ? "rgba(42,39,37,0.02)" : C.surface, borderTop: "1px solid rgba(42,39,37,0.07)" }}
            >
              <td style={{ padding: "13px 20px", fontSize: "13px", color: C.muted }}>{row.label}</td>
              {row.values.map((val, j) => (
                <td key={j} style={{ padding: "13px 20px", textAlign: "center", fontSize: "13px" }}>
                  {typeof val === "boolean" ? (
                    val ? (
                      <span style={{ color: C.indigo, fontSize: "16px", fontWeight: 700 }}>✓</span>
                    ) : (
                      <span style={{ color: "#C5BDB6" }}>—</span>
                    )
                  ) : (
                    <span style={{ color: C.text }}>{val}</span>
                  )}
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
   SECTION 1 — CHOOSE YOUR PATH
   ════════════════════════════════════════════════════════════════════════════ */
function ChooseYourPath({ onSelect }: { onSelect: (v: "self-service" | "concierge") => void }) {
  return (
    <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      {/* Background image */}
      <img
        src={splitPathImg}
        alt="Two paths diverging"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
      />
      {/* Gradient overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(20,15,10,0.45) 0%, rgba(20,15,10,0.15) 60%)" }} />

      {/* Navbar */}
      <div style={{ position: "relative", zIndex: 10 }}>
        <Navbar variant="dark" />
      </div>

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "120px",
          paddingBottom: "80px",
          paddingLeft: "24px",
          paddingRight: "24px",
        }}
      >
        {/* Headline */}
        <h1
          style={{
            color: "#FFFCF5",
            fontSize: "clamp(34px, 5vw, 52px)",
            fontWeight: 500,
            textAlign: "center",
            letterSpacing: "-0.78px",
            lineHeight: "1.15",
            maxWidth: "680px",
            marginBottom: "24px",
          }}
        >
          Choose how you'd like to move forward.
        </h1>
        <p
          style={{
            color: "rgba(245,235,215,0.85)",
            fontSize: "17px",
            lineHeight: "28px",
            textAlign: "center",
            maxWidth: "560px",
            marginBottom: "72px",
          }}
        >
          Whether you prefer guided tools or hands-on support, ScoreShift helps you understand what matters, know what to do next, and move forward with confidence.
        </p>

        {/* Two glass cards */}
        <div style={{ display: "flex", gap: "32px", justifyContent: "center", flexWrap: "wrap" }}>
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

        {/* Down arrow */}
        <div style={{ marginTop: "60px", color: "rgba(255,252,245,0.4)", fontSize: "20px", animation: "float 2.5s ease-in-out infinite" }}>
          ↓
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
      `}</style>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   SELF-SERVICE EXPERIENCE
   ════════════════════════════════════════════════════════════════════════════ */
function SelfServiceExperience({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>
      <div style={{ position: "relative", zIndex: 10 }}>
        <Navbar variant="light" />
      </div>

      {/* Hero */}
      <div style={{ position: "relative", height: "65vh", minHeight: "420px", overflow: "hidden" }}>
        <img
          src={windingPathImg}
          alt="Winding path forward"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(20,15,10,0.28) 0%, rgba(245,238,224,1) 100%)" }} />

        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            position: "absolute",
            top: "28px",
            left: "40px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(255,252,245,0.18)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,252,245,0.3)",
            borderRadius: "100px",
            color: "#FFFCF5",
            fontSize: "13px",
            padding: "8px 16px",
            cursor: "pointer",
            zIndex: 10,
          }}
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div style={{ position: "absolute", bottom: "60px", left: "50%", transform: "translateX(-50%)", textAlign: "center", width: "100%", padding: "0 24px" }}>
          <p style={{ color: "rgba(74,78,140,0.85)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>
            Self-Service
          </p>
          <h1
            style={{
              color: C.text,
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 600,
              letterSpacing: "-0.6px",
              marginBottom: "16px",
              lineHeight: "1.1",
            }}
          >
            Your path. Your pace.
          </h1>
          <p style={{ color: C.muted, fontSize: "17px", lineHeight: "1.6", maxWidth: "480px", margin: "0 auto" }}>
            Tools, monitoring, and guidance designed to help you move forward with confidence.
          </p>
        </div>
      </div>

      {/* Pricing cards on cream env background */}
      <div style={{ position: "relative", overflow: "hidden", paddingTop: "48px", paddingBottom: "80px" }}>
        <img
          src={creamEnvImg}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.35,
          }}
        />
        <div style={{ position: "relative", zIndex: 2, maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ color: C.text, fontSize: "32px", fontWeight: 600, marginBottom: "10px" }}>
              Choose your plan
            </h2>
            <p style={{ color: C.muted, fontSize: "15px" }}>
              Start free. Upgrade when you're ready. Founding Member pricing locked forever.
            </p>
          </div>

          {/* 4-card grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              alignItems: "start",
            }}
          >
            {selfServicePlans.map((plan) => (
              <PricingCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px 80px" }}>
        <h2 style={{ color: C.text, fontSize: "24px", fontWeight: 600, textAlign: "center", marginBottom: "32px" }}>
          Compare plans
        </h2>
        <div
          style={{
            background: C.surface,
            borderRadius: "20px",
            overflow: "hidden",
            border: "1px solid rgba(42,39,37,0.09)",
            boxShadow: "0 4px 24px rgba(42,39,37,0.06)",
          }}
        >
          <ComparisonTable
            plans={selfServicePlans.map((p) => p.name)}
            rows={ssCompare}
          />
        </div>
      </div>

      {/* Mail Wallet */}
      <div style={{ padding: "0 24px 80px" }}>
        <MailWallet />
      </div>

      {/* Mountain person visual */}
      <div style={{ maxWidth: "900px", margin: "0 auto 80px", padding: "0 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "32px" }}>
        <div style={{ borderRadius: "28px", overflow: "hidden", width: "360px", maxWidth: "100%", boxShadow: "0 24px 64px rgba(42,39,37,0.12)" }}>
          <img src={mountainPersonImg} alt="Working from anywhere" style={{ width: "100%", display: "block" }} />
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: C.bone, padding: "80px 24px", textAlign: "center" }}>
        <h2 style={{ color: C.text, fontSize: "36px", fontWeight: 600, marginBottom: "16px" }}>
          Start your guided plan.
        </h2>
        <p style={{ color: C.muted, fontSize: "16px", maxWidth: "400px", margin: "0 auto 36px" }}>
          Join the founding members who moved forward before everyone else.
        </p>
        <Link href="/signup">
          <button
            style={{
              background: C.indigo,
              color: "#FFFCF5",
              border: "none",
              borderRadius: "14px",
              padding: "16px 48px",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: `0 12px 32px -4px ${C.indigoShadow}`,
              transition: "background 0.2s",
            }}
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
   CONCIERGE EXPERIENCE
   ════════════════════════════════════════════════════════════════════════════ */
function ConciergeExperience({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>
      <div style={{ position: "relative", zIndex: 10 }}>
        <Navbar variant="light" />
      </div>

      {/* Hero */}
      <div style={{ position: "relative", height: "70vh", minHeight: "480px", overflow: "hidden" }}>
        <img
          src={conciergePathImg}
          alt="ScoreShift Concierge path"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(20,15,10,0.22) 0%, rgba(245,238,224,1) 100%)" }} />

        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            position: "absolute",
            top: "28px",
            left: "40px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(255,252,245,0.18)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,252,245,0.3)",
            borderRadius: "100px",
            color: "#FFFCF5",
            fontSize: "13px",
            padding: "8px 16px",
            cursor: "pointer",
            zIndex: 10,
          }}
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div style={{ position: "absolute", bottom: "60px", left: "50%", transform: "translateX(-50%)", textAlign: "center", width: "100%", padding: "0 24px" }}>
          <p style={{ color: "rgba(74,78,140,0.85)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>
            Concierge
          </p>
          <h1
            style={{
              color: C.text,
              fontSize: "clamp(30px, 4.5vw, 44px)",
              fontWeight: 600,
              letterSpacing: "-0.5px",
              marginBottom: "16px",
              lineHeight: "1.1",
            }}
          >
            Professional guidance from start to finish.
          </h1>
          <p style={{ color: C.muted, fontSize: "16px", lineHeight: "1.6", maxWidth: "500px", margin: "0 auto" }}>
            The ScoreShift team manages the strategy and execution while you track progress through your dashboard.
          </p>
        </div>
      </div>

      {/* Pricing cards */}
      <div style={{ position: "relative", overflow: "hidden", paddingTop: "48px", paddingBottom: "80px" }}>
        <img
          src={creamEnvImg}
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.35 }}
        />
        <div style={{ position: "relative", zIndex: 2, maxWidth: "1000px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ color: C.text, fontSize: "32px", fontWeight: 600, marginBottom: "10px" }}>
              Managed programs
            </h2>
            <p style={{ color: C.muted, fontSize: "15px" }}>
              One flat investment. No monthly recurring fees. We handle the execution.
            </p>
          </div>

          {/* 3-card grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "20px",
              alignItems: "start",
            }}
          >
            {conciergePlans.map((plan) => (
              <PricingCard key={plan.id} plan={plan} isConcierge />
            ))}
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div style={{ maxWidth: "820px", margin: "0 auto", padding: "0 24px 80px" }}>
        <h2 style={{ color: C.text, fontSize: "24px", fontWeight: 600, textAlign: "center", marginBottom: "32px" }}>
          What's included
        </h2>
        <div
          style={{
            background: C.surface,
            borderRadius: "20px",
            overflow: "hidden",
            border: "1px solid rgba(42,39,37,0.09)",
            boxShadow: "0 4px 24px rgba(42,39,37,0.06)",
          }}
        >
          <ComparisonTable
            plans={conciergePlans.map((p) => p.name)}
            rows={ccCompare}
          />
        </div>
      </div>

      {/* Mail Wallet */}
      <div style={{ padding: "0 24px 80px" }}>
        <MailWallet />
      </div>

      {/* CTA */}
      <div style={{ background: C.bone, padding: "80px 24px", textAlign: "center" }}>
        <h2 style={{ color: C.text, fontSize: "36px", fontWeight: 600, marginBottom: "16px" }}>
          Let us help guide the process.
        </h2>
        <p style={{ color: C.muted, fontSize: "16px", maxWidth: "440px", margin: "0 auto 36px" }}>
          Speak with a ScoreShift specialist to find the right program for your goals.
        </p>
        <Link href="/concierge">
          <button
            style={{
              background: C.indigo,
              color: "#FFFCF5",
              border: "none",
              borderRadius: "14px",
              padding: "16px 48px",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: `0 12px 32px -4px ${C.indigoShadow}`,
              transition: "background 0.2s",
            }}
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
   ROOT — orchestrates view transitions
   ════════════════════════════════════════════════════════════════════════════ */
export default function PricingPage() {
  const [view, setView] = useState<ViewType>("choose");
  const [fading, setFading] = useState(false);

  const navigateTo = (next: ViewType) => {
    setFading(true);
    setTimeout(() => {
      setView(next);
      setFading(false);
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }, 280);
  };

  return (
    <div
      style={{
        opacity: fading ? 0 : 1,
        transition: "opacity 0.28s ease",
      }}
    >
      {view === "choose" && (
        <ChooseYourPath onSelect={(v) => navigateTo(v)} />
      )}
      {view === "self-service" && (
        <SelfServiceExperience onBack={() => navigateTo("choose")} />
      )}
      {view === "concierge" && (
        <ConciergeExperience onBack={() => navigateTo("choose")} />
      )}
    </div>
  );
}
