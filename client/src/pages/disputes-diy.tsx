import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserContext } from "@/hooks/use-user-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatRelativeDate } from "@/lib/utils";
import { Gavel, Plus, Clock, CheckCircle, FileText, Sparkles, ChevronRight, Shield, AlertCircle, X } from "lucide-react";
import type { CreditIssue, Dispute } from "@shared/schema";

const BUREAUS = ["Experian", "Equifax", "TransUnion"] as const;
type Bureau = typeof BUREAUS[number];

const BUREAU_COLORS: Record<Bureau, string> = {
  Experian: "#0062FF",
  Equifax: "#E12726",
  TransUnion: "#662D8C",
};

const DISPUTE_REASONS = [
  "Account not mine",
  "Incorrect balance",
  "Incorrect payment history",
  "Account is too old (past 7 years)",
  "Duplicate account",
  "Account closed but shown open",
  "Wrong account status",
  "Identity theft / fraud",
];

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { color: string; bg: string; label: string }> = {
    PENDING: { color: "#E8A020", bg: "rgba(232,160,32,0.12)", label: "Pending" },
    SENT: { color: "#60A5FA", bg: "rgba(96,165,250,0.12)", label: "Sent" },
    DELIVERED: { color: "#2ECC8A", bg: "rgba(46,204,138,0.12)", label: "Delivered" },
    RESOLVED: { color: "#2ECC8A", bg: "rgba(46,204,138,0.12)", label: "Resolved" },
    REJECTED: { color: "#E05252", bg: "rgba(224,82,82,0.12)", label: "Rejected" },
  };
  const cfg = configs[status] || { color: "var(--text-secondary)", bg: "var(--bg-elevated)", label: status };
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: cfg.color, background: cfg.bg }}>
      {cfg.label}
    </span>
  );
}

