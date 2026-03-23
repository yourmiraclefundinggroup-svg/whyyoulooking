/**
 * LoanReadiness — ScoreShift exclusive loan readiness meter.
 * Shows progress toward target score, DSCR loan eligibility callout,
 * and automatic lending team notification trigger.
 * CRC CANNOT DO THIS — key differentiator.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, Building2, Bell, Star } from "lucide-react";

export interface LoanReadinessData {
  loanReadiness: number; // percentage 0–100
  currentScore: number;
  targetScore: number;
}

interface LoanReadinessProps {
  data: LoanReadinessData;
}

export function LoanReadiness({ data }: LoanReadinessProps) {
  const { loanReadiness, currentScore, targetScore } = data;
  const pointsNeeded = Math.max(0, targetScore - currentScore);
  const isReady = currentScore >= targetScore;

  // Color tiers for the readiness bar
  const barColor =
    loanReadiness >= 90
      ? "bg-emerald-500"
      : loanReadiness >= 70
      ? "bg-amber-500"
      : loanReadiness >= 50
      ? "bg-orange-500"
      : "bg-red-500";

  return (
    <Card className="shadow-sm border-0 bg-gradient-to-br from-[#0F172A] to-[#1a2744] overflow-hidden relative">
      {/* Background star watermark */}
      <Star className="absolute right-4 top-4 h-24 w-24 text-amber-400/10 pointer-events-none" />

      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center shadow">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-white">Loan Readiness</CardTitle>
            <p className="text-xs text-amber-400 font-medium">ScoreShift Exclusive Feature</p>
          </div>
          <Badge className="ml-auto bg-amber-400/20 text-amber-300 border-amber-400/30 text-xs">
            DSCR Pathway
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">

        {isReady ? (
          /* Ready state */
          <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-emerald-300 font-bold text-lg">Loan Eligible!</p>
            <p className="text-emerald-400 text-sm mt-1">
              Your score of {currentScore} meets the {targetScore} minimum
            </p>
          </div>
        ) : (
          <>
            {/* Readiness percentage */}
            <div className="flex items-end justify-between">
              <div>
                <span className="text-5xl font-black text-white">{loanReadiness}%</span>
                <span className="text-slate-400 text-sm ml-2">loan ready</span>
              </div>
              <div className="text-right">
                <span className="text-amber-400 font-bold text-lg">+{pointsNeeded} pts</span>
                <p className="text-slate-400 text-xs">needed</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Current: {currentScore}</span>
                <span>Target: {targetScore}</span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                  style={{ width: `${loanReadiness}%` }}
                />
              </div>
            </div>

            {/* Callout */}
            <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-amber-400" />
                <p className="text-amber-300 text-sm font-semibold">DSCR Loan Qualification</p>
              </div>
              <p className="text-slate-300 text-sm">
                You need{" "}
                <span className="text-amber-400 font-bold">+{pointsNeeded} more points</span> to
                qualify for DSCR loan financing
              </p>
            </div>
          </>
        )}

        {/* Auto-notification callout */}
        <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
          <Bell className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-white text-xs font-semibold">Automatic Notification</p>
            <p className="text-slate-400 text-xs mt-0.5">
              When you hit {targetScore}, our lending team will reach out automatically
            </p>
          </div>
        </div>

        {/* CRC comparison note */}
        <div className="flex items-center gap-2 pt-1">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
          <p className="text-emerald-400 text-xs font-medium">
            Only ScoreShift connects credit repair to loan readiness
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
