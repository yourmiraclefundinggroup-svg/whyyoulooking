/**
 * ScoreMap — AI-generated credit roadmap showing phased dispute strategy
 * and projected score improvement timeline.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Route, CheckCircle2, Loader2, Circle, Info } from "lucide-react";

type PhaseStatus = "completed" | "active" | "upcoming";

interface RoadmapPhase {
  number: number;
  name: string;
  weeks: string;
  scoreImpact: string;
  items: string;
  status: PhaseStatus;
}

const PHASES: RoadmapPhase[] = [
  {
    number: 1,
    name: "Foundation Disputes",
    weeks: "Weeks 1–4",
    scoreImpact: "+35–50 pts",
    items: "3 Collections, 1 Charge-Off",
    status: "completed",
  },
  {
    number: 2,
    name: "Late Payment Sweep",
    weeks: "Weeks 5–8",
    scoreImpact: "+25–40 pts",
    items: "6 Late Payments, 2 Inquiries",
    status: "active",
  },
  {
    number: 3,
    name: "Charge-Off Resolution",
    weeks: "Weeks 9–12",
    scoreImpact: "+30–45 pts",
    items: "2 Charge-Offs, 1 Public Record",
    status: "upcoming",
  },
  {
    number: 4,
    name: "Final Polish",
    weeks: "Weeks 13–16",
    scoreImpact: "+15–25 pts",
    items: "Remaining Inquiries, Utilization",
    status: "upcoming",
  },
];

const CURRENT_SCORE = 628;
const TARGET_SCORE = 720;
const MIN_SCORE = 300;
const MAX_SCORE = 850;

function phaseProgressPercent(score: number): number {
  return Math.round(((score - MIN_SCORE) / (MAX_SCORE - MIN_SCORE)) * 100);
}

function PhaseIcon({ status }: { status: PhaseStatus }) {
  if (status === "completed") {
    return <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />;
  }
  if (status === "active") {
    return <Loader2 className="h-5 w-5 text-amber-500 flex-shrink-0 animate-spin" />;
  }
  return <Circle className="h-5 w-5 text-slate-400 flex-shrink-0" />;
}

function PhaseNumberBadge({ number, status }: { number: number; status: PhaseStatus }) {
  const colorMap: Record<PhaseStatus, string> = {
    completed: "bg-emerald-500 text-white",
    active: "bg-amber-500 text-white",
    upcoming: "bg-slate-300 text-slate-600",
  };
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${colorMap[status]}`}
    >
      {number}
    </div>
  );
}

function StatusBadge({ status }: { status: PhaseStatus }) {
  if (status === "active") {
    return (
      <Badge className="bg-amber-100 text-amber-700 border border-amber-300 text-xs font-semibold">
        Active
      </Badge>
    );
  }
  if (status === "completed") {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-semibold">
        Completed
      </Badge>
    );
  }
  return (
    <Badge className="bg-slate-100 text-slate-500 border border-slate-200 text-xs font-semibold">
      Upcoming
    </Badge>
  );
}

export function ScoreMap() {
  const currentPct = phaseProgressPercent(CURRENT_SCORE);
  const targetPct = phaseProgressPercent(TARGET_SCORE);
  const pointsProjected = TARGET_SCORE - CURRENT_SCORE;

  return (
    <TooltipProvider>
      <Card className="shadow-sm border border-slate-200 overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shadow">
                <Route className="h-4 w-4 text-white" />
              </div>
              <CardTitle className="text-lg font-bold text-slate-900">
                Your Credit Roadmap
              </CardTitle>
            </div>

            {/* AI Generated badge with tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-default">
                  <Badge className="bg-amber-100 text-amber-700 border border-amber-300 font-semibold text-xs flex items-center gap-1">
                    ✨ AI Generated
                    <Info className="h-3 w-3 ml-0.5 opacity-60" />
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="left"
                className="max-w-[220px] text-xs text-center"
              >
                Our AI analyzed your credit report and dispute history to build
                this personalized roadmap
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>

        <CardContent className="pt-5 pb-6 px-5 space-y-3">
          {/* Phase timeline */}
          <div className="space-y-3">
            {PHASES.map((phase) => {
              const isActive = phase.status === "active";
              const isCompleted = phase.status === "completed";
              const isUpcoming = phase.status === "upcoming";

              return (
                <div
                  key={phase.number}
                  className={`rounded-xl p-4 border transition-all ${
                    isActive
                      ? "border-l-4 border-amber-500 border-t border-r border-b bg-amber-50/50"
                      : isCompleted
                      ? "border-l-4 border-emerald-500 border-t border-r border-b border-slate-100 bg-white"
                      : "border border-slate-100 bg-white"
                  } ${isUpcoming ? "opacity-70" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <PhaseNumberBadge number={phase.number} status={phase.status} />

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className={`text-sm ${
                            isActive ? "font-bold text-slate-900" : "font-semibold text-slate-700"
                          }`}
                        >
                          {phase.name}
                        </span>
                        <StatusBadge status={phase.status} />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
                        <span>{phase.weeks}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-600">{phase.items}</span>
                      </div>

                      <Badge
                        className={`text-xs font-semibold ${
                          isActive
                            ? "bg-amber-500 text-white"
                            : isCompleted
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {phase.scoreImpact}
                      </Badge>
                    </div>

                    <PhaseIcon status={phase.status} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Projected Score at Completion */}
          <div className="mt-5 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-700">
                Projected Score at Completion
              </p>
              <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold text-xs">
                +{pointsProjected} points projected
              </Badge>
            </div>

            {/* Progress bar */}
            <div className="relative h-5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              {/* Current score fill */}
              <div
                className="absolute left-0 top-0 h-full bg-amber-400 rounded-full transition-all duration-700"
                style={{ width: `${currentPct}%` }}
              />
              {/* Target marker */}
              <div
                className="absolute top-0 h-full w-0.5 bg-emerald-500"
                style={{ left: `${targetPct}%` }}
              />
            </div>

            {/* Score labels */}
            <div className="flex items-center justify-between mt-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-slate-600 font-medium">
                  Current: <strong className="text-slate-900">{CURRENT_SCORE}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600 font-medium">
                  Target: <strong className="text-slate-900">{TARGET_SCORE}</strong>
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
