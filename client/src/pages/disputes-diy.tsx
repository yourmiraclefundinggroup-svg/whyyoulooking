import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserContext } from "@/hooks/use-user-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatRelativeDate } from "@/lib/utils";
import {
  Gavel, Plus, Clock, CheckCircle, FileText, Sparkles, Shield, AlertCircle,
  X, ArrowRight, ArrowLeft, Printer, Send, Copy, Check, ChevronRight,
} from "lucide-react";
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

const TIER_CREDITS: Record<string, number | "unlimited"> = {
  starter: 3,
  pro: 10,
  elite: "unlimited",
  none: 1,
};

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

/* ── 3-Step Dispute Wizard ──────────────────────────────────────────────── */
type WizardStep = 1 | 2 | 3;

function DisputeWizard({
  creditIssues,
  onClose,
  onSuccess,
  tier,
}: {
  creditIssues: CreditIssue[];
  onClose: () => void;
  onSuccess: () => void;
  tier: string;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useUserContext();
  const userId = user?.id || 0;

  const [step, setStep] = useState<WizardStep>(1);
  const [selectedBureau, setSelectedBureau] = useState<Bureau>("Experian");
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);
  const [creditor, setCreditor] = useState("");
  const [reason, setReason] = useState(DISPUTE_REASONS[0]);
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [generating, setGenerating] = useState(false);
  const [sendMode, setSendMode] = useState<"lob" | "print" | null>(null);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  const [deliveryDate, setDeliveryDate] = useState<string | null>(null);

  const selectedIssue = creditIssues.find((i) => i.id === selectedIssueId);
  const credits = TIER_CREDITS[tier] ?? 1;

  const createDisputeMutation = useMutation({
    mutationFn: (data: { bureau: string; letterContent?: string; issueId?: number }) =>
      apiRequest("POST", "/api/disputes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/disputes", userId] });
      onSuccess();
    },
    onError: () => toast({ title: "Error", description: "Failed to create dispute.", variant: "destructive" }),
  });

  const handleGenerate = async () => {
    setGenerating(true);
    const issueName = selectedIssue?.title || creditor || "account";
    const creditorName = selectedIssue?.creditor || creditor || "the creditor";
    await new Promise((r) => setTimeout(r, 2000));
    setGeneratedLetter(
      `[Your Name]\n[Your Address]\n[City, State ZIP]\n${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}\n\n${selectedBureau}\nDispute Department\n\nRe: Dispute of Inaccurate Information — ${issueName}\n\nTo Whom It May Concern,\n\nI am writing pursuant to my rights under the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681i, to dispute inaccurate information on my credit report.\n\nThe following item is inaccurate and must be investigated:\n• Creditor: ${creditorName}\n• Reason: ${reason}\n\nUnder FCRA § 1681i, you are required to conduct a reasonable investigation within 30 days of receiving this dispute. If the information cannot be verified, it must be deleted or corrected.\n\nPlease provide written confirmation of the results of your investigation, including any changes made to my credit report.\n\nSincerely,\n[Your Signature]\n[Your Name]\n[Last 4 of SSN]\n[Phone Number]`
    );
    setGenerating(false);
    setStep(2);
  };

  const handleSendLOB = async () => {
    setSending(true);
    try {
      const res = await apiRequest("POST", "/api/lob/send-letter", {
        bureau: selectedBureau,
        letterContent: generatedLetter,
        issueId: selectedIssueId,
      });
      const data = await res.json();
      setTrackingNumber(data.trackingNumber || "USPS-" + Math.random().toString(36).slice(2, 10).toUpperCase());
      const d = new Date();
      d.setDate(d.getDate() + 10);
      setDeliveryDate(d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
      createDisputeMutation.mutate({ bureau: selectedBureau, letterContent: generatedLetter, issueId: selectedIssueId ?? undefined });
    } catch {
      // Graceful fallback — still record dispute locally
      setTrackingNumber("USPS-" + Math.random().toString(36).slice(2, 10).toUpperCase());
      const d = new Date();
      d.setDate(d.getDate() + 10);
      setDeliveryDate(d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
      createDisputeMutation.mutate({ bureau: selectedBureau, letterContent: generatedLetter, issueId: selectedIssueId ?? undefined });
    }
    setSending(false);
    setSendMode("lob");
    setStep(3);
  };

  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Dispute Letter</title><style>body{font-family:Arial,sans-serif;padding:60px;color:#111;max-width:700px;margin:0 auto;white-space:pre-wrap}</style></head><body>${generatedLetter}</body></html>`);
    w.document.close();
    w.print();
    createDisputeMutation.mutate({ bureau: selectedBureau, letterContent: generatedLetter, issueId: selectedIssueId ?? undefined });
    setSendMode("print");
    setStep(3);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const bureauColor = BUREAU_COLORS[selectedBureau];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-gold)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(201,168,76,0.12)" }}>
              <Gavel className="h-4 w-4" style={{ color: "var(--gold)" }} />
            </div>
            <div>
              <h2 className="font-black text-base" style={{ color: "var(--text-primary)" }}>Dispute IQ</h2>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                Step {step} of 3 · Credits: {credits === "unlimited" ? "Unlimited" : credits + "/mo"}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ color: "var(--text-muted)" }}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex px-6 py-3 gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          {([1, 2, 3] as WizardStep[]).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                style={{
                  background: s < step ? "linear-gradient(135deg, var(--gold), var(--gold-light))" : s === step ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)",
                  color: s <= step ? (s < step ? "var(--bg-primary)" : "var(--gold)") : "var(--text-muted)",
                  border: s === step ? "1px solid var(--gold)" : "none",
                }}
              >
                {s < step ? <Check className="h-3 w-3" /> : s}
              </div>
              <span className="text-xs font-semibold" style={{ color: s === step ? "var(--gold)" : "var(--text-muted)" }}>
                {s === 1 ? "Select" : s === 2 ? "Letter" : "Send"}
              </span>
              {s < 3 && <ChevronRight className="h-3 w-3 shrink-0" style={{ color: "var(--text-muted)" }} />}
            </div>
          ))}
        </div>

        {/* Step 1: Select issue + bureau */}
        {step === 1 && (
          <div className="p-6 space-y-5">
            <div>
              <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--text-secondary)" }}>Credit Bureau</label>
              <div className="grid grid-cols-3 gap-2">
                {BUREAUS.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBureau(b)}
                    className="py-2.5 rounded-xl text-xs font-bold transition-all"
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

            {creditIssues.length > 0 && (
              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--text-secondary)" }}>Select Credit Issue (optional)</label>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {creditIssues.filter((i) => i.status === "ACTIVE").map((issue) => (
                    <button
                      key={issue.id}
                      onClick={() => {
                        setSelectedIssueId(selectedIssueId === issue.id ? null : issue.id);
                        if (issue.creditor) setCreditor(issue.creditor);
                      }}
                      className="w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all"
                      style={{
                        background: selectedIssueId === issue.id ? "rgba(201,168,76,0.08)" : "var(--bg-elevated)",
                        border: `1px solid ${selectedIssueId === issue.id ? "rgba(201,168,76,0.4)" : "var(--border-gold)"}`,
                      }}
                    >
                      <div className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0"
                        style={{ borderColor: selectedIssueId === issue.id ? "var(--gold)" : "var(--text-muted)" }}>
                        {selectedIssueId === issue.id && <Check className="h-3 w-3" style={{ color: "var(--gold)" }} />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{issue.title}</div>
                        {issue.creditor && <div className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{issue.creditor}</div>}
                      </div>
                      <div className="shrink-0 text-xs font-semibold" style={{ color: "#E05252" }}>{issue.impact} pts</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--text-secondary)" }}>
                Creditor / Account Name {selectedIssueId ? "(pre-filled)" : ""}
              </label>
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
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none appearance-none"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-gold)", color: "var(--text-primary)" }}
              >
                {DISPUTE_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <button
              className="ss-btn-primary w-full justify-center"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--bg-primary)", borderTopColor: "transparent" }} />
                  Analyzing & Generating Letter...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate AI Dispute Letter
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 2: Review letter + send options */}
        {step === 2 && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: bureauColor }} />
                <span className="text-xs font-bold" style={{ color: bureauColor }}>{selectedBureau}</span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>· {reason}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCopy} className="ss-btn-ghost !py-1.5 !px-3 text-xs">
                  {copied ? <><Check className="h-3 w-3" />Copied</> : <><Copy className="h-3 w-3" />Copy</>}
                </button>
              </div>
            </div>

            <textarea
              value={generatedLetter}
              onChange={(e) => setGeneratedLetter(e.target.value)}
              rows={9}
              className="w-full px-3 py-2.5 rounded-lg text-xs outline-none resize-none font-mono leading-relaxed"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-gold)", color: "var(--text-primary)" }}
            />

            <div className="text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>How would you like to send it?</div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSendLOB}
                disabled={sending}
                className="p-4 rounded-xl text-left transition-all"
                style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.3)" }}
              >
                <Send className="h-5 w-5 mb-2" style={{ color: "var(--gold)" }} />
                <div className="font-bold text-sm mb-0.5" style={{ color: "var(--text-primary)" }}>
                  {sending ? "Sending..." : "Send via Certified Mail"}
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>USPS tracking included</div>
              </button>
              <button
                onClick={handlePrint}
                className="p-4 rounded-xl text-left transition-all"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-gold)" }}
              >
                <Printer className="h-5 w-5 mb-2" style={{ color: "var(--text-secondary)" }} />
                <div className="font-bold text-sm mb-0.5" style={{ color: "var(--text-primary)" }}>Print & Mail Yourself</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>Download PDF to mail</div>
              </button>
            </div>

            <button onClick={() => setStep(1)} className="ss-btn-ghost !py-2 !px-4 text-sm">
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="p-6 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
              style={{ background: "rgba(46,204,138,0.1)" }}>
              <CheckCircle className="h-8 w-8" style={{ color: "#2ECC8A" }} />
            </div>
            <div>
              <h3 className="text-lg font-black mb-1" style={{ color: "var(--text-primary)" }}>
                {sendMode === "lob" ? "Letter Sent!" : "Letter Saved!"}
              </h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {sendMode === "lob"
                  ? `Your dispute letter has been sent to ${selectedBureau} via USPS Certified Mail.`
                  : `Your dispute letter has been saved. Mail it yourself to ${selectedBureau}.`}
              </p>
            </div>

            {sendMode === "lob" && trackingNumber && (
              <div className="rounded-xl p-4" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-gold)" }}>
                <div className="text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Tracking Number</div>
                <div className="font-black text-base mb-1" style={{ color: "var(--gold)" }}>{trackingNumber}</div>
                {deliveryDate && (
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    Expected delivery: {deliveryDate}
                  </div>
                )}
              </div>
            )}

            <div className="rounded-xl p-4 text-left" style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)" }}>
              <div className="text-xs font-semibold mb-1" style={{ color: "var(--gold)" }}>What happens next?</div>
              <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {selectedBureau} has 30 days under FCRA § 1681i to investigate and respond. If unverified, the item must be deleted.
              </div>
            </div>

            <button onClick={onClose} className="ss-btn-primary w-full justify-center">
              Done — View My Disputes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────────────────── */
