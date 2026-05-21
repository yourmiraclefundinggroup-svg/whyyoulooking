import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useFeatureAccess, FEATURES } from "@/hooks/use-feature-access";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

/* ── Types ──────────────────────────────────────────────────────────────────── */
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
}

interface TradelineResponse {
  enrolled?: boolean;
  tradelines?: AnalyzedTradeline[];
  negativeTradelines?: AnalyzedTradeline[];
  inquiries?: { creditor: string; inquiryDate: string; inquiryType: string }[];
  reportFetchedAt?: string;
  source?: string;
  fileName?: string;
  note?: string;
}

/* ── Violation badge colours ────────────────────────────────────────────────── */
function violationStyle(v: TradelineViolation): { bg: string; text: string; border: string } {
  if (v.category === "metro2") return { bg: "#fffbeb", text: "#92400e", border: "#fcd34d" };
  // fcra
  if (v.code.includes("1681C") || v.code.includes("REAGING")) {
    return { bg: "#fef2f2", text: "#991b1b", border: "#fca5a5" };
  }
  return { bg: "#eff6ff", text: "#1e40af", border: "#93c5fd" };
}

/* ── Status pill colour ─────────────────────────────────────────────────────── */
function statusColor(status: string): { bg: string; text: string } {
  const s = (status || "").toLowerCase();
  if (s.includes("collection")) return { bg: "#fef2f2", text: "#991b1b" };
  if (s.includes("charge")) return { bg: "#7f1d1d", text: "#fee2e2" };
  if (s.includes("late") || s.includes("past due")) return { bg: "#fff7ed", text: "#9a3412" };
  if (s.includes("default") || s.includes("written off")) return { bg: "#fdf4ff", text: "#6b21a8" };
  if (s.includes("settled")) return { bg: "#f0fdf4", text: "#166534" };
  return { bg: "#f9fafb", text: "#374151" };
}

/* ── Empty state ─────────────────────────────────────────────────────────────── */
function EmptyState({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div style={{ textAlign: "center", padding: "56px 24px" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontWeight: 600, fontSize: 16, color: "var(--cp-text-primary, #111827)", marginBottom: 6 }}>{title}</div>
      <div style={{ color: "var(--cp-text-muted, #6b7280)", fontSize: 14 }}>{sub}</div>
    </div>
  );
}

/* ── Tier gate card ──────────────────────────────────────────────────────────── */
function LockedGate({ upgradeLabel }: { upgradeLabel: string | null }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 16, padding: "72px 32px", background: "#f9fafb", borderRadius: 16,
      border: "2px dashed #e5e7eb",
    }}>
      <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      <div style={{ fontWeight: 700, fontSize: 18, color: "#374151" }}>Dispute IQ is Locked</div>
      <div style={{ color: "#6b7280", fontSize: 14, textAlign: "center", maxWidth: 380 }}>
        Dispute IQ analyzes your credit report for Metro 2 violations and FCRA errors. A subscription plan is required to access this feature.
      </div>
      <a
        href="/pricing"
        style={{
          display: "inline-block", padding: "10px 24px", borderRadius: 8,
          background: "#d97706", color: "#fff", fontWeight: 600, fontSize: 14,
          textDecoration: "none",
        }}
      >
        {upgradeLabel || "View Plans"}
      </a>
    </div>
  );
}

/* ── Violation badge ─────────────────────────────────────────────────────────── */
function ViolationBadge({ v }: { v: TradelineViolation }) {
  const style = violationStyle(v);
  return (
    <span
      title={v.statute}
      style={{
        display: "inline-block", padding: "2px 8px", borderRadius: 4,
        fontSize: 11, fontWeight: 600, letterSpacing: "0.02em",
        background: style.bg, color: style.text,
        border: `1px solid ${style.border}`,
        cursor: "default",
      }}
    >
      {v.label}
    </span>
  );
}

