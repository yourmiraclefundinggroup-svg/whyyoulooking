import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserContext } from "@/hooks/use-user-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatRelativeDate } from "@/lib/utils";
import type { User } from "@shared/schema";
import {
  Gavel, Plus, Clock, CheckCircle, FileText, Sparkles, Shield, AlertCircle,
  X, ArrowRight, ArrowLeft, Printer, Send, Copy, Check, ChevronRight,
  ChevronDown, CreditCard, Brain, FileSearch,
} from "lucide-react";
import type { CreditIssue, Dispute } from "@shared/schema";
import {
  useArrayScript,
  ARRAY_SANDBOX_APP_KEY,
  ARRAY_SANDBOX_API_URL,
  ARRAY_SANDBOX_TOKENS,
} from "@/hooks/use-array-script";
import { AICreditAnalysis } from "@/components/ai-credit-analysis";

/* ── Constants ──────────────────────────────────────────────────────────── */

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

/* Credits per tier — used for plan credit tracker */
const TIER_MONTHLY_CREDITS: Record<string, number | null> = {
  none:    1,
  starter: 3,
  pro:     10,
  elite:   null, // null = unlimited
};

/* Per-plan free send credits; additional sends cost $29.99 each */
const TIER_FREE_SENDS: Record<string, number> = {
  none:    0,
  starter: 0, // pay-per-letter: $29.99 each
  pro:     1, // first free, $29.99 after
  elite:   2, // first 2 free, $29.99 after
};

const SEND_PRICE = 29.99;

/* Infer letter method label from content */
function letterMethodLabel(content: string): string {
  const lc = content.toLowerCase();
  if (lc.includes("goodwill")) return "Goodwill Letter";
  if (lc.includes("validat")) return "Validation Request";
  return "Dispute Letter";
}

/* Violation type display for credit issues */
const ISSUE_TYPE_LABELS: Record<string, { label: string; severity: "HIGH" | "MED" | "LOW"; color: string }> = {
  LATE_PAYMENT:       { label: "Late Payment",       severity: "HIGH", color: "#E05252" },
  COLLECTION:         { label: "Collection Account",  severity: "HIGH", color: "#E05252" },
  CHARGE_OFF:         { label: "Charge-Off",          severity: "HIGH", color: "#E05252" },
  HARD_INQUIRY:       { label: "Hard Inquiry",         severity: "MED",  color: "#E8A020" },
  HIGH_UTILIZATION:   { label: "High Utilization",    severity: "MED",  color: "#E8A020" },
  WRONG_BALANCE:      { label: "Incorrect Balance",   severity: "MED",  color: "#E8A020" },
  DUPLICATE:          { label: "Duplicate Account",   severity: "MED",  color: "#E8A020" },
  NOT_MINE:           { label: "Account Not Mine",    severity: "HIGH", color: "#E05252" },
  IDENTITY_THEFT:     { label: "Identity Theft",      severity: "HIGH", color: "#E05252" },
  OLD_DEBT:           { label: "Outdated Debt (7yr+)", severity: "MED", color: "#E8A020" },
  CLOSED_REPORTED_OPEN: { label: "Closed/Open Mismatch", severity: "LOW", color: "#60A5FA" },
};

/* ── Helpers ────────────────────────────────────────────────────────────── */

function buildLetter(
  bureau: Bureau,
  creditor: string,
  reason: string,
  user?: { firstName?: string | null; lastName?: string | null; email?: string | null } | null,
): string {
  const fullName = user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : "";
  const displayName = fullName || "[Your Name]";
  return `${displayName}
[Your Address, City, State ZIP]
${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

${bureau}
Dispute Department

Re: Dispute of Inaccurate Information — ${creditor}

To Whom It May Concern,

I am writing pursuant to my rights under the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681i, to dispute inaccurate information on my credit report.

The following item is inaccurate and must be investigated:
  • Creditor / Account: ${creditor}
  • Reason for Dispute: ${reason}

Under FCRA § 1681i, you are required to conduct a reasonable investigation within 30 days. If the information cannot be verified, it must be deleted or corrected promptly.

Please provide written confirmation of the results and any changes made to my credit report.

Sincerely,

${displayName}
[Last 4 Digits of SSN]
${user?.email ?? "[Email Address]"}`;
}

function StatusBadge({ status }: { status: string }) {
  const MAP: Record<string, { color: string; bg: string; label: string }> = {
    PENDING:   { color: "#E8A020", bg: "rgba(232,160,32,0.12)", label: "Pending" },
    SENT:      { color: "#60A5FA", bg: "rgba(96,165,250,0.12)",  label: "Sent" },
    DELIVERED: { color: "#2ECC8A", bg: "rgba(46,204,138,0.12)",  label: "Delivered" },
    RESOLVED:  { color: "#2ECC8A", bg: "rgba(46,204,138,0.12)",  label: "Resolved" },
    REJECTED:  { color: "#E05252", bg: "rgba(224,82,82,0.12)",   label: "Rejected" },
  };
  const c = MAP[status] ?? { color: "var(--text-secondary)", bg: "var(--bg-elevated)", label: status };
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ color: c.color, background: c.bg }}>{c.label}</span>
  );
}

/* ── Per-letter selection state ─────────────────────────────────────────── */

interface LetterSlot {
  id: string;
  issue: CreditIssue | null;
  creditor: string;
  reason: string;
  bureau: Bureau;
  generated: string;
  generating: boolean;
  sent: "lob" | "print" | null;
  tracking: string | null;
  deliveryDate: string | null;
  copied: boolean;
  expanded: boolean;
}

function freshSlot(i: number): LetterSlot {
  return {
    id: `slot-${i}-${Date.now()}`,
    issue: null,
    creditor: "",
    reason: DISPUTE_REASONS[0],
    bureau: "Experian",
    generated: "",
    generating: false,
    sent: null,
    tracking: null,
    deliveryDate: null,
    copied: false,
    expanded: true,
  };
}

