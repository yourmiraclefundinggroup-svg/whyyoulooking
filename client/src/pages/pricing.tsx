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
    description: "Get started with essential credit repair tools",
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
    description: "Unlimited disputes, real-time alerts, and premium tools",
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
    description: "Full protection suite with identity & privacy tools",
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
    <div className="min-h-screen" style={{ background: "#050A14" }}>
      <Navbar variant="dark" />

      <div className="pt-44 pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-md mb-5">
              <Sparkles size={12} className="text-yellow-300" />
              3-Bureau Credit Monitoring — Launching June 1st
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-4">
              Choose Your Plan
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Start with a 3-day free trial. No credit card required. Cancel anytime.
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div
              id="business"
              className="flex rounded-full p-1"
              style={{
                background: "#0F1E35",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <button
                onClick={() => setAudience("personal")}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                  audience === "personal"
                    ? "bg-amber-500 text-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Personal Credit
              </button>
              <button
                onClick={() => setAudience("business")}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                  audience === "business"
                    ? "bg-amber-500 text-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                White-Label Business
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mb-12">
            <span className={`text-sm ${!yearly ? "text-white" : "text-slate-500"}`}>Monthly</span>
            <button
              onClick={() => setYearly(!yearly)}
              className="relative w-12 h-6 rounded-full transition-colors"
              style={{ background: yearly ? "#F59E0B" : "rgba(255,255,255,0.1)" }}
            >
              <div
                className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform"
                style={{ transform: yearly ? "translateX(28px)" : "translateX(4px)" }}
              />
            </button>
            <span className={`text-sm ${yearly ? "text-white" : "text-slate-500"}`}>
              Yearly <span className="text-emerald-400 font-semibold">Save 20%</span>
            </span>
          </div>

          <div className="grid gap-6 mb-16 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="card-3d card-3d-gold p-8 relative flex flex-col"
                style={
                  plan.popular
                    ? { borderColor: "rgba(245,158,11,0.35)" }
                    : {}
                }
              >
                {plan.popular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-black text-xs font-bold whitespace-nowrap"
                    style={{ background: "linear-gradient(135deg, #F59E0B, #FCD34D)" }}
                  >
                    ⭐ Most Popular
                  </div>
                )}

                {plan.badge && !plan.popular && (
                  <div className="mb-3">
                    <span
                      className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full text-white"
                      style={{ background: "linear-gradient(135deg, #2563EB, #4F46E5)" }}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-white font-black text-xl mb-1">{plan.name}</h3>
                  <p className="text-slate-500 text-sm">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black text-white">
                      ${yearly ? plan.yearlyPrice : plan.price}
                    </span>
                    <span className="text-slate-500 mb-1">/mo</span>
                  </div>
                  {yearly && (
                    <div className="text-emerald-400 text-xs mt-1">
                      Save ${((plan.price - plan.yearlyPrice) * 12).toFixed(0)}/year
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-slate-300 text-sm">
                      <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link href={audience === "personal" ? `/checkout?tier=${plan.tier}` : "/signup"}>
                  <Button
                    className={`w-full font-bold ${
                      plan.popular
                        ? "bg-amber-500 hover:bg-amber-400 text-black glow-gold"
                        : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                    }`}
                  >
                    {plan.popular ? "Start Free Trial →" : "Get Started →"}
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {audience === "business" && (
            <div
              className="mb-10 flex items-start gap-3 px-5 py-4 rounded-xl border text-sm"
              style={{
                background: "rgba(245,158,11,0.06)",
                borderColor: "rgba(245,158,11,0.2)",
              }}
            >
              <span className="text-amber-400 mt-0.5 text-base leading-none flex-shrink-0">ℹ</span>
              <p className="text-slate-300 leading-relaxed">
                <span className="font-semibold text-amber-400">White-Label & SaaS Reseller:</span> All business plans include live 3-bureau credit monitoring, full white-label branding under your domain, and a complete client management portal. Launch your own credit repair brand with enterprise-grade technology.
              </p>
            </div>
          )}

          <div className="mb-16">
            <h2 className="text-2xl font-black text-white text-center mb-8">Full Feature Comparison</h2>
            <div
              className="rounded-2xl overflow-hidden border"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              <div
                className="grid text-sm font-bold"
                style={{
                  background: "#0F1E35",
                  gridTemplateColumns: "1fr repeat(3, 1fr)",
                }}
              >
                <div className="p-4 text-slate-400">Feature</div>
                {plans.map((p) => (
                  <div key={p.name} className="p-4 text-center text-white">{p.name}</div>
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
                  className="grid text-sm border-t"
                  style={{
                    borderColor: "rgba(255,255,255,0.04)",
                    background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
                    gridTemplateColumns: "1fr repeat(3, 1fr)",
                  }}
                >
                  <div className="p-4 text-slate-400">{row.label}</div>
                  {row.values.map((val, j) => (
                    <div key={j} className="p-4 text-center">
                      {typeof val === "boolean" ? (
                        val ? (
                          <span className="text-emerald-400 text-lg">✓</span>
                        ) : (
                          <span className="text-slate-700">—</span>
                        )
                      ) : (
                        <span className="text-slate-300">{val}</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-black text-white text-center mb-8">Frequently Asked Questions</h2>
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
                  className="card-3d p-6"
                >
                  <h3 className="text-white font-semibold mb-2 text-sm">{faq.q}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
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
