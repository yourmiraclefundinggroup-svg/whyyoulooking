import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft } from "lucide-react";

const personalPlans = [
  {
    name: "Starter",
    price: 49,
    yearlyPrice: 39,
    description: "Get started on your credit repair journey",
    popular: false,
    features: [
      "1 credit bureau monitoring",
      "AI dispute letter generation (up to 3/mo)",
      "Document upload",
      "Basic dashboard",
      "Email support",
    ],
  },
  {
    name: "Pro",
    price: 99,
    yearlyPrice: 79,
    description: "Everything you need for serious credit repair",
    popular: true,
    features: [
      "All 3 bureaus monitored",
      "Unlimited AI dispute letters with Dispute IQ™",
      "Automated Lob.com certified mail",
      "Credit Coach AI (24/7)",
      "Score Map roadmap",
      "Victory Room",
      "Denial Decoder",
      "Priority support",
    ],
  },
  {
    name: "Elite",
    price: 199,
    yearlyPrice: 159,
    description: "Maximum power with loan pipeline access",
    popular: false,
    features: [
      "Everything in Pro",
      "Referral Engine",
      "Bureau Watchdog (real-time alerts)",
      "DSCR loan pipeline access (LoanBridge™)",
      "ScoreShift Pulse real-time monitoring",
      "Dedicated account manager",
    ],
  },
];

const businessPlans = [
  {
    name: "Starter",
    price: 99,
    yearlyPrice: 79,
    description: "Launch your credit repair business",
    popular: false,
    features: [
      "Up to 25 clients",
      "Your branding",
      "Full client portal",
      "AI dispute letters",
      "Lob.com mail integration",
      "Basic reporting",
    ],
  },
  {
    name: "Professional",
    price: 249,
    yearlyPrice: 199,
    description: "Scale your business with automation",
    popular: true,
    features: [
      "Up to 100 clients",
      "Custom domain",
      "AutoCycle automation",
      "Full Dispute IQ™ engine",
      "Team management (3 staff seats)",
      "Advanced analytics",
      "API access",
    ],
  },
  {
    name: "Enterprise",
    price: 499,
    yearlyPrice: 399,
    description: "Unlimited scale with dedicated support",
    popular: false,
    features: [
      "Unlimited clients",
      "Unlimited staff seats",
      "Full white-label app",
      "Custom integrations",
      "Priority builds",
      "Dedicated success manager",
      "SLA guarantee",
    ],
  },
];

export default function PricingPage() {
  const [audience, setAudience] = useState<"personal" | "business">("personal");
  const [yearly, setYearly] = useState(false);

  const plans = audience === "personal" ? personalPlans : businessPlans;

  return (
    <div className="min-h-screen" style={{ background: "#050A14" }}>
      {/* Navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b"
        style={{
          background: "rgba(5,10,20,0.85)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-black font-black text-sm"
                  style={{ background: "linear-gradient(135deg, #F59E0B, #FCD34D)" }}
                >
                  SS
                </div>
                <span className="text-white font-bold text-lg tracking-tight">ScoreShift</span>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/auth">
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-white/5">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-black font-bold glow-gold">
                  Start Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-widest text-amber-400 mb-3 font-medium">Simple Pricing</div>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-4">
              Choose Your Plan
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Start with a 3-day free trial. No credit card required. Cancel anytime.
            </p>
          </div>

          {/* Audience Toggle */}
          <div className="flex justify-center mb-8">
            <div
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

          {/* Billing Toggle */}
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

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
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
                      Save ${(plan.price - plan.yearlyPrice) * 12}/year
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

                <Link href="/signup">
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

          {/* Feature comparison table */}
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

              {[
                { label: "Bureau monitoring", values: ["1 bureau", "All 3", "All 3"] },
                { label: "AI dispute letters", values: ["3/mo", "Unlimited", "Unlimited"] },
                { label: "Certified mail (Lob.com)", values: [false, true, true] },
                { label: "Credit Coach AI", values: [false, true, true] },
                { label: "Score Map", values: [false, true, true] },
                { label: "Loan Bridge (DSCR)", values: [false, false, true] },
                { label: "Dedicated manager", values: [false, false, true] },
              ].map((row, i) => (
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

          {/* FAQ */}
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
                  q: "What makes Dispute IQ™ different from regular dispute letters?",
                  a: "Standard dispute letters use the same templates bureaus see thousands of times. Dispute IQ™ uses AI to generate unique, contextually appropriate letters each round so they can't be pattern-flagged.",
                },
                {
                  q: "How does the DSCR loan pipeline work?",
                  a: "When your score hits a target threshold, our Loan Bridge feature automatically connects you to our network of DSCR lenders who specialize in investment property loans.",
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

      {/* Footer */}
      <footer
        className="py-8 px-4 border-t text-center text-slate-600 text-sm"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        © 2027 ScoreShift. All rights reserved.
        <span className="mx-3">·</span>
        <Link href="/privacy-policy"><span className="hover:text-white cursor-pointer">Privacy</span></Link>
        <span className="mx-3">·</span>
        <Link href="/terms"><span className="hover:text-white cursor-pointer">Terms</span></Link>
      </footer>
    </div>
  );
}
