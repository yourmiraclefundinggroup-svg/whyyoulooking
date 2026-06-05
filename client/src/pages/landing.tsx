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

/* ── Cinematic scroll progress — rAF-throttled ──────────────── */
function useCinematicProgress(ref: React.RefObject<HTMLDivElement>) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let rafId: number | null = null;
    const update = () => {
      rafId = null;
      const el = ref.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      const h = el.offsetHeight;
      const vh = window.innerHeight;
      const travel = h - vh;
      const p = travel > 0 ? Math.max(0, Math.min(1, -top / travel)) : 0;
      setProgress(p);
    };
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [ref]);
  return progress;
}

/* ── 3D tilt — CSS-variable driven with cursor-follow glow ──── */
function useTilt(ref: React.RefObject<HTMLDivElement>, strength = 3) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width * 2 - 1;
      const y = (e.clientY - r.top) / r.height * 2 - 1;
      el.style.setProperty("--rotateX", `${-y * strength}deg`);
      el.style.setProperty("--rotateY", `${x * strength * 1.2}deg`);
      el.style.setProperty("--gx", `${e.clientX - r.left}px`);
      el.style.setProperty("--gy", `${e.clientY - r.top}px`);
      el.classList.add("tilting");
    };
    const leave = () => {
      el.style.setProperty("--rotateX", "0deg");
      el.style.setProperty("--rotateY", "0deg");
      el.classList.remove("tilting");
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

  // Three timed copy lines at 0/15/35% progress, each lasting ~20pp
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
  const lineOp = (start: number, peak: number, end: number) => {
    if (cinProgress < start) return 0;
    if (cinProgress < peak) return clamp((cinProgress - start) / (peak - start), 0, 1);
    return clamp(1 - (cinProgress - peak) / (end - peak), 0, 1);
  };
  const line1Op = lineOp(0, 0.06, 0.28);
  const line2Op = lineOp(0.15, 0.26, 0.48);
  const line3Op = lineOp(0.35, 0.46, 0.58);
  const line1Y  = -cinProgress * 30;
  const line2Y  = -(cinProgress - 0.15) * 30;
  const line3Y  = -(cinProgress - 0.35) * 30;

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
            <li><a href="#how">How It Works</a></li>
            <li><a href="#features">Features</a></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><a href="#proof">Results</a></li>
          </ul>
          <div className="ss-nav-actions">
            <Link href="/auth" className="ss-nav-ghost">Sign in</Link>
            <Link href="/auth" className="ss-btn-nav">
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
            Modern credit monitoring, improvement, and financial readiness tools to help you
            move forward with clarity.
          </p>
          <div className="ss-hero-ctas ss-reveal ss-d3">
            <Link href="/auth" className="ss-btn-primary">
              Check Your Credit Health <ArrowRight />
            </Link>
            <a href="#how" className="ss-btn-ghost">
              See How It Works
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

      {/* ── §2 Cinematic scroll — canyon descent, three copy lines ─── */}
      <div className="ss-cin-wrap" id="how" ref={cinRef}>
        <div className="ss-cin-sticky">
          <video
            className="ss-cin-video"
            src="/videos/canyon-descent.mp4"
            autoPlay muted loop playsInline
          />
          <div className="ss-cin-veil" />

          {/* Line 1 — visible 0–28% */}
          <div className="ss-cin-line" style={{ opacity: line1Op, transform: `translateY(${line1Y}px)` }}>
            <span className="ss-cin-eyebrow">The ScoreShift difference</span>
            <h2 className="ss-cin-h2">Every disputed item removed.</h2>
          </div>

          {/* Line 2 — visible 15–48% */}
          <div className="ss-cin-line" style={{ opacity: line2Op, transform: `translateY(${line2Y}px)` }}>
            <h2 className="ss-cin-h2 ss-cin-h2-em">Every point counts.</h2>
          </div>

          {/* Line 3 — visible 35–58% */}
          <div className="ss-cin-line" style={{ opacity: line3Op, transform: `translateY(${line3Y}px)` }}>
            <span className="ss-cin-sub">Your portal is waiting.</span>
          </div>

          {/* Scroll hint */}
          <div className="ss-cin-scroll-hint" style={{ opacity: scrollHintOp }}>
            <ChevronDown />
          </div>
        </div>
      </div>

      {/* ── §3 Portal Float — canyon atmosphere with live portal ─── */}
      <section className="ss-pfloat" id="portal-float">
        <img src="/images/canyon-hero.jpg" alt="Grand Canyon atmosphere" className="ss-pfloat-bg" />
        <div className="ss-pfloat-fog" />
        <div className="ss-pfloat-inner ss-reveal">
          <div className="ss-pfloat-caption">
            <span className="ss-section-eye" style={{ color: "var(--ss-apricot)" }}>Live preview</span>
            <h2 className="ss-pfloat-h2">Your portal. Fully loaded.</h2>
            <p className="ss-pfloat-sub">
              Click anything — it's the real thing. Every screen is interactive, data-driven, and ready on day one.
            </p>
          </div>
          <div className="ss-pfloat-frame ss-reveal ss-d1">
            <iframe
              src="/portal-demo"
              className="ss-pfloat-iframe"
              title="ScoreShift portal preview"
              scrolling="no"
              frameBorder="0"
            />
          </div>
        </div>
      </section>

      {/* ── §4 Bento features ───────────────────────────────── */}
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
            {/* A — My Plan */}
            <TiltTile className="ss-tile-a ss-reveal">
              <div className="ss-tile-eye"><span className="ss-tile-eye-dot" />My Plan</div>
              <h3 className="ss-tile-h3">Your guided action plan, always current</h3>
              <p className="ss-tile-sub">AI builds and updates your personalized credit roadmap every day.</p>
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

            {/* C — Progress Tracker */}
            <TiltTile className="ss-tile-c ss-reveal">
              <div className="ss-tile-icon indigo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
              </div>
              <div className="ss-tile-eye"><span className="ss-tile-eye-dot" />Progress Tracker</div>
              <div className="ss-tile-big-stat indigo">+74</div>
              <div className="ss-tile-stat-desc">avg. points gained in 90 days</div>
            </TiltTile>

            {/* D — Protection Center */}
            <TiltTile className="ss-tile-d ss-reveal ss-d1">
              <div className="ss-tile-icon sage">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div className="ss-tile-eye"><span className="ss-tile-eye-dot" style={{ background: "var(--ss-sage)" }} />Protection Center</div>
              <div className="ss-tile-big-stat sage">87<span style={{ fontSize: 28 }}>%</span></div>
              <div className="ss-tile-stat-desc">dispute win rate across all bureaus</div>
            </TiltTile>

            {/* E — Smart Letters */}
            <TiltTile className="ss-tile-e ss-reveal ss-d2">
              <div className="ss-tile-icon apricot">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div className="ss-tile-eye"><span className="ss-tile-eye-dot" style={{ background: "var(--ss-apricot)" }} />Smart Letters</div>
              <div className="ss-tile-big-stat apricot">38</div>
              <div className="ss-tile-stat-desc">days avg. to first item removed</div>
            </TiltTile>

            {/* F — Debt Navigator */}
            <TiltTile className="ss-tile-f ss-reveal">
              <div className="ss-tile-icon charcoal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div className="ss-tile-eye"><span className="ss-tile-eye-dot" style={{ background: "var(--ss-charcoal)" }} />Debt Navigator</div>
              <h3 className="ss-tile-h3">Your payoff strategy, simplified</h3>
              <div className="ss-tile-chat">
                <div className="ss-tile-bubble user">What should I pay off first?</div>
                <div className="ss-tile-bubble ai">Start with the Capital One card at 24.9% APR — it's your highest-interest balance. Paying it down first saves you the most over time and frees up utilization.</div>
                <div className="ss-tile-typing">
                  <span/><span/><span/>
                </div>
              </div>
            </TiltTile>

            {/* G — Credit Report */}
            <TiltTile className="ss-tile-g ss-reveal ss-d1">
              <div className="ss-tile-icon indigo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </div>
              <div className="ss-tile-eye"><span className="ss-tile-eye-dot" />Credit Report</div>
              <h3 className="ss-tile-h3">All three bureaus, one clear view</h3>
              <p className="ss-tile-sub">Real-time monitoring across Experian, Equifax, and TransUnion — with instant alerts on any change.</p>
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

          <div className="ss-chat-feed">
            <div className="ss-chat-item ss-reveal">
              <div className="ss-chat-av sage">KR</div>
              <div className="ss-chat-bubble-wrap">
                <div className="ss-chat-stars">★★★★★</div>
                <div className="ss-chat-name">Keisha R. · Atlanta, GA</div>
                <div className="ss-chat-bubble">
                  I just got approved for my first home loan! My score went from <span className="ss-chat-highlight">588</span> to <span className="ss-chat-score"> 714</span> in 4 months. Couldn't have done it without ScoreShift.
                </div>
                <div className="ss-chat-reaction">🏡</div>
                <div className="ss-chat-time">4 months ago</div>
              </div>
            </div>

            <div className="ss-chat-item right ss-reveal ss-d1">
              <div className="ss-chat-av apricot">DM</div>
              <div className="ss-chat-bubble-wrap">
                <div className="ss-chat-stars">★★★★★</div>
                <div className="ss-chat-name">David M. · Houston, TX</div>
                <div className="ss-chat-bubble">
                  3 collections wiped out in 6 weeks. The dispute letters were perfect — Experian removed everything on the first round.
                </div>
                <div className="ss-chat-reaction">🎯</div>
                <div className="ss-chat-time">2 months ago</div>
              </div>
            </div>

            <div className="ss-chat-item ss-reveal ss-d2">
              <div className="ss-chat-av">TL</div>
              <div className="ss-chat-bubble-wrap">
                <div className="ss-chat-stars">★★★★★</div>
                <div className="ss-chat-name">Tamara L. · Chicago, IL</div>
                <div className="ss-chat-bubble">
                  The AI knows exactly what to write. I tried disputing on my own for a year — ScoreShift got my score up <span className="ss-chat-highlight">+62 points</span> in 60 days.
                </div>
                <div className="ss-chat-reaction">📈</div>
                <div className="ss-chat-time">3 months ago</div>
              </div>
            </div>

            <div className="ss-chat-item right ss-reveal ss-d3">
              <div className="ss-chat-av" style={{ background: "linear-gradient(135deg, #D97050, #A85030)" }}>MW</div>
              <div className="ss-chat-bubble-wrap">
                <div className="ss-chat-stars">★★★★★</div>
                <div className="ss-chat-name">Marcus W. · Dallas, TX</div>
                <div className="ss-chat-bubble">
                  I refinanced my car at 4.9% instead of 18%. That's saving me over $200 a month. This pays for itself.
                </div>
                <div className="ss-chat-reaction">🚗</div>
                <div className="ss-chat-time">1 month ago</div>
              </div>
            </div>

            <div className="ss-chat-item ss-reveal ss-d4">
              <div className="ss-chat-av sage">NP</div>
              <div className="ss-chat-bubble-wrap">
                <div className="ss-chat-stars">★★★★★</div>
                <div className="ss-chat-name">Nicole P. · Miami, FL</div>
                <div className="ss-chat-bubble">
                  Identity theft wrecked my credit. ScoreShift's plan walked me through every step. <span className="ss-chat-highlight">+89 points</span> removed 7 fraudulent items.
                </div>
                <div className="ss-chat-reaction">🛡️</div>
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
          <h2 className="ss-cta-h2 ss-reveal ss-d1">Start your climb.</h2>
          <span className="ss-cta-sub ss-reveal ss-d2">
            Join thousands of clients who've removed negatives, built credit, and moved forward with confidence.
          </span>
          <div className="ss-cta-btns ss-reveal ss-d3">
            <Link href="/auth" className="ss-btn-cta-main">
              Get Started Free <ArrowRight />
            </Link>
            <Link href="/auth" className="ss-btn-cta-ghost">
              Sign in
            </Link>
          </div>
          <p className="ss-cta-fine ss-reveal ss-d4">No credit card required · Cancel any time</p>
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
