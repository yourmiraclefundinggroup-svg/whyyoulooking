import { useState } from "react";
import { TrendingDown, DollarSign, Calculator, Zap, BarChart3, CheckCircle, CreditCard, AlertTriangle, X } from "lucide-react";

interface DebtEntry {
  id: string;
  name: string;
  balance: number;
  rate: number;
  minPayment: number;
}

const DEFAULT_DEBTS: DebtEntry[] = [
  { id: "1", name: "Credit Card A", balance: 4200, rate: 22.99, minPayment: 105 },
  { id: "2", name: "Credit Card B", balance: 1800, rate: 18.99, minPayment: 45 },
  { id: "3", name: "Personal Loan", balance: 8500, rate: 12.5, minPayment: 210 },
];

function calcPayoff(debts: DebtEntry[], extra: number, method: "avalanche" | "snowball") {
  const sorted = [...debts].sort((a, b) =>
    method === "avalanche" ? b.rate - a.rate : a.balance - b.balance
  );
  let months = 0;
  let totalInterest = 0;
  const state = sorted.map((d) => ({ ...d, remaining: d.balance }));
  const totalMin = state.reduce((s, d) => s + d.minPayment, 0);
  let budget = totalMin + extra;

  while (state.some((d) => d.remaining > 0) && months < 600) {
    months++;
    let leftover = budget;
    state.forEach((d) => {
      if (d.remaining <= 0) return;
      const interest = (d.remaining * d.rate) / 100 / 12;
      totalInterest += interest;
      d.remaining += interest;
      const pay = Math.min(d.remaining, d.minPayment);
      d.remaining -= pay;
      leftover -= pay;
    });
    const focus = state.find((d) => d.remaining > 0);
    if (focus && leftover > 0) {
      const apply = Math.min(focus.remaining, leftover);
      focus.remaining -= apply;
    }
  }
  return { months, totalInterest: Math.round(totalInterest) };
}

function ScoreGauge({ pct }: { pct: number }) {
  const r = 54;
  const circ = Math.PI * r;
  const dashOffset = circ - (circ * pct) / 100;
  return (
    <svg width="140" height="80" viewBox="0 0 140 80">
      <path
        d="M 14 76 A 56 56 0 0 1 126 76"
        fill="none"
        stroke="rgba(201,168,76,0.12)"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M 14 76 A 56 56 0 0 1 126 76"
        fill="none"
        stroke="url(#grd)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={dashOffset}
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      <defs>
        <linearGradient id="grd" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#E8C96B" />
        </linearGradient>
      </defs>
      <text x="70" y="70" textAnchor="middle" fill="#F0EDE8" fontSize="18" fontWeight="800">
        {pct}%
      </text>
    </svg>
  );
}