/* ── Account card ────────────────────────────────────────────────────────────── */
function AccountCard({
  tradeline,
  selected,
  locked,
  onToggle,
  index,
}: {
  tradeline: AnalyzedTradeline;
  selected: boolean;
  locked: boolean;
  onToggle: () => void;
  index: number;
}) {
  const sc = statusColor(tradeline.status);
  const lateTotal =
    (tradeline.latePayments?.days30 || 0) +
    (tradeline.latePayments?.days60 || 0) +
    (tradeline.latePayments?.days90 || 0);

  const metro2Violations = tradeline.violations.filter((v) => v.category === "metro2");
  const fcraViolations = tradeline.violations.filter((v) => v.category === "fcra");

  return (
    <div
      onClick={!locked ? onToggle : undefined}
      style={{
        background: "#fff",
        border: `2px solid ${selected ? "#d97706" : "#e5e7eb"}`,
        borderRadius: 12,
        padding: "18px 20px",
        cursor: locked ? "default" : "pointer",
        transition: "border-color 0.15s, box-shadow 0.15s",
        boxShadow: selected ? "0 0 0 3px rgba(217,119,6,0.12)" : "0 1px 3px rgba(0,0,0,0.06)",
        opacity: locked && !selected ? 0.6 : 1,
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {/* Checkbox */}
        <div
          style={{
            width: 20, height: 20, borderRadius: 4, flexShrink: 0, marginTop: 2,
            border: `2px solid ${selected ? "#d97706" : "#d1d5db"}`,
            background: selected ? "#d97706" : "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}
        >
          {selected && (
            <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Creditor + status */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>{tradeline.creditor}</span>
            <span
              style={{
                padding: "1px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600,
                background: sc.bg, color: sc.text,
              }}
            >
              {tradeline.status || "Unknown Status"}
            </span>
          </div>

          {/* Meta line */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: "#6b7280" }}>
              <strong style={{ color: "#374151" }}>Acct:</strong> ••••{tradeline.accountNumber.slice(-4)}
            </span>
            <span style={{ fontSize: 12, color: "#6b7280" }}>
              <strong style={{ color: "#374151" }}>Type:</strong> {tradeline.accountType || "—"}
            </span>
            {tradeline.balance && tradeline.balance !== "0" && (
              <span style={{ fontSize: 12, color: "#6b7280" }}>
                <strong style={{ color: "#374151" }}>Balance:</strong>{" "}
                ${parseFloat(tradeline.balance).toLocaleString()}
              </span>
            )}
            {tradeline.dateOfFirstDelinquency && (
              <span style={{ fontSize: 12, color: "#6b7280" }}>
                <strong style={{ color: "#374151" }}>DOFD:</strong> {tradeline.dateOfFirstDelinquency}
              </span>
            )}
            {lateTotal > 0 && (
              <span style={{ fontSize: 12, color: "#9a3412" }}>
                <strong>Late × {lateTotal}</strong>
                {tradeline.latePayments?.days30 ? ` (${tradeline.latePayments.days30}×30d)` : ""}
                {tradeline.latePayments?.days60 ? ` (${tradeline.latePayments.days60}×60d)` : ""}
                {tradeline.latePayments?.days90 ? ` (${tradeline.latePayments.days90}×90d)` : ""}
              </span>
            )}
          </div>

          {/* Violation badges */}
          {tradeline.violations.length > 0 && (
            <div>
              {metro2Violations.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: "#6b7280", alignSelf: "center", marginRight: 2, fontWeight: 600 }}>METRO 2:</span>
                  {metro2Violations.map((v) => (
                    <ViolationBadge key={v.code} v={v} />
                  ))}
                </div>
              )}
              {fcraViolations.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  <span style={{ fontSize: 10, color: "#6b7280", alignSelf: "center", marginRight: 2, fontWeight: 600 }}>FCRA:</span>
                  {fcraViolations.map((v) => (
                    <ViolationBadge key={v.code} v={v} />
                  ))}
                </div>
              )}
            </div>
          )}

          {tradeline.violations.length === 0 && (
            <span style={{ fontSize: 11, color: "#9ca3af", fontStyle: "italic" }}>No automated violations detected</span>
          )}
        </div>

        {/* Violation count bubble */}
        <div
          style={{
            flexShrink: 0, width: 36, height: 36, borderRadius: "50%",
            background: tradeline.violations.length > 0 ? "#fef3c7" : "#f3f4f6",
            border: `1.5px solid ${tradeline.violations.length > 0 ? "#fcd34d" : "#e5e7eb"}`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700,
            color: tradeline.violations.length > 0 ? "#92400e" : "#9ca3af",
          }}
        >
          {tradeline.violations.length}
          <span style={{ fontSize: 8, fontWeight: 400, lineHeight: 1 }}>issues</span>
        </div>
      </div>

      {locked && !selected && (
        <div style={{ marginTop: 8, fontSize: 11, color: "#d97706", textAlign: "right" }}>
          Upgrade to select more accounts
        </div>
      )}
    </div>
  );
}

/* ── PDF drop zone ───────────────────────────────────────────────────────────── */
function DropZone({ onFile }: { onFile: (f: File) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${dragging ? "#d97706" : "#d1d5db"}`,
        borderRadius: 12, padding: "48px 24px", textAlign: "center",
        cursor: "pointer", transition: "all 0.15s",
        background: dragging ? "#fffbeb" : "#fafafa",
      }}
    >
      <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke={dragging ? "#d97706" : "#9ca3af"}
        strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 12px" }}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      <div style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>
        Drop your credit report PDF here
      </div>
      <div style={{ fontSize: 13, color: "#9ca3af" }}>or click to browse · PDF only · max 20MB</div>
      <input ref={inputRef} type="file" accept=".pdf,application/pdf" style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────────── */
export function DisputeIQPage({ onGenerateLetters }: { onGenerateLetters?: (items: AnalyzedTradeline[]) => void }) {
  const { toast } = useToast();
  const { tier, hasAnyPlan, disputeLimit } = useFeatureAccess(FEATURES.BASIC_DISPUTES);

  const [source, setSource] = useState<"array" | "upload" | null>(null);
  const [uploadResult, setUploadResult] = useState<TradelineResponse | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  // ── Array pull query ──────────────────────────────────────────────────────
  const {
    data: arrayData,
    isFetching: arrayLoading,
    error: arrayError,
    refetch: refetchArray,
  } = useQuery<TradelineResponse>({
    queryKey: ["/api/client/array/tradelines"],
    enabled: source === "array",
    staleTime: 5 * 60 * 1000,
  });

  // ── PDF upload mutation ───────────────────────────────────────────────────
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const authToken = localStorage.getItem("auth_token");
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/client/credit-report/upload", {
        method: "POST",
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error || "Upload failed");
      }
      return res.json() as Promise<TradelineResponse>;
    },
    onSuccess: (data) => {
      setUploadResult(data);
      setSelectedKeys(new Set());
      if (data.note) {
        toast({ title: "Heads up", description: data.note });
      }
    },
    onError: (err: Error) => {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    },
  });

  // Active data comes from whichever source is selected
  const activeData: TradelineResponse | null =
    source === "array" ? (arrayData || null) : uploadResult;

  const negativeTradelines: AnalyzedTradeline[] = activeData?.negativeTradelines || [];

  // ── Selection logic with tier enforcement ─────────────────────────────────
  const toggleSelect = (key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        if (disputeLimit !== null && next.size >= disputeLimit) {
          toast({
            title: `${tier === "starter" ? "Starter" : "Plan"} limit reached`,
            description: `Your plan allows up to ${disputeLimit} accounts per dispute. Upgrade to Pro or Elite for unlimited.`,
          });
          return prev;
        }
        next.add(key);
      }
      return next;
    });
  };

  const selectedTradelines = negativeTradelines.filter((_, i) =>
    selectedKeys.has(`${_.creditor}_${i}`)
  );

  const handleGenerate = () => {
    if (selectedTradelines.length === 0) {
      toast({ title: "No accounts selected", description: "Check at least one account before generating dispute letters." });
      return;
    }
    if (onGenerateLetters) {
      onGenerateLetters(selectedTradelines);
    } else {
      toast({ title: "Coming soon", description: "Letter generation will be available shortly (Task #135)." });
    }
  };

  // ── Locked state ──────────────────────────────────────────────────────────
  if (!hasAnyPlan) {
    return (
      <div>
        <div className="cp-page-header">
          <div>
            <span className="cp-page-eyebrow">Credit Repair</span>
            <h1 className="cp-page-title">Dispute IQ</h1>
            <p className="cp-page-subtitle">AI-powered credit report analysis and violation detection.</p>
          </div>
        </div>
        <LockedGate upgradeLabel="View Plans" />
      </div>
    );
  }

  // ── Source selection screen ───────────────────────────────────────────────
  if (!source) {
    return (
      <div>
        <div className="cp-page-header">
          <div>
            <span className="cp-page-eyebrow">Credit Repair</span>
            <h1 className="cp-page-title">Dispute IQ</h1>
            <p className="cp-page-subtitle">
              Analyze your credit report for Metro 2 violations and FCRA errors — then select accounts to dispute.
            </p>
          </div>
          {disputeLimit !== null && (
            <div style={{
              padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
              background: "#fffbeb", color: "#92400e", border: "1px solid #fcd34d",
            }}>
              {tier.charAt(0).toUpperCase() + tier.slice(1)} plan · up to {disputeLimit} accounts
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 720, margin: "32px auto" }}>
          {/* Array pull option */}
          <button
            onClick={() => { setSource("array"); refetchArray(); }}
            style={{
              background: "#fff", border: "2px solid #e5e7eb", borderRadius: 16,
              padding: "36px 24px", textAlign: "center", cursor: "pointer",
              transition: "all 0.15s", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 12,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#d97706";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px rgba(217,119,6,0.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10" />
                <path d="M16 12l-4-4-4 4M12 8v8" />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#111827", marginBottom: 4 }}>Pull from Credit File</div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>Fetch live 3-bureau data from your connected Array credit monitoring account</div>
            </div>
            <div style={{ padding: "4px 12px", borderRadius: 20, background: "#d97706", color: "#fff", fontSize: 11, fontWeight: 700 }}>
              RECOMMENDED
            </div>
          </button>

          {/* Upload option */}
          <button
            onClick={() => setSource("upload")}
            style={{
              background: "#fff", border: "2px solid #e5e7eb", borderRadius: 16,
              padding: "36px 24px", textAlign: "center", cursor: "pointer",
              transition: "all 0.15s", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 12,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#6366f1";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="11" x2="12" y2="17" />
                <polyline points="9 14 12 11 15 14" />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#111827", marginBottom: 4 }}>Upload Credit Report PDF</div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>Upload a PDF credit report from AnnualCreditReport.com or your monitoring service</div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // ── Upload screen ─────────────────────────────────────────────────────────
  if (source === "upload" && !uploadResult) {
    return (
      <div>
        <div className="cp-page-header">
          <div>
            <span className="cp-page-eyebrow">Credit Repair</span>
            <h1 className="cp-page-title">Dispute IQ — Upload Report</h1>
          </div>
          <button onClick={() => setSource(null)} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 16px", cursor: "pointer", fontSize: 13, color: "#374151" }}>
            ← Back
          </button>
        </div>

        <div style={{ maxWidth: 580, margin: "0 auto" }}>
          {uploadMutation.isPending ? (
            <div style={{ textAlign: "center", padding: "56px 24px" }}>
              <div style={{ width: 40, height: 40, border: "3px solid #e5e7eb", borderTopColor: "#d97706", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
              <div style={{ fontWeight: 600, color: "#374151" }}>Analyzing your credit report…</div>
              <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 6 }}>This may take up to 30 seconds</div>
            </div>
          ) : (
            <DropZone onFile={(file) => uploadMutation.mutate(file)} />
          )}
        </div>
      </div>
    );
  }

  // ── Results screen ────────────────────────────────────────────────────────
  const isLoading = source === "array" && arrayLoading;
  const isError = source === "array" && !!arrayError;
  const errorMessage = arrayError instanceof Error ? arrayError.message : "";
  const notEnrolled = errorMessage.includes("enrolled") || errorMessage.includes("404");

  return (
    <div style={{ paddingBottom: selectedKeys.size > 0 ? 100 : 0 }}>
      {/* Page header */}
      <div className="cp-page-header">
        <div>
          <span className="cp-page-eyebrow">Credit Repair</span>
          <h1 className="cp-page-title">Dispute IQ</h1>
          <p className="cp-page-subtitle">
            {source === "array"
              ? "Live 3-bureau analysis from your connected credit file."
              : `PDF analysis · ${activeData?.fileName || "uploaded report"}`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {disputeLimit !== null && (
            <div style={{
              padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
              background: "#fffbeb", color: "#92400e", border: "1px solid #fcd34d",
            }}>
              {tier.charAt(0).toUpperCase() + tier.slice(1)} · max {disputeLimit} selected
            </div>
          )}
          <button
            onClick={() => { setSource(null); setUploadResult(null); setSelectedKeys(new Set()); }}
            style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 13, color: "#374151" }}
          >
            ← Change Source
          </button>
          {source === "array" && (
            <button
              onClick={() => refetchArray()}
              disabled={arrayLoading}
              style={{
                background: "#d97706", color: "#fff", border: "none", borderRadius: 8,
                padding: "7px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600,
                opacity: arrayLoading ? 0.6 : 1,
              }}
            >
              {arrayLoading ? "Refreshing…" : "↻ Refresh"}
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ textAlign: "center", padding: "72px 24px" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #e5e7eb", borderTopColor: "#d97706", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <div style={{ fontWeight: 600, color: "#374151" }}>Pulling your credit data…</div>
          <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 6 }}>Fetching 3-bureau report from Array</div>
        </div>
      )}

      {/* Not enrolled */}
      {!isLoading && isError && notEnrolled && (
        <div style={{ maxWidth: 560, margin: "32px auto" }}>
          <div style={{ background: "#fffbeb", border: "1.5px solid #fcd34d", borderRadius: 12, padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📡</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#92400e", marginBottom: 8 }}>Credit Monitoring Not Connected</div>
            <div style={{ fontSize: 13, color: "#78350f", marginBottom: 16 }}>
              Connect your Array credit monitoring account first to pull live 3-bureau data here.
            </div>
            <a href="/portal" style={{ color: "#d97706", fontWeight: 600, fontSize: 13 }}>
              Go to Credit Monitoring → 
            </a>
          </div>
        </div>
      )}

      {/* Other errors */}
      {!isLoading && isError && !notEnrolled && (
        <EmptyState icon="⚠️" title="Could not load credit data" description={errorMessage || "An unexpected error occurred. Please try again."} />
      )}

      {/* Results */}
      {!isLoading && !isError && (
        <>
          {/* Summary bar */}
          {negativeTradelines.length > 0 && (
            <div style={{
              display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap",
            }}>
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "10px 18px", flex: 1, minWidth: 120 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#dc2626" }}>{negativeTradelines.length}</div>
                <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 500 }}>Negative Accounts</div>
              </div>
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "10px 18px", flex: 1, minWidth: 120 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#d97706" }}>
                  {negativeTradelines.reduce((a, t) => a + t.violations.length, 0)}
                </div>
                <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 500 }}>Total Violations</div>
              </div>
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "10px 18px", flex: 1, minWidth: 120 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#1e40af" }}>
                  {negativeTradelines.filter((t) => t.violations.some((v) => v.category === "fcra")).length}
                </div>
                <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 500 }}>FCRA Violations</div>
              </div>
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "10px 18px", flex: 1, minWidth: 120 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#7c3aed" }}>
                  {selectedKeys.size}
                </div>
                <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 500 }}>
                  Selected
                  {disputeLimit !== null ? ` / ${disputeLimit}` : ""}
                </div>
              </div>
            </div>
          )}

          {/* Select all / deselect all */}
          {negativeTradelines.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center" }}>
              <button
                onClick={() => {
                  const limit = disputeLimit ?? negativeTradelines.length;
                  const keys = negativeTradelines.slice(0, limit).map((t, i) => `${t.creditor}_${i}`);
                  setSelectedKeys(new Set(keys));
                }}
                style={{ fontSize: 12, color: "#d97706", background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: "4px 0" }}
              >
                Select {disputeLimit !== null ? `top ${disputeLimit}` : "all"}
              </button>
              {selectedKeys.size > 0 && (
                <>
                  <span style={{ color: "#d1d5db" }}>·</span>
                  <button
                    onClick={() => setSelectedKeys(new Set())}
                    style={{ fontSize: 12, color: "#6b7280", background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}
                  >
                    Deselect all
                  </button>
                </>
              )}
              <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: "auto" }}>
                Click an account card to select it for disputing
              </span>
            </div>
          )}

          {/* Account cards */}
          {negativeTradelines.length === 0 ? (
            <EmptyState
              icon="✅"
              title="No Negative Accounts Found"
              description="Great news — no derogatory items were detected in your credit report. Check back after your next credit pull."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {negativeTradelines.map((tradeline, i) => {
                const key = `${tradeline.creditor}_${i}`;
                const isSelected = selectedKeys.has(key);
                const isLocked =
                  !isSelected &&
                  disputeLimit !== null &&
                  selectedKeys.size >= disputeLimit;

                return (
                  <AccountCard
                    key={key}
                    tradeline={tradeline}
                    selected={isSelected}
                    locked={isLocked}
                    onToggle={() => toggleSelect(key)}
                    index={i}
                  />
                );
              })}
            </div>
          )}

          {/* Report timestamp */}
          {activeData?.reportFetchedAt && (
            <div style={{ marginTop: 16, fontSize: 11, color: "#9ca3af", textAlign: "right" }}>
              Report pulled {new Date(activeData.reportFetchedAt).toLocaleString()}
            </div>
          )}
        </>
      )}

      {/* Sticky bottom bar */}
      {selectedKeys.size > 0 && (
        <div
          style={{
            position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
            background: "#1f2937", color: "#fff", borderRadius: 16,
            padding: "14px 24px", display: "flex", alignItems: "center", gap: 20,
            boxShadow: "0 8px 32px rgba(0,0,0,0.25)", zIndex: 100,
            maxWidth: "calc(100vw - 48px)",
          }}
        >
          <div>
            <span style={{ fontWeight: 700, fontSize: 16 }}>{selectedKeys.size}</span>
            <span style={{ fontSize: 13, color: "#9ca3af", marginLeft: 4 }}>
              account{selectedKeys.size !== 1 ? "s" : ""} selected
            </span>
          </div>
          <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 6, maxWidth: 300, overflow: "hidden" }}>
            {selectedTradelines.slice(0, 3).map((t, i) => (
              <span key={i} style={{ fontSize: 11, background: "#374151", padding: "2px 8px", borderRadius: 4, color: "#d1d5db" }}>
                {t.creditor.slice(0, 18)}{t.creditor.length > 18 ? "…" : ""}
              </span>
            ))}
            {selectedTradelines.length > 3 && (
              <span style={{ fontSize: 11, color: "#9ca3af" }}>+{selectedTradelines.length - 3} more</span>
            )}
          </div>
          <button
            onClick={handleGenerate}
            style={{
              background: "#d97706", color: "#fff", border: "none", borderRadius: 10,
              padding: "10px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer",
              whiteSpace: "nowrap", flexShrink: 0,
            }}
          >
            Generate Dispute Letters →
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
