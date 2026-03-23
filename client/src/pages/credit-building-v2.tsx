import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle, TrendingUp, CreditCard, DollarSign, Home, ArrowRight, ExternalLink } from "lucide-react";

const securedCards = [
  {
    name: "Discover it® Secured",
    apr: "28.24%",
    limitRange: "$200–$2,500",
    approvalOdds: 85,
    color: "emerald",
  },
  {
    name: "Capital One Platinum Secured",
    apr: "29.99%",
    limitRange: "$200–$1,000",
    approvalOdds: 72,
    color: "blue",
  },
  {
    name: "OpenSky® Secured Visa®",
    apr: "25.64%",
    limitRange: "$200–$3,000",
    approvalOdds: 61,
    color: "amber",
  },
];

const tradelines = [
  { age: "5 Years", limit: "$15,000", price: "$299", impact: "+40-60 pts" },
  { age: "8 Years", limit: "$25,000", price: "$449", impact: "+50-75 pts" },
  { age: "12 Years", limit: "$40,000", price: "$699", impact: "+60-90 pts" },
];

const phases = [
  { label: "Foundation", desc: "Secured card + dispute letters", phase: 1 },
  { label: "Building", desc: "Credit mix + payment history", phase: 2 },
  { label: "Growth", desc: "Score 640+ milestone", phase: 3 },
  { label: "Loan Ready", desc: "680+ DSCR approved", phase: 4 },
];

