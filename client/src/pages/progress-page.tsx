import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Activity, FileText, Calendar, CheckCircle } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CreditScoreHistory } from "@shared/schema";

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

function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="ss-card !p-5 text-center">
      <div className="text-3xl font-black mb-1" style={{ color: color || "var(--gold)" }}>{value}</div>
      <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{label}</div>
    </div>
  );
}

export default function ProgressPage() {
  const { data: progress, isLoading } = useQuery<ProgressSummary>({
    queryKey: ["/api/client/progress-summary"],
  });

  const { data: scoreHistory = [] } = useQuery<CreditScoreHistory[]>({
    queryKey: ["/api/client/score-history"],
  });

  const chartData = scoreHistory
    .slice()
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
    .map((entry) => ({
      date: new Date(entry.recordedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: entry.score,
    }));

  const handlePrint = () => {
    const el = document.getElementById("progress-printable");
    if (!el) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>My Credit Repair Progress</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#111;max-width:700px;margin:0 auto}</style></head><body>${el.innerHTML}</body></html>`);
    w.document.close();
    w.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="ss-card !p-8 animate-pulse">
            <div className="h-6 rounded-lg mb-4" style={{ background: "var(--bg-elevated)" }} />
            <div className="h-32 rounded-xl" style={{ background: "var(--bg-elevated)" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="ss-overline mb-2">Your Journey</div>
            <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
              Credit Progress
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Track your score improvement and dispute outcomes over time.
            </p>
          </div>
          {progress?.hasData && (
            <button onClick={handlePrint} className="ss-btn-ghost !py-2.5 !px-5 text-sm">
              <FileText className="h-4 w-4" />
              Print Report
            </button>
          )}
        </div>

        {!progress?.hasData ? (
          <div className="ss-card !p-12 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(201,168,76,0.08)" }}>
              <Activity className="h-8 w-8" style={{ color: "var(--gold)" }} />
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>No Progress Data Yet</h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Your progress report will appear once your admin uploads your credit report.
            </p>
          </div>
        ) : (
          <div id="progress-printable" className="space-y-6">

            {/* Score stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Starting Score" value={progress.startingScore ?? "—"} color="var(--text-secondary)" />
              <StatCard label="Current Score" value={progress.currentScore ?? "—"} color="var(--gold)" />
              <StatCard
                label="Score Change"
                value={`${(progress.scoreDelta ?? 0) >= 0 ? "+" : ""}${progress.scoreDelta ?? 0}`}
                color={(progress.scoreDelta ?? 0) >= 0 ? "#2ECC8A" : "#E05252"}
              />
              <StatCard label="Items Removed" value={progress.lettersRemoved ?? 0} color="#2ECC8A" />
            </div>

            {/* Dispute letter summary */}
            <div className="ss-card">
              <div className="ss-overline mb-5">Dispute Letter Summary</div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-black mb-1" style={{ color: "var(--gold)" }}>{progress.lettersSent ?? 0}</div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>Sent to Bureaus</div>
                </div>
                <div>
                  <div className="text-2xl font-black mb-1" style={{ color: "#2ECC8A" }}>{progress.lettersRemoved ?? 0}</div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>Confirmed Removed</div>
                </div>
                <div>
                  <div className="text-2xl font-black mb-1" style={{ color: "#E8A020" }}>{progress.lettersDraft ?? 0}</div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>In Progress</div>
                </div>
              </div>
            </div>

            {/* Next dispute */}
            {progress.nextDisputeDate && (
              <div className="ss-card !p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(201,168,76,0.08)" }}>
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

            {/* Score history chart */}
            <div className="ss-card">
              <div className="ss-overline mb-4">Score History</div>
              {chartData.length < 2 ? (
                <div className="py-10 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
                  {chartData.length === 1
                    ? `Score on record: ${chartData[0].score}. Upload more reports to see a trend.`
                    : "Score snapshots are recorded each time your credit report is processed."}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis
                      domain={["auto", "auto"]}
                      tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={40}
                    />
                    <Tooltip
                      contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border-gold)", borderRadius: 8, color: "var(--text-primary)" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="var(--gold)"
                      strokeWidth={2.5}
                      dot={{ fill: "var(--gold)", r: 4 }}
                      activeDot={{ r: 6, fill: "var(--gold-light)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
