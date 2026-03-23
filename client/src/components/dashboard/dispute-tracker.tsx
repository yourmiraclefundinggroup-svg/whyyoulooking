/**
 * DisputeTracker — Visual step tracker showing where disputes are in the process.
 * Shows bureau status pills, round info, and estimated next update.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Circle, FileSearch, FileText, Mail, Clock, MessageSquare, Trash2 } from "lucide-react";

export interface DisputeTrackerData {
  disputeStage: number; // 0-indexed — current active stage
  currentRound: number;
  totalRounds: number;
  itemsInDispute: number;
  nextUpdate: string;
}

interface DisputeTrackerProps {
  data: DisputeTrackerData;
}

const STAGES = [
  { label: "Items Identified", icon: FileSearch, description: "Negative items found on report" },
  { label: "Disputes Prepared", icon: FileText, description: "Letters drafted by our team" },
  { label: "Letters Mailed", icon: Mail, description: "Sent via certified mail" },
  { label: "Awaiting Response", icon: Clock, description: "30-day bureau review period" },
  { label: "Response Received", icon: MessageSquare, description: "Bureau has responded" },
  { label: "Items Removed", icon: Trash2, description: "Negative items deleted" },
];

const BUREAU_STATUSES: { bureau: string; status: string; color: string }[] = [
  { bureau: "Experian", status: "Mailed", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { bureau: "Equifax", status: "Awaiting Response", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { bureau: "TransUnion", status: "Response Received", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
];

export function DisputeTracker({ data }: DisputeTrackerProps) {
  const { disputeStage, currentRound, totalRounds, itemsInDispute, nextUpdate } = data;

  return (
    <Card className="shadow-sm border border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-900">Dispute Progress</CardTitle>
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-semibold">
            Round {currentRound} of {totalRounds}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Step tracker */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-200">
            <div
              className="h-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${(disputeStage / (STAGES.length - 1)) * 100}%` }}
            />
          </div>

          <div className="flex justify-between relative">
            {STAGES.map((stage, idx) => {
              const isCompleted = idx < disputeStage;
              const isActive = idx === disputeStage;
              const Icon = stage.icon;

              return (
                <div key={stage.label} className="flex flex-col items-center gap-1.5 w-14">
                  {/* Circle */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 transition-all
                      ${isCompleted
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : isActive
                        ? "bg-white border-amber-500 text-amber-600 shadow-md shadow-amber-100"
                        : "bg-white border-slate-200 text-slate-400"
                      }`}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  {/* Label */}
                  <span
                    className={`text-[10px] font-medium text-center leading-tight
                      ${isActive ? "text-amber-700 font-semibold" : isCompleted ? "text-emerald-700" : "text-slate-400"}`}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active stage description */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-sm font-semibold text-amber-800">
            Currently: {STAGES[disputeStage]?.label}
          </p>
          <p className="text-xs text-amber-700 mt-0.5">{STAGES[disputeStage]?.description}</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
            <p className="text-2xl font-bold text-slate-900">{itemsInDispute}</p>
            <p className="text-xs text-slate-500 mt-0.5">Items in Dispute</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
            <p className="text-sm font-bold text-slate-900">{nextUpdate}</p>
            <p className="text-xs text-slate-500 mt-0.5">Estimated Next Update</p>
          </div>
        </div>

        {/* Bureau status pills */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Per-Bureau Status
          </p>
          <div className="flex flex-wrap gap-2">
            {BUREAU_STATUSES.map(({ bureau, status, color }) => (
              <Badge key={bureau} className={`${color} border text-xs font-medium`}>
                {bureau}: {status}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
