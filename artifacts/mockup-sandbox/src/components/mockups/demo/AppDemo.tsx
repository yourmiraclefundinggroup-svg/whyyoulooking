import { useState, useEffect, useRef } from "react";

// ── Array sandbox constants (same as client/src/hooks/use-array-script.ts) ──
const ARRAY_APP_KEY   = "3F03D20E-5311-43D8-8A76-E4B5D77793BD";
const ARRAY_API_URL   = "https://mock.array.io";
const ARRAY_TOKEN     = "AD45C4BF-5C0A-40B3-8A53-ED29D091FA11";

// ── Load all Array web component scripts once ────────────────────────────────
const ARRAY_SCRIPTS = [
  "array-credit-overview",
  "array-credit-report",
  "array-credit-score",
  "array-credit-debt-analysis",
  "array-credit-score-simulator",
  "array-credit-alerts",
];

let scriptsLoaded = false;
let loadedCount = 0;
const loadListeners: Array<() => void> = [];

function loadArrayScripts(onReady: () => void) {
  if (scriptsLoaded) { onReady(); return; }
  const total = ARRAY_SCRIPTS.length;
  loadListeners.push(onReady);
  if (loadedCount >= total) { scriptsLoaded = true; loadListeners.forEach(fn => fn()); return; }

  ARRAY_SCRIPTS.forEach(name => {
    if (document.querySelector(`script[data-array="${name}"]`)) { loadedCount++; return; }
    const s = document.createElement("script");
    s.src = `https://embed.array.io/cms/${name}.js?appKey=${ARRAY_APP_KEY}`;
    s.dataset.array = name;
    const settle = () => {
      loadedCount++;
      if (loadedCount >= total) { scriptsLoaded = true; loadListeners.forEach(fn => fn()); }
    };
    s.onload = settle;
    s.onerror = settle;
    document.head.appendChild(s);
  });
}