/* ── Inline Array credit-report panel (no Array branding) ─────────────── */

function ArrayCreditReportPanel({
  scriptReady,
}: {
  scriptReady: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !ARRAY_SANDBOX_APP_KEY || !scriptReady) return;
    containerRef.current.innerHTML = "";
    const el = document.createElement("array-credit-report");
    el.setAttribute("appKey", ARRAY_SANDBOX_APP_KEY);
    el.setAttribute("apiUrl", ARRAY_SANDBOX_API_URL);
    el.setAttribute("sandbox", "true");
    el.setAttribute("userToken", ARRAY_SANDBOX_TOKENS.default ?? "");
    el.setAttribute("defaultBureau", "all");
    containerRef.current.appendChild(el);
    return () => { if (containerRef.current) containerRef.current.innerHTML = ""; };
  }, [scriptReady]);

  if (!scriptReady) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    /* Suppress Array branding via CSS isolation */
    <div className="diy-array-report-wrap" ref={containerRef}
      style={{ minHeight: 200, maxHeight: 480, overflowY: "auto" }} />
  );
}

/* ── Wizard (page-level) ────────────────────────────────────────────────── */

function DisputeWizard({
  creditIssues,
  onDone,
  tier,
  creditsUsed,
}: {
  creditIssues: CreditIssue[];
  onDone: () => void;
  tier: string;
  creditsUsed: number;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useUserContext();
  const userId = user?.id ?? 0;

  const { loaded: scriptReady } = useArrayScript();

  const { data: enrollment } = useQuery<{ enrolled: boolean }>({
    queryKey: ["/api/array/enrollment"],
    enabled: !!user,
  });
  const isEnrolled = enrollment?.enrolled ?? false;

  const monthlyCredits = TIER_MONTHLY_CREDITS[tier] ?? 1;
  const creditsLeft = monthlyCredits === null ? null : Math.max(0, monthlyCredits - creditsUsed);
  const MAX_LETTERS = monthlyCredits === null ? 3 : Math.min(3, creditsLeft ?? 3);

  const freeSends = TIER_FREE_SENDS[tier] ?? 0;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [slots, setSlots] = useState<LetterSlot[]>([freshSlot(0)]);
  const [pendingConfirm, setPendingConfirm] = useState<number | null>(null);
  const [sentCount, setSentCount] = useState(0); // lob sends this session

  const updateSlot = (i: number, patch: Partial<LetterSlot>) =>
    setSlots((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const addSlot = () => {
    if (slots.length < MAX_LETTERS) setSlots((p) => [...p, freshSlot(p.length)]);
  };

  const removeSlot = (i: number) =>
    setSlots((p) => p.filter((_, idx) => idx !== i));

  /* Step 1 → Step 2: generate all letters with "Dispute IQ is analyzing…" UX */
  const [analyzing, setAnalyzing] = useState(false);

  const handleGenerateAll = async () => {
    const valid = slots.filter((s) => s.creditor.trim() || s.issue);
    if (valid.length === 0) {
      toast({ title: "Add at least one item", description: "Enter a creditor or select an issue.", variant: "destructive" });
      return;
    }
    // Show analyzing overlay before transitioning to step 2
    setAnalyzing(true);
    await new Promise((r) => setTimeout(r, 1400));
    setAnalyzing(false);
    setStep(2);
    for (let i = 0; i < slots.length; i++) {
      const s = slots[i];
      const creditor = (s.issue?.creditor ?? s.creditor) || "the account";
      updateSlot(i, { generating: true, generated: "" });
      await new Promise((r) => setTimeout(r, 1200 + i * 300));
      updateSlot(i, { generating: false, generated: buildLetter(s.bureau, creditor, s.reason, user) });
    }
  };

  /* Determine price for next LOB send */
  const sendPrice = (sessionSentIdx: number) => {
    return sessionSentIdx < freeSends ? 0 : SEND_PRICE;
  };

  /* Confirm modal trigger (shows pricing before sending) */
  const confirmSendLOB = (i: number) => setPendingConfirm(i);

  /* Actual LOB send — called after user confirms */
  const sendLOB = async (i: number) => {
    const s = slots[i];
    setPendingConfirm(null);
    updateSlot(i, { generating: true });
    try {
      const res = await apiRequest("POST", "/api/lob/send-letter", {
        bureau: s.bureau,
        letterContent: s.generated,
        issueId: s.issue?.id,
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => "Unknown error");
        throw new Error(errText);
      }
      const data = await res.json();
      const tracking: string | null = data.trackingNumber ?? null;
      const d = new Date(); d.setDate(d.getDate() + 10);
      const deliveryDate = d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
      updateSlot(i, { sent: "lob", tracking, deliveryDate, generating: false });
      setSentCount((c) => c + 1);
      await apiRequest("POST", "/api/disputes", {
        bureau: s.bureau,
        letterContent: s.generated,
        issueId: s.issue?.id ?? null,
        userId,
      }).catch(() => null);
      queryClient.invalidateQueries({ queryKey: ["/api/disputes", userId] });
    } catch (err) {
      updateSlot(i, { generating: false });
      toast({
        title: "Send failed",
        description: err instanceof Error ? err.message : "Could not send via certified mail. Please try again.",
        variant: "destructive",
      });
    }
  };

  /* Print slot */
  const downloadSlot = useCallback(async (i: number) => {
    const s = slots[i];

    // Generate a real PDF using pdf-lib
    const pdfDoc = await PDFDocument.create();
    const font      = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const fontBold  = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

    const page = pdfDoc.addPage([612, 792]); // US Letter
    const { width, height } = page.getSize();
    const margin = 72; // 1 inch
    const lineH  = 16;
    let   y      = height - margin;

    const black = rgb(0, 0, 0);
    const grey  = rgb(0.4, 0.4, 0.4);

    // Header bar
    page.drawRectangle({ x: margin, y: y - 4, width: width - margin * 2, height: 1.5, color: grey });
    y -= 20;
    page.drawText("FCRA CREDIT DISPUTE LETTER", {
      x: margin, y, size: 9, font: fontBold, color: grey,
    });
    page.drawText(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), {
      x: width - margin - 120, y, size: 9, font, color: grey,
    });
    y -= lineH * 1.5;

    // Draw letter body — word-wrap each line to 75 chars at 10pt
    const maxWidth = width - margin * 2;
    const lines = s.generated.split("\n");
    for (const rawLine of lines) {
      if (y < margin + lineH) {
        // New page if needed
        const np = pdfDoc.addPage([612, 792]);
        y = np.getSize().height - margin;
      }
      // Simple line wrapping
      const words = rawLine.split(" ");
      let cur = "";
      for (const w of words) {
        const test = cur ? `${cur} ${w}` : w;
        const tw = font.widthOfTextAtSize(test, 11);
        if (tw > maxWidth && cur) {
          page.drawText(cur, { x: margin, y, size: 11, font, color: black });
          y -= lineH;
          cur = w;
        } else {
          cur = test;
        }
      }
      if (cur) {
        page.drawText(cur, { x: margin, y, size: 11, font, color: black });
      }
      y -= lineH;
    }

    // Footer
    y -= lineH;
    page.drawRectangle({ x: margin, y: y + lineH - 2, width: width - margin * 2, height: 1, color: grey });
    const bureauAddresses: Record<string, string> = {
      Experian:   "Experian Dispute Dept · P.O. Box 4500 · Allen, TX 75013",
      Equifax:    "Equifax Dispute Dept · P.O. Box 740256 · Atlanta, GA 30374",
      TransUnion: "TransUnion Dispute Dept · P.O. Box 2000 · Chester, PA 19016",
    };
    page.drawText(`Mail to: ${bureauAddresses[s.bureau] ?? s.bureau}`, {
      x: margin, y: y - 4, size: 9, font, color: grey,
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dispute-letter-${s.bureau.toLowerCase()}-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    updateSlot(i, { sent: "print" });
    apiRequest("POST", "/api/disputes", {
      bureau: s.bureau,
      letterContent: s.generated,
      issueId: s.issue?.id ?? null,
      userId,
    }).catch(() => null);
    queryClient.invalidateQueries({ queryKey: ["/api/disputes", userId] });
  }, [slots, userId, queryClient]);

  const allSent = slots.every((s) => s.sent !== null);
  const allGenerated = slots.every((s) => s.generated !== "");

  /* Analyzing overlay */
  if (analyzing) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 flex flex-col items-center justify-center gap-6 text-center">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)" }}>
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
        </div>
        <div>
          <h2 className="text-xl font-black mb-2" style={{ color: "var(--text-primary)" }}>
            Dispute IQ is analyzing your selections…
          </h2>
          <p className="text-sm max-w-xs mx-auto" style={{ color: "var(--text-secondary)" }}>
            Matching FCRA statutes, Metro 2 standards, and drafting your dispute letters.
          </p>
        </div>
        <div className="flex gap-1.5">
          {[0, 200, 400].map((delay) => (
            <span key={delay} className="w-2 h-2 rounded-full animate-bounce inline-block"
              style={{ background: "var(--gold)", animationDelay: `${delay}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* Wizard header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="ss-overline mb-1">Dispute IQ</div>
          <h2 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>
            {step === 1 ? "Select Items to Dispute" : step === 2 ? "Review & Send Letters" : "Dispute Summary"}
          </h2>
        </div>
        <button onClick={onDone} className="ss-btn-ghost !py-2 !px-3 text-sm">
          <X className="h-4 w-4" />
          Cancel
        </button>
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-2">
        {([1, 2, 3] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                style={{
                  background: s < step ? "linear-gradient(135deg,var(--gold),var(--gold-light))" : s === step ? "rgba(201,168,76,0.15)" : "var(--bg-elevated)",
                  color: s < step ? "var(--bg-primary)" : s === step ? "var(--gold)" : "var(--text-muted)",
                  border: s === step ? "1px solid var(--gold)" : "none",
                }}
              >
                {s < step ? <Check className="h-3.5 w-3.5" /> : s}
              </div>
              <span className="text-xs font-semibold hidden sm:block"
                style={{ color: s === step ? "var(--gold)" : "var(--text-muted)" }}>
                {s === 1 ? "Select" : s === 2 ? "Generate & Send" : "Summary"}
              </span>
            </div>
            {i < 2 && <div className="h-px flex-1" style={{ background: s < step ? "var(--gold)" : "var(--border-gold)" }} />}
          </div>
        ))}
      </div>

      {/* Plan credit tracker + pricing */}
      <div className="rounded-xl p-4 space-y-2" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-gold)" }}>
        <div className="flex items-center gap-3">
          <CreditCard className="h-4 w-4 shrink-0" style={{ color: "var(--gold)" }} />
          <div className="flex-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            {monthlyCredits === null
              ? <><span className="font-bold" style={{ color: "var(--gold)" }}>Unlimited</span> dispute letters this month (Elite — {freeSends} free certified sends)</>
              : <><span className="font-bold" style={{ color: creditsLeft === 0 ? "#E05252" : "var(--gold)" }}>{creditsLeft}</span> of {monthlyCredits} letters remaining this month ({tier.charAt(0).toUpperCase() + tier.slice(1)} plan)</>
            }
          </div>
          {monthlyCredits !== null && monthlyCredits > 0 && (
            <div className="w-20 h-1.5 rounded-full shrink-0" style={{ background: "var(--bg-elevated)" }}>
              <div className="h-1.5 rounded-full"
                style={{ width: `${Math.round(((creditsLeft ?? 0) / monthlyCredits) * 100)}%`, background: "linear-gradient(90deg,var(--gold),var(--gold-light))" }} />
            </div>
          )}
        </div>
        <div className="text-xs" style={{ color: "var(--text-muted)" }}>
          {tier === "starter" && "Certified mail: $29.99/letter · Print & mail free"}
          {tier === "pro" && "First certified send free · Additional: $29.99/letter · Print & mail free"}
          {tier === "elite" && "First 2 certified sends free · Additional: $29.99/letter · Print & mail free"}
          {tier === "none" && "Certified mail: $29.99/letter · Print & mail free"}
        </div>
      </div>

      {/* ── Confirm Send Modal ── */}
      {pendingConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setPendingConfirm(null)}>
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-4"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-gold)" }}
            onClick={(e) => e.stopPropagation()}>
            <div>
              <div className="ss-overline mb-1">Confirm Send</div>
              <h3 className="font-black text-lg" style={{ color: "var(--text-primary)" }}>Send via Certified Mail?</h3>
            </div>
            {(() => {
              const slot = slots[pendingConfirm];
              const creditor = (slot.issue?.creditor ?? slot.creditor) || "the account";
              const sessionLOBCount = slots.slice(0, pendingConfirm).filter((s) => s.sent === "lob").length;
              const price = sendPrice(sentCount + sessionLOBCount);
              return (
                <div className="space-y-3">
                  {/* Bureau + mailing address */}
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--text-secondary)" }}>Bureau</span>
                    <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{slot.bureau}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--text-secondary)" }}>Mailing address</span>
                    <span className="font-semibold text-right text-xs" style={{ color: "var(--text-primary)", maxWidth: "55%" }}>
                      {slot.bureau === "Experian"   && "P.O. Box 4500, Allen TX 75013"}
                      {slot.bureau === "Equifax"    && "P.O. Box 740256, Atlanta GA 30374"}
                      {slot.bureau === "TransUnion" && "P.O. Box 2000, Chester PA 19016"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--text-secondary)" }}>Account</span>
                    <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{creditor}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--text-secondary)" }}>Method</span>
                    <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                      {letterMethodLabel(slot.generated)}
                    </span>
                  </div>
                  <div className="h-px" style={{ background: "var(--border-gold)" }} />
                  {/* Credit usage accounting */}
                  {monthlyCredits !== null && (
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "var(--text-secondary)" }}>Credits</span>
                      <span className="font-semibold" style={{ color: creditsLeft === 0 ? "#E05252" : "var(--gold)" }}>
                        1 credit used · {Math.max(0, (creditsLeft ?? 0) - 1)} remaining
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--text-secondary)" }}>Charge</span>
                    <span className="font-black" style={{ color: price === 0 ? "#2ECC8A" : "var(--gold)" }}>
                      {price === 0 ? "Free (plan benefit)" : `$${price.toFixed(2)}`}
                    </span>
                  </div>
                </div>
              );
            })()}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setPendingConfirm(null)} className="ss-btn-ghost flex-1 justify-center !py-2.5">Cancel</button>
              <button onClick={() => { if (pendingConfirm !== null) sendLOB(pendingConfirm); }} className="ss-btn-primary flex-1 justify-center !py-2.5">
                <Send className="h-4 w-4" />Confirm Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 1: Flagged-items picker + manual slots ── */}
      {step === 1 && (() => {
        const activeIssues = creditIssues.filter((x) => x.status === "ACTIVE");
        const selectedIssueIds = slots.map((s) => s.issue?.id).filter(Boolean) as number[];

        const toggleIssue = (issue: CreditIssue) => {
          const alreadyIdx = slots.findIndex((s) => s.issue?.id === issue.id);
          if (alreadyIdx >= 0) {
            // deselect
            if (slots.length === 1) {
              updateSlot(0, { issue: null, creditor: "", reason: DISPUTE_REASONS[0], bureau: "Experian" });
            } else {
              removeSlot(alreadyIdx);
            }
          } else {
            if (slots.length >= MAX_LETTERS) return;
            // find first empty slot or add new
            const emptyIdx = slots.findIndex((s) => !s.issue && !s.creditor);
            const patch: Partial<typeof slots[0]> = {
              issue,
              creditor: issue.creditor ?? "",
              bureau: "Experian",
              reason: DISPUTE_REASONS[0],
            };
            if (emptyIdx >= 0) {
              updateSlot(emptyIdx, patch);
            } else {
              setSlots((prev) => [...prev, { ...freshSlot(prev.length), ...patch }]);
            }
          }
        };

        return (
          <div className="space-y-5">
            {/* ── Live Credit Report (Array) — DIY AI Analysis ── */}
            {isEnrolled && (
              <div className="rounded-2xl overflow-hidden"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border-gold)" }}>
                <div className="flex items-center gap-3 px-5 py-3.5 border-b"
                  style={{ borderColor: "var(--border-gold)" }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(201,168,76,0.1)" }}>
                    <FileSearch className="h-4 w-4" style={{ color: "var(--gold)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      Live Credit Report — AI Analysis
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      Your full 3-bureau report, pulled directly for dispute targeting
                    </p>
                  </div>
                  <span className="text-[10px] font-medium shrink-0" style={{ color: "var(--text-muted)" }}>
                    DIY only
                  </span>
                </div>
                <div className="p-4">
                  <ArrayCreditReportPanel scriptReady={scriptReady} />
                </div>
              </div>
            )}

            {/* Flagged items analysis panel */}
            {activeIssues.length > 0 && (
              <div className="rounded-2xl p-5 space-y-4"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border-gold)" }}>
                <div>
                  <div className="ss-overline mb-1">Dispute IQ Analysis</div>
                  <h3 className="font-black text-base" style={{ color: "var(--text-primary)" }}>
                    {activeIssues.length} Flagged Item{activeIssues.length !== 1 ? "s" : ""} Detected
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    Select up to {MAX_LETTERS} item{MAX_LETTERS !== 1 ? "s" : ""} to dispute. Tap a card to include it.
                  </p>
                </div>
                <div className="space-y-2">
                  {activeIssues.map((issue) => {
                    const isSelected = selectedIssueIds.includes(issue.id);
                    const typeInfo = ISSUE_TYPE_LABELS[issue.type ?? ""] ?? null;
                    const bureauColor = "var(--gold)";
                    const isDisabled = !isSelected && slots.filter((s) => s.issue).length >= MAX_LETTERS;
                    return (
                      <button
                        key={issue.id}
                        onClick={() => toggleIssue(issue)}
                        disabled={isDisabled}
                        className="w-full text-left p-3.5 rounded-xl transition-all"
                        style={{
                          background: isSelected ? "rgba(201,168,76,0.08)" : "var(--bg-elevated)",
                          border: `1px solid ${isSelected ? "rgba(201,168,76,0.5)" : "var(--border-gold)"}`,
                          opacity: isDisabled ? 0.45 : 1,
                        }}>
                        <div className="flex items-start gap-3">
                          {/* Checkbox indicator */}
                          <div className="mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0"
                            style={{
                              background: isSelected ? "linear-gradient(135deg,var(--gold),var(--gold-light))" : "var(--bg-surface)",
                              border: `1px solid ${isSelected ? "var(--gold)" : "var(--border-gold)"}`,
                            }}>
                            {isSelected && <Check className="h-2.5 w-2.5" style={{ color: "var(--bg-primary)" }} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm mb-1.5" style={{ color: "var(--text-primary)" }}>
                              {issue.title}
                              {issue.creditor && <span className="font-normal ml-1" style={{ color: "var(--text-muted)" }}>· {issue.creditor}</span>}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {/* Violation type context pill */}
                              {issue.type && (
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                  style={{ background: "rgba(201,168,76,0.1)", color: bureauColor }}>
                                  {issue.type}
                                </span>
                              )}
                              {/* Violation type pill */}
                              {typeInfo && (
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                  style={{ background: `${typeInfo.color}12`, color: typeInfo.color }}>
                                  {typeInfo.label}
                                </span>
                              )}
                              {/* Severity badge */}
                              {typeInfo && (
                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide"
                                  style={{
                                    background: typeInfo.severity === "HIGH" ? "rgba(224,82,82,0.1)" : typeInfo.severity === "MED" ? "rgba(232,160,32,0.1)" : "rgba(96,165,250,0.1)",
                                    color: typeInfo.severity === "HIGH" ? "#E05252" : typeInfo.severity === "MED" ? "#E8A020" : "#60A5FA",
                                  }}>
                                  {typeInfo.severity}
                                </span>
                              )}
                              {/* Impact */}
                              {issue.impact != null && issue.impact !== 0 && (
                                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                  {Math.abs(issue.impact)} pt impact
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Slots — shown for manual entry or items with no issue */}
            {slots.map((slot, i) => {
              const isIssueSlot = !!slot.issue;
              if (isIssueSlot) return null; // issue-backed slots: nothing to show in step 1
              return (
                <div key={slot.id} className="rounded-2xl p-5 space-y-4"
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border-gold)" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="ss-overline mb-0.5">Manual Entry</div>
                      <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Letter {i + 1}</span>
                    </div>
                    {(slots.length > 1 || activeIssues.length > 0) && (
                      <button onClick={() => removeSlot(i)} style={{ color: "var(--text-muted)" }}>
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {/* Bureau */}
                  <div>
                    <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--text-secondary)" }}>Credit Bureau</label>
                    <div className="grid grid-cols-3 gap-2">
                      {BUREAUS.map((b) => (
                        <button key={b} onClick={() => updateSlot(i, { bureau: b })}
                          className="py-2 rounded-xl text-xs font-bold transition-all"
                          style={{
                            background: slot.bureau === b ? BUREAU_COLORS[b] : "var(--bg-elevated)",
                            color: slot.bureau === b ? "#fff" : "var(--text-secondary)",
                            border: `1px solid ${slot.bureau === b ? BUREAU_COLORS[b] : "var(--border-gold)"}`,
                          }}>
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Creditor */}
                  <div>
                    <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--text-secondary)" }}>Creditor / Account Name</label>
                    <input value={slot.creditor} onChange={(e) => updateSlot(i, { creditor: e.target.value })}
                      placeholder="e.g. Capital One, Midland Credit"
                      className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-gold)", color: "var(--text-primary)" }} />
                  </div>
                  {/* Reason */}
                  <div>
                    <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--text-secondary)" }}>Dispute Reason</label>
                    <select value={slot.reason} onChange={(e) => updateSlot(i, { reason: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg text-sm outline-none appearance-none"
                      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-gold)", color: "var(--text-primary)" }}>
                      {DISPUTE_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
              );
            })}

            {/* Add manual slot */}
            {slots.filter((s) => !s.issue).length === 0 && slots.length < MAX_LETTERS && (
              <button onClick={addSlot}
                className="w-full py-3 rounded-xl text-sm font-semibold border-2 border-dashed transition-all"
                style={{ borderColor: "var(--border-gold)", color: "var(--text-secondary)", background: "transparent" }}>
                <Plus className="h-4 w-4 inline mr-1" />
                Add manual item not listed above
              </button>
            )}
            {slots.length < MAX_LETTERS && MAX_LETTERS > 1 && activeIssues.length === 0 && (
              <button onClick={addSlot}
                className="w-full py-3 rounded-xl text-sm font-semibold border-2 border-dashed transition-all"
                style={{ borderColor: "var(--border-gold)", color: "var(--text-secondary)", background: "transparent" }}>
                <Plus className="h-4 w-4 inline mr-1" />
                Add another letter ({slots.length}/{MAX_LETTERS})
              </button>
            )}

            {/* Selected summary */}
            {selectedIssueIds.length > 0 && (
              <div className="px-4 py-2.5 rounded-xl text-sm"
                style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)" }}>
                <span style={{ color: "var(--text-secondary)" }}>{selectedIssueIds.length} item{selectedIssueIds.length !== 1 ? "s" : ""} selected</span>
                {" "}<span style={{ color: "var(--gold)" }}>· Ready to generate</span>
              </div>
            )}

            <button
              onClick={handleGenerateAll}
              disabled={slots.every((s) => !s.issue && !s.creditor.trim())}
              className="ss-btn-primary w-full justify-center">
              <Sparkles className="h-4 w-4" />
              Generate {slots.filter((s) => s.issue || s.creditor.trim()).length || slots.length} AI Dispute Letter{slots.length !== 1 ? "s" : ""}
            </button>
          </div>
        );
      })()}

      {/* ── STEP 2: Review letters + per-letter send ── */}
      {step === 2 && (
        <div className="space-y-5">
          {slots.map((slot, i) => {
            const bureauColor = BUREAU_COLORS[slot.bureau];
            const creditor = (slot.issue?.creditor ?? slot.creditor) || "the account";
            return (
              <div key={slot.id} className="rounded-2xl overflow-hidden"
                style={{ background: "var(--bg-surface)", border: `1px solid ${slot.sent ? "rgba(46,204,138,0.3)" : "var(--border-gold)"}` }}>
                {/* Letter card header */}
                <div className="flex items-center gap-3 px-5 py-3 cursor-pointer"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                  onClick={() => updateSlot(i, { expanded: !slot.expanded })}>
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: bureauColor }} />
                  <span className="font-bold text-sm flex-1" style={{ color: "var(--text-primary)" }}>
                    Letter {i + 1} — {slot.bureau} · {creditor}
                  </span>
                  {slot.sent && (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                      style={{ background: "rgba(46,204,138,0.12)", color: "#2ECC8A" }}>
                      {slot.sent === "lob" ? "Sent" : "Printed"}
                    </span>
                  )}
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform"
                    style={{ color: "var(--text-muted)", transform: slot.expanded ? "rotate(180deg)" : "rotate(0deg)" }} />
                </div>

                {slot.expanded && (
                  <div className="p-5 space-y-4">
                    {slot.generating ? (
                      <div className="py-8 flex flex-col items-center gap-3">
                        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                          style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
                        <span className="text-sm" style={{ color: "var(--text-muted)" }}>Generating letter...</span>
                      </div>
                    ) : slot.generated ? (
                      <>
                        <div className="flex justify-end gap-2">
                          <button onClick={() => {
                            navigator.clipboard.writeText(slot.generated);
                            updateSlot(i, { copied: true });
                            setTimeout(() => updateSlot(i, { copied: false }), 2000);
                          }} className="ss-btn-ghost !py-1.5 !px-3 text-xs">
                            {slot.copied ? <><Check className="h-3 w-3" />Copied</> : <><Copy className="h-3 w-3" />Copy</>}
                          </button>
                        </div>
                        <textarea
                          value={slot.generated}
                          onChange={(e) => updateSlot(i, { generated: e.target.value })}
                          rows={8}
                          className="w-full px-3 py-2.5 rounded-lg text-xs outline-none resize-none font-mono leading-relaxed"
                          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-gold)", color: "var(--text-primary)" }}
                        />

                        {/* Per-letter send options */}
                        {!slot.sent ? (
                          <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => confirmSendLOB(i)} disabled={slot.generating}
                              className="p-3 rounded-xl text-left transition-all"
                              style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.3)" }}>
                              <Send className="h-4 w-4 mb-1.5" style={{ color: "var(--gold)" }} />
                              <div className="font-bold text-xs mb-0.5" style={{ color: "var(--text-primary)" }}>
                                {slot.generating ? "Sending..." : "Certified Mail"}
                              </div>
                              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                                {sendPrice(sentCount + slots.slice(0, i).filter((s) => s.sent === "lob").length) === 0
                                  ? "Free with your plan · USPS tracking"
                                  : `$${SEND_PRICE.toFixed(2)} · USPS tracking included`}
                              </div>
                            </button>
                            <button onClick={() => downloadSlot(i)}
                              className="p-3 rounded-xl text-left transition-all"
                              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-gold)" }}>
                              <Printer className="h-4 w-4 mb-1.5" style={{ color: "var(--text-secondary)" }} />
                              <div className="font-bold text-xs mb-0.5" style={{ color: "var(--text-primary)" }}>Download & Print</div>
                              <div className="text-xs" style={{ color: "var(--text-muted)" }}>Save letter file to mail yourself</div>
                            </button>
                          </div>
                        ) : (
                          <div className="rounded-xl p-4"
                            style={{ background: "rgba(46,204,138,0.06)", border: "1px solid rgba(46,204,138,0.25)" }}>
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle className="h-4 w-4" style={{ color: "#2ECC8A" }} />
                              <span className="font-semibold text-sm" style={{ color: "#2ECC8A" }}>
                                {slot.sent === "lob" ? "Sent via Certified Mail" : "Printed"}
                              </span>
                            </div>
                            {slot.tracking && (
                              <div className="text-xs space-y-0.5" style={{ color: "var(--text-secondary)" }}>
                                <div>Tracking: <span className="font-mono font-bold" style={{ color: "var(--gold)" }}>{slot.tracking}</span></div>
                                {slot.deliveryDate && <div>Expected: {slot.deliveryDate}</div>}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="ss-btn-ghost !py-2.5 !px-5 text-sm">
              <ArrowLeft className="h-4 w-4" />Back
            </button>
            {allSent && (
              <button onClick={() => setStep(3)} className="ss-btn-primary flex-1 justify-center">
                View Summary
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 3: Summary ── */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="rounded-2xl p-6 text-center"
            style={{ background: "var(--bg-surface)", border: "1px solid rgba(46,204,138,0.3)" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: "rgba(46,204,138,0.1)" }}>
              <CheckCircle className="h-8 w-8" style={{ color: "#2ECC8A" }} />
            </div>
            <h3 className="text-lg font-black mb-1" style={{ color: "var(--text-primary)" }}>
              {slots.length} Dispute Letter{slots.length > 1 ? "s" : ""} Filed
            </h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Bureaus have 30 days under FCRA § 1681i to investigate and respond.
            </p>
          </div>

          {slots.map((slot, i) => (
            <div key={slot.id} className="flex items-start gap-3 p-4 rounded-xl"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border-gold)" }}>
              <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ background: BUREAU_COLORS[slot.bureau] }} />
              <div className="flex-1">
                <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                  {slot.bureau} — {(slot.issue?.creditor ?? slot.creditor) || "Account"}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  {slot.sent === "lob"
                    ? `Sent via Certified Mail${slot.tracking ? ` · ${slot.tracking}` : ""}`
                    : "Printed — mail yourself"}
                </div>
              </div>
              <CheckCircle className="h-4 w-4 shrink-0" style={{ color: "#2ECC8A" }} />
            </div>
          ))}

          <div className="rounded-xl p-4"
            style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)" }}>
            <div className="text-xs font-semibold mb-1" style={{ color: "var(--gold)" }}>Next Steps</div>
            <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
              If a bureau cannot verify the item within 30 days, it must be removed. If they verify incorrectly, escalate to the CFPB.
            </div>
          </div>

          <button onClick={onDone} className="ss-btn-primary w-full justify-center">
            Done — View My Disputes
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────────────────── */

export default function DisputeIQ() {
  const { user, canCreateDisputes } = useUserContext();
  const userId = user?.id ?? 0;
  const tier: string = (user as User & { subscriptionTier?: string })?.subscriptionTier ?? "none";

  const [wizardActive, setWizardActive] = useState(false);

  const { data: disputes = [], isLoading } = useQuery<Dispute[]>({
    queryKey: ["/api/disputes", userId],
  });

  const { data: creditIssues = [] } = useQuery<CreditIssue[]>({
    queryKey: ["/api/credit-issues", userId],
  });

  const pending  = disputes.filter((d) => ["PENDING", "SENT", "DELIVERED"].includes(d.status));
  const resolved = disputes.filter((d) => d.status === "RESOLVED");
  const activeIssues = creditIssues.filter((i) => i.status === "ACTIVE");

  /* Count letters sent THIS calendar month for credit tracker */
  const now = new Date();
  const creditsUsed = disputes.filter((d) => {
    const sent = new Date(d.dateSent);
    return sent.getMonth() === now.getMonth() && sent.getFullYear() === now.getFullYear();
  }).length;

  const steps = [
    { n: 1, label: "Identify",  desc: "Find inaccurate items",  done: activeIssues.length > 0 },
    { n: 2, label: "Generate",  desc: "AI writes your letter",   done: disputes.length > 0 },
    { n: 3, label: "Send",      desc: "Certified mail to bureau", done: pending.length > 0 || resolved.length > 0 },
    { n: 4, label: "Track",     desc: "Monitor 30-day window",   done: resolved.length > 0 },
  ];

  if (wizardActive) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
        <DisputeWizard
          creditIssues={creditIssues}
          tier={tier}
          creditsUsed={creditsUsed}
          onDone={() => setWizardActive(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Header ── */}
        <div className="rounded-2xl p-6 sm:p-8 relative overflow-hidden"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-gold)" }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)" }} />
          <div className="relative flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="ss-overline mb-2">DIY Credit Repair</div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1" style={{ color: "var(--text-primary)" }}>
                Dispute IQ
              </h1>
              <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
                AI-generated dispute letters — up to 3 at a time — with USPS Certified Mail.
              </p>
              {/* Credits tracker badge — primary: free certified-mail sends; secondary: letter quota */}
              {(() => {
                const freeSendsTotal = TIER_FREE_SENDS[tier] ?? 0;
                const monthlyCredits = TIER_MONTHLY_CREDITS[tier] ?? 1;
                const lettersLeft = monthlyCredits === null ? null : Math.max(0, monthlyCredits - creditsUsed);
                const atLimit = monthlyCredits !== null && lettersLeft === 0;
                const isElite = tier === "elite";
                return (
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Primary: free send credits */}
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                      style={{ background: "rgba(201,168,76,0.1)", color: "var(--gold)", border: "1px solid var(--border-gold)" }}>
                      <Send className="h-3 w-3" />
                      {freeSendsTotal === 0
                        ? "No free sends · $29.99/letter"
                        : `${freeSendsTotal} free certified send${freeSendsTotal !== 1 ? "s" : ""} / mo`}
                    </span>
                    {/* Secondary: letter-generation quota */}
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                      style={{
                        background: atLimit ? "rgba(224,82,82,0.1)" : "rgba(255,255,255,0.04)",
                        color: atLimit ? "#E05252" : "var(--text-secondary)",
                        border: `1px solid ${atLimit ? "rgba(224,82,82,0.3)" : "rgba(255,255,255,0.08)"}`,
                      }}>
                      <CreditCard className="h-3 w-3" />
                      {isElite
                        ? "Unlimited AI letters"
                        : atLimit
                          ? "Letter limit reached"
                          : `${lettersLeft} letter${lettersLeft !== 1 ? "s" : ""} left this month`}
                    </span>
                    {atLimit && (
                      <a href="/billing"
                        className="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
                        style={{ background: "linear-gradient(135deg,var(--gold),var(--gold-light))", color: "var(--bg-primary)" }}>
                        Upgrade →
                      </a>
                    )}
                  </div>
                );
              })()}
            </div>
            {canCreateDisputes && (
              <button className="ss-btn-primary shrink-0" onClick={() => setWizardActive(true)}>
                <Plus className="h-4 w-4" />
                New Dispute
              </button>
            )}
          </div>
        </div>

        {/* ── Journey ── */}
        <div className="rounded-2xl p-6" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-gold)" }}>
          <div className="ss-overline mb-5">Your Dispute Journey</div>
          <div className="flex items-start overflow-x-auto pb-2">
            {steps.map((step, i) => (
              <div key={step.n} className="flex items-center flex-1 min-w-[90px]">
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black mb-2 transition-all"
                    style={{
                      background: step.done ? "linear-gradient(135deg,var(--gold),var(--gold-light))" : "var(--bg-elevated)",
                      color: step.done ? "var(--bg-primary)" : "var(--text-muted)",
                      border: step.done ? "none" : "1px solid var(--border-gold)",
                    }}>
                    {step.done ? <CheckCircle className="h-5 w-5" /> : step.n}
                  </div>
                  <div className="text-xs font-bold mb-0.5" style={{ color: step.done ? "var(--gold)" : "var(--text-primary)" }}>{step.label}</div>
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

        {/* ── AI Credit Analysis (DIY only) ── */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-gold)" }}>
          <div className="flex items-center gap-3 px-5 py-3.5 border-b"
            style={{ borderColor: "var(--border-gold)" }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(201,168,76,0.1)" }}>
              <Brain className="h-4 w-4" style={{ color: "var(--gold)" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                AI Credit Analysis
              </p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Personalized dispute strategy powered by AI — available to DIY subscribers only
              </p>
            </div>
            <span className="text-[10px] font-medium shrink-0 px-2 py-0.5 rounded-full"
              style={{ background: "rgba(201,168,76,0.1)", color: "var(--gold)", border: "1px solid var(--border-gold)" }}>
              DIY
            </span>
          </div>
          <div className="p-4">
            <AICreditAnalysis userId={userId} />
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Active Issues", value: activeIssues.length, color: "#E05252", icon: AlertCircle },
            { label: "In Progress",   value: pending.length,      color: "#E8A020", icon: Clock },
            { label: "Resolved",      value: resolved.length,     color: "#2ECC8A", icon: CheckCircle },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="ss-card !p-5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}12` }}>
                <Icon className="h-4 w-4" style={{ color }} />
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
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: "rgba(232,160,32,0.12)", color: "#E8A020" }}>
              {pending.length} pending
            </span>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>Loading...</div>
          ) : pending.length === 0 ? (
            <div className="py-10 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: "rgba(201,168,76,0.08)" }}>
                <Gavel className="h-7 w-7" style={{ color: "var(--gold)" }} />
              </div>
              <div className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>No Active Disputes</div>
              <div className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                {activeIssues.length > 0
                  ? `${activeIssues.length} credit issue${activeIssues.length > 1 ? "s" : ""} ready to dispute.`
                  : "No credit issues found to dispute."}
              </div>
              {canCreateDisputes && (
                <button className="ss-btn-primary text-sm !py-2.5 !px-5" onClick={() => setWizardActive(true)}>
                  <Plus className="h-4 w-4" />
                  File Your First Dispute
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((dispute) => {
                const issue = creditIssues.find((x) => x.id === dispute.issueId);
                const bc = BUREAU_COLORS[dispute.bureau as Bureau] ?? "var(--gold)";
                return (
                  <div key={dispute.id} className="flex items-start gap-4 p-4 rounded-xl"
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-gold)" }}>
                    <div className="w-3 h-3 rounded-full mt-1.5 animate-pulse shrink-0" style={{ background: bc }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                          {dispute.bureau} — {issue?.title ?? "Dispute"}
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
          <div className="rounded-2xl p-6"
            style={{ background: "var(--bg-surface)", border: "1px solid rgba(46,204,138,0.2)" }}>
            <div className="ss-overline mb-4">Wins</div>
            <div className="space-y-3">
              {resolved.map((dispute) => {
                const issue = creditIssues.find((x) => x.id === dispute.issueId);
                return (
                  <div key={dispute.id} className="flex items-start gap-4 p-4 rounded-xl"
                    style={{ background: "var(--bg-elevated)", border: "1px solid rgba(46,204,138,0.15)" }}>
                    <CheckCircle className="h-5 w-5 mt-0.5 shrink-0" style={{ color: "#2ECC8A" }} />
                    <div className="flex-1">
                      <div className="font-semibold text-sm mb-0.5" style={{ color: "var(--text-primary)" }}>
                        {dispute.bureau} — {issue?.title ?? "Dispute"}
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

        {/* ── FCRA Rights ── */}
        <div className="rounded-2xl p-6" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-gold)" }}>
          <div className="ss-overline mb-5">Know Your Rights</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Shield,   title: "30-Day Rule",         body: "Bureaus must investigate within 30 days of receiving your dispute under FCRA § 1681i." },
              { icon: FileText, title: "Free Corrections",    body: "If an error is found, correction and removal are completely free — by law." },
              { icon: Sparkles, title: "Escalate to CFPB",    body: "If a bureau won't remove it, file a complaint with the CFPB for additional leverage." },
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
    </div>
  );
}