export default function CreditBuildingV2() {
  return (
    <div className="min-h-screen px-4 py-8" style={{ background: "#050A14" }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="text-xs uppercase tracking-widest text-amber-400 mb-2 font-medium">Credit Building</div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">
            Build Credit Strategically
          </h1>
          <p className="text-slate-400 text-lg">
            The fastest legal path from thin file to loan-ready. Every tool you need, in one place.
          </p>
        </div>

        <div className="space-y-8">
          {/* === SECURED CARD MATCHER === */}
          <div className="card-3d p-8">
            <div className="flex items-start gap-4 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)" }}
              >
                <CreditCard className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white mb-1">Secured Credit Card Matcher</h2>
                <p className="text-slate-400 text-sm">
                  We match you to secured cards you're likely to be approved for based on your current score.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {securedCards.map((card) => (
                <div
                  key={card.name}
                  className="p-5 rounded-xl border transition-all hover:border-white/10"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    borderColor: "rgba(255,255,255,0.05)",
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-white font-semibold text-sm leading-tight">{card.name}</h3>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-2"
                      style={{
                        background:
                          card.approvalOdds >= 80
                            ? "rgba(52,211,153,0.1)"
                            : card.approvalOdds >= 70
                            ? "rgba(96,165,250,0.1)"
                            : "rgba(245,158,11,0.1)",
                        color:
                          card.approvalOdds >= 80
                            ? "#34D399"
                            : card.approvalOdds >= 70
                            ? "#60A5FA"
                            : "#F59E0B",
                        border: `1px solid ${
                          card.approvalOdds >= 80
                            ? "rgba(52,211,153,0.2)"
                            : card.approvalOdds >= 70
                            ? "rgba(96,165,250,0.2)"
                            : "rgba(245,158,11,0.2)"
                        }`,
                      }}
                    >
                      {card.approvalOdds}% odds
                    </span>
                  </div>
                  <div className="space-y-1.5 mb-4 text-xs text-slate-500">
                    <div>APR: <span className="text-slate-400">{card.apr}</span></div>
                    <div>Limit: <span className="text-slate-400">{card.limitRange}</span></div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs"
                  >
                    Apply Now <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* === CREDIT BUILDER LOAN === */}
          <div className="card-3d p-8">
            <div className="flex items-start gap-4 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)" }}
              >
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white mb-1">Credit Builder Loan</h2>
                <p className="text-slate-400 text-sm">
                  Build credit while saving money. Payments go into a savings account you unlock at the end.
                </p>
              </div>
            </div>

            <div
              className="p-5 rounded-xl mb-4"
              style={{
                background: "rgba(52,211,153,0.05)",
                border: "1px solid rgba(52,211,153,0.1)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-semibold text-sm">+40-60 pts in 12 months</span>
              </div>
              <p className="text-slate-400 text-xs">Average score improvement for clients who complete a 12-month credit builder loan.</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {["$25/mo", "$35/mo", "$48/mo"].map((amount) => (
                <button
                  key={amount}
                  className="py-3 rounded-xl text-white font-semibold text-sm transition-all hover:border-amber-500/30"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {amount}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-slate-500 text-xs">Partner: Self Financial</div>
              <Button className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-sm">
                Get Started <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* === TRADELINES === */}
          <div className="card-3d p-8">
            <div className="flex items-start gap-4 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}
              >
                <TrendingUp className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white mb-1">Authorized User Tradelines</h2>
                <p className="text-slate-400 text-sm">
                  Boost your score by being added to established accounts. This is the fastest legal way to boost your score by 30-80 pts.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {tradelines.map((tl) => (
                <div
                  key={tl.age}
                  className="flex items-center justify-between p-4 rounded-xl border transition-all hover:border-amber-500/20"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    borderColor: "rgba(255,255,255,0.05)",
                  }}
                >
                  <div className="flex gap-6 text-sm">
                    <div>
                      <div className="text-slate-500 text-xs mb-0.5">Account Age</div>
                      <div className="text-white font-semibold">{tl.age}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs mb-0.5">Credit Limit</div>
                      <div className="text-white font-semibold">{tl.limit}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs mb-0.5">Est. Impact</div>
                      <div className="text-emerald-400 font-semibold">{tl.impact}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-amber-400 font-bold">{tl.price}</span>
                    <Button size="sm" className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs">
                      Select
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* === RENT REPORTING === */}
          <div className="card-3d p-8">
            <div className="flex items-start gap-4 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)" }}
              >
                <Home className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white mb-1">Rent Reporting</h2>
                <p className="text-slate-400 text-sm">
                  Your on-time rent payments can build credit. Add them to all 3 bureaus automatically.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-3 mb-6">
              {["Equifax", "Experian", "TransUnion"].map((bureau) => (
                <div
                  key={bureau}
                  className="flex items-center gap-2 p-3 rounded-xl text-sm"
                  style={{
                    background: "rgba(96,165,250,0.05)",
                    border: "1px solid rgba(96,165,250,0.1)",
                  }}
                >
                  <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-slate-300">{bureau}</span>
                </div>
              ))}
            </div>

            <Button className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20">
              Start Rent Reporting <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* === PROGRESS TRACKER === */}
          <div className="card-3d p-8">
            <h2 className="text-xl font-black text-white mb-6">Your Credit Building Journey</h2>
            <div className="relative">
              {/* Progress line */}
              <div
                className="absolute left-5 top-6 bottom-6 w-0.5"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
              <div
                className="absolute left-5 top-6 w-0.5"
                style={{
                  background: "linear-gradient(180deg, #F59E0B, #D97706)",
                  height: "25%",
                }}
              />

              <div className="space-y-8">
                {phases.map((phase, i) => (
                  <div key={phase.label} className="flex items-start gap-4 pl-2">
                    <div
                      className="relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                      style={{
                        background:
                          i === 0
                            ? "linear-gradient(135deg, #F59E0B, #FCD34D)"
                            : "rgba(255,255,255,0.05)",
                        border:
                          i === 0
                            ? "none"
                            : "1px solid rgba(255,255,255,0.1)",
                        color: i === 0 ? "#000" : "#475569",
                      }}
                    >
                      {phase.phase}
                    </div>
                    <div>
                      <div
                        className={`font-bold text-sm ${i === 0 ? "text-amber-400" : "text-slate-400"}`}
                      >
                        {phase.label}
                      </div>
                      <div className="text-slate-600 text-xs mt-0.5">{phase.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