// ── Array web component wrapper ───────────────────────────────────────────────
function ArrayBlock({
  tag,
  ready,
  attrs = {},
  minHeight = 280,
}: {
  tag: string;
  ready: boolean;
  attrs?: Record<string, string>;
  minHeight?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ready || !ref.current) return;
    ref.current.innerHTML = "";
    const el = document.createElement(tag);
    el.setAttribute("appKey",    ARRAY_APP_KEY);
    el.setAttribute("userToken", ARRAY_TOKEN);
    el.setAttribute("apiUrl",    ARRAY_API_URL);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    ref.current.appendChild(el);
    return () => { if (ref.current) ref.current.innerHTML = ""; };
  }, [tag, ready]);

  return (
    <div
      ref={ref}
      style={{
        minHeight,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: ready ? "transparent" : "#F1E8DA",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {!ready && (
        <span style={{ fontSize: 12, color: "#8B8480" }}>Loading {tag}…</span>
      )}
    </div>
  );
}

// ── Screen types ──────────────────────────────────────────────────────────────
type Screen = "dashboard" | "disputes" | "monitoring" | "ai" | "report";

const NAV: { id: Screen; label: string; icon: string }[] = [
  { id: "dashboard",   label: "Dashboard",         icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { id: "disputes",    label: "Dispute Hub",        icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { id: "monitoring",  label: "Credit Monitoring",  icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" },
  { id: "ai",          label: "AI Assistant",       icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" },
  { id: "report",      label: "Credit Report",      icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
];

// ── Dashboard screen — real array-credit-overview + array-credit-score ───────
function DashboardScreen({ ready }: { ready: boolean }) {
  return (
    <div style={{ padding: "20px 24px", overflowY: "auto", height: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#2A2725", marginBottom: -8 }}>Credit Overview</div>
      <ArrayBlock tag="array-credit-overview" ready={ready} minHeight={200} />

      <div style={{ fontSize: 13, fontWeight: 700, color: "#2A2725", marginBottom: -8 }}>Score Tracker — All Bureaus</div>
      <ArrayBlock
        tag="array-credit-score"
        ready={ready}
        attrs={{ bureau: "all", scoreTracker: "true" }}
        minHeight={220}
      />
    </div>
  );
}

// ── Credit Monitoring — real array-credit-score all bureaus + debt analysis ──
function MonitoringScreen({ ready }: { ready: boolean }) {
  return (
    <div style={{ padding: "20px 24px", overflowY: "auto", height: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#2A2725", marginBottom: -8 }}>Tri-Bureau Credit Scores</div>
      <ArrayBlock
        tag="array-credit-score"
        ready={ready}
        attrs={{ bureau: "all" }}
        minHeight={260}
      />
      <div style={{ fontSize: 13, fontWeight: 700, color: "#2A2725", marginBottom: -8 }}>Debt Analysis</div>
      <ArrayBlock tag="array-credit-debt-analysis" ready={ready} minHeight={200} />
    </div>
  );
}

// ── Credit Report — real array-credit-report ──────────────────────────────────
function ReportScreen({ ready }: { ready: boolean }) {
  return (
    <div style={{ padding: "20px 24px", overflowY: "auto", height: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#2A2725", marginBottom: -4 }}>Full Credit Report</div>
      <ArrayBlock tag="array-credit-report" ready={ready} minHeight={500} />
    </div>
  );
}

// ── Dispute Hub — realistic mock ───────────────────────────────────────────────
function DisputeScreen() {
  const [selected, setSelected] = useState<number | null>(0);
  const disputes = [
    { account: "Midland Credit Management", bureau: "Equifax",     type: "Collections",    amount: "$847",   status: "Won",         statusColor: "#6A7769", bg: "#f0f7f0", sent: "Apr 2, 2025",  letter: "I am writing to formally dispute the above collection account. This account is being reported inaccurately in violation of FCRA §1681i. Per my records, I do not owe this debt and demand immediate deletion.\n\nRespectfully,\nDonald Blair" },
    { account: "Capital One – Auto",        bureau: "Experian",    type: "Late Payment",   amount: "90-day", status: "In Progress", statusColor: "#7C6BCB", bg: "#f4f2fb", sent: "May 1, 2025",  letter: "I dispute the 90-day late payment notation on my Experian report for the above account. Per FCRA §1681i(a)(1)(A) you must investigate and correct or remove inaccurate information within 30 days.\n\nRespectfully,\nDonald Blair" },
    { account: "Portfolio Recovery",        bureau: "TransUnion",  type: "Collections",    amount: "$1,240", status: "Awaiting",    statusColor: "#E4A26F", bg: "#fef9f4", sent: "May 14, 2025", letter: "I dispute this collection account appearing on my TransUnion report. This debt is past the statute of limitations and the Metro 2 DA field is incorrect. Immediate deletion is required under FCRA §1681c-2.\n\nRespectfully,\nDonald Blair" },
  ];
  const sel = selected !== null ? disputes[selected] : null;
  return (
    <div style={{ display: "flex", height: "100%", gap: 0 }}>
      <div style={{ width: 300, borderRight: "1px solid #E0D5C4", overflowY: "auto", padding: "16px 0" }}>
        <div style={{ padding: "0 16px 12px", fontSize: 13, fontWeight: 700, color: "#2A2725" }}>3 Disputes</div>
        {disputes.map((d, i) => (
          <div key={i} onClick={() => setSelected(i)} style={{ padding: "12px 16px", cursor: "pointer", borderLeft: `3px solid ${selected === i ? "#7C6BCB" : "transparent"}`, background: selected === i ? "#faf8ff" : "transparent", transition: "all 0.15s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#2A2725" }}>{d.account}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: d.statusColor, background: d.bg, padding: "2px 8px", borderRadius: 20 }}>{d.status}</span>
            </div>
            <div style={{ fontSize: 11, color: "#8B8480" }}>{d.type} · {d.bureau}</div>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
        {sel && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#2A2725", marginBottom: 2 }}>{sel.account}</div>
                <div style={{ fontSize: 12, color: "#8B8480" }}>{sel.type} · {sel.bureau}{sel.amount !== "—" ? ` · ${sel.amount}` : ""}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: sel.statusColor, background: sel.bg, padding: "4px 14px", borderRadius: 20 }}>{sel.status}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[["Sent Via", "USPS Certified Mail"], ["Sent", sel.sent], ["FCRA Basis", "§1681i(a)(1)(A)"], ["Response Due", "30 days"]].map(([k, v]) => (
                <div key={k} style={{ background: "#fff", border: "1px solid #E0D5C4", borderRadius: 10, padding: "10px 14px" }}>
                  <div style={{ fontSize: 10, color: "#8B8480", marginBottom: 2 }}>{k}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#2A2725" }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "#fff", border: "1px solid #E0D5C4", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#8B8480", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>AI-Generated Dispute Letter</div>
              <div style={{ fontSize: 12, color: "#3A3734", lineHeight: 1.8, whiteSpace: "pre-line" }}>
                <p><strong>Re: {sel.account} – {sel.type} – {sel.bureau}</strong></p>
                <p style={{ marginTop: 8 }}>To Whom It May Concern,</p>
                <p style={{ marginTop: 6 }}>{sel.letter}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── AI Assistant — realistic mock ─────────────────────────────────────────────
function AIScreen() {
  const [input, setInput] = useState("");
  const msgs = [
    { role: "assistant", text: "Hi Donald! Your ScoreShift AI advisor here. I can see your tri-bureau scores from Array. How can I help you today?" },
    { role: "user", text: "What's the fastest way to raise my score 50 points?" },
    { role: "assistant", text: "Great question! Based on your credit profile, the three highest-impact moves are:\n\n1. Pay down your revolving balances to under 10% utilization — this alone can add 20–40 points.\n2. Dispute the Midland Credit collection — you have a strong case and removal could be worth 30+ points.\n3. Ask a family member with excellent credit to add you as an authorized user on an old, high-limit card.\n\nDo any of these need a dispute letter generated?" },
    { role: "user", text: "Yes — generate the Midland dispute letter" },
    { role: "assistant", text: "Done. I've drafted a certified FCRA §1681i dispute letter for Midland Credit Management citing Metro 2 DA field violations. You can find it in the Dispute Hub ready to send via USPS Certified Mail." },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            {m.role === "assistant" && (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #8D80D3, #7C6BCB)", display: "flex", alignItems: "center", justifyContent: "center", marginRight: 8, flexShrink: 0, marginTop: 2 }}>
                <span style={{ fontSize: 12 }}>✦</span>
              </div>
            )}
            <div style={{ maxWidth: "72%", padding: "10px 14px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: m.role === "user" ? "linear-gradient(135deg, #8D80D3, #7C6BCB)" : "#fff", color: m.role === "user" ? "#fff" : "#2A2725", fontSize: 12, lineHeight: 1.6, border: m.role === "user" ? "none" : "1px solid #E0D5C4", whiteSpace: "pre-line" }}>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: "12px 20px", borderTop: "1px solid #E0D5C4", display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about your credit…" style={{ flex: 1, padding: "8px 14px", borderRadius: 24, border: "1px solid #E0D5C4", fontSize: 12, color: "#2A2725", background: "#F3EEE6", outline: "none" }} />
        <button style={{ padding: "8px 18px", borderRadius: 24, background: "linear-gradient(135deg, #8D80D3, #7C6BCB)", color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Send</button>
      </div>
    </div>
  );
}

// ── Root component ────────────────────────────────────────────────────────────
export default function AppDemo() {
  const [active, setActive]     = useState<Screen>("dashboard");
  const [animating, setAnimating] = useState(false);
  const [arrayReady, setArrayReady] = useState(false);

  useEffect(() => {
    loadArrayScripts(() => setArrayReady(true));
  }, []);

  const navigate = (screen: Screen) => {
    if (screen === active || animating) return;
    setAnimating(true);
    setTimeout(() => { setActive(screen); setAnimating(false); }, 160);
  };

  const renderScreen = () => {
    switch (active) {
      case "dashboard":  return <DashboardScreen  ready={arrayReady} />;
      case "monitoring": return <MonitoringScreen  ready={arrayReady} />;
      case "report":     return <ReportScreen      ready={arrayReady} />;
      case "disputes":   return <DisputeScreen />;
      case "ai":         return <AIScreen />;
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#F1E8DA", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ width: "96%", maxWidth: 1200, height: "92vh", background: "#F3EEE6", borderRadius: 16, boxShadow: "0 32px 80px rgba(42,39,37,0.22)", border: "1px solid #D8CCB9", display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Window chrome */}
        <div style={{ height: 42, background: "#2A2725", display: "flex", alignItems: "center", padding: "0 16px", gap: 8, flexShrink: 0 }}>
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57", display: "inline-block" }} />
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e", display: "inline-block" }} />
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840", display: "inline-block" }} />
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <div style={{ background: "#3A3734", borderRadius: 6, padding: "3px 20px", fontSize: 11, color: "#8B8480" }}>
              scoreshift.app · Donald Blair's Credit Dashboard
            </div>
          </div>
          <span style={{ fontSize: 11, color: "#5B5652", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: arrayReady ? "#28c840" : "#febc2e", display: "inline-block" }} />
            {arrayReady ? "Array connected" : "connecting…"}
          </span>
        </div>

        {/* Layout */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* Sidebar */}
          <div style={{ width: 210, background: "#2A2725", display: "flex", flexDirection: "column", padding: "20px 0", flexShrink: 0 }}>
            <div style={{ padding: "0 20px 18px", borderBottom: "1px solid #3A3734" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#F3EEE6", letterSpacing: -0.5 }}>Score<span style={{ color: "#8D80D3" }}>Shift</span></div>
              <div style={{ fontSize: 11, color: "#5B5652", marginTop: 2 }}>Donald Blair · Elite</div>
            </div>
            <nav style={{ padding: "14px 0", flex: 1 }}>
              {NAV.map(s => (
                <button key={s.id} onClick={() => navigate(s.id)} style={{ width: "100%", padding: "10px 20px", display: "flex", alignItems: "center", gap: 12, background: active === s.id ? "rgba(141,128,211,0.18)" : "transparent", border: "none", borderLeft: `3px solid ${active === s.id ? "#8D80D3" : "transparent"}`, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={active === s.id ? "#8D80D3" : "#5B5652"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={s.icon} />
                  </svg>
                  <span style={{ fontSize: 13, fontWeight: active === s.id ? 600 : 400, color: active === s.id ? "#F3EEE6" : "#8B8480" }}>{s.label}</span>
                </button>
              ))}
            </nav>
            <div style={{ padding: "14px 20px", borderTop: "1px solid #3A3734" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #8D80D3, #7C6BCB)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff", fontWeight: 700 }}>DB</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#F3EEE6" }}>Donald Blair</div>
                  <div style={{ fontSize: 10, color: "#5B5652" }}>Elite Plan · Active</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* Topbar */}
            <div style={{ height: 50, background: "#fff", borderBottom: "1px solid #E0D5C4", display: "flex", alignItems: "center", padding: "0 22px", justifyContent: "space-between", flexShrink: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#2A2725" }}>
                {NAV.find(s => s.id === active)?.label}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ fontSize: 11, color: "#8B8480" }}>Live Array data · {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                <div style={{ padding: "4px 12px", borderRadius: 20, background: "#f4f2fb", fontSize: 11, fontWeight: 600, color: "#7C6BCB" }}>Elite</div>
              </div>
            </div>

            {/* Screen with fade */}
            <div style={{ flex: 1, overflow: "hidden", position: "relative", background: "#F3EEE6" }}>
              <div style={{ position: "absolute", inset: 0, overflow: "auto", opacity: animating ? 0 : 1, transform: animating ? "translateY(5px)" : "translateY(0)", transition: "opacity 0.16s ease, transform 0.16s ease" }}>
                {renderScreen()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