export default function DebtNavigator() {
  const [debts] = useState<DebtEntry[]>(DEFAULT_DEBTS);
  const [extra, setExtra] = useState(200);
  const [method, setMethod] = useState<"avalanche" | "snowball">("avalanche");

  const totalDebt = debts.reduce((s, d) => s + d.balance, 0);
  const totalMin = debts.reduce((s, d) => s + d.minPayment, 0);

  const current = calcPayoff(debts, 0, method);
  const withExtra = calcPayoff(debts, extra, method);
  const monthsSaved = current.months - withExtra.months;
  const interestSaved = current.totalInterest - withExtra.totalInterest;
  const debtFreeScore = Math.min(98, Math.round(40 + (extra / (totalMin + extra)) * 58));

  const strategies = [
    {
      id: "avalanche",
      label: "Avalanche",
      tagline: "Highest interest first",
      badge: "Saves most interest",
      color: "#C9A84C",
    },
    {
      id: "snowball",
      label: "Snowball",
      tagline: "Smallest balance first",
      badge: "Fastest wins",
      color: "#60A5FA",
    },
  ];

  const tips = [
    { icon: "💳", title: "Balance Transfer", body: "Move high-rate debt to a 0% APR intro card — can eliminate interest for 12–21 months." },
    { icon: "🏦", title: "Debt Consolidation", body: "Combine multiple balances into one lower-rate personal loan for simplicity." },
    { icon: "📞", title: "Negotiate Rate", body: "Call your creditor and ask for a lower rate — it works 70% of the time for on-time payers." },
    { icon: "⚡", title: "Increase Income", body: "Every extra $100/month toward debt can cut payoff time by months or even years." },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-10">
          <div className="ss-overline mb-2">Financial Tools</div>
          <h1 className="text-3xl font-black tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>
            Debt Navigator
          </h1>
          <p style={{ color: "var(--text-secondary)" }} className="text-sm">
            Calculate your payoff timeline, compare strategies, and find the fastest path to debt freedom.
          </p>
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Debt", value: `$${totalDebt.toLocaleString()}`, sub: `${debts.length} accounts`, color: "#E05252" },
            { label: "Monthly Min", value: `$${totalMin}`, sub: "required payment", color: "var(--gold)" },
            { label: "Months to Free", value: withExtra.months, sub: "with extra payment", color: "#2ECC8A" },
            { label: "Interest Saved", value: `$${interestSaved.toLocaleString()}`, sub: "vs. min-only", color: "#60A5FA" },
          ].map((stat) => (
            <div key={stat.label} className="ss-card !p-5">
              <div className="text-xs mb-1" style={{ color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {stat.label}
              </div>
              <div className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Strategy selector + calculator */}
          <div className="lg:col-span-2 ss-card space-y-6">
            <div>
              <div className="ss-overline mb-3">Payoff Strategy</div>
              <div className="grid grid-cols-2 gap-3">
                {strategies.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setMethod(s.id as "avalanche" | "snowball")}
                    className="p-4 rounded-xl border text-left transition-all"
                    style={{
                      background: method === s.id ? "rgba(201,168,76,0.06)" : "var(--bg-elevated)",
                      borderColor: method === s.id ? s.color : "var(--border-gold)",
                      boxShadow: method === s.id ? `0 0 0 1px ${s.color}40` : "none",
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm" style={{ color: method === s.id ? s.color : "var(--text-primary)" }}>
                        {s.label}
                      </span>
                      {method === s.id && (
                        <CheckCircle style={{ color: s.color }} className="h-4 w-4" />
                      )}
                    </div>
                    <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{s.tagline}</div>
                    <div className="mt-2 text-xs px-2 py-0.5 rounded-full inline-block" style={{ background: `${s.color}15`, color: s.color }}>
                      {s.badge}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="ss-overline mb-3">Extra Monthly Payment</div>
              <div className="flex items-center gap-4">
                <span className="text-3xl font-black" style={{ color: "var(--gold)" }}>${extra}</span>
                <input
                  type="range"
                  min={0}
                  max={1000}
                  step={25}
                  value={extra}
                  onChange={(e) => setExtra(Number(e.target.value))}
                  className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: "var(--gold)" }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                <span>$0 extra</span>
                <span>$1,000 extra</span>
              </div>
            </div>

            {/* Payoff comparison */}
            <div>
              <div className="ss-overline mb-3">Payoff Comparison</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-4" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-gold)" }}>
                  <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Minimum Only</div>
                  <div className="text-2xl font-black" style={{ color: "#E05252" }}>{current.months}mo</div>
                  <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                    ${current.totalInterest.toLocaleString()} interest
                  </div>
                </div>
                <div className="rounded-xl p-4" style={{ background: "rgba(46,204,138,0.06)", border: "1px solid rgba(46,204,138,0.25)" }}>
                  <div className="text-xs mb-1" style={{ color: "#2ECC8A" }}>With Extra ${extra}/mo</div>
                  <div className="text-2xl font-black" style={{ color: "#2ECC8A" }}>{withExtra.months}mo</div>
                  <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                    ${withExtra.totalInterest.toLocaleString()} interest
                  </div>
                </div>
              </div>
              {monthsSaved > 0 && (
                <div className="mt-3 rounded-xl p-3 text-sm font-medium flex items-center gap-2" style={{ background: "rgba(201,168,76,0.06)", border: "1px solid var(--border-gold)", color: "var(--gold)" }}>
                  <Zap className="h-4 w-4 shrink-0" />
                  You save {monthsSaved} months and ${interestSaved.toLocaleString()} in interest
                </div>
              )}
            </div>
          </div>

          {/* Debt Freedom Score */}
          <div className="ss-card flex flex-col items-center text-center">
            <div className="ss-overline mb-4">Debt Freedom Score</div>
            <ScoreGauge pct={debtFreeScore} />
            <div className="mt-3 text-4xl font-black" style={{ color: "var(--gold)" }}>{debtFreeScore}</div>
            <div className="text-xs mt-1 mb-6" style={{ color: "var(--text-secondary)" }}>out of 100</div>
            <div className="w-full space-y-3">
              {[
                { label: "Payment Momentum", val: Math.min(100, Math.round(60 + extra / 20)) },
                { label: "Debt-to-Income Ratio", val: 72 },
                { label: "Strategy Efficiency", val: method === "avalanche" ? 94 : 82 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
                    <span>{item.label}</span>
                    <span style={{ color: "var(--gold)" }}>{item.val}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "var(--bg-elevated)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${item.val}%`, background: "linear-gradient(90deg, var(--gold), var(--gold-light))" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Debt accounts */}
        <div className="mb-8">
          <div className="ss-overline mb-4">Your Debt Accounts</div>
          <div className="space-y-3">
            {debts.map((d, i) => {
              const interest = Math.round((d.balance * d.rate) / 100 / 12);
              return (
                <div key={d.id} className="ss-card !p-5 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black" style={{ background: "rgba(201,168,76,0.12)", color: "var(--gold)" }}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm mb-0.5" style={{ color: "var(--text-primary)" }}>{d.name}</div>
                    <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      ${d.minPayment}/mo min · ${interest}/mo interest
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black" style={{ color: "var(--text-primary)" }}>${d.balance.toLocaleString()}</div>
                    <div className="text-xs" style={{ color: "#E05252" }}>{d.rate}% APR</div>
                  </div>
                  <div className="w-24 hidden sm:block">
                    <div className="h-1.5 rounded-full" style={{ background: "var(--bg-elevated)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.round((d.balance / totalDebt) * 100)}%`,
                          background: "linear-gradient(90deg, #E05252, #C9A84C)",
                        }}
                      />
                    </div>
                    <div className="text-xs mt-1 text-right" style={{ color: "var(--text-muted)" }}>
                      {Math.round((d.balance / totalDebt) * 100)}% of total
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Strategy tips */}
        <div>
          <div className="ss-overline mb-4">Debt Reduction Strategies</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tips.map((tip) => (
              <div key={tip.title} className="ss-card !p-5 flex gap-4">
                <div className="text-2xl shrink-0">{tip.icon}</div>
                <div>
                  <div className="font-bold text-sm mb-1" style={{ color: "var(--text-primary)" }}>{tip.title}</div>
                  <div className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{tip.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Manager */}
        <SubscriptionManager />

      </div>
    </div>
  );
}

/* ── Subscription Manager ─────────────────────────────────────────────────── */

interface SubscriptionRow {
  id: string;
  name: string;
  amount: number;
  cycle: string;
  category: string;
  flag: "cancel" | "dispute" | null;
}

const DEMO_SUBS: SubscriptionRow[] = [
  { id: "s1", name: "Gym Membership",       amount: 49.99,  cycle: "Monthly", category: "Health",      flag: "cancel"  },
  { id: "s2", name: "Streaming Service",    amount: 15.99,  cycle: "Monthly", category: "Entertainment", flag: null      },
  { id: "s3", name: "Credit Monitoring Co", amount: 29.99,  cycle: "Monthly", category: "Finance",      flag: "dispute" },
  { id: "s4", name: "Cloud Storage",        amount: 9.99,   cycle: "Monthly", category: "Tech",         flag: null      },
];

function SubscriptionManager() {
  const [subs] = useState<SubscriptionRow[]>(DEMO_SUBS);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = subs.filter((s) => !dismissed.has(s.id));
  const totalMonthly = visible.reduce((acc, s) => acc + s.amount, 0);
  const flagged = visible.filter((s) => s.flag !== null);

  const dismiss = (id: string) => setDismissed((prev) => new Set(Array.from(prev).concat(id)));

  return (
    <div className="rounded-2xl p-6" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-gold)" }}>
      <div className="flex items-start justify-between mb-5 gap-4">
        <div>
          <div className="ss-overline mb-1">Subscription Manager</div>
          <h2 className="font-black text-lg" style={{ color: "var(--text-primary)" }}>
            Recurring Charges
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {visible.length} active · <span style={{ color: "var(--gold)" }}>${totalMonthly.toFixed(2)}/mo</span>
            {flagged.length > 0 && (
              <> · <span style={{ color: "#E05252" }}>{flagged.length} flagged for review</span></>
            )}
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(201,168,76,0.1)" }}>
          <CreditCard className="h-5 w-5" style={{ color: "var(--gold)" }} />
        </div>
      </div>

      <div className="space-y-3">
        {visible.map((sub) => (
          <div key={sub.id}
            className="flex items-center gap-3 p-4 rounded-xl"
            style={{
              background: "var(--bg-elevated)",
              border: `1px solid ${sub.flag === "dispute" ? "rgba(224,82,82,0.25)" : sub.flag === "cancel" ? "rgba(232,160,32,0.2)" : "var(--border-gold)"}`,
            }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: sub.flag === "dispute" ? "rgba(224,82,82,0.1)" : sub.flag === "cancel" ? "rgba(232,160,32,0.1)" : "rgba(201,168,76,0.08)" }}>
              {sub.flag === "dispute"
                ? <AlertTriangle className="h-4 w-4" style={{ color: "#E05252" }} />
                : sub.flag === "cancel"
                  ? <AlertTriangle className="h-4 w-4" style={{ color: "#E8A020" }} />
                  : <CreditCard className="h-4 w-4" style={{ color: "var(--gold)" }} />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{sub.name}</span>
                {sub.flag === "dispute" && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: "rgba(224,82,82,0.1)", color: "#E05252" }}>Dispute?</span>
                )}
                {sub.flag === "cancel" && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: "rgba(232,160,32,0.1)", color: "#E8A020" }}>Consider canceling</span>
                )}
              </div>
              <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {sub.category} · {sub.cycle}
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="font-black text-sm" style={{ color: "var(--text-primary)" }}>
                ${sub.amount.toFixed(2)}
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>/mo</div>
            </div>

            <button onClick={() => dismiss(sub.id)}
              className="shrink-0 p-1.5 rounded-lg transition-colors"
              style={{ color: "var(--text-muted)" }}>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {visible.length === 0 && (
          <div className="py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            No recurring subscriptions detected.
          </div>
        )}
      </div>

      {flagged.length > 0 && (
        <div className="mt-4 p-3 rounded-xl text-xs"
          style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)", color: "var(--text-secondary)" }}>
          <span style={{ color: "var(--gold)", fontWeight: 700 }}>Tip:</span> Canceling flagged subscriptions could save you{" "}
          <span style={{ color: "var(--gold)", fontWeight: 700 }}>
            ${flagged.reduce((a, s) => a + s.amount, 0).toFixed(2)}/mo
          </span>{" "}
          (${(flagged.reduce((a, s) => a + s.amount, 0) * 12).toFixed(0)}/yr).
        </div>
      )}
    </div>
  );
}
