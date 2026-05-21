import { useState, useEffect } from "react";

type Screen = "dashboard" | "disputes" | "monitoring" | "ai" | "report";

const SCREENS: { id: Screen; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { id: "disputes", label: "Dispute Hub", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { id: "monitoring", label: "Credit Monitoring", icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" },
  { id: "ai", label: "AI Assistant", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" },
  { id: "report", label: "Credit Report", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
];

function SvgIcon({ d, size = 18, color = "currentColor" }: { d: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function ScoreArc({ score }: { score: number }) {
  const pct = (score - 300) / (850 - 300);
  const r = 70;
  const cx = 100, cy = 100;
  const startAngle = -210;
  const endAngle = 30;
  const totalArc = endAngle - startAngle;
  const filledArc = totalArc * pct;
  const toRad = (a: number) => (a * Math.PI) / 180;
  const arcPath = (from: number, to: number) => {
    const x1 = cx + r * Math.cos(toRad(from));
    const y1 = cy + r * Math.sin(toRad(from));
    const x2 = cx + r * Math.cos(toRad(to));
    const y2 = cy + r * Math.sin(toRad(to));
    const large = Math.abs(to - from) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };
  const color = score >= 740 ? "#6A7769" : score >= 670 ? "#8D80D3" : score >= 580 ? "#E4A26F" : "#c0392b";
  const label = score >= 740 ? "Excellent" : score >= 670 ? "Good" : score >= 580 ? "Fair" : "Poor";
  return (
    <svg width={200} height={150} viewBox="0 0 200 150">
      <path d={arcPath(startAngle, endAngle)} fill="none" stroke="#E0D5C4" strokeWidth="10" strokeLinecap="round" />
      <path d={arcPath(startAngle, startAngle + filledArc)} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" />
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="32" fontWeight="700" fill="#2A2725" fontFamily="system-ui">{score}</text>
      <text x={cx} y={cy + 32} textAnchor="middle" fontSize="13" fill={color} fontFamily="system-ui" fontWeight="600">{label}</text>
    </svg>
  );
}

function DashboardScreen() {
  const bureaus = [
    { name: "Experian", score: 728, color: "#3b82f6", change: +12 },
    { name: "Equifax", score: 714, color: "#ef4444", change: +8 },
    { name: "TransUnion", score: 731, color: "#8b5cf6", change: +15 },
  ];
  const alerts = [
    { icon: "↑", text: "TransUnion score increased by 15 points", time: "2h ago", good: true },
    { icon: "!", text: "New hard inquiry from Capital One", time: "1d ago", good: false },
    { icon: "✓", text: "Dispute resolved — Midland Credit removed", time: "3d ago", good: true },
  ];
  const actions = [
    { label: "Become an Authorized User", pct: 85 },
    { label: "Pay Down Revolving Balance", pct: 60 },
    { label: "Request Credit Limit Increase", pct: 45 },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "24px 28px", overflowY: "auto", height: "100%" }}>
      {/* Score overview */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>
        <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #E0D5C4", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#8B8480", marginBottom: 4, letterSpacing: 1, textTransform: "uppercase" }}>Average Score</div>
          <ScoreArc score={724} />
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 12, color: "#6A7769", fontWeight: 600 }}>↑ +11 this month</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {bureaus.map(b => (
            <div key={b.name} style={{ background: "#fff", borderRadius: 12, padding: "14px 18px", border: "1px solid #E0D5C4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: b.color, display: "inline-block" }} />
                <span style={{ fontWeight: 600, color: "#2A2725", fontSize: 14 }}>{b.name}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: "#2A2725" }}>{b.score}</span>
                <span style={{ fontSize: 12, color: "#6A7769", fontWeight: 600, background: "#f0f7f0", padding: "2px 8px", borderRadius: 20 }}>↑ +{b.change}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts + Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: "#fff", borderRadius: 14, padding: 18, border: "1px solid #E0D5C4" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#2A2725", marginBottom: 14 }}>Recent Alerts</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {alerts.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ width: 28, height: 28, borderRadius: "50%", background: a.good ? "#f0f7f0" : "#fff8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{a.icon}</span>
                <div>
                  <div style={{ fontSize: 12, color: "#3A3734", lineHeight: 1.4 }}>{a.text}</div>
                  <div style={{ fontSize: 11, color: "#8B8480", marginTop: 2 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: "#fff", borderRadius: 14, padding: 18, border: "1px solid #E0D5C4" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#2A2725", marginBottom: 14 }}>Score-Building Actions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {actions.map((a, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: "#3A3734" }}>{a.label}</span>
                  <span style={{ fontSize: 11, color: "#8D80D3", fontWeight: 600 }}>{a.pct}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 6, background: "#E0D5C4" }}>
                  <div style={{ height: 6, borderRadius: 6, background: "linear-gradient(90deg, #8D80D3, #7C6BCB)", width: `${a.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DisputeScreen() {
  const [selected, setSelected] = useState<number | null>(null);
  const disputes = [
    { id: 1, account: "Midland Credit Management", bureau: "Equifax", type: "Collections", amount: "$847", status: "Won", statusColor: "#6A7769", bg: "#f0f7f0", sent: "Apr 2, 2025", delivery: "Apr 7, 2025" },
    { id: 2, account: "Capital One – Auto", bureau: "Experian", type: "Late Payment (90d)", amount: "—", status: "In Progress", statusColor: "#7C6BCB", bg: "#f4f2fb", sent: "May 1, 2025", delivery: "May 6, 2025" },
    { id: 3, account: "Portfolio Recovery", bureau: "TransUnion", type: "Collections", amount: "$1,240", status: "Awaiting", statusColor: "#E4A26F", bg: "#fef9f4", sent: "May 14, 2025", delivery: "May 19, 2025" },
    { id: 4, account: "Chase Freedom – Charge-off", bureau: "Experian", type: "Charge-Off", amount: "$2,100", status: "Draft", statusColor: "#8B8480", bg: "#f8f6f4", sent: "—", delivery: "—" },
  ];
  const sel = selected !== null ? disputes[selected] : null;
  return (
    <div style={{ display: "flex", height: "100%", gap: 0 }}>
      <div style={{ width: 340, borderRight: "1px solid #E0D5C4", overflowY: "auto", padding: "20px 0" }}>
        <div style={{ padding: "0 18px 14px", fontSize: 13, fontWeight: 700, color: "#2A2725" }}>4 Disputes</div>
        {disputes.map((d, i) => (
          <div key={d.id} onClick={() => setSelected(i)} style={{ padding: "14px 18px", cursor: "pointer", borderLeft: `3px solid ${selected === i ? "#7C6BCB" : "transparent"}`, background: selected === i ? "#faf8ff" : "transparent", transition: "all 0.15s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#2A2725" }}>{d.account}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: d.statusColor, background: d.bg, padding: "2px 8px", borderRadius: 20 }}>{d.status}</span>
            </div>
            <div style={{ fontSize: 11, color: "#8B8480" }}>{d.type} · {d.bureau}</div>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
        {sel ? (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#2A2725", marginBottom: 4 }}>{sel.account}</div>
                <div style={{ fontSize: 13, color: "#8B8480" }}>{sel.type} · {sel.bureau}{sel.amount !== "—" ? ` · ${sel.amount}` : ""}</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: sel.statusColor, background: sel.bg, padding: "4px 14px", borderRadius: 20 }}>{sel.status}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              {[["Sent Via", "USPS Certified Mail"], ["Letter Sent", sel.sent], ["Est. Delivery", sel.delivery], ["FCRA Basis", "§1681i(a)(1)(A)"]].map(([k, v]) => (
                <div key={k} style={{ background: "#fff", border: "1px solid #E0D5C4", borderRadius: 10, padding: "12px 16px" }}>
                  <div style={{ fontSize: 11, color: "#8B8480", marginBottom: 3 }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#2A2725" }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "#fff", border: "1px solid #E0D5C4", borderRadius: 12, padding: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#8B8480", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>AI-Generated Dispute Letter</div>
              <div style={{ fontSize: 12, color: "#3A3734", lineHeight: 1.8 }}>
                <p>To Whom It May Concern,</p>
                <p style={{ marginTop: 8 }}>I am writing to formally dispute the account listed above, which appears on my credit report maintained by <strong>{sel.bureau}</strong>. This account is being reported inaccurately and in violation of the Fair Credit Reporting Act (FCRA), specifically 15 U.S.C. §1681i.</p>
                <p style={{ marginTop: 8 }}>I hereby request that you investigate this matter and remove or correct the inaccurate information within 30 days of receipt of this letter, as required by law.</p>
                <p style={{ marginTop: 8 }}>Respectfully,<br />James Mitchell</p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#8B8480", fontSize: 14 }}>Select a dispute to view details</div>
        )}
      </div>
    </div>
  );
}

function MonitoringScreen() {
  const bureaus = [
    { name: "Experian", score: 728, color: "#3b82f6", factors: ["Payment History: 99%", "Utilization: 18%", "Age: 7y 4mo"] },
    { name: "Equifax", score: 714, color: "#ef4444", factors: ["Payment History: 97%", "Utilization: 24%", "Age: 7y 4mo"] },
    { name: "TransUnion", score: 731, color: "#8b5cf6", factors: ["Payment History: 99%", "Utilization: 16%", "Age: 7y 4mo"] },
  ];
  const history = [
    { month: "Dec", eq: 678, ex: 681, tu: 679 },
    { month: "Jan", eq: 685, ex: 690, tu: 688 },
    { month: "Feb", eq: 692, ex: 698, tu: 696 },
    { month: "Mar", eq: 700, ex: 708, tu: 706 },
    { month: "Apr", eq: 706, ex: 716, tu: 718 },
    { month: "May", eq: 714, ex: 728, tu: 731 },
  ];
  const maxScore = 740;
  const minScore = 670;
  const range = maxScore - minScore;
  const colors = { eq: "#ef4444", ex: "#3b82f6", tu: "#8b5cf6" };
  return (
    <div style={{ padding: "24px 28px", overflowY: "auto", height: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {bureaus.map(b => (
          <div key={b.name} style={{ background: "#fff", borderRadius: 14, padding: 18, border: "1px solid #E0D5C4" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: b.color, display: "inline-block" }} />
              <span style={{ fontWeight: 700, color: "#2A2725", fontSize: 13 }}>{b.name}</span>
            </div>
            <div style={{ fontSize: 36, fontWeight: 700, color: "#2A2725", marginBottom: 4 }}>{b.score}</div>
            <div style={{ fontSize: 11, color: "#6A7769", marginBottom: 12, fontWeight: 600 }}>Good · ↑ improving</div>
            {b.factors.map((f, i) => (
              <div key={i} style={{ fontSize: 11, color: "#5B5652", padding: "3px 0", borderTop: i === 0 ? "1px solid #F1E8DA" : undefined }}>{f}</div>
            ))}
          </div>
        ))}
      </div>
      {/* Score history chart */}
      <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #E0D5C4" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#2A2725", marginBottom: 16 }}>6-Month Score History</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 120 }}>
          {history.map((h, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: "100%", display: "flex", gap: 3, alignItems: "flex-end", height: 100 }}>
                {(["eq", "ex", "tu"] as const).map(k => {
                  const val = h[k];
                  const ht = Math.max(8, ((val - minScore) / range) * 90);
                  return <div key={k} style={{ flex: 1, background: colors[k], borderRadius: "3px 3px 0 0", height: ht, opacity: 0.85 }} />;
                })}
              </div>
              <div style={{ fontSize: 10, color: "#8B8480" }}>{h.month}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 12, justifyContent: "center" }}>
          {[["Equifax", "#ef4444"], ["Experian", "#3b82f6"], ["TransUnion", "#8b5cf6"]].map(([n, c]) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: c as string, display: "inline-block" }} />
              <span style={{ fontSize: 11, color: "#5B5652" }}>{n}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AIScreen() {
  const [input, setInput] = useState("");
  const messages = [
    { role: "assistant", text: "Hi James! I'm your ScoreShift AI credit advisor. Your average score is 724 — up 11 points this month. How can I help you today?" },
    { role: "user", text: "Why did my Equifax score drop last week?" },
    { role: "assistant", text: "I can see what happened. A new hard inquiry from Capital One appeared on your Equifax report on May 20th. Hard inquiries typically reduce your score by 5–10 points temporarily. The good news: they fall off after 2 years and their impact fades after 12 months. Your score should recover within 60–90 days, especially since your payment history is clean at 97%." },
    { role: "user", text: "Should I dispute the Capital One inquiry?" },
    { role: "assistant", text: "Only if you didn't apply for that Capital One product. If you did apply, disputes won't work — bureaus verify with the lender. If you didn't authorize this pull, that's a different matter and I can generate a dispute letter under FCRA §1681b(f) citing permissible purpose. Want me to do that?" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            {m.role === "assistant" && (
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #8D80D3, #7C6BCB)", display: "flex", alignItems: "center", justifyContent: "center", marginRight: 10, flexShrink: 0, marginTop: 2 }}>
                <span style={{ fontSize: 14 }}>✦</span>
              </div>
            )}
            <div style={{ maxWidth: "72%", padding: "12px 16px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: m.role === "user" ? "linear-gradient(135deg, #8D80D3, #7C6BCB)" : "#fff", color: m.role === "user" ? "#fff" : "#2A2725", fontSize: 13, lineHeight: 1.6, border: m.role === "user" ? "none" : "1px solid #E0D5C4" }}>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: "16px 24px", borderTop: "1px solid #E0D5C4", display: "flex", gap: 10 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about your credit…"
          style={{ flex: 1, padding: "10px 16px", borderRadius: 24, border: "1px solid #E0D5C4", fontSize: 13, color: "#2A2725", background: "#F3EEE6", outline: "none" }}
        />
        <button style={{ padding: "10px 20px", borderRadius: 24, background: "linear-gradient(135deg, #8D80D3, #7C6BCB)", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Send</button>
      </div>
    </div>
  );
}

function ReportScreen() {
  const issues = [
    { type: "Collections", account: "Midland Credit Mgmt", bureau: "Equifax", impact: "High", impactColor: "#ef4444", amount: "$847", age: "2y 3mo", disputable: true },
    { type: "Late Payment", account: "Capital One Auto", bureau: "Experian", impact: "High", impactColor: "#ef4444", amount: "90-day late", age: "14mo", disputable: true },
    { type: "Hard Inquiry", account: "Capital One", bureau: "Equifax", impact: "Low", impactColor: "#E4A26F", amount: "—", age: "1d", disputable: false },
    { type: "High Utilization", account: "Chase Freedom (38%)", bureau: "All Bureaus", impact: "Medium", impactColor: "#E4A26F", amount: "$2,850/$7,500", age: "Current", disputable: false },
    { type: "Collections", account: "Portfolio Recovery", bureau: "TransUnion", impact: "High", impactColor: "#ef4444", amount: "$1,240", age: "3y 1mo", disputable: true },
  ];
  const summary = [
    { label: "Total Accounts", value: "14" },
    { label: "Open", value: "9" },
    { label: "Closed", value: "5" },
    { label: "Derogatory", value: "3" },
    { label: "On-Time Rate", value: "97%" },
    { label: "Oldest Account", value: "11y 2mo" },
  ];
  return (
    <div style={{ padding: "24px 28px", overflowY: "auto", height: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
        {summary.map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 10, padding: "12px 14px", border: "1px solid #E0D5C4", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#2A2725" }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "#8B8480", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E0D5C4", overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #F1E8DA", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#2A2725" }}>AI-Identified Issues ({issues.length})</div>
          <button style={{ fontSize: 12, fontWeight: 600, color: "#7C6BCB", background: "#f4f2fb", border: "none", borderRadius: 20, padding: "5px 14px", cursor: "pointer" }}>Generate All Letters</button>
        </div>
        {issues.map((issue, i) => (
          <div key={i} style={{ padding: "14px 18px", borderBottom: i < issues.length - 1 ? "1px solid #F1E8DA" : undefined, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: issue.impactColor, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#2A2725" }}>{issue.account}</div>
              <div style={{ fontSize: 11, color: "#8B8480", marginTop: 1 }}>{issue.type} · {issue.bureau} · {issue.age}</div>
            </div>
            <div style={{ fontSize: 12, color: "#3A3734" }}>{issue.amount}</div>
            <span style={{ fontSize: 11, fontWeight: 600, color: issue.impactColor, background: issue.impactColor + "18", padding: "2px 10px", borderRadius: 20, minWidth: 60, textAlign: "center" }}>{issue.impact}</span>
            {issue.disputable && (
              <button style={{ fontSize: 11, fontWeight: 600, color: "#7C6BCB", background: "#f4f2fb", border: "1px solid #c4bde8", borderRadius: 8, padding: "4px 12px", cursor: "pointer" }}>Dispute</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const SCREEN_COMPONENTS: Record<Screen, () => JSX.Element> = {
  dashboard: DashboardScreen,
  disputes: DisputeScreen,
  monitoring: MonitoringScreen,
  ai: AIScreen,
  report: ReportScreen,
};

export default function AppDemo() {
  const [active, setActive] = useState<Screen>("dashboard");
  const [prev, setPrev] = useState<Screen | null>(null);
  const [animating, setAnimating] = useState(false);

  const navigate = (screen: Screen) => {
    if (screen === active || animating) return;
    setPrev(active);
    setAnimating(true);
    setTimeout(() => {
      setActive(screen);
      setAnimating(false);
      setPrev(null);
    }, 180);
  };

  const ActiveComp = SCREEN_COMPONENTS[active];

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#F1E8DA", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* App window */}
      <div style={{ width: "95%", maxWidth: 1200, height: "90vh", background: "#F3EEE6", borderRadius: 16, boxShadow: "0 32px 80px rgba(42,39,37,0.22)", border: "1px solid #D8CCB9", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Window chrome */}
        <div style={{ height: 42, background: "#2A2725", display: "flex", alignItems: "center", padding: "0 16px", gap: 10, flexShrink: 0 }}>
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57", display: "inline-block" }} />
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e", display: "inline-block" }} />
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840", display: "inline-block" }} />
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <div style={{ background: "#3A3734", borderRadius: 6, padding: "3px 20px", fontSize: 11, color: "#8B8480" }}>scoreshift.app · Credit Repair Dashboard</div>
          </div>
        </div>

        {/* Main layout */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Sidebar */}
          <div style={{ width: 210, background: "#2A2725", display: "flex", flexDirection: "column", padding: "20px 0", flexShrink: 0 }}>
            {/* Brand */}
            <div style={{ padding: "0 20px 20px", borderBottom: "1px solid #3A3734" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#F3EEE6", letterSpacing: -0.5 }}>
                Score<span style={{ color: "#8D80D3" }}>Shift</span>
              </div>
              <div style={{ fontSize: 11, color: "#5B5652", marginTop: 2 }}>James Mitchell · Pro</div>
            </div>

            {/* Nav */}
            <nav style={{ padding: "14px 0", flex: 1 }}>
              {SCREENS.map(s => (
                <button
                  key={s.id}
                  onClick={() => navigate(s.id)}
                  style={{
                    width: "100%",
                    padding: "10px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: active === s.id ? "rgba(141,128,211,0.18)" : "transparent",
                    border: "none",
                    borderLeft: `3px solid ${active === s.id ? "#8D80D3" : "transparent"}`,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                  }}
                >
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={active === s.id ? "#8D80D3" : "#5B5652"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={s.icon} />
                  </svg>
                  <span style={{ fontSize: 13, fontWeight: active === s.id ? 600 : 400, color: active === s.id ? "#F3EEE6" : "#8B8480" }}>
                    {s.label}
                  </span>
                </button>
              ))}
            </nav>

            {/* User footer */}
            <div style={{ padding: "16px 20px", borderTop: "1px solid #3A3734" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #8D80D3, #7C6BCB)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff", fontWeight: 700 }}>JM</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#F3EEE6" }}>James Mitchell</div>
                  <div style={{ fontSize: 10, color: "#5B5652" }}>Pro Plan · Active</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Topbar */}
            <div style={{ height: 52, background: "#fff", borderBottom: "1px solid #E0D5C4", display: "flex", alignItems: "center", padding: "0 24px", justifyContent: "space-between", flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#2A2725" }}>
                  {SCREENS.find(s => s.id === active)?.label}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ fontSize: 12, color: "#8B8480" }}>Last updated: 2 min ago</div>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#F1E8DA", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#5B5652" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Screen content with fade transition */}
            <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
              <div style={{
                position: "absolute", inset: 0, overflow: "auto",
                opacity: animating ? 0 : 1,
                transform: animating ? "translateY(6px)" : "translateY(0)",
                transition: "opacity 0.18s ease, transform 0.18s ease"
              }}>
                <ActiveComp />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
