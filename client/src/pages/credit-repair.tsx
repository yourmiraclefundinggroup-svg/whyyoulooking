import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useUserContext } from "@/hooks/use-user-context";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";
import {
  useArrayScript,
  ARRAY_SANDBOX_APP_KEY,
  ARRAY_SANDBOX_API_URL,
  ARRAY_SANDBOX_TOKENS,
} from "@/hooks/use-array-script";
import { DisputeLetterModal } from "@/components/dispute-letter-modal";
import { Link } from "wouter";
import {
  Shield, AlertCircle, CheckCircle, Clock, Gavel, TrendingUp,
  ArrowRight, ChevronRight, Sparkles, BarChart3, Eye, X, Check,
  Activity, Bell,
} from "lucide-react";
import type { CreditIssue, Dispute } from "@shared/schema";

/* ─── Array web component ──────────────────────────────────────────────────── */
function ArrayWebComponent({
  tag, userToken, scriptReady, attrs = {}, className = "w-full min-h-[200px]",
}: {
  tag: string; userToken?: string; scriptReady?: boolean;
  attrs?: Record<string, string>; className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    if (scriptReady === false) return;
    containerRef.current.innerHTML = "";
    const el = document.createElement(tag);
    el.setAttribute("appKey", ARRAY_SANDBOX_APP_KEY);
    el.setAttribute("apiUrl", ARRAY_SANDBOX_API_URL);
    el.setAttribute("sandbox", "true");
    if (userToken) el.setAttribute("userToken", userToken);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    containerRef.current.appendChild(el);
    return () => { if (containerRef.current) containerRef.current.innerHTML = ""; };
  }, [tag, userToken, scriptReady, JSON.stringify(attrs)]);

  if (scriptReady === false) {
    return (
      <div className={`${className} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Loading credit data...</p>
        </div>
      </div>
    );
  }
  return <div ref={containerRef} className={className} />;
}

/* ─── Bureau pill selector ─────────────────────────────────────────────────── */
const BUREAUS = ["Experian", "Equifax", "TransUnion"] as const;
type Bureau = typeof BUREAUS[number];

const BUREAU_CONFIG: Record<Bureau, { color: string; score: number; change: number }> = {
  Experian:   { color: "#0062FF", score: 634, change: +12 },
  Equifax:    { color: "#E12726", score: 621, change: +8 },
  TransUnion: { color: "#662D8C", score: 628, change: +11 },
};

const MOCK_HISTORY = [572, 581, 595, 610, 618, 634];

/* ─── Score arc gauge ──────────────────────────────────────────────────────── */
function ScoreGauge({ score }: { score: number }) {
  const min = 300, max = 850;
  const pct = Math.max(0, Math.min(1, (score - min) / (max - min)));
  const r = 70;
  const circ = Math.PI * r;
  const dashOffset = circ * (1 - pct);

  const color = score >= 740 ? "#2ECC8A" : score >= 670 ? "var(--gold)" : score >= 580 ? "#E8A020" : "#E05252";
  const label = score >= 740 ? "Excellent" : score >= 670 ? "Good" : score >= 580 ? "Fair" : "Poor";

  return (
    <svg width="180" height="100" viewBox="0 0 180 100">
      <path d="M 18 96 A 72 72 0 0 1 162 96" fill="none" stroke="rgba(201,168,76,0.1)" strokeWidth="12" strokeLinecap="round" />
      <path
        d="M 18 96 A 72 72 0 0 1 162 96"
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={dashOffset}
        style={{ transition: "stroke-dashoffset 1s ease, stroke 0.5s ease" }}
      />
      <text x="90" y="82" textAnchor="middle" fill="var(--text-primary)" fontSize="28" fontWeight="800">{score}</text>
      <text x="90" y="96" textAnchor="middle" fill={color} fontSize="11" fontWeight="600">{label}</text>
    </svg>
  );
}

/* ─── Main page ────────────────────────────────────────────────────────────── */
export default function CreditRepair() {
  const { user, canCreateDisputes, isClientViewer } = useUserContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const userId = user?.id || 1;

  const [selectedBureau, setSelectedBureau] = useState<Bureau>("Experian");
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<CreditIssue | undefined>();

  const { loaded: scriptReady } = useArrayScript();
  const userToken = ARRAY_SANDBOX_TOKENS.default;

  const { data: creditIssues = [] } = useQuery<CreditIssue[]>({
    queryKey: ["/api/credit-issues", userId],
  });
  const { data: disputes = [] } = useQuery<Dispute[]>({
    queryKey: ["/api/disputes", userId],
  });
  const { data: arrayEnrollment } = useQuery<{ enrolled: boolean; productCodes: string[] }>({
    queryKey: ["/api/array/enrollment"],
    enabled: !!user,
    retry: false,
  });

  const updateIssueMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<CreditIssue> }) => {
      const response = await apiRequest("PATCH", `/api/credit-issues/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credit-issues", userId] });
      toast({ title: "Issue updated" });
    },
  });

  const isEnrolled = arrayEnrollment?.enrolled ?? false;

  const activeIssues = creditIssues.filter((i) => i.status === "ACTIVE");
  const pendingDisputes = disputes.filter((d) => ["PENDING", "SENT", "DELIVERED"].includes(d.status));
  const resolvedIssues = creditIssues.filter((i) => i.status === "RESOLVED");

  const firstName = user?.firstName || "there";

  const bureau = BUREAU_CONFIG[selectedBureau];

  const chartData = MOCK_HISTORY.map((score, i) => ({
    month: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"][i],
    score,
  }));

  const alerts = [
    ...activeIssues.slice(0, 3).map((issue) => ({
      id: `issue-${issue.id}`,
      type: "warning" as const,
      title: issue.title,
      body: `${issue.creditor} · ${Math.abs(issue.impact)} pt impact`,
      action: canCreateDisputes ? { label: "Dispute", onClick: () => { setSelectedIssue(issue); setDisputeModalOpen(true); } } : undefined,
    })),
    ...(resolvedIssues.length > 0 ? [{
      id: "resolved",
      type: "success" as const,
      title: `${resolvedIssues.length} item${resolvedIssues.length > 1 ? "s" : ""} resolved`,
      body: "Successfully removed from your credit report",
      action: undefined,
    }] : []),
  ];

  return (
    <>
      <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

          {/* ── 1. Welcome Hero ─────────────────────────────────────────────── */}
          <div
            className="rounded-2xl p-6 sm:p-8 relative overflow-hidden"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-gold)" }}
          >
            {/* Ambient glow */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)" }} />

            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="ss-overline mb-2">Credit Repair</div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1" style={{ color: "var(--text-primary)" }}>
                  Welcome back, {firstName} 👋
                </h1>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {isClientViewer
                    ? "Viewing the work being done on your credit file."
                    : "Here's your credit snapshot for today."}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Active Issues</div>
                  <div className="text-2xl font-black" style={{ color: activeIssues.length > 0 ? "#E05252" : "#2ECC8A" }}>
                    {activeIssues.length}
                  </div>
                </div>
                <div className="w-px h-10" style={{ background: "var(--border-gold)" }} />
                <div className="text-right">
                  <div className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Disputes</div>
                  <div className="text-2xl font-black" style={{ color: "var(--gold)" }}>{pendingDisputes.length}</div>
                </div>
                <div className="w-px h-10" style={{ background: "var(--border-gold)" }} />
                <div className="text-right">
                  <div className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Resolved</div>
                  <div className="text-2xl font-black" style={{ color: "#2ECC8A" }}>{resolvedIssues.length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── 2. Credit Overview ──────────────────────────────────────────── */}
          <div
            className="rounded-2xl p-6"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-gold)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="ss-overline mb-1">Credit Overview</div>
                <h2 className="font-black text-lg" style={{ color: "var(--text-primary)" }}>
                  {isEnrolled ? "Live Bureau Scores" : "Sample Credit Snapshot"}
                </h2>
              </div>
              {isEnrolled ? (
                <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "rgba(46,204,138,0.1)", color: "#2ECC8A" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC8A] animate-pulse" />
                  Live Data
                </span>
              ) : (
                <Link href="/credit-monitoring">
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer" style={{ background: "rgba(201,168,76,0.12)", color: "var(--gold)", border: "1px solid rgba(201,168,76,0.25)" }}>
                    Activate Monitoring →
                  </span>
                </Link>
              )}
            </div>

            {isEnrolled ? (
              /* Live Array components */
              <div className="space-y-4">
                {/* Bureau pills */}
                <div className="flex items-center gap-2 flex-wrap">
                  {BUREAUS.map((b) => (
                    <button
                      key={b}
                      onClick={() => setSelectedBureau(b)}
                      className="px-3 py-1 rounded-full text-xs font-bold transition-all"
                      style={{
                        background: selectedBureau === b ? BUREAU_CONFIG[b].color : "rgba(255,255,255,0.04)",
                        color: selectedBureau === b ? "#fff" : "var(--text-secondary)",
                        border: `1px solid ${selectedBureau === b ? BUREAU_CONFIG[b].color : "var(--border-gold)"}`,
                      }}
                    >
                      {b}
                    </button>
                  ))}
                </div>
                <ArrayWebComponent
                  tag="array-credit-overview"
                  userToken={userToken}
                  scriptReady={scriptReady}
                  className="w-full min-h-[240px]"
                />
              </div>
            ) : (
              /* Static score display */
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left: bureau pills + gauge */}
                <div className="flex flex-col items-center gap-4">
                  {/* Bureau pills */}
                  <div className="flex gap-2 flex-wrap justify-center">
                    {BUREAUS.map((b) => (
                      <button
                        key={b}
                        onClick={() => setSelectedBureau(b)}
                        className="px-3 py-1 rounded-full text-xs font-bold transition-all"
                        style={{
                          background: selectedBureau === b ? BUREAU_CONFIG[b].color : "rgba(255,255,255,0.04)",
                          color: selectedBureau === b ? "#fff" : "var(--text-secondary)",
                          border: `1px solid ${selectedBureau === b ? BUREAU_CONFIG[b].color : "var(--border-gold)"}`,
                        }}
                      >
                        {b}
                      </button>
                    ))}
                  </div>

                  {/* Score gauge */}
                  <ScoreGauge score={bureau.score} />

                  {/* Score change */}
                  <div className="text-center">
                    <span className="text-sm font-bold" style={{ color: bureau.change >= 0 ? "#2ECC8A" : "#E05252" }}>
                      {bureau.change >= 0 ? "+" : ""}{bureau.change} pts
                    </span>
                    <span className="text-xs ml-1" style={{ color: "var(--text-muted)" }}>this month</span>
                  </div>
                </div>

                {/* Right: trend chart */}
                <div className="flex-1">
                  <div className="text-xs font-semibold mb-3" style={{ color: "var(--text-muted)" }}>6-Month Score Trend</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={chartData}>
                      <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[560, 650]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
                      <Tooltip
                        contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border-gold)", borderRadius: 8, color: "var(--text-primary)", fontSize: 12 }}
                      />
                      <Line type="monotone" dataKey="score" stroke="var(--gold)" strokeWidth={2.5} dot={{ fill: "var(--gold)", r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>

                  {/* Bureau score row */}
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {BUREAUS.map((b) => (
                      <div key={b} className="text-center p-3 rounded-xl" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-gold)" }}>
                        <div className="w-2 h-2 rounded-full mx-auto mb-1.5" style={{ background: BUREAU_CONFIG[b].color }} />
                        <div className="font-black text-xl" style={{ color: "var(--text-primary)" }}>{BUREAU_CONFIG[b].score}</div>
                        <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{b.slice(0, 3)}</div>
                        <div className="text-xs font-semibold mt-0.5" style={{ color: "#2ECC8A" }}>+{BUREAU_CONFIG[b].change}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── 3. Credit Alerts ────────────────────────────────────────────── */}
          <div
            className="rounded-2xl p-6"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-gold)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="ss-overline mb-1">Alerts</div>
                <h2 className="font-black text-lg" style={{ color: "var(--text-primary)" }}>Credit Alerts</h2>
              </div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                <Bell className="h-4 w-4" />
                {alerts.length} alert{alerts.length !== 1 ? "s" : ""}
              </div>
            </div>

            {alerts.length === 0 ? (
              <div className="py-10 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "rgba(46,204,138,0.08)" }}>
                  <CheckCircle className="h-7 w-7" style={{ color: "#2ECC8A" }} />
                </div>
                <div className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>All Clear</div>
                <div className="text-sm" style={{ color: "var(--text-secondary)" }}>No active credit issues to address.</div>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => {
                  const isWarning = alert.type === "warning";
                  return (
                    <div
                      key={alert.id}
                      className="flex items-start gap-4 p-4 rounded-xl"
                      style={{
                        background: isWarning ? "rgba(224,82,82,0.04)" : "rgba(46,204,138,0.04)",
                        border: `1px solid ${isWarning ? "rgba(224,82,82,0.2)" : "rgba(46,204,138,0.2)"}`,
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: isWarning ? "rgba(224,82,82,0.12)" : "rgba(46,204,138,0.12)" }}
                      >
                        {isWarning
                          ? <AlertCircle className="h-4 w-4" style={{ color: "#E05252" }} />
                          : <CheckCircle className="h-4 w-4" style={{ color: "#2ECC8A" }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm mb-0.5" style={{ color: "var(--text-primary)" }}>{alert.title}</div>
                        <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{alert.body}</div>
                      </div>
                      {alert.action && canCreateDisputes && (
                        <button
                          onClick={alert.action.onClick}
                          className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                          style={{ background: "rgba(201,168,76,0.12)", color: "var(--gold)", border: "1px solid rgba(201,168,76,0.2)" }}
                        >
                          {alert.action.label}
                        </button>
                      )}
                    </div>
                  );
                })}
                {isEnrolled && (
                  <div className="pt-2">
                    <Link href="/credit-monitoring">
                      <span className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer" style={{ color: "var(--gold)" }}>
                        View all monitoring alerts <ChevronRight className="h-4 w-4" />
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── 4. Active Disputes ──────────────────────────────────────────── */}
          <div
            className="rounded-2xl p-6"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-gold)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="ss-overline mb-1">Disputes</div>
                <h2 className="font-black text-lg" style={{ color: "var(--text-primary)" }}>Active Disputes</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "rgba(201,168,76,0.12)", color: "var(--gold)" }}>
                  {pendingDisputes.length} pending
                </span>
                {canCreateDisputes && (
                  <Link href="/disputes-diy">
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer" style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-light))", color: "var(--bg-primary)" }}>
                      Dispute IQ →
                    </span>
                  </Link>
                )}
              </div>
            </div>

            {pendingDisputes.length === 0 ? (
              <div className="py-10 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "rgba(201,168,76,0.08)" }}>
                  <Gavel className="h-7 w-7" style={{ color: "var(--gold)" }} />
                </div>
                <div className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>No Active Disputes</div>
                <div className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                  {activeIssues.length > 0
                    ? `You have ${activeIssues.length} issue${activeIssues.length > 1 ? "s" : ""} ready to dispute.`
                    : "No credit issues found to dispute."}
                </div>
                {canCreateDisputes && activeIssues.length > 0 && (
                  <Link href="/disputes-diy">
                    <button className="ss-btn-primary text-sm !py-2.5 !px-5">
                      <Gavel className="h-4 w-4" />
                      Start Dispute
                    </button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {pendingDisputes.map((dispute) => {
                  const issue = creditIssues.find((i) => i.id === dispute.issueId);
                  const bureauColors: Record<string, string> = {
                    Experian: "#0062FF", Equifax: "#E12726", TransUnion: "#662D8C",
                  };
                  const bColor = bureauColors[dispute.bureau] || "var(--gold)";
                  return (
                    <div
                      key={dispute.id}
                      className="flex items-start gap-4 p-4 rounded-xl"
                      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-gold)" }}
                    >
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: bColor }} />
                        <div
                          className="text-xs font-black px-2 py-0.5 rounded-full"
                          style={{ background: `${bColor}15`, color: bColor }}
                        >
                          {dispute.bureau}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm mb-0.5" style={{ color: "var(--text-primary)" }}>
                          {issue?.title || "Dispute"}
                        </div>
                        <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          Sent {formatRelativeDate(dispute.dateSent)} · Expected {formatRelativeDate(dispute.expectedResponse)}
                        </div>
                      </div>
                      <span
                        className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: "rgba(232,160,32,0.12)", color: "#E8A020" }}
                      >
                        {dispute.status}
                      </span>
                    </div>
                  );
                })}

                <div className="pt-2">
                  <Link href="/disputes-diy">
                    <span className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer" style={{ color: "var(--gold)" }}>
                      View full dispute history <ChevronRight className="h-4 w-4" />
                    </span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Bottom padding */}
          <div className="h-8" />
        </div>
      </div>

      {!isClientViewer && (
        <DisputeLetterModal
          open={disputeModalOpen}
          onOpenChange={setDisputeModalOpen}
          issue={selectedIssue}
        />
      )}
    </>
  );
}
