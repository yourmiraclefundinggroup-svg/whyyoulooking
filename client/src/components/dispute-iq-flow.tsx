/**
 * Multi-step dispute letter generation flow for Dispute IQ.
 * Step 1: Consumer info  →  Step 2: Document uploads  →  Step 3: Review & Generate  →  Preview dialog
 */

import { useState, useRef, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFeatureAccess, FEATURES } from "@/hooks/use-feature-access";
import { useUserContext } from "@/hooks/use-user-context";
import { useToast } from "@/hooks/use-toast";

/* ── Types ─────────────────────────────────────────────────────────────────── */
interface TradelineViolation {
  code: string;
  category: "metro2" | "fcra";
  label: string;
  statute?: string;
}

interface AnalyzedTradeline {
  creditor: string;
  accountNumber: string;
  accountType: string;
  balance: string;
  status: string;
  dateOpened: string;
  dateOfFirstDelinquency?: string;
  latePayments?: { days30?: number; days60?: number; days90?: number };
  violations: TradelineViolation[];
  isDerogatory: boolean;
  bureau?: string;
  bureaus?: string[];
}

interface ConsumerInfo {
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  dateOfBirth: string;
  ssnLast4: string;
  stateIdNumber: string;
  isIdentityTheft: boolean;
  ftcReportNumber: string;
}

interface DisputeDoc {
  docType: "gov_id" | "ssn_card" | "auth_letter";
  fileName: string;
  uploadedAt: string;
}

type Step = 1 | 2 | 3 | "preview";

const BUREAU_LABELS: Record<string, string> = {
  EXPERIAN: "Experian",
  EQUIFAX: "Equifax",
  TRANSUNION: "TransUnion",
};
const BUREAU_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  EXPERIAN: { bg: "#eff6ff", text: "#1d4ed8", border: "#93c5fd" },
  EQUIFAX: { bg: "#fef2f2", text: "#b91c1c", border: "#fca5a5" },
  TRANSUNION: { bg: "#f5f3ff", text: "#6d28d9", border: "#c4b5fd" },
};

/* ── helpers ─────────────────────────────────────────────────────────────────── */
function groupByBureau(accounts: AnalyzedTradeline[]): Record<string, AnalyzedTradeline[]> {
  const groups: Record<string, AnalyzedTradeline[]> = {};
  for (const a of accounts) {
    const b = ((a.bureaus && a.bureaus[0]) || a.bureau || "UNKNOWN").toUpperCase();
    if (!groups[b]) groups[b] = [];
    groups[b].push(a);
  }
  return groups;
}

