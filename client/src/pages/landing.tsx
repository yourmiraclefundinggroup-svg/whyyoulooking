import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "wouter";
import "../styles/landing.css";
import scoreshiftLogo from "@assets/scoreshift-logo.png";

/* ── Scroll reveal ──────────────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".ss-reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
      }),
      { threshold: 0.07, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ── Nav scroll + hero parallax ─────────────────────────────── */
function useNavScroll() {
  useEffect(() => {
    const nav = document.querySelector(".ss-nav");
    const img = document.querySelector(".ss-hero-img") as HTMLElement | null;
    const handler = () => {
      nav?.classList.toggle("scrolled", window.scrollY > 60);
      if (img) img.style.transform = `translateY(${window.scrollY * 0.3}px)`;
    };
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);
}

/* ── Cinematic scroll progress ──────────────────────────────── */
function useCinematicProgress(ref: React.RefObject<HTMLDivElement>) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const handler = () => {
      const el = ref.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      const h = el.offsetHeight;
      const vh = window.innerHeight;
      const travel = h - vh;
      const scrolledIn = -top;
      const p = travel > 0 ? Math.max(0, Math.min(1, scrolledIn / travel)) : 0;
      setProgress(p);
    };
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, [ref]);
  return progress;
}

/* ── 3D tilt ────────────────────────────────────────────────── */
function useTilt(ref: React.RefObject<HTMLDivElement>, strength = 3) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width * 2 - 1;
      const y = (e.clientY - r.top) / r.height * 2 - 1;
      el.style.transform = `perspective(900px) rotateX(${-y * strength}deg) rotateY(${x * (strength * 1.2)}deg) translateY(-5px)`;
      el.style.boxShadow = "0 2px 6px rgba(42,40,37,0.06),0 14px 36px rgba(42,40,37,0.12),0 40px 72px rgba(42,40,37,0.09),inset 0 1px 0 rgba(255,255,255,0.9)";
    };
    const leave = () => {
      el.style.transform = "";
      el.style.boxShadow = "";
    };
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    return () => { el.removeEventListener("mousemove", move); el.removeEventListener("mouseleave", leave); };
  }, [ref, strength]);
}

