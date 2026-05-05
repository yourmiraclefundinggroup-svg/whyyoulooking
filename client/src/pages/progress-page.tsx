import { useQuery } from "@tanstack/react-query";
import { useUserContext } from "@/hooks/use-user-context";
import { CheckCircle, FileText, Activity, Calendar, Printer, Mail, BookOpen, Shield } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CreditScoreHistory, Dispute, CreditIssue } from "@shared/schema";

interface ProgressSummary {
  hasData: boolean;
  startingScore?: number;
  currentScore?: number;
  scoreDelta?: number;
  totalUploads?: number;
  lettersSent?: number;
  lettersRemoved?: number;
  lettersDraft?: number;
  nextDisputeDate?: string | null;
  nextDisputeRound?: string | null;
  latestUploadDate?: string;
  latestBureau?: string;
}

const BUREAU_COLORS: Record<string, string> = {
  Experian: "#0062FF",
  Equifax: "#E12726",
  TransUnion: "#662D8C",
};

/* Infer dispute method from letter content */
function inferMethod(letterContent: string | null): { label: string; icon: typeof Mail } {
  const content = (letterContent ?? "").toLowerCase();
  if (content.includes("goodwill")) return { label: "Goodwill Letter", icon: BookOpen };
  if (content.includes("validat")) return { label: "Validation Request", icon: Shield };
  return { label: "Dispute Letter", icon: Mail };
}