function generatePrintableHTML(letterContent: string, bureau: string, clientName: string): string {
  const color = BUREAU_COLORS[bureau.toUpperCase()]?.text || "#d97706";
  const lines = letterContent.split("\n").map((line) => {
    const t = line.trim();
    if (/^═+$/.test(t)) return `<hr style="border:2px solid ${color};margin:12px 0"/>`;
    if (/^─+$/.test(t)) return `<hr style="border:1px solid #e5e7eb;margin:8px 0"/>`;
    if (/^DISPUTE #\d+:/i.test(t)) return `<h3 style="color:${color};font-size:14px;font-weight:bold;margin:16px 0 4px;padding:8px;background:#f9fafb;border-left:4px solid ${color}">${t}</h3>`;
    if (/^(SECTION|LEGAL NOTICE|PACKAGE|CONSUMER IDENTIFICATION|Ground \d+|DEMAND|DISPUTED|RE:)/.test(t)) return `<div style="font-weight:600;font-size:12px;color:#111827;margin:8px 0">${t}</div>`;
    if (t.startsWith("▶")) return `<div style="padding-left:16px;margin:2px 0;color:#166534">${t}</div>`;
    if (t === "") return "<br/>";
    return `<div style="color:#1f2937;line-height:1.65;font-size:12px">${t}</div>`;
  });
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Dispute Letter — ${clientName} — ${bureau}</title>
<style>body{font-family:'Times New Roman',serif;padding:40px;max-width:820px;margin:0 auto;color:#111827}@media print{body{padding:20px}}</style></head>
<body>${lines.join("\n")}</body></html>`;
}

/* ── DocSlot ─────────────────────────────────────────────────────────────────── */
function DocSlot({
  type,
  label,
  hint,
  existing,
  onUpload,
  uploading,
}: {
  type: "gov_id" | "ssn_card" | "auth_letter";
  label: string;
  hint: string;
  existing?: DisputeDoc;
  onUpload: (file: File) => void;
  uploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div style={{
      border: `2px solid ${existing ? "#d97706" : "#e5e7eb"}`,
      borderRadius: 12, padding: "16px 18px",
      background: existing ? "#fffbeb" : "#fafafa",
      display: "flex", alignItems: "center", gap: 14,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
        background: existing ? "#fef3c7" : "#f3f4f6",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20,
      }}>
        {existing ? "✅" : "📄"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: "#111827", marginBottom: 2 }}>{label}</div>
        {existing ? (
          <div style={{ fontSize: 12, color: "#92400e" }}>
            {existing.fileName} · uploaded {new Date(existing.uploadedAt).toLocaleDateString()}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: "#9ca3af" }}>{hint}</div>
        )}
      </div>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        style={{
          padding: "7px 14px", borderRadius: 8, border: "1px solid #e5e7eb",
          background: "#fff", color: "#374151", fontSize: 12, fontWeight: 600,
          cursor: "pointer", flexShrink: 0, opacity: uploading ? 0.5 : 1,
        }}
      >
        {uploading ? "Uploading…" : existing ? "Replace" : "Upload"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }}
      />
    </div>
  );
}

/* ── Step indicator ─────────────────────────────────────────────────────────── */
function StepBadge({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: active || done ? 1 : 0.4 }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        background: done ? "#16a34a" : active ? "#d97706" : "#e5e7eb",
        color: done || active ? "#fff" : "#6b7280",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 700, flexShrink: 0,
      }}>
        {done ? "✓" : n}
      </div>
      <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? "#111827" : "#6b7280" }}>
        {label}
      </span>
    </div>
  );
}

/* ── Label + Input helper ───────────────────────────────────────────────────── */
function Field({
  label, value, onChange, placeholder, type = "text", required,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
        {label}{required && <span style={{ color: "#dc2626" }}> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db",
          fontSize: 14, color: "#111827", background: "#fff", outline: "none",
          width: "100%", boxSizing: "border-box",
        }}
      />
    </div>
  );
}

/* ── Letter preview dialog ──────────────────────────────────────────────────── */
function LetterPreviewDialog({
  letter,
  bureau,
  clientName,
  letterId,
  onClose,
  onTrack,
}: {
  letter: string;
  bureau: string;
  clientName: string;
  letterId: number | null;
  onClose: () => void;
  onTrack: () => void;
}) {
  const { toast } = useToast();
  const { canAccess } = useFeatureAccess();
  const { user } = useUserContext();
  const canMail = canAccess(FEATURES.LOB_MAIL);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [sendResult, setSendResult] = useState<{ trackingNumber: string; expectedDelivery: string } | null>(null);

  const mailMutation = useMutation({
    mutationFn: async () => {
      const authToken = localStorage.getItem("auth_token");
      const res = await fetch("/api/client/lob/send-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          bureau,
          letterContent: letter,
          letterId,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error || "Send failed");
      }
      return res.json() as Promise<{ trackingNumber: string; expectedDelivery: string }>;
    },
    onSuccess: (data) => {
      setSendResult(data);
      setShowSendConfirm(false);
      toast({ title: "Letter mailed!", description: `Tracking: ${data.trackingNumber}` });
    },
    onError: (err: Error) => {
      toast({ title: "Send failed", description: err.message, variant: "destructive" });
    },
  });

  const bColor = BUREAU_COLORS[bureau.toUpperCase()] || BUREAU_COLORS["EXPERIAN"];

  const handleDownload = () => {
    const html = generatePrintableHTML(letter, bureau, clientName);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dispute-letter-${bureau.toLowerCase()}-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200,
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      overflowY: "auto", padding: "24px 16px",
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, width: "100%", maxWidth: 760,
        boxShadow: "0 24px 80px rgba(0,0,0,0.25)", flexShrink: 0,
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 24px", borderBottom: "1px solid #e5e7eb",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{
            padding: "3px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700,
            background: bColor.bg, color: bColor.text, border: `1px solid ${bColor.border}`,
          }}>
            {BUREAU_LABELS[bureau.toUpperCase()] || bureau}
          </span>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#111827", flex: 1 }}>
            Dispute Letter Preview
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#9ca3af" }}>✕</button>
        </div>

        {/* Letter content */}
        <div style={{
          padding: "24px", maxHeight: "55vh", overflowY: "auto",
          fontFamily: "'Courier New', monospace", fontSize: 12, lineHeight: 1.7,
          whiteSpace: "pre-wrap", color: "#1f2937", background: "#fafafa",
          borderBottom: "1px solid #e5e7eb",
        }}>
          {letter}
        </div>

        {/* Sent success */}
        {sendResult && (
          <div style={{ margin: "0 24px", marginTop: 16, padding: 16, background: "#f0fdf4", borderRadius: 10, border: "1px solid #86efac" }}>
            <div style={{ fontWeight: 700, color: "#166534", marginBottom: 4 }}>📬 Letter Mailed via USPS Certified Mail</div>
            <div style={{ fontSize: 13, color: "#166534" }}>
              Tracking: <strong>{sendResult.trackingNumber}</strong> · Expected delivery: {sendResult.expectedDelivery || "5–7 business days"}
            </div>
            <button
              onClick={onTrack}
              style={{ marginTop: 8, fontSize: 12, color: "#d97706", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              View in Disputes Tracking →
            </button>
          </div>
        )}

        {/* Send confirm */}
        {showSendConfirm && !sendResult && (
          <div style={{ margin: "0 24px", marginTop: 16, padding: 16, background: "#fffbeb", borderRadius: 10, border: "1px solid #fcd34d" }}>
            <div style={{ fontWeight: 600, color: "#92400e", marginBottom: 8 }}>Confirm Certified Mail Send</div>
            <div style={{ fontSize: 13, color: "#78350f", marginBottom: 12 }}>
              Send this dispute letter to <strong>{BUREAU_LABELS[bureau.toUpperCase()] || bureau}</strong> via USPS Certified Mail?
              <br />A Lob tracking number will be generated and you can track delivery in the Disputes tab.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => mailMutation.mutate()}
                disabled={mailMutation.isPending}
                style={{
                  padding: "8px 18px", borderRadius: 8, background: "#d97706", color: "#fff",
                  border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer",
                  opacity: mailMutation.isPending ? 0.6 : 1,
                }}
              >
                {mailMutation.isPending ? "Sending…" : "✉ Confirm Send"}
              </button>
              <button
                onClick={() => setShowSendConfirm(false)}
                style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", color: "#374151", fontSize: 13, cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ padding: "16px 24px", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={handleDownload}
            style={{
              padding: "9px 18px", borderRadius: 8, border: "1px solid #e5e7eb",
              background: "#fff", color: "#374151", fontSize: 13, fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            }}
          >
            ⬇ Download PDF
          </button>

          {!sendResult && (
            canMail ? (
              <button
                onClick={() => setShowSendConfirm(true)}
                style={{
                  padding: "9px 18px", borderRadius: 8, background: "#d97706", color: "#fff",
                  border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}
              >
                ✉ Send via Certified Mail
              </button>
            ) : (
              <a
                href="/pricing"
                style={{
                  padding: "9px 18px", borderRadius: 8, background: "#f3f4f6", color: "#6b7280",
                  border: "1px solid #e5e7eb", fontSize: 13, fontWeight: 600,
                  textDecoration: "none", display: "inline-block",
                }}
                title="Pro or Elite plan required for Certified Mail"
              >
                🔒 Send via Certified Mail (Pro+)
              </a>
            )
          )}

          <button onClick={onClose} style={{ marginLeft: "auto", padding: "9px 16px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", color: "#374151", fontSize: 13, cursor: "pointer" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main flow modal ─────────────────────────────────────────────────────────── */
export function DisputeIQFlow({
  selectedAccounts,
  onClose,
  onDisputeCreated,
}: {
  selectedAccounts: AnalyzedTradeline[];
  onClose: () => void;
  onDisputeCreated?: () => void;
}) {
  const { user } = useUserContext();
  const { toast } = useToast();
  const qClient = useQueryClient();

  const [step, setStep] = useState<Step>(1);

  // Pre-fill consumer info from user profile
  const [info, setInfo] = useState<ConsumerInfo>({
    fullName: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
    addressLine1: user?.addressLine1 || "",
    addressLine2: user?.addressLine2 || "",
    city: user?.city || "",
    state: user?.state || "",
    zipCode: user?.zipCode || "",
    dateOfBirth: user?.dateOfBirth || "",
    ssnLast4: user?.ssnLast4 || "",
    stateIdNumber: "",
    isIdentityTheft: false,
    ftcReportNumber: user?.ftcReportNumber || "",
  });

  const [generatedLetters, setGeneratedLetters] = useState<Array<{
    bureau: string;
    letterContent: string;
    letterId: number | null;
    accountCount: number;
  }>>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  // Fetch existing docs
  const { data: docsRaw, refetch: refetchDocs } = useQuery<DisputeDoc[]>({
    queryKey: ["/api/client/dispute-docs"],
  });
  const docs: DisputeDoc[] = Array.isArray(docsRaw) ? docsRaw : [];
  const docByType = (t: string) => docs.find((d) => d.docType === t);

  // Upload doc
  const uploadDoc = useCallback(async (file: File, docType: string) => {
    setUploadingDoc(docType);
    try {
      const authToken = localStorage.getItem("auth_token");
      const fd = new FormData();
      fd.append("file", file);
      fd.append("docType", docType);
      const res = await fetch("/api/client/dispute-docs", {
        method: "POST",
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      await refetchDocs();
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploadingDoc(null);
    }
  }, [refetchDocs, toast]);

  // Generate letters
  const generateMutation = useMutation({
    mutationFn: async () => {
      const authToken = localStorage.getItem("auth_token");
      const res = await fetch("/api/client/dispute-packet/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          consumer: info,
          selectedAccounts,
          enclosureNames: docs.map((d) => d.fileName),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error || "Generation failed");
      }
      return res.json() as Promise<Array<{ bureau: string; letterContent: string; letterId: number; accountCount: number }>>;
    },
    onSuccess: (data) => {
      setGeneratedLetters(data);
      setPreviewIndex(0);
      setStep("preview");
      qClient.invalidateQueries({ queryKey: ["/api/client/dispute-letters"] });
    },
    onError: (err: Error) => {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    },
  });

  // Validation for step 1
  const step1Valid = info.fullName.trim() && info.addressLine1.trim() && info.city.trim() && info.state.trim() && info.zipCode.trim();

  // Group selected accounts by bureau for step 3 review
  const bureauGroups = groupByBureau(selectedAccounts);
  const bureaus = Object.keys(bureauGroups);

  // If in preview
  if (step === "preview" && generatedLetters.length > 0) {
    const current = generatedLetters[previewIndex];
    return (
      <>
        {generatedLetters.length > 1 && (
          <div style={{
            position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)",
            background: "#1f2937", borderRadius: 12, padding: "10px 20px",
            display: "flex", gap: 10, alignItems: "center", zIndex: 201,
          }}>
            {generatedLetters.map((l, i) => (
              <button
                key={i}
                onClick={() => setPreviewIndex(i)}
                style={{
                  padding: "5px 14px", borderRadius: 6, border: "none",
                  background: i === previewIndex ? "#d97706" : "#374151",
                  color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer",
                }}
              >
                {BUREAU_LABELS[l.bureau] || l.bureau}
              </button>
            ))}
          </div>
        )}
        <LetterPreviewDialog
          letter={current.letterContent}
          bureau={current.bureau}
          clientName={info.fullName}
          letterId={current.letterId}
          onClose={onClose}
          onTrack={() => { onClose(); onDisputeCreated?.(); }}
        />
      </>
    );
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px",
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, width: "100%", maxWidth: 640,
        maxHeight: "92vh", display: "flex", flexDirection: "column",
        boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
      }}>
        {/* Modal header */}
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 17, color: "#111827" }}>Generate Dispute Letters</div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
              {selectedAccounts.length} account{selectedAccounts.length !== 1 ? "s" : ""} selected
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#9ca3af" }}>✕</button>
        </div>

        {/* Step indicators */}
        <div style={{ padding: "12px 24px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", display: "flex", gap: 20 }}>
          <StepBadge n={1} label="Consumer Info" active={step === 1} done={step !== 1} />
          <div style={{ width: 1, background: "#e5e7eb", height: 20, alignSelf: "center" }} />
          <StepBadge n={2} label="Documents" active={step === 2} done={step === 3 || step === "preview"} />
          <div style={{ width: 1, background: "#e5e7eb", height: 20, alignSelf: "center" }} />
          <StepBadge n={3} label="Review & Generate" active={step === 3} done={step === "preview"} />
        </div>

        {/* Step content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>

          {/* ── Step 1: Consumer Info ── */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>
                Confirm your identity information — this will appear on your dispute letters.
              </div>
              <Field label="Full Name" value={info.fullName} onChange={(v) => setInfo((p) => ({ ...p, fullName: v }))} placeholder="First Last" required />
              <Field label="Street Address" value={info.addressLine1} onChange={(v) => setInfo((p) => ({ ...p, addressLine1: v }))} placeholder="123 Main St" required />
              <Field label="Address Line 2 (optional)" value={info.addressLine2} onChange={(v) => setInfo((p) => ({ ...p, addressLine2: v }))} placeholder="Apt 4B" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 120px", gap: 10 }}>
                <Field label="City" value={info.city} onChange={(v) => setInfo((p) => ({ ...p, city: v }))} placeholder="City" required />
                <Field label="State" value={info.state} onChange={(v) => setInfo((p) => ({ ...p, state: v.toUpperCase().slice(0, 2) }))} placeholder="TX" required />
                <Field label="ZIP Code" value={info.zipCode} onChange={(v) => setInfo((p) => ({ ...p, zipCode: v }))} placeholder="75001" required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="Date of Birth" value={info.dateOfBirth} onChange={(v) => setInfo((p) => ({ ...p, dateOfBirth: v }))} placeholder="MM/DD/YYYY" type="text" />
                <Field label="SSN Last 4" value={info.ssnLast4} onChange={(v) => setInfo((p) => ({ ...p, ssnLast4: v.slice(0, 4) }))} placeholder="1234" type="password" />
              </div>
              <Field label="State ID Number" value={info.stateIdNumber} onChange={(v) => setInfo((p) => ({ ...p, stateIdNumber: v }))} placeholder="Driver's License / State ID number" />

              {/* Identity theft toggle */}
              <div style={{ padding: "14px 16px", background: "#fef2f2", borderRadius: 10, border: "1px solid #fca5a5" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={info.isIdentityTheft}
                    onChange={(e) => setInfo((p) => ({ ...p, isIdentityTheft: e.target.checked }))}
                    style={{ width: 18, height: 18, cursor: "pointer" }}
                  />
                  <span style={{ fontWeight: 600, fontSize: 14, color: "#991b1b" }}>
                    This is an identity theft case (adds § 605B 4-day block demand)
                  </span>
                </label>
                {info.isIdentityTheft && (
                  <div style={{ marginTop: 10 }}>
                    <Field
                      label="FTC Report Number (IdentityTheft.gov)"
                      value={info.ftcReportNumber}
                      onChange={(v) => setInfo((p) => ({ ...p, ftcReportNumber: v }))}
                      placeholder="e.g. 12345678"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Step 2: Document Uploads ── */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>
                Upload supporting documents to include with your dispute letters. Already uploaded documents are shown in gold.
              </div>
              <DocSlot
                type="gov_id"
                label="Government-Issued Photo ID"
                hint="Driver's license, passport, or state ID — front side"
                existing={docByType("gov_id")}
                onUpload={(f) => uploadDoc(f, "gov_id")}
                uploading={uploadingDoc === "gov_id"}
              />
              <DocSlot
                type="ssn_card"
                label="Social Security Card / SSN Proof"
                hint="Social Security card photo or SSA-issued document"
                existing={docByType("ssn_card")}
                onUpload={(f) => uploadDoc(f, "ssn_card")}
                uploading={uploadingDoc === "ssn_card"}
              />
              <DocSlot
                type="auth_letter"
                label="Signed ScoreShift Authorization Letter"
                hint="Download from your documents section, sign, and upload here"
                existing={docByType("auth_letter")}
                onUpload={(f) => uploadDoc(f, "auth_letter")}
                uploading={uploadingDoc === "auth_letter"}
              />
              <div style={{ padding: "10px 14px", background: "#fffbeb", borderRadius: 8, fontSize: 12, color: "#92400e", border: "1px solid #fcd34d" }}>
                💡 Documents are optional but strengthen your dispute. Bureaus are more likely to act on verified identities.
              </div>
            </div>
          )}

          {/* ── Step 3: Review & Generate ── */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ fontSize: 13, color: "#6b7280" }}>
                Review your dispute summary. Clicking "Generate" will create AI-written dispute letters per bureau — unique descriptions based on the actual violations found.
              </div>

              {/* Consumer summary */}
              <div style={{ padding: 14, background: "#f9fafb", borderRadius: 10, border: "1px solid #e5e7eb" }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#374151", marginBottom: 8 }}>Consumer Info</div>
                <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7 }}>
                  <strong>{info.fullName}</strong><br />
                  {info.addressLine1}{info.addressLine2 ? `, ${info.addressLine2}` : ""}<br />
                  {info.city}, {info.state} {info.zipCode}<br />
                  {info.ssnLast4 && <>SSN Last 4: ••••{info.ssnLast4}<br /></>}
                  {info.isIdentityTheft && (
                    <span style={{ color: "#dc2626", fontWeight: 600 }}>⚠ Identity Theft Case{info.ftcReportNumber ? ` — FTC #${info.ftcReportNumber}` : ""}</span>
                  )}
                </div>
              </div>

              {/* Accounts per bureau */}
              {bureaus.map((b) => {
                const accts = bureauGroups[b];
                const bColor = BUREAU_COLORS[b] || BUREAU_COLORS["EXPERIAN"];
                return (
                  <div key={b} style={{ border: "1px solid #e5e7eb", borderRadius: 10 }}>
                    <div style={{
                      padding: "10px 14px", display: "flex", alignItems: "center", gap: 8,
                      borderBottom: "1px solid #f3f4f6", background: "#fafafa", borderRadius: "10px 10px 0 0",
                    }}>
                      <span style={{ padding: "2px 10px", borderRadius: 5, fontSize: 11, fontWeight: 700, background: bColor.bg, color: bColor.text, border: `1px solid ${bColor.border}` }}>
                        {BUREAU_LABELS[b] || b}
                      </span>
                      <span style={{ fontSize: 12, color: "#6b7280" }}>→ {accts.length} account{accts.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div style={{ padding: "10px 14px" }}>
                      {accts.map((a) => (
                        <div key={`${a.creditor}_${a.accountNumber}`} style={{ fontSize: 13, color: "#374151", padding: "4px 0", display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontWeight: 600 }}>{a.creditor}</span>
                          <span style={{ color: "#9ca3af", fontSize: 11 }}>••••{a.accountNumber.slice(-4)}</span>
                          {a.violations.length > 0 && (
                            <span style={{ padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" }}>
                              {a.violations.length} violation{a.violations.length !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Documents summary */}
              {docs.length > 0 && (
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  📎 {docs.length} document{docs.length !== 1 ? "s" : ""} will be referenced: {docs.map((d) => d.fileName).join(", ")}
                </div>
              )}

              <div style={{ padding: "10px 14px", background: "#fffbeb", borderRadius: 8, fontSize: 12, color: "#92400e", border: "1px solid #fcd34d" }}>
                🤖 AI will generate unique violation descriptions per account using the actual Metro 2 and FCRA violations detected. Letters will be saved as drafts automatically.
              </div>

              {generateMutation.isPending && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "#f0fdf4", borderRadius: 10, border: "1px solid #86efac" }}>
                  <div style={{ width: 20, height: 20, border: "2.5px solid #e5e7eb", borderTopColor: "#16a34a", borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
                  <div style={{ fontSize: 13, color: "#166534", fontWeight: 600 }}>Generating your dispute letters… This may take 20–40 seconds.</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", gap: 10 }}>
          {step !== 1 ? (
            <button
              onClick={() => setStep((s) => (s === 3 ? 2 : 1) as Step)}
              disabled={generateMutation.isPending}
              style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", color: "#374151", fontSize: 13, cursor: "pointer" }}
            >
              ← Back
            </button>
          ) : (
            <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", color: "#374151", fontSize: 13, cursor: "pointer" }}>
              Cancel
            </button>
          )}

          {step !== 3 ? (
            <button
              onClick={() => setStep((s) => (s === 1 ? 2 : 3) as Step)}
              disabled={step === 1 && !step1Valid}
              style={{
                padding: "9px 22px", borderRadius: 8, background: "#d97706", color: "#fff",
                border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
                opacity: step === 1 && !step1Valid ? 0.5 : 1,
              }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              style={{
                padding: "9px 22px", borderRadius: 8, background: "#d97706", color: "#fff",
                border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
                opacity: generateMutation.isPending ? 0.6 : 1,
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              {generateMutation.isPending ? (
                <>
                  <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  Generating…
                </>
              ) : (
                "✨ Generate Dispute Letters"
              )}
            </button>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