/* ── Count-up ───────────────────────────────────────────────── */
function useCountUp(from: number, to: number, duration = 1600) {
  const [value, setValue] = useState(from);
  const elRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    let triggered = false;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || triggered) return;
      triggered = true;
      obs.disconnect();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setValue(to); return; }
      let start: number | null = null;
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);
      const step = (ts: number) => {
        if (start === null) start = ts;
        const p = ease(Math.min((ts - start) / duration, 1));
        setValue(Math.round(from + p * (to - from)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [from, to, duration]);
  return { value, elRef };
}

function CountUp({ from = 0, to, suffix = "", prefix = "" }: { from?: number; to: number; suffix?: string; prefix?: string }) {
  const { value, elRef } = useCountUp(from, to);
  return <span ref={elRef}>{prefix}{value.toLocaleString()}{suffix}</span>;
}

/* ── SVG Icons ──────────────────────────────────────────────── */
const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const ArrowRight = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

/* ── Interactive Portal Mock ────────────────────────────────── */
type PortalScreen = "dashboard" | "disputes" | "plan";

const PNAV = [
  { id: "dashboard" as PortalScreen, label: "Dashboard",
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { id: "disputes" as PortalScreen, label: "Dispute IQ", badge: "3",
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
  { id: "plan" as PortalScreen, label: "My Plan",
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg> },
];

const ALL_NAV = [
  { id: "dashboard", label: "Dashboard", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { id: "plan", label: "My Plan", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { id: "report", label: "Credit Report", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
  { id: "disputes", label: "Dispute IQ", badge: "3", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
  { id: "letters", label: "Smart Letters", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
  { id: "progress", label: "Progress", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg> },
  { id: "identity", label: "Identity Guard", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  { id: "debt", label: "Debt Analysis", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
];

const SCREEN_TITLE: Record<PortalScreen, string> = {
  dashboard: "Dashboard",
  disputes: "Dispute IQ",
  plan: "My Plan",
};

function ScreenDashboard() {
  return (
    <div className="ss-pscreen">
      {/* Hero card */}
      <div className="ss-phero">
        <div>
          <div className="ss-phero-eye">CREDIT ACTION PLAN</div>
          <div className="ss-phero-name">Good morning, Alex.</div>
          <div className="ss-phero-sub">Pro Plan · 3 disputes in progress</div>
        </div>
        <div className="ss-pscores">
          {([["712","EXP","#3B82F6"],["705","EQ","#EF4444"],["718","TU","#8B5CF6"]] as const).map(([v,n,c]) => (
            <div key={n} className="ss-pscore-chip">
              <div className="ss-pscore-bureau">{n}</div>
              <div className="ss-pscore-val" style={{ color: c }}>{v}</div>
              <div className="ss-pscore-change">+12</div>
            </div>
          ))}
        </div>
      </div>

      {/* Action + Progress */}
      <div className="ss-pgrid2">
        <div className="ss-pcard">
          <div className="ss-pcard-label">Next Best Action</div>
          <div className="ss-pnba-body">
            <span className="ss-pnba-icon">⚡</span>
            <div>
              <div className="ss-pnba-title">Dispute MIDLAND CREDIT</div>
              <div className="ss-pnba-sub">Est. +18 pts · Ready to send</div>
            </div>
          </div>
        </div>
        <div className="ss-pcard">
          <div className="ss-pcard-label">Plan Progress</div>
          <div className="ss-pprog-val">68%</div>
          <div className="ss-pprog-track"><div className="ss-pprog-fill" style={{ width: "68%" }}/></div>
          <div className="ss-pprog-note">4 of 6 actions complete</div>
        </div>
      </div>

      {/* Stats */}
      <div className="ss-pgrid3">
        <div className="ss-pcard">
          <div className="ss-pstat-icon indigo">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/></svg>
          </div>
          <div className="ss-pstat-val">+47</div>
          <div className="ss-pstat-lbl">Pts gained</div>
        </div>
        <div className="ss-pcard">
          <div className="ss-pstat-icon sage">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div className="ss-pstat-val">2</div>
          <div className="ss-pstat-lbl">Items removed</div>
        </div>
        <div className="ss-pcard">
          <div className="ss-pstat-icon apricot">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div className="ss-pstat-val">3</div>
          <div className="ss-pstat-lbl">Active disputes</div>
        </div>
      </div>

      {/* Recent disputes */}
      <div className="ss-pcard">
        <div className="ss-pdisps">
          <div className="ss-pdisp-header">Recent Disputes</div>
          {[
            { name: "MIDLAND FUNDING LLC", meta: "Collection · 2021", bureau: "EX", bColor: "#3B82F6", status: "pending" },
            { name: "CAPITAL ONE AUTO", meta: "Late 30d · Aug 2023", bureau: "EQ", bColor: "#EF4444", status: "won" },
            { name: "SYNC BANK CREDIT", meta: "Inquiry · Mar 2024", bureau: "TU", bColor: "#8B5CF6", status: "sent" },
          ].map(d => (
            <div key={d.name} className="ss-pdisp-item">
              <div className="ss-pdisp-bur" style={{ background: d.bColor }}>{d.bureau}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="ss-pdisp-name">{d.name}</div>
                <div className="ss-pdisp-meta">{d.meta}</div>
              </div>
              <div className={`ss-pstatus ${d.status}`}>{d.status === "won" ? "Won" : d.status === "sent" ? "Sent" : "Pending"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScreenDisputes() {
  return (
    <div className="ss-pdisp-iq">
      <div className="ss-pcard" style={{ marginBottom: 4 }}>
        <div className="ss-pcard-label" style={{ marginBottom: 0 }}>3 disputes ready to send · Est. +52 pts combined</div>
      </div>
      {[
        { name: "MIDLAND FUNDING LLC", meta: "Collection · Opened Mar 2021", priority: "high", pts: "+18 pts", bureau: "EX", bColor: "#3B82F6" },
        { name: "CAPITAL ONE AUTO", meta: "Late payment · 30d · Aug 2023", priority: "medium", pts: "+12 pts", bureau: "EQ", bColor: "#EF4444" },
        { name: "SYNC BANK CREDIT CARD", meta: "Hard inquiry · Mar 2024", priority: "low", pts: "+9 pts", bureau: "TU", bColor: "#8B5CF6" },
      ].map(d => (
        <div key={d.name} className="ss-pdisp-item-full">
          <div className="ss-pdisp-row">
            <div className={`ss-pdisp-dot ${d.priority}`} />
            <div className="ss-pdisp-details">
              <div className="ss-pdisp-full-name">{d.name}</div>
              <div className="ss-pdisp-full-meta">{d.meta}</div>
            </div>
            <div className="ss-pdisp-bur" style={{ background: d.bColor }}>{d.bureau}</div>
            <div className="ss-pdisp-pts">{d.pts}</div>
          </div>
          <button className="ss-pdisp-full-action">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            Generate Letter
          </button>
        </div>
      ))}
    </div>
  );
}

function ScreenPlan() {
  return (
    <div className="ss-pplan">
      <div className="ss-pcard" style={{ marginBottom: 4 }}>
        <div className="ss-pcard-label" style={{ marginBottom: 0 }}>68% complete · 4 of 6 actions done</div>
      </div>
      {[
        { rank: 1, done: true, title: "Dispute CITI BANK collection", sub: "Sent via certified mail", pts: "+22 pts" },
        { rank: 2, done: true, title: "Lower utilization on Amex", sub: "Paid down to 28%", pts: "+18 pts" },
        { rank: 3, done: true, title: "Remove PORTFOLIO RECOVERY", sub: "Removed from Experian", pts: "+15 pts" },
        { rank: 4, done: true, title: "Add authorized user tradeline", sub: "Partner account added", pts: "+11 pts" },
        { rank: 5, done: false, title: "Dispute MIDLAND FUNDING", sub: "Ready to generate letter", pts: "+18 pts" },
        { rank: 6, done: false, title: "Reduce Chase card utilization", sub: "Target: below 20%", pts: "+12 pts" },
      ].map(a => (
        <div key={a.rank} className="ss-pplan-item">
          <div className={`ss-pplan-rank ${a.done ? "done" : ""}`}>
            {a.done
              ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              : a.rank}
          </div>
          <div className="ss-pplan-text">
            <div className="ss-pplan-title">{a.title}</div>
            <div className="ss-pplan-sub">{a.sub}</div>
          </div>
          <div className="ss-pplan-pts">{a.pts}</div>
        </div>
      ))}
    </div>
  );
}

function PortalMock() {
  const [screen, setScreen] = useState<PortalScreen>("dashboard");

  return (
    <div className="ss-portal-shell">
      {/* Sidebar */}
      <div className="ss-psidebar">
        <Link href="/portal" className="ss-psidebar-logo">
          <img src={scoreshiftLogo} alt="ScoreShift" />
          ScoreShift
        </Link>
        <div className="ss-psidebar-nav">
          <div className="ss-pnav-section">Overview</div>
          {ALL_NAV.slice(0, 4).map(n => (
            <button
              key={n.id}
              className={`ss-pnav-item${screen === n.id ? " active" : ""}`}
              onClick={() => {
                if (n.id === "dashboard" || n.id === "disputes" || n.id === "plan") {
                  setScreen(n.id as PortalScreen);
                }
              }}
            >
              {n.icon}
              {n.label}
              {"badge" in n && n.badge && <span className="ss-pnav-badge">{n.badge}</span>}
            </button>
          ))}
          <div className="ss-pnav-section">Tools</div>
          {ALL_NAV.slice(4).map(n => (
            <button
              key={n.id}
              className={`ss-pnav-item${screen === n.id ? " active" : ""}`}
              onClick={() => {
                if (n.id === "plan") setScreen("plan");
              }}
            >
              {n.icon}
              {n.label}
            </button>
          ))}
        </div>
        <div className="ss-psidebar-user">
          <div className="ss-puser-av">AJ</div>
          <div>
            <div className="ss-puser-name">Alex Johnson</div>
            <div className="ss-puser-plan">Pro Plan</div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="ss-pmain">
        <div className="ss-ptopbar">
          <div className="ss-ptopbar-title">{SCREEN_TITLE[screen]}</div>
          <div className="ss-ptopbar-right">
            <span className="ss-ptopbar-chip">Pro</span>
            <div className="ss-ptopbar-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
          </div>
        </div>
        <div className="ss-pcontent">
          {screen === "dashboard" && <ScreenDashboard />}
          {screen === "disputes" && <ScreenDisputes />}
          {screen === "plan" && <ScreenPlan />}
        </div>
      </div>
    </div>
  );
}

/* ── Tile ref wrapper ───────────────────────────────────────── */
function TiltTile({ className, children }: { className: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useTilt(ref, 2.2);
  return <div ref={ref} className={`ss-tile ${className}`}>{children}</div>;
}

/* ══════════════════════════════════════════════════════════════
   LANDING PAGE
══════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  useScrollReveal();
  useNavScroll();

  const cinRef = useRef<HTMLDivElement>(null);
  const cinProgress = useCinematicProgress(cinRef);

  // Derived cinematic values
  const copyOpacity = Math.max(0, 1 - cinProgress * 3.5);
  const copyY       = -cinProgress * 40;
  const portalY     = Math.max(0, (1 - cinProgress * 1.35)) * 110;
  const portalOp    = Math.min(1, cinProgress * 2.8);
  const portalScale = 0.82 + cinProgress * 0.18;
  const scrollHintOp = Math.max(0, 1 - cinProgress * 8);

  return (
    <div className="ss-land">
      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="ss-nav">
        <div className="ss-wrap ss-nav-inner">
          <Link href="/" className="ss-nav-logo">
            <img src={scoreshiftLogo} alt="ScoreShift" />
            ScoreShift
          </Link>
          <ul className="ss-nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#proof">Results</a></li>
            <li><Link href="/pricing">Pricing</Link></li>
          </ul>
          <div className="ss-nav-actions">
            <Link href="/auth" className="ss-nav-ghost">Sign in</Link>
            <Link href="/get-started" className="ss-btn-nav">
              Get started <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── §1 Hero ─────────────────────────────────────────── */}
      <section className="ss-hero">
        <img
          src="/images/canyon-hero.jpg"
          alt="Aerial Grand Canyon sunrise"
          className="ss-hero-img"
        />
        <div className="ss-hero-veil" />
        <div className="ss-hero-body">
          <div className="ss-reveal">
            <div className="ss-hero-badge">
              <span className="ss-hero-badge-dot" />
              AI-powered credit repair
            </div>
          </div>
          <h1 className="ss-hero-h1 ss-reveal ss-d1">
            Built to move<br />
            <em>you forward.</em>
          </h1>
          <p className="ss-hero-sub ss-reveal ss-d2">
            ScoreShift combines AI dispute intelligence, real-time credit monitoring, and a
            personalized action plan — all in one place.
          </p>
          <div className="ss-hero-ctas ss-reveal ss-d3">
            <Link href="/get-started" className="ss-btn-primary">
              Start for free <ArrowRight />
            </Link>
            <a href="#portal-demo" className="ss-btn-ghost">
              See the portal
            </a>
          </div>
          <div className="ss-hero-proof ss-reveal ss-d4">
            <div className="ss-hero-avatars">
              {["AJ","KR","ML","DB","SC"].map(i => (
                <div key={i} className="ss-hero-av">{i}</div>
              ))}
            </div>
            <span>Trusted by <strong style={{ color: "rgba(255,255,255,0.82)" }}>2,400+</strong> clients</span>
          </div>
        </div>
        <div className="ss-hero-scroll">
          <ChevronDown />
        </div>
      </section>

      {/* ── §2 Cinematic scroll — canyon descent → portal ───── */}
      <div className="ss-cin-wrap" ref={cinRef} id="portal-demo">
        <div className="ss-cin-sticky">
          {/* Canyon video */}
          <video
            className="ss-cin-video"
            src="/videos/canyon-descent.mp4"
            autoPlay muted loop playsInline
          />
          <div className="ss-cin-veil" />

          {/* Copy that fades out */}
          <div
            className="ss-cin-copy"
            style={{ opacity: copyOpacity, transform: `translateY(${copyY}px)` }}
          >
            <span className="ss-cin-eyebrow">Your credit journey</span>
            <h2 className="ss-cin-h2">
              Everything you need.<br />
              Nothing you don't.
            </h2>
            <span className="ss-cin-sub">
              Scroll to explore the portal — see exactly what you'll get.
            </span>
          </div>

          {/* Portal that rises up */}
          <div
            className="ss-cin-portal-stage"
            style={{
              transform: `translateY(${portalY}%) scale(${portalScale})`,
              opacity: portalOp,
            }}
          >
            <iframe
              src="/portal-demo"
              className="ss-cin-portal-iframe"
              title="ScoreShift portal preview"
              scrolling="no"
              frameBorder="0"
            />
          </div>

          {/* Scroll hint */}
          <div className="ss-cin-scroll-hint" style={{ opacity: scrollHintOp }}>
            <ChevronDown />
          </div>
        </div>
      </div>

      {/* ── §3 Bento features ───────────────────────────────── */}
      <section className="ss-bento" id="features">
        <div className="ss-wrap">
          <div className="ss-bento-head">
            <span className="ss-section-eye ss-reveal">What you get</span>
            <h2 className="ss-section-h2 ss-reveal ss-d1">
              Credit repair,{" "}
              <span className="ss-gradient-text">reimagined.</span>
            </h2>
            <p className="ss-section-sub ss-reveal ss-d2">
              Every tool built to accelerate your score — from AI dispute letters to real-time bureau monitoring.
            </p>
          </div>

          <div className="ss-bento-grid">
            {/* A — Score simulator */}
            <TiltTile className="ss-tile-a ss-reveal">
              <div className="ss-tile-eye"><span className="ss-tile-eye-dot" />Credit Score AI</div>
              <h3 className="ss-tile-h3">Watch your score rise in real-time</h3>
              <p className="ss-tile-sub">AI simulates the impact of each action before you take it.</p>
              <div className="ss-tile-score-vis">
                <div className="ss-tile-score-arc">
                  <svg viewBox="0 0 100 56" fill="none">
                    <path d="M10 50 A42 42 0 0 1 90 50" stroke="rgba(143,122,255,0.15)" strokeWidth="7" strokeLinecap="round"/>
                    <path d="M10 50 A42 42 0 0 1 90 50" stroke="url(#arc-g)" strokeWidth="7" strokeLinecap="round" strokeDasharray="132" strokeDashoffset="35"/>
                    <defs>
                      <linearGradient id="arc-g" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6B5FD9"/>
                        <stop offset="100%" stopColor="#8F7AFF"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="ss-tile-score-num">748</div>
                </div>
                <div>
                  <div className="ss-tile-score-delta">↑ +47 pts since start</div>
                  <div className="ss-tile-score-label">Projected: 760 in 60 days</div>
                </div>
              </div>
            </TiltTile>

            {/* B — Dispute timeline */}
            <TiltTile className="ss-tile-b ss-reveal ss-d1">
              <div className="ss-tile-eye"><span className="ss-tile-eye-dot" />Dispute IQ</div>
              <h3 className="ss-tile-h3">AI-generated letters that win</h3>
              <p className="ss-tile-sub">FCRA-compliant dispute packets written and tracked automatically.</p>
              <div className="ss-tile-timeline">
                {[
                  { label: "Dispute letter generated", meta: "MIDLAND FUNDING · EXP", badge: "done", state: "done" },
                  { label: "Sent via certified mail", meta: "Tracking #9400111899224", badge: "done", state: "done" },
                  { label: "Bureau response received", meta: "Experian · 21 days left", badge: "active", state: "active" },
                  { label: "Item removal confirmed", meta: "Pending bureau update", badge: "pending", state: "pending" },
                ].map((t, i) => (
                  <div key={i} className="ss-tile-tl-item">
                    <div className="ss-tile-tl-left">
                      <div className={`ss-tile-tl-dot ${t.state}`} />
                      <div className="ss-tile-tl-line" />
                    </div>
                    <div className="ss-tile-tl-content">
                      <div className="ss-tile-tl-row">
                        <div>
                          <div className="ss-tile-tl-title">{t.label}</div>
                          <div className="ss-tile-tl-meta">{t.meta}</div>
                        </div>
                        <span className={`ss-tile-tl-badge ${t.badge}`}>{t.badge}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TiltTile>

            {/* C — Stat */}
            <TiltTile className="ss-tile-c ss-reveal">
              <div className="ss-tile-icon indigo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
              </div>
              <div className="ss-tile-eye"><span className="ss-tile-eye-dot" />Avg. score gain</div>
              <div className="ss-tile-big-stat indigo">+74</div>
              <div className="ss-tile-stat-desc">points in the first 90 days</div>
            </TiltTile>

            {/* D — Stat */}
            <TiltTile className="ss-tile-d ss-reveal ss-d1">
              <div className="ss-tile-icon sage">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div className="ss-tile-eye"><span className="ss-tile-eye-dot" style={{ background: "var(--ss-sage)" }} />Disputes won</div>
              <div className="ss-tile-big-stat sage">87<span style={{ fontSize: 28 }}>%</span></div>
              <div className="ss-tile-stat-desc">success rate across all bureaus</div>
            </TiltTile>

            {/* E — Stat */}
            <TiltTile className="ss-tile-e ss-reveal ss-d2">
              <div className="ss-tile-icon apricot">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div className="ss-tile-eye"><span className="ss-tile-eye-dot" style={{ background: "var(--ss-apricot)" }} />Avg. time to results</div>
              <div className="ss-tile-big-stat apricot">38</div>
              <div className="ss-tile-stat-desc">days to first item removed</div>
            </TiltTile>

            {/* F — AI chat */}
            <TiltTile className="ss-tile-f ss-reveal">
              <div className="ss-tile-icon charcoal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div className="ss-tile-eye"><span className="ss-tile-eye-dot" style={{ background: "var(--ss-charcoal)" }} />AI Assistant</div>
              <h3 className="ss-tile-h3">Ask anything, 24/7</h3>
              <div className="ss-tile-chat">
                <div className="ss-tile-bubble user">Why did my score drop 12 pts?</div>
                <div className="ss-tile-bubble ai">Your Experian report shows a new hard inquiry from March 15th. Hard inquiries typically cause a 5–12 point drop but fade within 12 months. Your score should recover by May.</div>
                <div className="ss-tile-typing">
                  <span/><span/><span/>
                </div>
              </div>
            </TiltTile>

            {/* G — Bureau monitor */}
            <TiltTile className="ss-tile-g ss-reveal ss-d1">
              <div className="ss-tile-icon indigo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </div>
              <div className="ss-tile-eye"><span className="ss-tile-eye-dot" />3-Bureau Monitoring</div>
              <h3 className="ss-tile-h3">All three bureaus, one view</h3>
              <p className="ss-tile-sub">Real-time alerts when anything changes across Experian, Equifax, and TransUnion.</p>
              <div className="ss-tile-bureaus">
                {[["Experian","712","#3B82F6","up"],["Equifax","705","#EF4444","up"],["TransUnion","718","#8B5CF6","watch"]].map(([n,v,c,b]) => (
                  <div key={n} className="ss-tile-bureau">
                    <div className="ss-tile-bureau-name">{n}</div>
                    <div className="ss-tile-bureau-score" style={{ color: c }}>{v}</div>
                    <div className={`ss-tile-bureau-badge ${b}`}>{b === "up" ? "+12 ↑" : "Alert"}</div>
                  </div>
                ))}
              </div>
            </TiltTile>
          </div>
        </div>
      </section>

      {/* ── §4 Social proof — conversation bubbles ──────────── */}
      <section className="ss-social" id="proof">
        <div className="ss-wrap">
          <div className="ss-social-head">
            <span className="ss-section-eye ss-reveal">Real results</span>
            <h2 className="ss-section-h2 ss-reveal ss-d1">The moments that matter.</h2>
            <p className="ss-section-sub ss-reveal ss-d2">Real conversations from real clients.</p>
          </div>

          <div className="ss-chat-feed ss-reveal ss-d1">
            <div className="ss-chat-item">
              <div className="ss-chat-av sage">KR</div>
              <div className="ss-chat-bubble-wrap">
                <div className="ss-chat-name">Keisha R. · Atlanta, GA</div>
                <div className="ss-chat-bubble">
                  I just got approved for my first home loan! My score went from <span className="ss-chat-highlight">588</span> to <span className="ss-chat-score"> 714</span> in 4 months. Couldn't have done it without ScoreShift.
                </div>
                <div className="ss-chat-time">4 months ago</div>
              </div>
            </div>

            <div className="ss-chat-item right">
              <div className="ss-chat-av apricot">DM</div>
              <div className="ss-chat-bubble-wrap">
                <div className="ss-chat-name">David M. · Houston, TX</div>
                <div className="ss-chat-bubble">
                  3 collections wiped out in 6 weeks. The dispute letters were perfect — Experian removed everything on the first round.
                </div>
                <div className="ss-chat-time">2 months ago</div>
              </div>
            </div>

            <div className="ss-chat-item">
              <div className="ss-chat-av">TL</div>
              <div className="ss-chat-bubble-wrap">
                <div className="ss-chat-name">Tamara L. · Chicago, IL</div>
                <div className="ss-chat-bubble">
                  The AI knows exactly what to write. I tried disputing on my own for a year — ScoreShift got my score up <span className="ss-chat-highlight">+62 points</span> in 60 days.
                </div>
                <div className="ss-chat-time">3 months ago</div>
              </div>
            </div>

            <div className="ss-chat-item right">
              <div className="ss-chat-av" style={{ background: "linear-gradient(135deg, #D97050, #A85030)" }}>MW</div>
              <div className="ss-chat-bubble-wrap">
                <div className="ss-chat-name">Marcus W. · Dallas, TX</div>
                <div className="ss-chat-bubble">
                  I refinanced my car at 4.9% instead of 18%. That's saving me over $200 a month. This pays for itself.
                </div>
                <div className="ss-chat-time">1 month ago</div>
              </div>
            </div>

            <div className="ss-chat-item">
              <div className="ss-chat-av sage">NP</div>
              <div className="ss-chat-bubble-wrap">
                <div className="ss-chat-name">Nicole P. · Miami, FL</div>
                <div className="ss-chat-bubble">
                  Identity theft wrecked my credit. ScoreShift's plan walked me through every step. <span className="ss-chat-highlight">+89 points</span> removed 7 fraudulent items.
                </div>
                <div className="ss-chat-time">5 weeks ago</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="ss-social-stats">
            {[
              { val: 74, suffix: "+", label: "Avg. points gained", accent: false },
              { val: 87, suffix: "%", label: "Dispute win rate", accent: true },
              { val: 38, suffix: " days", label: "To first item removed", accent: false },
              { val: 2400, suffix: "+", label: "Clients served", accent: false },
            ].map(s => (
              <div key={s.label} className="ss-social-stat ss-reveal">
                <div className="ss-social-stat-val">
                  <CountUp to={s.val} suffix={s.suffix} />
                </div>
                <div className="ss-social-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── §5 Final CTA — canyon returns ───────────────────── */}
      <section className="ss-cta">
        <img
          src="/images/canyon-hero.jpg"
          alt="Grand Canyon"
          className="ss-cta-img"
        />
        <div className="ss-cta-veil" />
        <div className="ss-cta-body">
          <span className="ss-cta-eye ss-reveal">The next step is yours</span>
          <h2 className="ss-cta-h2 ss-reveal ss-d1">
            Your score is a number.<br />
            Your future isn't.
          </h2>
          <span className="ss-cta-sub ss-reveal ss-d2">
            Join thousands of clients who've used ScoreShift to remove negatives, build credit, and move forward with confidence.
          </span>
          <div className="ss-cta-btns ss-reveal ss-d3">
            <Link href="/get-started" className="ss-btn-cta-main">
              Start free today <ArrowRight />
            </Link>
            <Link href="/auth" className="ss-btn-cta-ghost">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="ss-footer">
        <div className="ss-wrap ss-footer-inner">
          <Link href="/" className="ss-footer-logo">
            <img src={scoreshiftLogo} alt="ScoreShift" />
            ScoreShift
          </Link>
          <ul className="ss-footer-links">
            <li><Link href="/privacy-policy">Privacy</Link></li>
            <li><Link href="/terms">Terms</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><a href="mailto:hello@scoreshift.com">Contact</a></li>
          </ul>
          <span className="ss-footer-copy">© {new Date().getFullYear()} ScoreShift, Inc.</span>
        </div>
      </footer>
    </div>
  );
}