function DisputeMethodBadge({ letterContent }: { letterContent: string | null }) {
  const { label, icon: Icon } = inferMethod(letterContent);
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded"
      style={{ background: "rgba(255,255,255,0.04)", color: "var(--text-muted)" }}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

export default function ProgressPage() {
  const { user } = useUserContext();
  const userId = user?.id || 0;

  const { data: progress, isLoading } = useQuery<ProgressSummary>({
    queryKey: ["/api/client/progress-summary"],
  });

  const { data: scoreHistory = [] } = useQuery<CreditScoreHistory[]>({
    queryKey: ["/api/client/score-history"],
  });

  const { data: disputes = [] } = useQuery<Dispute[]>({
    queryKey: ["/api/disputes", userId],
  });

  const { data: creditIssues = [] } = useQuery<CreditIssue[]>({
    queryKey: ["/api/credit-issues", userId],
  });

  const resolved = disputes.filter((d) => d.status === "RESOLVED");

  // Build bureau-level deletion summary from resolved disputes
  const bureauCounts = resolved.reduce<Record<string, number>>((acc, d) => {
    acc[d.bureau] = (acc[d.bureau] || 0) + 1;
    return acc;
  }, {});

  const chartData = scoreHistory
    .slice()
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
    .map((e) => ({
      date: new Date(e.recordedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: e.score,
    }));

  const handlePrint = () => {
    const el = document.getElementById("progress-printable");
    if (!el) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Credit Repair Progress</title>
      <style>
        body{font-family:Arial,sans-serif;padding:40px;color:#111;max-width:700px;margin:0 auto}
        h1{color:#111;font-weight:900} .label{color:#666;font-size:12px;text-transform:uppercase;letter-spacing:.08em}
        .row{display:flex;justify-content:space-between;border-bottom:1px solid #eee;padding:12px 0}
        .pill{display:inline-block;padding:2px 10px;border-radius:99px;font-size:11px;font-weight:700}
      </style>
    </head><body>${el.innerHTML}</body></html>`);
    w.document.close();
    w.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="ss-card !p-8 animate-pulse space-y-4">
            <div className="h-5 w-32 rounded-lg" style={{ background: "var(--bg-elevated)" }} />
            <div className="h-8 w-56 rounded-lg" style={{ background: "var(--bg-elevated)" }} />
            <div className="h-32 rounded-xl" style={{ background: "var(--bg-elevated)" }} />
          </div>
        </div>
      </div>
    );
  }

  const totalDeleted = progress?.lettersRemoved ?? resolved.length;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6" id="progress-printable">

        {/* ── Hero ── */}
        <div
          className="rounded-2xl p-6 sm:p-8 relative overflow-hidden"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-gold)" }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)" }} />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="ss-overline mb-2">Your Journey</div>
              <h1 className="text-3xl font-black tracking-tight mb-1" style={{ color: "var(--text-primary)" }}>
                Deletion Progress
              </h1>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Items successfully removed from your credit file.
              </p>
            </div>
            <div className="flex items-center gap-6 shrink-0">
              <div className="text-center">
                <div className="text-4xl font-black" style={{ color: "#2ECC8A" }}>{totalDeleted}</div>
                <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Items Deleted</div>
              </div>
              <div className="w-px h-12" style={{ background: "var(--border-gold)" }} />
              <div className="text-center">
                <div className="text-4xl font-black" style={{ color: "var(--gold)" }}>
                  {(progress?.scoreDelta ?? 0) >= 0 ? "+" : ""}{progress?.scoreDelta ?? 0}
                </div>
                <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Pts Gained</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bureau Deletion Summary ── */}
        <div
          className="rounded-2xl p-6"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-gold)" }}
        >
          <div className="ss-overline mb-4">By Bureau</div>
          <div className="grid grid-cols-3 gap-4">
            {(["Experian", "Equifax", "TransUnion"] as const).map((bureau) => {
              const count = bureauCounts[bureau] ?? 0;
              const pct = totalDeleted > 0 ? Math.round((count / totalDeleted) * 100) : 0;
              return (
                <div
                  key={bureau}
                  className="rounded-xl p-4"
                  style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-gold)" }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: BUREAU_COLORS[bureau] }} />
                    <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{bureau.slice(0, 3)}</span>
                  </div>
                  <div className="text-2xl font-black mb-1" style={{ color: "#2ECC8A" }}>{count}</div>
                  <div className="w-full h-1.5 rounded-full mb-1" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: BUREAU_COLORS[bureau] }} />
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>Deleted</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Deleted Items List ── */}
        <div
          className="rounded-2xl p-6"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-gold)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="ss-overline mb-1">Removed Items</div>
              <h2 className="font-black text-lg" style={{ color: "var(--text-primary)" }}>Deletion Log</h2>
            </div>
            {resolved.length > 0 && (
              <button onClick={handlePrint} className="ss-btn-ghost !py-2 !px-4 text-sm">
                <Printer className="h-4 w-4" />
                Print Report
              </button>
            )}
          </div>

          {resolved.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(201,168,76,0.08)" }}>
                <Activity className="h-8 w-8" style={{ color: "var(--gold)" }} />
              </div>
              <div className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>No deletions recorded yet. Your journey starts now.</div>
              <div className="text-sm max-w-xs mx-auto" style={{ color: "var(--text-secondary)" }}>
                Confirmed deletions and bureau acknowledgements will appear here as your disputes resolve.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {resolved.map((dispute) => {
                const issue = creditIssues.find((i) => i.id === dispute.issueId);
                const bureauColor = BUREAU_COLORS[dispute.bureau] || "var(--gold)";
                return (
                  <div
                    key={dispute.id}
                    className="flex items-start gap-4 p-4 rounded-xl"
                    style={{ background: "var(--bg-elevated)", border: "1px solid rgba(46,204,138,0.15)" }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "rgba(46,204,138,0.1)" }}>
                      <CheckCircle className="h-4 w-4" style={{ color: "#2ECC8A" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm mb-2" style={{ color: "var(--text-primary)" }}>
                        {issue?.title || "Resolved Dispute"}
                      </div>
                      {/* Bureau checkmark pills */}
                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        <span
                          className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full"
                          style={{ background: `${bureauColor}18`, color: bureauColor }}
                        >
                          <CheckCircle className="h-3 w-3" />
                          {dispute.bureau}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        {dispute.dateSent && (
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                            Removed {new Date(dispute.dateSent).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        )}
                        <DisputeMethodBadge letterContent={dispute.letterContent} />
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(46,204,138,0.12)", color: "#2ECC8A" }}>
                      Deleted
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Score History Chart ── */}
        {chartData.length >= 2 && (
          <div
            className="rounded-2xl p-6"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-gold)" }}
          >
            <div className="ss-overline mb-4">Score History</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={["auto", "auto"]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border-gold)", borderRadius: 8, color: "var(--text-primary)" }} />
                <Line type="monotone" dataKey="score" stroke="var(--gold)" strokeWidth={2.5}
                  dot={{ fill: "var(--gold)", r: 4 }} activeDot={{ r: 6, fill: "var(--gold-light)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── Next Dispute Date ── */}
        {progress?.nextDisputeDate && (
          <div
            className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-gold)" }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(201,168,76,0.08)" }}>
              <Calendar className="h-5 w-5" style={{ color: "var(--gold)" }} />
            </div>
            <div>
              <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                Next Dispute Round {progress.nextDisputeRound ?? ""}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                Scheduled for {new Date(progress.nextDisputeDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </div>
            </div>
          </div>
        )}

        <div className="h-8" />
      </div>
    </div>
  );
}
