/**
 * USPSTracking — Automated USPS mail tracking for dispute letters.
 * Shows timeline visualization and bureau info. Includes "Sent via Lob" badge placeholder.
 * Multiple letters handled via tabs.
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Circle, Package, Truck, MapPin, ExternalLink, Zap } from "lucide-react";

export interface TrackingEntry {
  id: string;
  trackingNumber: string;
  bureau: string;
  mailedDate: string;
  deliveredDate?: string;
  expectedDate?: string;
  status: "label_created" | "in_transit" | "out_for_delivery" | "delivered";
  sentViaLob?: boolean; // Lob.com integration placeholder
}

interface USPSTrackingProps {
  entries: TrackingEntry[];
}

const TRACKING_STAGES = [
  { key: "label_created", label: "Label Created", icon: Package },
  { key: "in_transit", label: "In Transit", icon: Truck },
  { key: "out_for_delivery", label: "Out for Delivery", icon: MapPin },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
] as const;

const STATUS_ORDER: Record<TrackingEntry["status"], number> = {
  label_created: 0,
  in_transit: 1,
  out_for_delivery: 2,
  delivered: 3,
};

function TrackingTimeline({ entry }: { entry: TrackingEntry }) {
  const currentIdx = STATUS_ORDER[entry.status];

  return (
    <div className="space-y-4">
      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-medium">
          {entry.bureau}
        </Badge>
        {/* Lob.com integration placeholder badge */}
        {entry.sentViaLob && (
          <Badge className="bg-violet-100 text-violet-700 border-violet-200 text-[10px]">
            <Zap className="h-3 w-3 mr-1" />
            Sent via Lob
          </Badge>
        )}
        <span className="text-xs text-slate-500">
          Mailed: <span className="font-medium text-slate-700">{entry.mailedDate}</span>
        </span>
        {entry.deliveredDate && (
          <span className="text-xs text-slate-500">
            Delivered: <span className="font-medium text-emerald-700">{entry.deliveredDate}</span>
          </span>
        )}
        {!entry.deliveredDate && entry.expectedDate && (
          <span className="text-xs text-slate-500">
            Expected: <span className="font-medium text-amber-700">{entry.expectedDate}</span>
          </span>
        )}
      </div>

      {/* Tracking number */}
      <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
        <span className="text-xs text-slate-500 font-medium">Tracking #</span>
        <span className="text-sm font-mono font-semibold text-slate-800">{entry.trackingNumber}</span>
      </div>

      {/* Visual timeline */}
      <div className="relative flex justify-between items-start">
        {/* Connecting line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200">
          <div
            className="h-full bg-blue-500 transition-all duration-700"
            style={{ width: `${(currentIdx / (TRACKING_STAGES.length - 1)) * 100}%` }}
          />
        </div>

        {TRACKING_STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIdx;
          const isActive = idx === currentIdx;
          const Icon = stage.icon;

          return (
            <div key={stage.key} className="flex flex-col items-center gap-1.5 z-10 w-16">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2
                  ${isCompleted
                    ? "bg-blue-500 border-blue-500 text-white"
                    : isActive
                    ? "bg-white border-blue-500 text-blue-600 shadow-md"
                    : "bg-white border-slate-200 text-slate-400"
                  }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <span
                className={`text-[10px] font-medium text-center leading-tight
                  ${isActive ? "text-blue-700 font-semibold" : isCompleted ? "text-blue-600" : "text-slate-400"}`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* USPS Link */}
      <Button
        variant="outline"
        size="sm"
        className="text-blue-600 border-blue-200 hover:bg-blue-50"
        onClick={() =>
          window.open(
            `https://tools.usps.com/go/TrackConfirmAction?tLabels=${entry.trackingNumber}`,
            "_blank"
          )
        }
      >
        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
        View on USPS
      </Button>
    </div>
  );
}

export function USPSTracking({ entries }: USPSTrackingProps) {
  if (!entries.length) {
    return (
      <Card className="shadow-sm border border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-slate-900">USPS Tracking</CardTitle>
          <p className="text-xs text-slate-500 mt-1">Certified mail tracking for your dispute letters</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
            <Package className="h-10 w-10 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No letters mailed yet</p>
            <p className="text-xs text-slate-400 max-w-xs">
              Your dispute letters will appear here once your specialist sends them via certified mail.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-900">USPS Tracking</CardTitle>
          <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-xs">
            {entries.length} letter{entries.length !== 1 ? "s" : ""} mailed
          </Badge>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Automated tracking — no manual updates needed
        </p>
      </CardHeader>
      <CardContent>
        {entries.length === 1 ? (
          <TrackingTimeline entry={entries[0]} />
        ) : (
          <Tabs defaultValue={entries[0].id}>
            <TabsList className="mb-4 bg-slate-100">
              {entries.map((entry) => (
                <TabsTrigger
                  key={entry.id}
                  value={entry.id}
                  className="text-xs font-medium data-[state=active]:bg-white"
                >
                  {entry.bureau}
                </TabsTrigger>
              ))}
            </TabsList>
            {entries.map((entry) => (
              <TabsContent key={entry.id} value={entry.id}>
                <TrackingTimeline entry={entry} />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
