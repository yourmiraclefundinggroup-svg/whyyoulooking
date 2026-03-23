/**
 * ActionCenter — "What you need to do" card. Shows primary CTA if action is needed,
 * or a calm green "all caught up" state if nothing is required from the client.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Upload, ArrowRight, AlertCircle } from "lucide-react";

export interface ActionItem {
  id: string;
  priority: "primary" | "secondary";
  message: string;
  ctaLabel?: string;
  ctaAction?: () => void;
}

interface ActionCenterProps {
  actions: ActionItem[];
  allCaughtUp?: boolean;
}

export function ActionCenter({ actions, allCaughtUp = false }: ActionCenterProps) {
  const primaryAction = actions.find((a) => a.priority === "primary");
  const secondaryActions = actions.filter((a) => a.priority === "secondary");

  if (allCaughtUp || actions.length === 0) {
    return (
      <Card className="shadow-sm border-0 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-emerald-900">You're all caught up ✓</p>
              <p className="text-sm text-emerald-700 mt-0.5">
                No action needed right now — we're working on your file
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-lg font-bold text-slate-900">Action Needed</CardTitle>
        </div>
        <p className="text-xs text-slate-500 mt-1">Complete these steps to keep your case moving</p>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Primary action */}
        {primaryAction && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Upload className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <Badge className="bg-amber-500 text-white border-0 text-xs mb-2">
                  Action Required
                </Badge>
                <p className="text-sm font-semibold text-amber-900">{primaryAction.message}</p>
              </div>
            </div>
            {primaryAction.ctaLabel && (
              <Button
                className="mt-3 w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                onClick={primaryAction.ctaAction}
              >
                {primaryAction.ctaLabel}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        )}

        {/* Secondary actions */}
        {secondaryActions.length > 0 && (
          <div className="space-y-2">
            {secondaryActions.map((action) => (
              <div
                key={action.id}
                className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-3"
              >
                <p className="text-sm text-slate-700">{action.message}</p>
                {action.ctaLabel && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-3 text-blue-600 border-blue-200 hover:bg-blue-50 text-xs shrink-0"
                    onClick={action.ctaAction}
                  >
                    {action.ctaLabel}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