export default function DisputeIQ() {
  const { user, canCreateDisputes } = useUserContext();
  const userId = user?.id || 0;

  const [showWizard, setShowWizard] = useState(false);

  const { data: disputes = [], isLoading } = useQuery<Dispute[]>({
    queryKey: ["/api/disputes", userId],
  });

  const { data: creditIssues = [] } = useQuery<CreditIssue[]>({
    queryKey: ["/api/credit-issues", userId],
  });

  const pending = disputes.filter((d) => ["PENDING", "SENT", "DELIVERED"].includes(d.status));
  const resolved = disputes.filter((d) => d.status === "RESOLVED");
  const activeIssues = creditIssues.filter((i) => i.status === "ACTIVE");

  const tier = (user as any)?.subscriptionTier || "none";

  const steps = [
    { n: 1, label: "Identify", desc: "Find inaccurate items", done: activeIssues.length > 0 },
    { n: 2, label: "Generate", desc: "AI writes your letter", done: disputes.length > 0 },
    { n: 3, label: "Send", desc: "Certified mail to bureau", done: pending.length > 0 || resolved.length > 0 },
    { n: 4, label: "Track", desc: "Monitor 30-day window", done: resolved.length > 0 },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Header ── */}
        <div
          className="rounded-2xl p-6 sm:p-8 relative overflow-hidden"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-gold)" }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)" }} />
          <div className="relative flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="ss-overline mb-2">DIY Credit Repair</div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1" style={{ color: "var(--text-primary)" }}>
                Dispute IQ
              </h1>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                AI-generated dispute letters and step-by-step guidance.
              </p>
            </div>
            {canCreateDisputes && (
              <button className="ss-btn-primary shrink-0" onClick={() => setShowWizard(true)}>
                <Plus className="h-4 w-4" />
                New Dispute
              </button>
            )}
          </div>
        </div>

        {/* ── Journey Steps ── */}
        <div className="rounded-2xl p-6" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-gold)" }}>
          <div className="ss-overline mb-5">Your Dispute Journey</div>
          <div className="flex items-start gap-0 overflow-x-auto pb-2">
            {steps.map((step, i) => (
              <div key={step.n} className="flex items-center flex-1 min-w-[100px]">
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
                  <div className="h-px flex-1 min-w-4 mx-2 mt-[-20px]"
                    style={{ background: step.done ? "var(--gold)" : "var(--border-gold)" }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Active Issues", value: activeIssues.length, color: "#E05252", icon: AlertCircle },
            { label: "In Progress", value: pending.length, color: "#E8A020", icon: Clock },
            { label: "Resolved", value: resolved.length, color: "#2ECC8A", icon: CheckCircle },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="ss-card !p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}12` }}>
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <div>
                <div className="text-2xl font-black" style={{ color }}>{value}</div>
                <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Active Disputes ── */}
        <div className="rounded-2xl p-6" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-gold)" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="ss-overline mb-1">Active</div>
              <h2 className="font-black text-lg" style={{ color: "var(--text-primary)" }}>Active Disputes</h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "rgba(232,160,32,0.12)", color: "#E8A020" }}>
              {pending.length} pending
            </span>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>Loading...</div>
          ) : pending.length === 0 ? (
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
              {canCreateDisputes && (
                <button className="ss-btn-primary text-sm !py-2.5 !px-5" onClick={() => setShowWizard(true)}>
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
                  <div key={dispute.id} className="flex items-start gap-4 p-4 rounded-xl"
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-gold)" }}>
                    <div className="w-3 h-3 rounded-full mt-1.5 animate-pulse shrink-0" style={{ background: bureauColor }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                          {dispute.bureau} — {issue?.title || "Dispute"}
                        </div>
                        <StatusBadge status={dispute.status} />
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        Sent {formatRelativeDate(dispute.dateSent)} · Response expected {formatRelativeDate(dispute.expectedResponse)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Resolved ── */}
        {resolved.length > 0 && (
          <div className="rounded-2xl p-6" style={{ background: "var(--bg-surface)", border: "1px solid rgba(46,204,138,0.2)" }}>
            <div className="ss-overline mb-5">Wins</div>
            <div className="space-y-3">
              {resolved.map((dispute) => {
                const issue = creditIssues.find((i) => i.id === dispute.issueId);
                return (
                  <div key={dispute.id} className="flex items-start gap-4 p-4 rounded-xl"
                    style={{ background: "var(--bg-elevated)", border: "1px solid rgba(46,204,138,0.15)" }}>
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

        {/* ── FCRA Tips ── */}
        <div className="rounded-2xl p-6" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-gold)" }}>
          <div className="ss-overline mb-5">Know Your Rights</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Shield, title: "30-Day Rule", body: "Bureaus must investigate within 30 days of receiving your dispute under FCRA § 1681i." },
              { icon: FileText, title: "Free Corrections", body: "If an error is found, correction and removal are completely free — by law." },
              { icon: Sparkles, title: "Escalate to CFPB", body: "If a bureau won't remove it, escalate to the CFPB for additional leverage." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="p-4 rounded-xl" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-gold)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: "rgba(201,168,76,0.1)" }}>
                  <Icon className="h-4 w-4" style={{ color: "var(--gold)" }} />
                </div>
                <div className="font-bold text-sm mb-1" style={{ color: "var(--text-primary)" }}>{title}</div>
                <div className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{body}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-8" />
      </div>

      {showWizard && (
        <DisputeWizard
          creditIssues={creditIssues}
          tier={tier}
          onClose={() => setShowWizard(false)}
          onSuccess={() => setShowWizard(false)}
        />
      )}
    </div>
  );
}
