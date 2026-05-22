import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useFeatureAccess, FEATURES } from "@/hooks/use-feature-access";
import { useToast } from "@/hooks/use-toast";
import { useUserContext } from "@/hooks/use-user-context";
import { DisputeIQFlow, LetterPreviewDialog, BUREAU_COLORS, BUREAU_LABELS } from "@/components/dispute-iq-flow";
import { useArrayToken } from "@/hooks/use-array-token";
import { useArrayScript } from "@/hooks/use-array-script";

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
  bureau?: string;
  bureaus?: string[];
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

interface SavedLetter {
  id: number;
  bureau: string;
  letterType: string;
  status: string;
  trackingNumber: string | null;
  expectedDeliveryDate: string | null;
  sentDate: string | null;
  createdAt: string;
  content: string;
}

/* ── Violation badge colours ────────────────────────────────────────────────── */
function violationStyle(v: TradelineViolation): { bg: string; text: string; border: string } {
  if (v.category === "metro2") return { bg: "#fffbeb", text: "#92400e", border: "#fcd34d" };
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
function EmptyState({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div style={{ textAlign: "center", padding: "56px 24px" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontWeight: 600, fontSize: 16, color: "#111827", marginBottom: 6 }}>{title}</div>
      <div style={{ color: "#6b7280", fontSize: 14 }}>{description}</div>
    </div>
  );
}

/* ── Tier gate card ──────────────────────────────────────────────────────────── */
function LockedGate() {
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
        View Plans
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

/* ── Bureau badge ────────────────────────────────────────────────────────────── */
function BureauBadge({ bureau }: { bureau: string }) {
  const key = bureau.toUpperCase();
  const color = BUREAU_COLORS[key] || { bg: "#f3f4f6", text: "#374151", border: "#e5e7eb" };
  const label = BUREAU_LABELS[key] || bureau;
  return (
    <span style={{
      padding: "1px 7px", borderRadius: 4, fontSize: 10, fontWeight: 700,
      background: color.bg, color: color.text, border: `1px solid ${color.border}`,
      letterSpacing: "0.03em",
    }}>
      {label}
    </span>
  );
}

/* ── Account card ────────────────────────────────────────────────────────────── */
function AccountCard({
  tradeline,
  selected,
  locked,
  onToggle,
}: {
  tradeline: AnalyzedTradeline;
  selected: boolean;
  locked: boolean;
  onToggle: () => void;
}) {
  const sc = statusColor(tradeline.status);
  const lateTotal =
    (tradeline.latePayments?.days30 || 0) +
    (tradeline.latePayments?.days60 || 0) +
    (tradeline.latePayments?.days90 || 0);

  const metro2Violations = tradeline.violations.filter((v) => v.category === "metro2");
  const fcraViolations = tradeline.violations.filter((v) => v.category === "fcra");

  // Determine bureaus to display
  const displayBureaus: string[] = tradeline.bureaus?.length
    ? tradeline.bureaus
    : tradeline.bureau
    ? [tradeline.bureau]
    : [];

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
          {/* Row 1: creditor + status pill + bureau badges */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>{tradeline.creditor}</span>
            <span style={{ padding: "1px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: sc.bg, color: sc.text }}>
              {tradeline.status || "Unknown Status"}
            </span>
            {displayBureaus.map((b) => (
              <BureauBadge key={b} bureau={b} />
            ))}
          </div>

          {/* Row 2: meta info */}
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

          {/* Row 3: violation badges */}
          {tradeline.violations.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {metro2Violations.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "#6b7280", fontWeight: 700, marginRight: 2, minWidth: 52 }}>METRO 2:</span>
                  {metro2Violations.map((v) => <ViolationBadge key={v.code} v={v} />)}
                </div>
              )}
              {fcraViolations.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "#6b7280", fontWeight: 700, marginRight: 2, minWidth: 52 }}>FCRA:</span>
                  {fcraViolations.map((v) => <ViolationBadge key={v.code} v={v} />)}
                </div>
              )}
            </div>
          ) : (
            <span style={{ fontSize: 11, color: "#9ca3af", fontStyle: "italic" }}>No automated violations detected</span>
          )}
        </div>

        {/* Violation count bubble */}
        <div style={{
          flexShrink: 0, width: 38, height: 38, borderRadius: "50%",
          background: tradeline.violations.length > 0 ? "#fef3c7" : "#f3f4f6",
          border: `1.5px solid ${tradeline.violations.length > 0 ? "#fcd34d" : "#e5e7eb"}`,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 700,
          color: tradeline.violations.length > 0 ? "#92400e" : "#9ca3af",
        }}>
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

