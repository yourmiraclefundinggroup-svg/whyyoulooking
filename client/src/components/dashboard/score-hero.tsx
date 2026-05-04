/**
 * ScoreHero — Credit Score hero section.
 * Shows Array live components when enrolled, or static placeholder data otherwise.
 * Bureau brand colors: Experian #0062FF, Equifax #E12726, TransUnion #662D8C
 */
import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Sparkles, ShieldCheck, Zap, BarChart3 } from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import {
  ARRAY_SANDBOX_APP_KEY,
  ARRAY_SANDBOX_API_URL,
  ARRAY_SANDBOX_TOKENS,
} from "@/hooks/use-array-script";

export interface ScoreData {
  scores: { experian: number; equifax: number; transunion: number };
  scoreChange: { experian: number; equifax: number; transunion: number };
  scoreHistory: number[];
  lastUpdated: string;
}

interface ScoreHeroProps {
  data: ScoreData;
  arrayToken?: { token: string; appKey: string };
  isEnrolled?: boolean;
  scriptReady?: boolean;
}

function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 800) return { label: "Exceptional", color: "text-emerald-600 dark:text-emerald-400" };
  if (score >= 740) return { label: "Very Good", color: "text-green-600 dark:text-green-400" };
  if (score >= 670) return { label: "Good", color: "text-lime-600 dark:text-lime-400" };
  if (score >= 580) return { label: "Fair", color: "text-amber-600 dark:text-amber-400" };
  return { label: "Poor", color: "text-red-600 dark:text-red-400" };
}

function getScoreBarColor(score: number): string {
  if (score >= 740) return "bg-emerald-500";
  if (score >= 670) return "bg-green-500";
  if (score >= 580) return "bg-amber-500";
  return "bg-red-500";
}

const BUREAU_CONFIG = {
  Experian: {
    color: "#0062FF",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800/50",
    badge: "bg-[#0062FF] text-white",
    dot: "bg-[#0062FF]",
  },
  Equifax: {
    color: "#E12726",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800/50",
    badge: "bg-[#E12726] text-white",
    dot: "bg-[#E12726]",
  },
  TransUnion: {
    color: "#662D8C",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    border: "border-purple-200 dark:border-purple-800/50",
    badge: "bg-[#662D8C] text-white",
    dot: "bg-[#662D8C]",
  },
} as const;

interface BureauCardProps {
  bureau: keyof typeof BUREAU_CONFIG;
  score: number;
  change: number;
}

