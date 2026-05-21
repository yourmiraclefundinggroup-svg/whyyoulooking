import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const personalPlans = [
  {
    name: "Starter",
    tier: "starter",
    price: 29,
    yearlyPrice: 24,
    description: "Start seeing your full credit picture",
    popular: false,
    badge: null,
    features: [
      "Dashboard access",
      "Credit overview & score tracker (3 bureaus)",
      "3 dispute letters / month",
      "Credit report viewer",
      "ScoreMap™ roadmap",
      "Email support",
    ],
  },
  {
    name: "Pro",
    tier: "pro",
    price: 79,
    yearlyPrice: 66,
    description: "Full monitoring, guided disputes, and real-time alerts",
    popular: true,
    badge: "Most Popular",
    features: [
      "Everything in Starter",
      "Unlimited dispute letters",
      "Real-Time Credit Alerts",
      "Automated Lob.com certified mail",
      "Score Simulator",
      "Debt Analysis & Debt Navigator",
      "Credit Coach AI — 24/7",
      "Priority support",
    ],
  },
  {
    name: "Elite",
    tier: "elite",
    price: 149,
    yearlyPrice: 124,
    description: "Complete credit readiness and identity protection",
    popular: false,
    badge: "🚀 June 1st Launch",
    features: [
      "Everything in Pro",
      "Identity Protect (dark web + fraud alerts)",
      "Privacy Protect (data broker removal)",
      "Subscription Manager",
      "Student Loan Aid",
      "LoanBridge™ DSCR loan connection",
      "Dedicated account manager",
    ],
  },
];

const businessPlans = [
  {
    name: "Starter",
    tier: "biz-starter",
    price: 79.99,
    yearlyPrice: 67,
    description: "Launch your white-label credit repair brand",
    popular: false,
    badge: null,
    features: [
      "1 user",
      "Up to 100 clients",
      "Live 3-bureau credit monitoring",
      "Client dashboard",
      "Basic white-label branding",
      "Email support",
    ],
  },
  {
    name: "Growth",
    tier: "biz-growth",
    price: 329.99,
    yearlyPrice: 275,
    description: "Scale your branded portal with a growing team",
    popular: true,
    badge: "Most Popular",
    features: [
      "Up to 5 users",
      "Up to 1,250 clients",
      "Live 3-bureau credit monitoring",
      "Full white-label branding",
      "Client management tools",
      "AutoCycle batch automation",
      "Priority support",
    ],
  },
  {
    name: "Scaling",
    tier: "biz-scaling",
    price: 459.99,
    yearlyPrice: 384,
    description: "Full white-label SaaS for high-volume agencies",
    popular: false,
    badge: null,
    features: [
      "Up to 10 users",
      "Up to 2,500 clients",
      "Live 3-bureau credit monitoring",
      "Full white-label experience",
      "Advanced client management",
      "API + Zapier integration",
      "Dedicated account manager",
    ],
  },
];

