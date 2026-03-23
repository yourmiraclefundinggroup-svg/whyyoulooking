/**
 * ActivityFeed — Vertical timeline showing team updates and milestones.
 * Color-coded icons by event type (mail=blue, win=green, action=amber).
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle2, PenLine, PartyPopper, Bell, FileText } from "lucide-react";

export interface ActivityEvent {
  id: string;
  type: "mail" | "win" | "action" | "response" | "prepare" | "alert";
  icon: string; // emoji fallback
  message: string;
  date: string;
}

interface ActivityFeedProps {
  events: ActivityEvent[];
}

const TYPE_STYLES: Record<ActivityEvent["type"], { bg: string; border: string; iconColor: string; Icon: React.ElementType }> = {
  mail: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    iconColor: "text-blue-600",
    Icon: Mail,
  },
  win: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    iconColor: "text-emerald-600",
    Icon: CheckCircle2,
  },
  action: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    iconColor: "text-amber-600",
    Icon: PenLine,
  },
  response: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    iconColor: "text-purple-600",
    Icon: FileText,
  },
  prepare: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    iconColor: "text-slate-600",
    Icon: PenLine,
  },
  alert: {
    bg: "bg-red-50",
    border: "border-red-200",
    iconColor: "text-red-600",
    Icon: Bell,
  },
};

export function ActivityFeed({ events }: ActivityFeedProps) {
  return (
    <Card className="shadow-sm border border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-slate-900">Activity Feed</CardTitle>
        <p className="text-xs text-slate-500 mt-1">Updates from your credit repair team</p>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-0">
          {/* Vertical connecting line */}
          <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-slate-200" />

          {events.map((event, idx) => {
            const style = TYPE_STYLES[event.type];
            const Icon = style.Icon;
            const isLast = idx === events.length - 1;

            return (
              <div key={event.id} className={`relative flex gap-4 ${isLast ? "pb-0" : "pb-5"}`}>
                {/* Icon bubble */}
                <div
                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${style.bg} ${style.border}`}
                >
                  <Icon className={`h-4 w-4 ${style.iconColor}`} />
                </div>

                {/* Content */}
                <div className="flex-1 pt-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-800 leading-snug">
                      {event.icon && <span className="mr-1">{event.icon}</span>}
                      {event.message}
                    </p>
                    <span className="text-xs text-slate-500 whitespace-nowrap shrink-0">{event.date}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