function BureauCard({ bureau, score, change }: BureauCardProps) {
  const isUp = change > 0;
  const isDown = change < 0;
  const { label, color } = getScoreLabel(score);
  const cfg = BUREAU_CONFIG[bureau];

  return (
    <div
      className={`flex flex-col items-center p-4 rounded-xl border transition-all hover:-translate-y-0.5 ${cfg.bg} ${cfg.border}`}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${cfg.badge}`}
        >
          {bureau}
        </span>
      </div>
      <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
        {score}
      </span>
      <span className={`text-xs font-semibold mt-0.5 ${color}`}>{label}</span>
      <div className="flex items-center gap-1 mt-2">
        {isUp ? (
          <>
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              +{change} pts
            </span>
          </>
        ) : isDown ? (
          <>
            <TrendingDown className="h-3.5 w-3.5 text-red-500" />
            <span className="text-xs font-semibold text-red-600 dark:text-red-400">
              {change} pts
            </span>
          </>
        ) : (
          <>
            <Minus className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">No change</span>
          </>
        )}
      </div>
    </div>
  );
}

const MONTH_LABELS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

function ArrayWebComponent({
  tag,
  userToken,
  scriptReady,
  attrs = {},
  className = "w-full min-h-[200px]",
}: {
  tag: string;
  userToken?: string;
  scriptReady?: boolean;
  attrs?: Record<string, string>;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (scriptReady === false) return;
    containerRef.current.innerHTML = "";

    const el = document.createElement(tag);
    el.setAttribute("appKey", ARRAY_SANDBOX_APP_KEY);
    el.setAttribute("apiUrl", ARRAY_SANDBOX_API_URL);
    el.setAttribute("sandbox", "true");
    if (userToken) el.setAttribute("userToken", userToken);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));

    containerRef.current.appendChild(el);
    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [tag, userToken, scriptReady, JSON.stringify(attrs)]);

  if (scriptReady === false) {
    return (
      <div className={`${className} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent ss-spinner" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading credit data...</p>
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className={className} />;
}

function ArrayCard({
  title,
  description,
  children,
  icon: Icon,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#0F1E35] overflow-hidden shadow-sm">
      <div className="px-5 pt-4 pb-3 border-b border-slate-100 dark:border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
          </div>
          <span className="ml-auto text-[10px] text-slate-400 dark:text-slate-500 font-medium shrink-0">
            Live · 3 Bureaus
          </span>
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export function ScoreHero({ data, isEnrolled, scriptReady }: ScoreHeroProps) {
  const userToken = ARRAY_SANDBOX_TOKENS.default;

  if (isEnrolled) {
    return (
      <div className="space-y-4">
        {/* Bureau badges row */}
        <div className="flex items-center gap-2 flex-wrap">
          {(["Experian", "Equifax", "TransUnion"] as const).map((b) => (
            <span
              key={b}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full text-white ${BUREAU_CONFIG[b].badge}`}
            >
              ✓ {b}
            </span>
          ))}
          <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
            Real-time credit data
          </span>
        </div>

        {/* Credit Overview — full width */}
        <ArrayCard
          title="Credit Overview"
          description="Live 3-bureau credit scores and account summary"
          icon={Sparkles}
        >
          <ArrayWebComponent
            tag="array-credit-overview"
            userToken={userToken}
            scriptReady={scriptReady}
            className="w-full min-h-[220px]"
          />
        </ArrayCard>

        {/* Score Tracker (3-bureau) + Debt Analysis — side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ArrayCard
            title="Score Tracker — All 3 Bureaus"
            description="Experian · Equifax · TransUnion score trends"
            icon={BarChart3}
          >
            <ArrayWebComponent
              tag="array-credit-score"
              userToken={userToken}
              scriptReady={scriptReady}
              attrs={{ bureau: "all", scoreTracker: "true" }}
              className="w-full min-h-[200px]"
            />
          </ArrayCard>
          <ArrayCard
            title="Debt Analysis"
            description="Credit utilization and debt breakdown"
            icon={Zap}
          >
            <ArrayWebComponent
              tag="array-credit-debt-analysis"
              userToken={userToken}
              scriptReady={scriptReady}
              className="w-full min-h-[200px]"
            />
          </ArrayCard>
        </div>
      </div>
    );
  }

  // ── Static fallback (not enrolled) ────────────────────────────────────────
  const { scores, scoreChange, scoreHistory, lastUpdated } = data;

  const avgScore = Math.round(
    (scores.experian + scores.equifax + scores.transunion) / 3
  );
  const avgChange = Math.round(
    (scoreChange.experian + scoreChange.equifax + scoreChange.transunion) / 3
  );
  const { label: avgLabel } = getScoreLabel(avgScore);
  const scorePercent = Math.round(((avgScore - 300) / 550) * 100);

  const sparkData = scoreHistory.map((val, i) => ({
    month: MONTH_LABELS[i] ?? `M${i + 1}`,
    score: val,
  }));

  return (
    <Card className="shadow-lg border-0 overflow-hidden bg-gradient-to-br from-[#0F172A] to-[#1E3A5F]">
      <CardContent className="p-6 md:p-8">
        {/* Bureau status row */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          {(["Experian", "Equifax", "TransUnion"] as const).map((b) => (
            <span
              key={b}
              className={`text-[11px] font-bold px-2 py-1 rounded-full text-white ${BUREAU_CONFIG[b].badge}`}
            >
              ✓ {b}
            </span>
          ))}
          <span className="ml-auto text-xs text-white/40">Sample data</span>
        </div>

        {/* Top row */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          {/* Left: Big score */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="text-amber-400 text-sm font-semibold uppercase tracking-wider">
                AI-Analyzed Credit Score
              </span>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-7xl font-black text-white tabular-nums">{avgScore}</span>
              <div className="mb-2 flex flex-col items-start gap-1">
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-sm font-semibold">
                  <TrendingUp className="h-3.5 w-3.5 mr-1" />
                  +{avgChange} pts this month
                </Badge>
                <span className="text-sm font-semibold text-white/80">{avgLabel}</span>
              </div>
            </div>
            <p className="text-slate-400 text-xs mt-1">Last updated: {lastUpdated}</p>

            {/* Score range bar */}
            <div className="w-full max-w-xs mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Poor (300)</span>
                <span>Exceptional (850)</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${getScoreBarColor(avgScore)}`}
                  style={{ width: `${scorePercent}%` }}
                />
              </div>
              <div className="text-center mt-1 text-xs text-slate-400">{avgScore} / 850</div>
            </div>
          </div>

          {/* Right: Sparkline */}
          <div className="flex flex-col items-center md:items-end">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
              6-Month Trend
            </p>
            <div className="h-28 w-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkData}>
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      color: "#f1f5f9",
                      fontSize: 12,
                    }}
                    formatter={(val: number) => [`${val}`, "Score"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#F59E0B"
                    strokeWidth={2.5}
                    dot={{ fill: "#F59E0B", r: 3 }}
                    activeDot={{ r: 5, fill: "#F59E0B" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bureau breakdown */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <BureauCard bureau="Experian" score={scores.experian} change={scoreChange.experian} />
          <BureauCard bureau="Equifax" score={scores.equifax} change={scoreChange.equifax} />
          <BureauCard bureau="TransUnion" score={scores.transunion} change={scoreChange.transunion} />
        </div>

        {/* Attribution */}
        <p className="text-center text-xs text-white/30 mt-4">3-bureau live data · Real-time monitoring</p>

        {/* Credit monitoring CTA — shown only when not enrolled */}
        <div className="mt-5 flex items-center justify-between gap-4 rounded-xl bg-white/10 border border-white/20 px-4 py-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
            <p className="text-sm text-white/80">
              <span className="font-semibold text-white">Activate live credit monitoring</span>
              {" "}— connect all 3 bureaus to see real-time scores and alerts.
            </p>
          </div>
          <Link
            href="/credit-monitoring"
            className="shrink-0 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-4 py-1.5 text-sm font-semibold text-white transition-colors whitespace-nowrap"
          >
            Connect →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