export default function PricingPage() {
  const [audience, setAudience] = useState<"personal" | "business">("personal");
  const [yearly, setYearly] = useState(false);

  const plans = audience === "personal" ? personalPlans : businessPlans;

  return (
    <div className="min-h-screen" style={{ background: "#F1E8DA" }}>
      <Navbar variant="light" />

      <div className="pt-44 pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center gap-2 text-white text-xs font-bold px-4 py-2 rounded-full shadow-md mb-5"
              style={{ background: "linear-gradient(135deg, #7C6BCB, #9F93D9)" }}
            >
              <Sparkles size={12} className="text-white/80" />
              Live 3-Bureau Monitoring — Available Now
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4" style={{ color: "#2A2725" }}>
              Your Path Forward
            </h1>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "#5B5652" }}>
              Start with a 3-day free trial. No credit card required. Cancel anytime.
            </p>
          </div>

          {/* Audience Toggle */}
          <div className="flex justify-center mb-8">
            <div
              className="flex rounded-full p-1"
              style={{
                background: "#E0D5C4",
                border: "1px solid rgba(42,39,37,0.12)",
              }}
            >
              <button
                onClick={() => setAudience("personal")}
                className="px-6 py-2 rounded-full text-sm font-semibold transition-all"
                style={
                  audience === "personal"
                    ? { background: "#7C6BCB", color: "#fff" }
                    : { color: "#5B5652" }
                }
              >
                Personal Credit
              </button>
              <button
                onClick={() => setAudience("business")}
                className="px-6 py-2 rounded-full text-sm font-semibold transition-all"
                style={
                  audience === "business"
                    ? { background: "#7C6BCB", color: "#fff" }
                    : { color: "#5B5652" }
                }
              >
                White-Label Business
              </button>
            </div>
          </div>

          {/* Yearly toggle */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <span className="text-sm font-medium" style={{ color: !yearly ? "#2A2725" : "#8B8480" }}>Monthly</span>
            <button
              onClick={() => setYearly(!yearly)}
              className="relative w-12 h-6 rounded-full transition-colors"
              style={{ background: yearly ? "#7C6BCB" : "rgba(42,39,37,0.15)" }}
            >
              <div
                className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm"
                style={{ transform: yearly ? "translateX(28px)" : "translateX(4px)" }}
              />
            </button>
            <span className="text-sm font-medium" style={{ color: yearly ? "#2A2725" : "#8B8480" }}>
              Yearly <span className="font-semibold" style={{ color: "#6A7769" }}>Save 20%</span>
            </span>
          </div>

          {/* Plan Cards */}
          <div className="grid gap-6 mb-16 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="p-8 rounded-2xl relative flex flex-col transition-all"
                style={
                  plan.popular
                    ? {
                        background: "#3A3734",
                        border: "1px solid rgba(124,107,203,0.30)",
                        boxShadow: "0 8px 32px rgba(42,39,37,0.18)",
                      }
                    : {
                        background: "#F3EEE6",
                        border: "1px solid rgba(42,39,37,0.12)",
                        boxShadow: "0 2px 12px rgba(42,39,37,0.06)",
                      }
                }
              >
                {plan.popular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-bold whitespace-nowrap"
                    style={{ background: "linear-gradient(135deg, #7C6BCB, #9F93D9)" }}
                  >
                    ⭐ Most Popular
                  </div>
                )}

                {plan.badge && !plan.popular && (
                  <div className="mb-3">
                    <span
                      className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full text-white"
                      style={{ background: "linear-gradient(135deg, #7C6BCB, #9F93D9)" }}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3
                    className="font-black text-xl mb-1"
                    style={{ color: plan.popular ? "#fff" : "#2A2725" }}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: plan.popular ? "rgba(255,255,255,0.55)" : "#5B5652" }}
                  >
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span
                      className="text-4xl font-black"
                      style={{ color: plan.popular ? "#fff" : "#2A2725" }}
                    >
                      ${yearly ? plan.yearlyPrice : plan.price}
                    </span>
                    <span className="mb-1" style={{ color: plan.popular ? "rgba(255,255,255,0.45)" : "#8B8480" }}>/mo</span>
                  </div>
                  {yearly && (
                    <div className="text-xs mt-1" style={{ color: "#7B8A7A" }}>
                      Save ${((plan.price - plan.yearlyPrice) * 12).toFixed(0)}/year
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm"
                      style={{ color: plan.popular ? "rgba(255,255,255,0.80)" : "#4A4541" }}
                    >
                      <CheckCircle
                        className="w-4 h-4 flex-shrink-0 mt-0.5"
                        style={{ color: plan.popular ? "#B0A6DF" : "#7B8A7A" }}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link href={audience === "personal" ? `/checkout?tier=${plan.tier}` : "/signup"}>
                  <button
                    className="w-full py-2.5 rounded-xl font-bold text-sm transition-all"
                    style={
                      plan.popular
                        ? { background: "#7C6BCB", color: "#fff" }
                        : {
                            background: "transparent",
                            color: "#2A2725",
                            border: "1px solid rgba(42,39,37,0.22)",
                          }
                    }
                    onMouseEnter={(e) => {
                      if (plan.popular) (e.currentTarget.style.background = "#8D80D3");
                      else (e.currentTarget.style.background = "rgba(42,39,37,0.05)");
                    }}
                    onMouseLeave={(e) => {
                      if (plan.popular) (e.currentTarget.style.background = "#7C6BCB");
                      else (e.currentTarget.style.background = "transparent");
                    }}
                  >
                    {plan.popular ? "Start Free Trial →" : "Get Started →"}
                  </button>
                </Link>
              </div>
            ))}
          </div>

          {/* Business info banner */}
          {audience === "business" && (
            <div
              className="mb-10 flex items-start gap-3 px-5 py-4 rounded-xl text-sm"
              style={{
                background: "rgba(124,107,203,0.06)",
                border: "1px solid rgba(124,107,203,0.20)",
              }}
            >
              <span className="mt-0.5 text-base leading-none flex-shrink-0" style={{ color: "#7C6BCB" }}>ℹ</span>
              <p className="leading-relaxed" style={{ color: "#4A4541" }}>
                <span className="font-semibold" style={{ color: "#7C6BCB" }}>White-Label &amp; SaaS Reseller:</span>{" "}
                All business plans include live 3-bureau credit monitoring, full white-label branding under your domain, and a complete client management portal. Launch your own credit repair brand with enterprise-grade technology.
              </p>
            </div>
          )}

          {/* Feature Comparison Table */}
          <div className="mb-16">
            <h2 className="text-2xl font-black text-center mb-8" style={{ color: "#2A2725" }}>Full Feature Comparison</h2>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(42,39,37,0.10)" }}
            >
              <div
                className="grid text-sm font-bold"
                style={{
                  background: "#E0D5C4",
                  gridTemplateColumns: "1fr repeat(3, 1fr)",
                }}
              >
                <div className="p-4" style={{ color: "#5B5652" }}>Feature</div>
                {plans.map((p) => (
                  <div key={p.name} className="p-4 text-center font-bold" style={{ color: "#2A2725" }}>{p.name}</div>
                ))}
              </div>

              {(audience === "business" ? [
                { label: "Users included", values: ["1 user", "Up to 5 users", "Up to 10 users"] },
                { label: "Client seats", values: ["100 clients", "1,250 clients", "2,500 clients"] },
                { label: "Live 3-bureau credit monitoring", values: [true, true, true] },
                { label: "Client dashboard", values: [true, true, true] },
                { label: "White-label branding", values: ["Basic", "Full", "Full"] },
                { label: "Client management tools", values: [false, true, true] },
                { label: "AutoCycle batch automation", values: [false, true, true] },
                { label: "API + Zapier integration", values: [false, false, true] },
                { label: "Advanced client management", values: [false, false, true] },
                { label: "Priority support", values: [false, true, true] },
                { label: "Dedicated account manager", values: [false, false, true] },
              ] : [
                { label: "Credit overview & score tracker", values: [true, true, true] },
                { label: "3-bureau coverage", values: [true, true, true] },
                { label: "Dispute letters", values: ["3/month", "Unlimited", "Unlimited"] },
                { label: "Real-Time Credit Alerts", values: [false, true, true] },
                { label: "Certified mail (Lob.com)", values: [false, true, true] },
                { label: "Score Simulator", values: [false, true, true] },
                { label: "Debt Navigator", values: [false, true, true] },
                { label: "Credit Coach AI", values: [false, true, true] },
                { label: "Identity Protect", values: [false, false, true] },
                { label: "Privacy Protect", values: [false, false, true] },
                { label: "Student Loan Aid", values: [false, false, true] },
                { label: "LoanBridge™", values: [false, false, true] },
                { label: "Dedicated account manager", values: [false, false, true] },
              ]).map((row, i) => (
                <div
                  key={row.label}
                  className="grid text-sm"
                  style={{
                    borderTop: "1px solid rgba(42,39,37,0.07)",
                    background: i % 2 === 0 ? "rgba(42,39,37,0.02)" : "#F3EEE6",
                    gridTemplateColumns: "1fr repeat(3, 1fr)",
                  }}
                >
                  <div className="p-4" style={{ color: "#5B5652" }}>{row.label}</div>
                  {row.values.map((val, j) => (
                    <div key={j} className="p-4 text-center">
                      {typeof val === "boolean" ? (
                        val ? (
                          <span className="text-lg font-bold" style={{ color: "#7B8A7A" }}>✓</span>
                        ) : (
                          <span style={{ color: "#C5BDB6" }}>—</span>
                        )
                      ) : (
                        <span style={{ color: "#4A4541" }}>{val}</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-black text-center mb-8" style={{ color: "#2A2725" }}>Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {
                  q: "Is there really no credit card required for the trial?",
                  a: "Correct. Your 3-day trial is completely free with no payment info required. You only pay when you choose to continue.",
                },
                {
                  q: "Can I switch plans at any time?",
                  a: "Yes. Upgrade or downgrade at any time. Changes take effect immediately and billing is prorated.",
                },
                {
                  q: "What's the difference between Starter, Pro, and Elite?",
                  a: "Starter gives you the basics — 3-bureau credit overview, score tracking, and 3 dispute letters per month. Pro adds unlimited disputes, Real-Time Alerts, certified mail sending, Score Simulator, and Debt Navigator. Elite adds full identity protection, privacy guard, Student Loan Aid, and a dedicated account manager.",
                },
                {
                  q: "Do features unlock automatically after upgrading?",
                  a: "Yes. When your payment processes, your tier updates immediately and all included features — including credit monitoring and identity protection — are activated automatically without any manual steps.",
                },
              ].map((faq) => (
                <div
                  key={faq.q}
                  className="p-6 rounded-2xl"
                  style={{
                    background: "#F3EEE6",
                    border: "1px solid rgba(42,39,37,0.10)",
                  }}
                >
                  <h3 className="font-semibold mb-2 text-sm" style={{ color: "#2A2725" }}>{faq.q}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#5B5652" }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