/* ── Bureau group header ──────────────────────────────────────────────────────── */
function BureauGroupHeader({ bureau, count }: { bureau: string; count: number }) {
  const key = bureau.toUpperCase();
  const color = BUREAU_COLORS[key] || BUREAU_COLORS["EXPERIAN"];
  const label = BUREAU_LABELS[key] || bureau;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, margin: "20px 0 8px",
      paddingBottom: 8, borderBottom: `2px solid ${color.border}`,
    }}>
      <span style={{
        padding: "3px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700,
        background: color.bg, color: color.text, border: `1px solid ${color.border}`,
      }}>
        {label}
      </span>
      <span style={{ fontSize: 12, color: "#6b7280" }}>{count} negative account{count !== 1 ? "s" : ""}</span>
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

/* ── Group tradelines by bureau ──────────────────────────────────────────────── */
function groupByBureau(tradelines: AnalyzedTradeline[]): Record<string, AnalyzedTradeline[]> {
  const groups: Record<string, AnalyzedTradeline[]> = {};
  const bureauOrder = ["EXPERIAN", "EQUIFAX", "TRANSUNION"];

  for (const t of tradelines) {
    const primaryBureau =
      (t.bureaus && t.bureaus.length > 0 ? t.bureaus[0] : t.bureau || "OTHER").toUpperCase();
    if (!groups[primaryBureau]) groups[primaryBureau] = [];
    groups[primaryBureau].push(t);
  }

  // Sort by preferred bureau order
  const sorted: Record<string, AnalyzedTradeline[]> = {};
  for (const b of bureauOrder) {
    if (groups[b]?.length) sorted[b] = groups[b];
  }
  for (const b of Object.keys(groups)) {
    if (!sorted[b]) sorted[b] = groups[b];
  }
  return sorted;
}

