/**
 * ItemsRemoved — Victory section. Shows items successfully removed from credit report.
 * This is the feel-good wins card — client sees real results.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Trophy, Star } from "lucide-react";

export interface RemovedItem {
  type: string;
  creditor: string;
  detail: string;
  removedDate?: string;
}

interface ItemsRemovedProps {
  count: number;
  items: RemovedItem[];
}

export function ItemsRemoved({ count, items }: ItemsRemovedProps) {
  return (
    <Card className="shadow-sm border-0 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 overflow-hidden relative">
      {/* Background trophy watermark */}
      <Trophy className="absolute right-4 top-4 h-20 w-20 text-emerald-100 pointer-events-none" />

      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow">
            <Star className="h-5 w-5 text-white fill-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-emerald-900">Items Removed</CardTitle>
            <p className="text-xs text-emerald-700">Real results, real wins</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Big counter */}
        <div className="flex items-baseline gap-2">
          <span className="text-6xl font-black text-emerald-600">{count}</span>
          <span className="text-lg font-semibold text-emerald-700">
            item{count !== 1 ? "s" : ""} removed
          </span>
        </div>

        {/* Removed items list */}
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 bg-white/70 rounded-xl p-3 border border-emerald-100"
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">
                  {item.type} — {item.creditor}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] shrink-0">
                ✓ Removed
              </Badge>
            </div>
          ))}
        </div>

        {/* Motivational callout */}
        <div className="bg-emerald-500 text-white rounded-xl p-3 text-center">
          <p className="text-sm font-bold">Keep going — every removal counts! 🎉</p>
          <p className="text-xs mt-0.5 text-emerald-100">
            Each item removed can improve your score by 10–40 points
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
