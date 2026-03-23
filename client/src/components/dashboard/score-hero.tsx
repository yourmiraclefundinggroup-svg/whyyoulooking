/**
 * ScoreHero — Credit Score hero section.
 * Shows animated score, 3-bureau breakdown, sparkline chart, and score range bar.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

export interface ScoreData {
  scores: { experian: number; equifax: number; transunion: number };
  scoreChange: { experian: number; equifax: number; transunion: number };
  scoreHistory: number[]; // last 6 months
  lastUpdated: string;
}

interface ScoreHeroProps {
  data: ScoreData;
}

// Map a score to a color label for display
function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 800) return { label: "Exceptional", color: "text-emerald-600" };
  if (score >= 740) return { label: "Very Good", color: "text-green-600" };
  if (score >= 670) return { label: "Good", color: "text-lime-600" };
  if (score >= 580) return { label: "Fair", color: "text-amber-600" };
  return { label: "Poor", color: "text-red-600" };
}

// Returns a fill color for the score range bar segment
function getScoreBarColor(score: number): string {
  if (score >= 740) return "bg-emerald-500";
  if (score >= 670) return "bg-green-500";
  if (score >= 580) return "bg-amber-500";
  return "bg-red-500";
}

interface BureauCardProps {
  bureau: string;
  score: number;
  change: number;
}

function BureauCard({ bureau, score, change }: BureauCardProps) {
  const isUp = change > 0;
  const isDown = change < 0;
  const { label, color } = getScoreLabel(score);

  return (
    <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
        {bureau}
      </span>
      <span className="text-3xl font-bold text-slate-900">{score}</span>
      <span className={`text-xs font-medium mt-0.5 ${color}`}>{label}</span>
      <div className="flex items-center gap-1 mt-2">
        {isUp ? (
          <>
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-600">+{change} pts</span>
          </>
        ) : isDown ? (
          <>
            <TrendingDown className="h-3.5 w-3.5 text-red-500" />
            <span className="text-xs font-semibold text-red-600">{change} pts</span>
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

// Month labels for the sparkline x-axis
const MONTH_LABELS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

export function ScoreHero({ data }: ScoreHeroProps) {
  const { scores, scoreChange, scoreHistory, lastUpdated } = data;

  // Average across all three bureaus
  const avgScore = Math.round(
    (scores.experian + scores.equifax + scores.transunion) / 3
  );
  const avgChange = Math.round(
    (scoreChange.experian + scoreChange.equifax + scoreChange.transunion) / 3
  );
  const { label: avgLabel, color: avgColor } = getScoreLabel(avgScore);

  // Score range bar: 300–850 = 550 pts total
  const scorePercent = Math.round(((avgScore - 300) / 550) * 100);

  // Sparkline data
  const sparkData = scoreHistory.map((val, i) => ({
    month: MONTH_LABELS[i] ?? `M${i + 1}`,
    score: val,
  }));

  return (
    <Card className="shadow-lg border-0 overflow-hidden bg-gradient-to-br from-[#0F172A] to-[#1E3A5F]">
      <CardContent className="p-6 md:p-8">
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
                <span className={`text-sm font-semibold ${avgColor.replace("text-", "text-")} opacity-90 text-white/80`}>
                  {avgLabel}
                </span>
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
              <div className="text-center mt-1 text-xs text-slate-400">
                {avgScore} / 850
              </div>
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
      </CardContent>
    </Card>
  );
}