/* ── Shadow DOM credit report extractor ──────────────────────────────────────── */
// Parses the text content of the array-credit-report shadow DOM into tradelines.
// The web component renders each account as: CREDITOR\nReported: DATE\n$BALANCE\nSTATUS
function extractFromShadowDom(shadowRoot: ShadowRoot): TradelineResponse | null {
  // Use innerText if available (respects CSS display), else fall back to textContent
  const raw = (shadowRoot as any).innerText ?? shadowRoot.textContent ?? "";
  if (!raw || raw.length < 200) return null;

  const lines = raw.split("\n").map((l: string) => l.trim()).filter(Boolean);
  const tradelines: AnalyzedTradeline[] = [];
  const inquiries: { creditor: string; inquiryDate: string; inquiryType: string; suggestedDisputeReason: string }[] = [];

  let section: "accounts" | "inquiries" | "collections" | "other" = "accounts";
  let i = 0;

  const isAccountHeader = (l: string) =>
    /^(credit cards|auto loans|real estate|student loans|other|accounts)$/i.test(l);
  const isBalanceLine = (l: string) => /^\$[\d,]+\.\d{2}$/.test(l);
  const isDateLine = (l: string) => /\w{3,9} \d{1,2},?\s*\d{4}/.test(l);
  const isStatusLine = (l: string) =>
    /good standing|closed|outstanding|late|past due|delinquent|charged.?off|collection|settled/i.test(l);
  const isInquiryType = (l: string) =>
    /^(automotive|banking|finance|retail|utilities|credit card|mortgage|personal|other)$/i.test(l);

  // Heuristic: account creditor names are ALL-CAPS or TITLE case, 2-40 chars, no common UI strings
  const UI_WORDS = new Set([
    "Hard inquiries","Inquiries","Collections","Public records","Creditors","Account summary",
    "Balances","Payments","Open accounts","Closed accounts","Show All Summary","Expand All",
    "Credit cards","Auto loans","Real estate","Student loans","Other","Accounts",
    "Hide","Show","View Summary","Download PDF","All Bureaus","TransUnion","Equifax","Experian",
    "Credit report","Your credit is in excellent shape","Report date","VantageScore",
  ]);
  const isCreditorLine = (l: string) =>
    l.length >= 3 && l.length <= 50 &&
    /^[A-Z0-9][A-Z0-9\s/&.',-]{1,}$/i.test(l) &&
    !UI_WORDS.has(l) &&
    !/^\d+$/.test(l) &&
    !isBalanceLine(l) &&
    !isDateLine(l) &&
    !isStatusLine(l);

  while (i < lines.length) {
    const line = lines[i];

    if (/^hard inquiries$/i.test(line)) { section = "inquiries"; i++; continue; }
    if (/^collections$/i.test(line)) { section = "collections"; i++; continue; }
    if (/^public records$/i.test(line) || /^creditors$/i.test(line)) { section = "other"; i++; continue; }
    if (isAccountHeader(line)) { section = "accounts"; i++; continue; }

    if (section === "inquiries") {
      // Pattern: CREDITOR NAME\nTYPE\nDATE  or  CREDITOR NAME\nDATE
      if (isCreditorLine(line)) {
        const peek = lines.slice(i + 1, i + 4);
        const dateStr = peek.find(isDateLine) ?? "";
        if (dateStr) {
          inquiries.push({
            creditor: line,
            inquiryDate: dateStr,
            inquiryType: "hard",
            suggestedDisputeReason: "Unauthorized hard inquiry — no permissible purpose established (FCRA § 1681b)",
          });
          i += 2 + peek.indexOf(dateStr);
          continue;
        }
      }
    }

    if (section === "accounts" || section === "collections") {
      if (isCreditorLine(line)) {
        const window = lines.slice(i + 1, i + 8);
        const balance = window.find(isBalanceLine) ?? "0";
        const status = window.find(isStatusLine) ?? (section === "collections" ? "Outstanding" : "Unknown");
        const dateStr = window.find(l => /reported:/i.test(l))?.replace(/reported:\s*/i, "").trim()
          ?? window.find(isDateLine)
          ?? "";
        const isNeg = section === "collections" || !/good standing/i.test(status);
        tradelines.push({
          creditor: line,
          accountNumber: "Unknown",
          accountType: section === "collections" ? "collection" : "other",
          balance: balance.replace("$", "").replace(/,/g, ""),
          status,
          dateOpened: dateStr,
          dateOfFirstDelinquency: undefined,
          latePayments: { days30: 0, days60: 0, days90: 0 },
          violations: [],
          isDerogatory: isNeg,
          bureaus: ["EXPERIAN"],
        });
        i += Math.min(8, window.length) + 1;
        continue;
      }
    }

    i++;
  }

  if (tradelines.length === 0 && inquiries.length === 0) return null;

  const negativeTradelines = tradelines.filter(t => t.isDerogatory);
  return {
    enrolled: true,
    tradelines,
    negativeTradelines,
    inquiries,
    source: "array",
    reportFetchedAt: new Date().toISOString(),
  };
}

/* ── Main page ───────────────────────────────────────────────────────────────── */
export function DisputeIQPage({ onGenerateLetters, clientId }: { onGenerateLetters?: (items: AnalyzedTradeline[]) => void; clientId?: number | null }) {
  const { toast } = useToast();
  const { user } = useUserContext();
  const { tier, hasAnyPlan, disputeLimit } = useFeatureAccess(FEATURES.BASIC_DISPUTES);
  const [profileNudgeDismissed, setProfileNudgeDismissed] = useState(false);
  const { appKey, token: arrayToken, apiUrl, sandboxMode, isReady: tokenReady } = useArrayToken();
  const { loaded: scriptReady } = useArrayScript(appKey || undefined);

  // Show nudge if address is missing — so the flow pre-fills cleanly on first use
  const profileMissingAddress = hasAnyPlan && !profileNudgeDismissed && !(user?.addressLine1 && user?.city && user?.state && user?.zipCode);

  const [activeTab, setActiveTab] = useState<"analyze" | "letters">("analyze");
  const [previewLetter, setPreviewLetter] = useState<SavedLetter | null>(null);

  const { data: savedLetters = [], isLoading: lettersLoading } = useQuery<SavedLetter[]>({
    queryKey: ["/api/client/dispute-letters"],
    enabled: activeTab === "letters",
  });

  const [source, setSource] = useState<"array" | "upload" | null>(null);
  const [uploadResult, setUploadResult] = useState<TradelineResponse | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [showFlow, setShowFlow] = useState(false);

  // ── Credit file pull — server-side via /api/client/array/tradelines ─────────
  // The server tries the live credit API first, then falls back to the client's
  // most recently uploaded and parsed PDF credit report stored in the database.
  const tradelinesUrl = clientId
    ? `/api/client/array/tradelines?clientId=${clientId}`
    : "/api/client/array/tradelines";

  const {
    data: arrayData,
    isLoading: arrayLoading,
    error: arrayErrorRaw,
    refetch: refetchArray,
  } = useQuery<TradelineResponse>({
    queryKey: ["/api/client/array/tradelines", clientId ?? "self"],
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(tradelinesUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    enabled: source === "array",
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  const arrayError = arrayErrorRaw ? (arrayErrorRaw instanceof Error ? arrayErrorRaw : new Error(String(arrayErrorRaw))) : null;

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
      if (data.note) toast({ title: "Heads up", description: data.note });
    },
    onError: (err: Error) => {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    },
  });

  // ── Browser-side Array web component extraction ───────────────────────────
  // When "Pull from Credit File" is selected, we embed a hidden array-credit-report
  // web component. After it renders (5-10 sec), we read its open shadow DOM and
  // parse the credit accounts. This works even when the server-side REST API can't
  // reach Array's endpoints, because the web component fetches from the browser.
  const [browserExtracted, setBrowserExtracted] = useState<TradelineResponse | null>(null);
  const [browserExtracting, setBrowserExtracting] = useState(false);
  const extractionAttempted = useRef(false);
  const hiddenContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (source !== "array" || !scriptReady || !tokenReady || extractionAttempted.current) return;
    extractionAttempted.current = true;
    setBrowserExtracting(true);

    let settled = false;

    const tryExtract = (): TradelineResponse | null => {
      // 1. Shadow DOM of the hidden component
      const el = document.getElementById("__dispute-iq-array-hidden")
        ?.querySelector("array-credit-report") as any;
      if (el?.shadowRoot) {
        const text = (el.shadowRoot as any).innerText ?? el.shadowRoot.textContent ?? "";
        // Debug: log first 300 chars so we can see what the component renders
        if (text.length > 50) {
          console.debug("[DisputeIQ] shadowRoot text sample:", text.slice(0, 300));
        }
        const extracted = extractFromShadowDom(el.shadowRoot as ShadowRoot);
        if (extracted && (extracted.tradelines?.length ?? 0) + (extracted.inquiries?.length ?? 0) > 0) {
          return extracted;
        }
      }
      // 2. sessionStorage — web component sometimes caches JSON report data here
      try {
        const reportKeys = Object.keys(sessionStorage).filter(k =>
          k.includes("array-report") || k.includes("credmo-report")
        );
        for (const key of reportKeys) {
          const raw = sessionStorage.getItem(key);
          if (!raw) continue;
          try {
            const parsed = JSON.parse(raw);
            const accts = parsed?.accounts ?? parsed?.tradelines ?? parsed?.data?.accounts;
            if (Array.isArray(accts) && accts.length > 0) {
              return {
                enrolled: true,
                tradelines: accts,
                negativeTradelines: accts.filter((a: any) => a.isDerogatory),
                inquiries: [],
                source: "array",
                reportFetchedAt: new Date().toISOString(),
              };
            }
          } catch { /* not JSON */ }
        }
      } catch { /* sessionStorage blocked */ }
      return null;
    };

    const finish = (data: TradelineResponse | null) => {
      if (settled) return;
      settled = true;
      if (data) setBrowserExtracted(data);
      setBrowserExtracting(false);
    };

    // MutationObserver: fire as soon as the shadow DOM gets real content
    let observer: MutationObserver | null = null;
    const attachObserver = () => {
      const el = document.getElementById("__dispute-iq-array-hidden")
        ?.querySelector("array-credit-report") as any;
      if (!el) return false;
      // Watch the shadow root once it exists
      const watchShadow = () => {
        const root = el.shadowRoot;
        if (!root) return;
        observer = new MutationObserver(() => {
          const data = tryExtract();
          if (data) { observer?.disconnect(); finish(data); }
        });
        observer.observe(root, { childList: true, subtree: true });
      };
      if (el.shadowRoot) {
        watchShadow();
      } else {
        // shadowRoot not yet attached — watch the element itself for upgrades
        const outer = new MutationObserver(() => {
          if (el.shadowRoot) { outer.disconnect(); watchShadow(); }
        });
        outer.observe(el, { attributes: true, childList: true });
      }
      return true;
    };

    // Try attaching observer immediately; retry after short delay if the
    // element isn't in the DOM yet (React hasn't committed the ref yet)
    if (!attachObserver()) {
      setTimeout(attachObserver, 500);
    }

    // Hard timeout at 20s — stop waiting and show whatever we have
    const timeout = setTimeout(() => {
      observer?.disconnect();
      finish(tryExtract());
    }, 20000);

    return () => {
      settled = true;
      observer?.disconnect();
      clearTimeout(timeout);
    };
  }, [source, scriptReady, tokenReady]);

  // Reset extraction state when source changes
  useEffect(() => {
    if (source !== "array") {
      extractionAttempted.current = false;
      setBrowserExtracted(null);
      setBrowserExtracting(false);
    }
  }, [source]);

  // Browser-extracted data takes priority; server data is the fallback
  const activeData: TradelineResponse | null =
    source === "array"
      ? (browserExtracted || arrayData || null)
      : uploadResult;

  // isLoadingArray: true while either source is still running AND we have no data yet.
  // We keep showing the spinner even after the server finishes quickly (e.g. source:"none")
  // so the browser extraction has a chance to complete first.
  const serverHasRealData = !!arrayData && arrayData.source !== "none";
  const isLoadingArray = source === "array" && !browserExtracted && (
    arrayLoading ||
    browserExtracting ||
    // Scripts or token not ready yet — extraction hasn't started, keep spinner on
    (!extractionAttempted.current && !serverHasRealData)
  );

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
            description: `Your plan allows up to ${disputeLimit} accounts per dispute batch. Upgrade to Pro or Elite for unlimited.`,
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
      toast({ title: "No accounts selected", description: "Select at least one account first." });
      return;
    }
    if (onGenerateLetters) {
      onGenerateLetters(selectedTradelines);
    } else {
      setShowFlow(true);
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
        <LockedGate />
      </div>
    );
  }

  // ── Profile nudge banner (reusable) ──────────────────────────────────────
  const ProfileNudgeBanner = profileMissingAddress ? (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
      background: "#fffbeb", borderRadius: 10, border: "1px solid #fcd34d",
      marginBottom: 20, flexWrap: "wrap",
    }}>
      <span style={{ fontSize: 18 }}>📋</span>
      <div style={{ flex: 1, minWidth: 200 }}>
        <span style={{ fontWeight: 600, fontSize: 13, color: "#92400e" }}>Complete your profile — </span>
        <span style={{ fontSize: 13, color: "#b45309" }}>
          Add your mailing address so it pre-fills automatically when you generate dispute letters.
        </span>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
        <a
          href="/portal/profile"
          style={{
            padding: "6px 14px", borderRadius: 8, background: "#d97706", color: "#fff",
            fontSize: 12, fontWeight: 700, textDecoration: "none", display: "inline-block",
          }}
        >
          Update Profile →
        </a>
        <button
          onClick={() => setProfileNudgeDismissed(true)}
          style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0 }}
          title="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  ) : null;

  // ── Tab bar (Analyze / My Letters) ────────────────────────────────────────
  const TabBar = (
    <div style={{ display: "flex", borderBottom: "2px solid #e5e7eb", marginBottom: 24 }}>
      {(["analyze", "letters"] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          style={{
            padding: "10px 20px", fontSize: 13, fontWeight: 600, background: "none",
            border: "none", cursor: "pointer",
            color: activeTab === tab ? "#d97706" : "#6b7280",
            borderBottom: `2px solid ${activeTab === tab ? "#d97706" : "transparent"}`,
            marginBottom: -2,
          }}
        >
          {tab === "analyze" ? "Analyze" : "My Letters"}
        </button>
      ))}
    </div>
  );

  // ── My Letters view ───────────────────────────────────────────────────────
  const LETTER_TYPE_LABELS: Record<string, string> = {
    round1: "Round 1", round2: "Round 2", validation: "Debt Validation",
    goodwill: "Goodwill", inquiry: "Inquiry",
  };
  const LETTER_STATUS_STYLE: Record<string, { bg: string; color: string }> = {
    draft: { bg: "#f3f4f6", color: "#374151" },
    approved: { bg: "#eff6ff", color: "#1d4ed8" },
    sent: { bg: "#fffbeb", color: "#92400e" },
    mailed: { bg: "#f0fdf4", color: "#166534" },
    removed: { bg: "#fef2f2", color: "#b91c1c" },
    deleted: { bg: "#fef2f2", color: "#b91c1c" },
  };

  if (activeTab === "letters") {
    return (
      <div>
        <div className="cp-page-header">
          <div>
            <span className="cp-page-eyebrow">Credit Repair</span>
            <h1 className="cp-page-title">Dispute IQ</h1>
            <p className="cp-page-subtitle">All dispute letters you've generated.</p>
          </div>
          {disputeLimit !== null && (
            <div style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: "#fffbeb", color: "#92400e", border: "1px solid #fcd34d" }}>
              {tier.charAt(0).toUpperCase() + tier.slice(1)} plan · up to {disputeLimit} accounts
            </div>
          )}
        </div>

        {TabBar}

        {lettersLoading && (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <div style={{ width: 36, height: 36, border: "3px solid #e5e7eb", borderTopColor: "#d97706", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
            <div style={{ color: "#6b7280", fontSize: 14 }}>Loading your letters…</div>
          </div>
        )}

        {!lettersLoading && savedLetters.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>📬</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#374151", marginBottom: 8 }}>No letters yet</div>
            <div style={{ fontSize: 14, color: "#9ca3af", marginBottom: 24 }}>
              Generate your first dispute letter and it will appear here.
            </div>
            <button
              onClick={() => setActiveTab("analyze")}
              style={{ padding: "9px 20px", borderRadius: 8, background: "#d97706", color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
            >
              Start Analyzing →
            </button>
          </div>
        )}

        {!lettersLoading && savedLetters.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {savedLetters.map((ltr) => {
              const bColor = BUREAU_COLORS[ltr.bureau?.toUpperCase()] || BUREAU_COLORS["EXPERIAN"];
              const ss = LETTER_STATUS_STYLE[ltr.status] || LETTER_STATUS_STYLE.draft;
              const typeLabel = LETTER_TYPE_LABELS[ltr.letterType] || ltr.letterType;
              return (
                <div
                  key={ltr.id}
                  onClick={() => setPreviewLetter(ltr)}
                  style={{
                    background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12,
                    padding: "14px 18px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.07)")}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                >
                  <span style={{
                    padding: "3px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700,
                    background: bColor.bg, color: bColor.text, border: `1px solid ${bColor.border}`,
                    flexShrink: 0,
                  }}>
                    {BUREAU_LABELS[ltr.bureau?.toUpperCase()] || ltr.bureau}
                  </span>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{typeLabel} Letter</div>
                    <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                      {new Date(ltr.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </div>
                  <span style={{
                    padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: ss.bg, color: ss.color, flexShrink: 0,
                    textTransform: "uppercase", letterSpacing: "0.04em",
                  }}>
                    {ltr.status}
                  </span>
                  {ltr.trackingNumber && (
                    <a
                      href={`https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(ltr.trackingNumber)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        fontSize: 12, color: ltr.status === "mailed" ? "#166534" : "#6b7280",
                        fontWeight: ltr.status === "mailed" ? 600 : 400,
                        textDecoration: "underline", flexShrink: 0,
                        display: "flex", alignItems: "center", gap: 4,
                      }}
                    >
                      📦 {ltr.trackingNumber}
                    </a>
                  )}
                  <span style={{ color: "#d1d5db", fontSize: 18, flexShrink: 0 }}>›</span>
                </div>
              );
            })}
          </div>
        )}

        {previewLetter && (
          <LetterPreviewDialog
            letter={previewLetter.content}
            bureau={previewLetter.bureau}
            clientName={`${user?.firstName || ""} ${user?.lastName || ""}`.trim()}
            letterId={previewLetter.id}
            onClose={() => setPreviewLetter(null)}
            onTrack={() => setPreviewLetter(null)}
          />
        )}
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
            <div style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: "#fffbeb", color: "#92400e", border: "1px solid #fcd34d" }}>
              {tier.charAt(0).toUpperCase() + tier.slice(1)} plan · up to {disputeLimit} accounts
            </div>
          )}
        </div>

        {TabBar}
        {ProfileNudgeBanner}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 720, margin: "32px auto" }}>
          <button
            onClick={() => { setSource("array"); }}
            style={{
              background: "#fff", border: "2px solid #e5e7eb", borderRadius: 16,
              padding: "36px 24px", textAlign: "center", cursor: "pointer",
              transition: "all 0.15s", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 12,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#d97706"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px rgba(217,119,6,0.1)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
          >
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#111827", marginBottom: 4 }}>Pull from Credit File</div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>Fetch live 3-bureau data from your connected ScoreShift credit monitoring account</div>
            </div>
            <div style={{ padding: "4px 12px", borderRadius: 20, background: "#d97706", color: "#fff", fontSize: 11, fontWeight: 700 }}>RECOMMENDED</div>
          </button>

          <button
            onClick={() => setSource("upload")}
            style={{
              background: "#fff", border: "2px solid #e5e7eb", borderRadius: 16,
              padding: "36px 24px", textAlign: "center", cursor: "pointer",
              transition: "all 0.15s", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 12,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#6366f1"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
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

        {TabBar}

        {ProfileNudgeBanner}

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
  // isLoading: show spinner while either the server query OR the browser extraction is running
  const isLoading = source === "array" && isLoadingArray && !browserExtracted;
  // Only show error if the server failed AND the browser extraction also produced nothing
  const isError = source === "array" && !!arrayError && !browserExtracted && !browserExtracting;
  const errorMessage = arrayError instanceof Error ? arrayError.message : String(arrayError || "");
  const notEnrolled = errorMessage.includes("enrolled") || errorMessage.includes("404");

  const bureauGroups = groupByBureau(negativeTradelines);
  const hasBureauData = Object.keys(bureauGroups).some((b) => b !== "OTHER");

  return (
    <div style={{ paddingBottom: selectedKeys.size > 0 ? 108 : 0 }}>
      {/* Page header */}
      <div className="cp-page-header">
        <div>
          <span className="cp-page-eyebrow">Credit Repair</span>
          <h1 className="cp-page-title">Dispute IQ</h1>
          <p className="cp-page-subtitle">
            {source === "array"
              ? activeData?.source === "credit_file"
                ? `Pulled from your credit file · ${activeData.fileName || "uploaded report"}${activeData.bureau ? ` · ${activeData.bureau.charAt(0) + activeData.bureau.slice(1).toLowerCase()}` : ""}`
                : activeData?.source === "none"
                ? "No credit report on file — upload a PDF to get started."
                : "Analyzing your 3-bureau credit file…"
              : `PDF analysis · ${activeData?.fileName || "uploaded report"}`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {disputeLimit !== null && (
            <div style={{ padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "#fffbeb", color: "#92400e", border: "1px solid #fcd34d" }}>
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
              onClick={() => {
                setBrowserExtracted(null);
                extractionAttempted.current = false;
                refetchArray();
              }}
              disabled={isLoadingArray}
              style={{ background: "#d97706", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, opacity: isLoadingArray ? 0.6 : 1 }}
            >
              {isLoadingArray ? "Refreshing…" : "↻ Refresh"}
            </button>
          )}
        </div>
      </div>

      {TabBar}
      {ProfileNudgeBanner}

      {/* Hidden array-credit-report web component — loads in background so we can
          extract data from its shadow DOM once it renders. Never shown to the user.
          The inner div is created imperatively via useEffect to avoid JSX conflicts
          with unregistered custom elements. */}
      {source === "array" && scriptReady && tokenReady && arrayToken && appKey && (
        <div
          id="__dispute-iq-array-hidden"
          ref={(node) => {
            hiddenContainerRef.current = node;
            // Imperatively append the web component exactly once
            if (node && !node.querySelector("array-credit-report")) {
              const el = document.createElement("array-credit-report");
              el.setAttribute("appKey", appKey!);
              el.setAttribute("userToken", arrayToken!);
              if (sandboxMode) {
                el.setAttribute("apiUrl", apiUrl || "https://mock.array.io");
                el.setAttribute("sandbox", "true");
              }
              node.appendChild(el);
            }
          }}
          aria-hidden="true"
          style={{ position: "fixed", left: -15000, top: -15000, width: 1280, height: 900, overflow: "hidden", pointerEvents: "none", zIndex: -1 }}
        />
      )}

      {/* Loading */}
      {isLoading && (
        <div style={{ textAlign: "center", padding: "72px 24px" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #e5e7eb", borderTopColor: "#d97706", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <div style={{ fontWeight: 600, color: "#374151" }}>Analyzing your credit file…</div>
          <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 6 }}>Reading your credit report — this takes a few seconds…</div>
        </div>
      )}

      {/* Not enrolled */}
      {!isLoading && isError && notEnrolled && (
        <div style={{ maxWidth: 560, margin: "32px auto" }}>
          <div style={{ background: "#fffbeb", border: "1.5px solid #fcd34d", borderRadius: 12, padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📡</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#92400e", marginBottom: 8 }}>Credit Monitoring Not Connected</div>
            <div style={{ fontSize: 13, color: "#78350f", marginBottom: 16 }}>
              Connect your ScoreShift credit monitoring account first to pull live 3-bureau data.
            </div>
            <a href="/portal" style={{ color: "#d97706", fontWeight: 600, fontSize: 13 }}>Go to Credit Monitoring →</a>
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
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              {[
                { value: negativeTradelines.length, label: "Negative Accounts", color: "#dc2626" },
                { value: negativeTradelines.reduce((a, t) => a + t.violations.length, 0), label: "Total Violations", color: "#d97706" },
                { value: negativeTradelines.filter((t) => t.violations.some((v) => v.category === "fcra")).length, label: "FCRA Issues", color: "#1e40af" },
                { value: selectedKeys.size, label: `Selected${disputeLimit !== null ? ` / ${disputeLimit}` : ""}`, color: "#7c3aed" },
              ].map(({ value, label, color }) => (
                <div key={label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "10px 18px", flex: 1, minWidth: 110 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
                  <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 500 }}>{label}</div>
                </div>
              ))}
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
                Click a card to select it for disputing
              </span>
            </div>
          )}

          {/* Account cards */}
          {negativeTradelines.length === 0 ? (
            activeData?.source === "none" ? (
              <EmptyState
                icon="📄"
                title="No Credit Report on File"
                description={activeData.note || "Upload a PDF credit report below to analyze your accounts and generate dispute letters."}
              />
            ) : (
            <EmptyState
              icon="✅"
              title="No Negative Accounts Found"
              description="Great news — no derogatory items were detected. Check back after your next credit pull."
            />
            )
          ) : hasBureauData ? (
            /* Grouped by bureau */
            Object.entries(bureauGroups).map(([bureau, tradelines]) => (
              <div key={bureau}>
                <BureauGroupHeader bureau={bureau} count={tradelines.length} />
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {tradelines.map((tradeline) => {
                    const globalIndex = negativeTradelines.indexOf(tradeline);
                    const key = `${tradeline.creditor}_${globalIndex}`;
                    const isSelected = selectedKeys.has(key);
                    const isLocked = !isSelected && disputeLimit !== null && selectedKeys.size >= disputeLimit;
                    return (
                      <AccountCard
                        key={key}
                        tradeline={tradeline}
                        selected={isSelected}
                        locked={isLocked}
                        onToggle={() => toggleSelect(key)}
                      />
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            /* Flat list (no bureau data) */
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {negativeTradelines.map((tradeline, i) => {
                const key = `${tradeline.creditor}_${i}`;
                const isSelected = selectedKeys.has(key);
                const isLocked = !isSelected && disputeLimit !== null && selectedKeys.size >= disputeLimit;
                return (
                  <AccountCard
                    key={key}
                    tradeline={tradeline}
                    selected={isSelected}
                    locked={isLocked}
                    onToggle={() => toggleSelect(key)}
                  />
                );
              })}
            </div>
          )}

          {activeData?.reportFetchedAt && (
            <div style={{ marginTop: 16, fontSize: 11, color: "#9ca3af", textAlign: "right" }}>
              Report pulled {new Date(activeData.reportFetchedAt).toLocaleString()}
            </div>
          )}
        </>
      )}

      {/* Sticky bottom bar */}
      {selectedKeys.size > 0 && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "#1f2937", color: "#fff", borderRadius: 16,
          padding: "14px 24px", display: "flex", alignItems: "center", gap: 20,
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)", zIndex: 100,
          maxWidth: "calc(100vw - 48px)",
        }}>
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

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {showFlow && (
        <DisputeIQFlow
          selectedAccounts={selectedTradelines}
          onClose={() => setShowFlow(false)}
          onDisputeCreated={() => setShowFlow(false)}
        />
      )}
    </div>
  );
}