export default function DisputeIQ() {
  const { user, canCreateDisputes } = useUserContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const userId = user?.id || 0;

  const [showNewDispute, setShowNewDispute] = useState(false);
  const [selectedBureau, setSelectedBureau] = useState<Bureau>("Experian");
  const [selectedReason, setSelectedReason] = useState(DISPUTE_REASONS[0]);
  const [issueTitle, setIssueTitle] = useState("");
  const [creditor, setCreditor] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState("");

  const { data: disputes = [], isLoading } = useQuery<Dispute[]>({
    queryKey: ["/api/disputes", userId],
  });

  const { data: creditIssues = [] } = useQuery<CreditIssue[]>({
    queryKey: ["/api/credit-issues", userId],
  });

  const createDisputeMutation = useMutation({
    mutationFn: (data: { bureau: string; letterContent?: string }) =>
      apiRequest("POST", "/api/disputes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/disputes", userId] });
      setShowNewDispute(false);
      setGeneratedLetter("");
      toast({ title: "Dispute filed", description: "Your dispute has been created successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create dispute.", variant: "destructive" });
    },
  });

  const handleGenerateLetter = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1800));
    setGeneratedLetter(
      `[Your Name]\n[Your Address]\n[City, State ZIP]\n[Date]\n\n${selectedBureau} Dispute Center\n\nRe: Dispute of Inaccurate Information — ${creditor || "Account"}\n\nTo Whom It May Concern,\n\nI am writing to dispute the following information in my credit report. I have identified the following inaccuracy: "${selectedReason}" regarding ${creditor || "the account in question"}.\n\nPursuant to the Fair Credit Reporting Act, Section 611 (15 U.S.C. § 1681i), I request that you investigate and correct or remove this inaccurate information within 30 days.\n\nPlease provide written confirmation of the investigation results.\n\nSincerely,\n[Your Signature]`
    );
    setGenerating(false);
  };

  const pending = disputes.filter((d) => ["PENDING", "SENT", "DELIVERED"].includes(d.status));
  const resolved = disputes.filter((d) => d.status === "RESOLVED");
  const activeIssues = creditIssues.filter((i) => i.status === "ACTIVE");

  const steps = [
    { n: 1, label: "Identify", desc: "Find inaccurate items on your report", done: activeIssues.length > 0 },
    { n: 2, label: "Generate", desc: "AI writes your dispute letter", done: disputes.length > 0 },
    { n: 3, label: "Send", desc: "Mail certified letter to bureau", done: pending.length > 0 || resolved.length > 0 },
    { n: 4, label: "Track", desc: "Monitor 30-day response window", done: resolved.length > 0 },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="ss-overline mb-2">DIY Credit Repair</div>
            <h1 className="text-3xl font-black tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>
              Dispute IQ
            </h1>
            <p style={{ color: "var(--text-secondary)" }} className="text-sm">
              AI-generated dispute letters and step-by-step guidance to dispute errors yourself.
            </p>
          </div>
          {canCreateDisputes && (
            <button
              className="ss-btn-primary"
              onClick={() => setShowNewDispute(true)}
            >
              <Plus className="h-4 w-4" />
              New Dispute
            </button>
          )}
        </div>

        {/* Process Steps */}
        <div className="ss-card mb-8">
          <div className="ss-overline mb-5">Your Dispute Journey</div>
          <div className="flex items-start gap-0 overflow-x-auto pb-2">
            {steps.map((step, i) => (
              <div key={step.n} className="flex items-center flex-1 min-w-[120px]">
                <div className="flex flex-col items-center text-center flex-1">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black mb-2 transition-all"
                    style={{
                      background: step.done ? "linear-gradient(135deg, var(--gold), var(--gold-light))" : "var(--bg-elevated)",
                      color: step.done ? "var(--bg-primary)" : "var(--text-muted)",
                      border: step.done ? "none" : "1px solid var(--border-gold)",
                    }}
                  >
                    {step.done ? <CheckCircle className="h-5 w-5" /> : step.n}
                  </div>
                  <div className="text-xs font-bold mb-0.5" style={{ color: step.done ? "var(--gold)" : "var(--text-primary)" }}>
                    {step.label}
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>{step.desc}</div>
                </div>
                {i < steps.length - 1 && (
                  <div className="h-px flex-1 min-w-4 mx-2 mt-[-20px]" style={{ background: step.done ? "var(--gold)" : "var(--border-gold)" }} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Stats */}
          {[
            { label: "Active Issues", value: activeIssues.length, color: "#E05252", icon: AlertCircle },
            { label: "In Progress", value: pending.length, color: "#E8A020", icon: Clock },
            { label: "Resolved", value: resolved.length, color: "#2ECC8A", icon: CheckCircle },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="ss-card !p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${color}12` }}>
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <div>
                <div className="text-2xl font-black" style={{ color }}>{value}</div>
                <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Active disputes */}
        <div className="mb-8">
          <div className="ss-overline mb-4">Active Disputes</div>
          {isLoading ? (
            <div className="ss-card !p-8 text-center" style={{ color: "var(--text-muted)" }}>Loading...</div>
          ) : pending.length === 0 ? (
            <div className="ss-card !p-10 text-center">
              <Gavel className="h-10 w-10 mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
              <div className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>No Active Disputes</div>
              <div className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                Start by identifying inaccurate items and filing a dispute.
              </div>
              {canCreateDisputes && (
                <button className="ss-btn-primary text-sm !py-2.5 !px-5" onClick={() => setShowNewDispute(true)}>
                  <Plus className="h-4 w-4" />
                  File Your First Dispute
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((dispute) => {
                const issue = creditIssues.find((i) => i.id === dispute.issueId);
                const bureauColor = BUREAU_COLORS[dispute.bureau as Bureau] || "var(--gold)";
                return (
                  <div key={dispute.id} className="ss-card !p-5 flex items-start gap-4">
                    <div className="w-3 h-3 rounded-full mt-1.5 animate-pulse shrink-0" style={{ background: bureauColor }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                          {dispute.bureau} — {issue?.title || "Dispute"}
                        </div>
                        <StatusBadge status={dispute.status} />
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        Sent {formatRelativeDate(dispute.dateSent)} · Expected response {formatRelativeDate(dispute.expectedResponse)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Resolved */}
        {resolved.length > 0 && (
          <div className="mb-8">
            <div className="ss-overline mb-4">Resolved Disputes</div>
            <div className="space-y-3">
              {resolved.map((dispute) => {
                const issue = creditIssues.find((i) => i.id === dispute.issueId);
                return (
                  <div key={dispute.id} className="ss-card !p-5 flex items-start gap-4" style={{ borderColor: "rgba(46,204,138,0.2)" }}>
                    <CheckCircle className="h-5 w-5 mt-0.5 shrink-0" style={{ color: "#2ECC8A" }} />
                    <div className="flex-1">
                      <div className="font-semibold text-sm mb-0.5" style={{ color: "var(--text-primary)" }}>
                        {dispute.bureau} — {issue?.title || "Dispute"}
                      </div>
                      <div className="text-xs" style={{ color: "#2ECC8A" }}>Successfully resolved</div>
                    </div>
                    <StatusBadge status="RESOLVED" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="ss-card">
          <div className="ss-overline mb-5">FCRA Rights You Should Know</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: <Shield className="h-5 w-5" />, title: "30-Day Rule", body: "Bureaus must investigate within 30 days of receiving your dispute." },
              { icon: <FileText className="h-5 w-5" />, title: "Free Corrections", body: "If an error is found, correction and removal are completely free." },
              { icon: <Sparkles className="h-5 w-5" />, title: "Second Dispute", body: "If a bureau won't remove it, escalate to the CFPB for additional leverage." },
            ].map((item) => (
              <div key={item.title} className="p-4 rounded-xl" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-gold)" }}>
                <div className="mb-2" style={{ color: "var(--gold)" }}>{item.icon}</div>
                <div className="font-bold text-sm mb-1" style={{ color: "var(--text-primary)" }}>{item.title}</div>
                <div className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{item.body}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* New Dispute Modal */}
      {showNewDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)" }}>
          <div className="w-full max-w-lg rounded-2xl p-6 space-y-5" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-gold)" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black" style={{ color: "var(--text-primary)" }}>New Dispute</h2>
              <button onClick={() => { setShowNewDispute(false); setGeneratedLetter(""); }} style={{ color: "var(--text-muted)" }}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--text-secondary)" }}>Credit Bureau</label>
              <div className="flex gap-2">
                {BUREAUS.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBureau(b)}
                    className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: selectedBureau === b ? BUREAU_COLORS[b] : "var(--bg-elevated)",
                      color: selectedBureau === b ? "#fff" : "var(--text-secondary)",
                      border: `1px solid ${selectedBureau === b ? BUREAU_COLORS[b] : "var(--border-gold)"}`,
                    }}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--text-secondary)" }}>Creditor / Account Name</label>
              <input
                value={creditor}
                onChange={(e) => setCreditor(e.target.value)}
                placeholder="e.g. Capital One, Midland Credit"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-gold)", color: "var(--text-primary)" }}
              />
            </div>

            <div>
              <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--text-secondary)" }}>Reason for Dispute</label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none appearance-none"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-gold)", color: "var(--text-primary)" }}
              >
                {DISPUTE_REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {!generatedLetter ? (
              <button
                className="ss-btn-primary w-full justify-center"
                onClick={handleGenerateLetter}
                disabled={generating}
              >
                <Sparkles className="h-4 w-4" />
                {generating ? "Generating Letter..." : "Generate AI Dispute Letter"}
              </button>
            ) : (
              <>
                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--text-secondary)" }}>Generated Letter</label>
                  <textarea
                    value={generatedLetter}
                    onChange={(e) => setGeneratedLetter(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2.5 rounded-lg text-xs outline-none resize-none font-mono"
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-gold)", color: "var(--text-primary)" }}
                  />
                </div>
                <button
                  className="ss-btn-primary w-full justify-center"
                  onClick={() => createDisputeMutation.mutate({ bureau: selectedBureau, letterContent: generatedLetter })}
                  disabled={createDisputeMutation.isPending}
                >
                  <Gavel className="h-4 w-4" />
                  {createDisputeMutation.isPending ? "Filing..." : "File Dispute"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
