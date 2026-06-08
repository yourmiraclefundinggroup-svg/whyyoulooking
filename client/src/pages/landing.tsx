import { useEffect } from "react";
import { Link } from "wouter";
import "../styles/landing.css";

/* ── Scroll reveal ─────────────────────────────────────────── */
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

/* ── Nav scroll ────────────────────────────────────────────── */
function useNavScroll() {
  useEffect(() => {
    const nav = document.querySelector(".ss-nav");
    const handler = () => nav?.classList.toggle("scrolled", window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);
}

/* ── Hero parallax ─────────────────────────────────────────── */
function useHeroParallax() {
  useEffect(() => {
    const img = document.querySelector(".ss-s1-img") as HTMLElement | null;
    let raf: number | null = null;
    const handler = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        if (img) img.style.transform = `translateY(${window.scrollY * 0.28}px)`;
      });
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => { window.removeEventListener("scroll", handler); if (raf) cancelAnimationFrame(raf); };
  }, []);
}

/* ── Icons ─────────────────────────────────────────────────── */
const ArrowRight = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const ChevronDown = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

/* ══════════════════════════════════════════════════════════════
   LANDING PAGE
══════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  useScrollReveal();
  useNavScroll();
  useHeroParallax();

  return (
    <div className="ss-land">

      {/* ── Glass Nav ──────────────────────────────────────────── */}
      <nav className="ss-nav">
        <div className="ss-wrap ss-nav-inner">
          <Link href="/" className="ss-nav-logo">
            <img src="/images/scoreshift-wordmark-transparent.png" alt="ScoreShift" className="ss-nav-logo-img" />
          </Link>
          <ul className="ss-nav-links">
            <li><a href="#product">Product</a></li>
            <li><a href="#journey">How It Works</a></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><a href="#trust">Results</a></li>
          </ul>
          <div className="ss-nav-actions">
            <Link href="/auth" className="ss-nav-ghost">Sign in</Link>
            <Link href="/auth" className="ss-btn-nav">
              Start My Plan <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════════
          SCENE 1 — Believe
      ════════════════════════════════════════════════════════ */}
      <section className="ss-s1">
        <img
          src="/images/hero.jpg"
          alt=""
          className="ss-s1-img"
          aria-hidden="true"
        />
        <div className="ss-s1-veil" />
        <div className="ss-s1-body">
          <h1 className="ss-s1-h1 ss-reveal ss-d1">
            Credit guidance that<br />
            <em>actually tells you<br />what to do next.</em>
          </h1>
          <p className="ss-s1-sub ss-reveal ss-d2">
            Understand what matters, prioritize what comes next, and take
            action with guided tools designed to help you move forward.
          </p>
          <div className="ss-s1-ctas ss-reveal ss-d3">
            <Link href="/auth" className="ss-btn-primary">
              Start My Plan <ArrowRight />
            </Link>
            <a href="#product" className="ss-btn-glass">
              See How It Works
            </a>
          </div>
        </div>
        <a href="#product" className="ss-scroll-cue" aria-label="Scroll down">
          <ChevronDown />
        </a>
      </section>

      {/* ════════════════════════════════════════════════════════
          SCENE 2 — Product Reveal (iPhone showcase)
      ════════════════════════════════════════════════════════ */}
      <section className="ss-s2" id="product">
        <div className="ss-wrap">
          <div className="ss-s2-head ss-reveal">
            <span className="ss-section-eye">Live preview</span>
            <h2 className="ss-s2-h2">
              Know what matters.<br />
              <span className="ss-text-gold">Know what to do next.</span>
            </h2>
            <p className="ss-s2-sub">
              Tap any item in your plan to reveal the tool built to fix it.
            </p>
          </div>
        </div>

        <div className="ss-iphone-stage ss-reveal ss-d1">
          <div className="ss-iphone-glow" />
          <div className="ss-iphone-wrap">
            <div className="ss-iphone-frame">
              <div className="ss-iphone-btn ss-iphone-silent" />
              <div className="ss-iphone-btn ss-iphone-vol-up" />
              <div className="ss-iphone-btn ss-iphone-vol-dn" />
              <div className="ss-iphone-btn ss-iphone-power" />
              <div className="ss-iphone-screen">
                <div className="ss-iphone-island" />
                <iframe
                  src="/portal-iphone"
                  className="ss-iphone-iframe"
                  title="ScoreShift My Plan"
                  frameBorder="0"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="ss-action-map ss-reveal ss-d2">
          <p className="ss-action-map-headline">Your plan connects every problem to the right tool.</p>
          <p className="ss-action-map-sub">Tap a priority to see what ScoreShift helps you do next.</p>
          <div className="ss-action-map-grid">
            {[
              {
                icon: "✦",
                problem: "Inaccurate items",
                action: "Review and dispute with",
                tool: "Dispute IQ",
                colorClass: "ss-pill-indigo",
                delay: "ss-d1",
              },
              {
                icon: "◈",
                problem: "High balances",
                action: "Plan payoff moves with",
                tool: "Debt Navigator",
                colorClass: "ss-pill-gold",
                delay: "ss-d2",
              },
              {
                icon: "◎",
                problem: "Collections",
                action: "See resolution options in",
                tool: "Resolution Center",
                colorClass: "ss-pill-apricot",
                delay: "ss-d3",
              },
              {
                icon: "↺",
                problem: "Late payments",
                action: "Track recovery steps with",
                tool: "Payment Recovery",
                colorClass: "ss-pill-sage",
                delay: "ss-d4",
              },
            ].map(p => (
              <div key={p.tool} className={`ss-action-pill ss-reveal ${p.delay} ${p.colorClass}`}>
                <span className="ss-pill-icon">{p.icon}</span>
                <div className="ss-pill-body">
                  <span className="ss-pill-problem">{p.problem}</span>
                  <span className="ss-pill-action">
                    {p.action} <span className="ss-pill-tool">{p.tool} →</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          SCENE 3 — Guided Journey
      ════════════════════════════════════════════════════════ */}
      <section className="ss-s3" id="journey">
        <div className="ss-s3-parallax-wrap">
          <img src="/images/path-guided.jpg" alt="" className="ss-s3-img" aria-hidden="true" />
        </div>
        <div className="ss-s3-veil" />
        <div className="ss-s3-body">
          <div className="ss-s3-pill ss-reveal">Guided journey</div>
          <h2 className="ss-s3-h2 ss-reveal ss-d1">
            Guidance built<br />around you.
          </h2>
          <p className="ss-s3-sub ss-reveal ss-d2">
            Every person's credit story is different. ScoreShift reads yours
            and builds a step-by-step path that fits where you actually are.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          SCENE 4 — Guidance Built Around You (lifestyle panels)
      ════════════════════════════════════════════════════════ */}
      <section className="ss-s5">
        <div className="ss-s5-intro ss-reveal">
          <h2 className="ss-s5-intro-h2">Guidance built around you.</h2>
          <p className="ss-s5-intro-sub">
            Every person's credit story is different. ScoreShift reads your profile,
            identifies what matters most, and builds a personalized path forward.
          </p>
        </div>

        {[
          {
            id: "builder",
            side: "left",
            image: "/images/lifestyle-builder-new.jpg",
            overlay: "linear-gradient(135deg, rgba(20,12,48,0.38) 0%, rgba(80,48,140,0.22) 100%)",
            accent: "#A78BFA",
            label: "The Builder",
            headline: "Building something bigger than your credit.",
            body: "ScoreShift helps entrepreneurs understand what impacts their profile most, prioritize actions, and track progress over time.",
          },
          {
            id: "future",
            side: "right",
            image: "/images/lifestyle-couple.jpg",
            overlay: "linear-gradient(135deg, rgba(30,14,6,0.36) 0%, rgba(140,72,24,0.22) 100%)",
            accent: "#D4A96A",
            label: "The Future",
            headline: "Planning major milestones.",
            body: "Whether you're preparing for a home purchase, refinancing, or your next move, ScoreShift turns uncertainty into a clear action plan.",
          },
          {
            id: "explorer",
            side: "left",
            image: "/images/lifestyle-explorer.jpg",
            overlay: "linear-gradient(135deg, rgba(10,30,18,0.36) 0%, rgba(40,100,64,0.22) 100%)",
            accent: "#6BAE8A",
            label: "The Explorer",
            headline: "Financial confidence creates freedom.",
            body: "Know what matters, know what comes next, and make decisions with clarity.",
          },
          {
            id: "planner",
            side: "right",
            image: "/images/lifestyle-builder.jpg",
            overlay: "linear-gradient(135deg, rgba(8,18,46,0.38) 0%, rgba(36,60,130,0.22) 100%)",
            accent: "#60A5FA",
            label: "The Planner",
            headline: "Understanding what moves the needle.",
            body: "ScoreShift identifies the factors affecting your profile and guides you through the next best action.",
          },
          {
            id: "community",
            side: "left",
            image: "/images/lifestyle-walk.jpg",
            overlay: "linear-gradient(135deg, rgba(26,14,6,0.36) 0%, rgba(110,72,32,0.22) 100%)",
            accent: "#EFA26F",
            label: "The Community",
            headline: "Progress is easier when you can see it.",
            body: "Track milestones, monitor changes, and follow a plan built around your goals.",
          },
        ].map((p) => (
          <div key={p.id} className="ss-s5-panel ss-reveal">
            <div className={`ss-s5-inner ${p.side === "right" ? "reverse" : ""}`}>
              <div className="ss-s5-art">
                <img src={p.image} alt="" className="ss-s5-photo" aria-hidden="true" />
                <div className="ss-s5-photo-veil" style={{ background: p.overlay }} />
              </div>
              <div className="ss-s5-copy">
                <span className="ss-s5-label" style={{ color: p.accent }}>{p.label}</span>
                <h3 className="ss-s5-headline">{p.headline}</h3>
                <p className="ss-s5-body">{p.body}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ════════════════════════════════════════════════════════
          SCENE 5 — How ScoreShift Guides You (Process)
      ════════════════════════════════════════════════════════ */}
      <section className="ss-sprocess" id="how-it-works">
        <div className="ss-wrap">
          <div className="ss-sprocess-head ss-reveal">
            <h2 className="ss-sprocess-h2">How ScoreShift guides you.</h2>
            <p className="ss-sprocess-sub">
              ScoreShift turns your credit profile into a clear sequence of priorities,
              tools, and next steps.
            </p>
          </div>

          <div className="ss-sprocess-grid">

            {/* ── 01 UNDERSTAND ── */}
            <div className="ss-pcard ss-reveal ss-d1">
              <div className="ss-pcard-visual">
                <svg viewBox="0 0 280 196" fill="none" xmlns="http://www.w3.org/2000/svg" className="ss-pcard-svg">
                  <defs>
                    <filter id="u-shadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#1e1b18" floodOpacity="0.12"/>
                    </filter>
                    <filter id="u-glow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="6" result="blur"/>
                      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                    <linearGradient id="u-bg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.72"/>
                      <stop offset="100%" stopColor="#f5f3ef" stopOpacity="0.60"/>
                    </linearGradient>
                    <linearGradient id="u-hi" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18"/>
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.06"/>
                    </linearGradient>
                    <clipPath id="u-lens-clip">
                      <circle cx="188" cy="122" r="46"/>
                    </clipPath>
                  </defs>
                  {/* Report panel */}
                  <rect x="22" y="18" width="164" height="166" rx="16" fill="url(#u-bg)" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" filter="url(#u-shadow)"/>
                  {/* Header bar */}
                  <rect x="38" y="34" width="52" height="7" rx="3.5" fill="rgba(99,102,241,0.30)"/>
                  <rect x="38" y="47" width="36" height="4" rx="2" fill="rgba(140,123,110,0.22)"/>
                  {/* Divider */}
                  <line x1="38" y1="62" x2="170" y2="62" stroke="rgba(200,194,185,0.45)" strokeWidth="1"/>
                  {/* Report rows — normal */}
                  <rect x="38" y="72" width="120" height="4" rx="2" fill="rgba(140,123,110,0.18)"/>
                  <rect x="38" y="82" width="94" height="4" rx="2" fill="rgba(140,123,110,0.18)"/>
                  {/* Highlighted row 1 — indigo */}
                  <rect x="30" y="94" width="148" height="14" rx="4" fill="url(#u-hi)"/>
                  <rect x="38" y="97" width="110" height="4" rx="2" fill="rgba(99,102,241,0.55)"/>
                  <rect x="152" y="97" width="18" height="4" rx="2" fill="rgba(99,102,241,0.75)"/>
                  {/* Normal rows */}
                  <rect x="38" y="116" width="128" height="4" rx="2" fill="rgba(140,123,110,0.18)"/>
                  <rect x="38" y="126" width="82" height="4" rx="2" fill="rgba(140,123,110,0.18)"/>
                  {/* Highlighted row 2 — gold */}
                  <rect x="30" y="138" width="148" height="14" rx="4" fill="rgba(196,145,58,0.10)"/>
                  <rect x="38" y="141" width="96" height="4" rx="2" fill="rgba(196,145,58,0.60)"/>
                  {/* Normal rows */}
                  <rect x="38" y="160" width="116" height="4" rx="2" fill="rgba(140,123,110,0.18)"/>
                  <rect x="38" y="170" width="72" height="4" rx="2" fill="rgba(140,123,110,0.18)"/>
                  {/* Lens glass backing */}
                  <circle cx="188" cy="122" r="50" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
                  {/* Lens frosted glass circle */}
                  <circle cx="188" cy="122" r="46" fill="rgba(255,255,255,0.52)" stroke="rgba(255,255,255,0.90)" strokeWidth="1.8" filter="url(#u-shadow)"/>
                  {/* Magnified content inside lens */}
                  <g clipPath="url(#u-lens-clip)">
                    <rect x="154" y="108" width="68" height="28" rx="5" fill="rgba(99,102,241,0.08)"/>
                    <rect x="160" y="113" width="56" height="5" rx="2.5" fill="rgba(99,102,241,0.55)"/>
                    <rect x="160" y="122" width="42" height="5" rx="2.5" fill="rgba(99,102,241,0.35)"/>
                    <rect x="160" y="131" width="50" height="4" rx="2" fill="rgba(140,123,110,0.25)"/>
                  </g>
                  {/* Lens rim highlight */}
                  <circle cx="188" cy="122" r="46" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="1.2"/>
                  {/* Handle */}
                  <line x1="224" y1="158" x2="248" y2="182" stroke="rgba(230,225,216,0.85)" strokeWidth="7" strokeLinecap="round"/>
                  <line x1="224" y1="158" x2="248" y2="182" stroke="rgba(255,255,255,0.60)" strokeWidth="3" strokeLinecap="round"/>
                  {/* Lens inner shine */}
                  <ellipse cx="175" cy="110" rx="14" ry="8" fill="rgba(255,255,255,0.28)" transform="rotate(-25 175 110)"/>
                </svg>
              </div>
              <div className="ss-pcard-text">
                <h3 className="ss-pcard-title">Understand</h3>
                <p className="ss-pcard-body">We surface exactly what's impacting your credit — and why each item matters.</p>
              </div>
            </div>

            {/* ── 02 PRIORITIZE ── */}
            <div className="ss-pcard ss-reveal ss-d2">
              <div className="ss-pcard-visual">
                <svg viewBox="0 0 280 196" fill="none" xmlns="http://www.w3.org/2000/svg" className="ss-pcard-svg">
                  <defs>
                    <filter id="p-shadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#1e1b18" floodOpacity="0.14"/>
                    </filter>
                    <filter id="p-node-glow">
                      <feGaussianBlur stdDeviation="4" result="blur"/>
                      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                    <linearGradient id="p-path" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="rgba(99,102,241,0.15)"/>
                      <stop offset="45%" stopColor="rgba(99,102,241,0.55)"/>
                      <stop offset="65%" stopColor="rgba(196,145,58,0.55)"/>
                      <stop offset="100%" stopColor="rgba(196,145,58,0.15)"/>
                    </linearGradient>
                    <linearGradient id="p-card1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.80"/>
                      <stop offset="100%" stopColor="#f0ede8" stopOpacity="0.65"/>
                    </linearGradient>
                  </defs>

                  {/* Background glass panel */}
                  <rect x="16" y="24" width="248" height="152" rx="18" fill="rgba(255,255,255,0.38)" stroke="rgba(255,255,255,0.65)" strokeWidth="1" filter="url(#p-shadow)"/>

                  {/* Connector path — curved through all nodes */}
                  <path d="M 46 130 C 80 130 80 90 114 90 C 148 90 148 60 182 60 C 216 60 216 90 240 90" stroke="url(#p-path)" strokeWidth="2.5" strokeLinecap="round"/>

                  {/* Node 1 — small, muted (left) */}
                  <circle cx="46" cy="130" r="10" fill="rgba(255,255,255,0.55)" stroke="rgba(200,194,185,0.60)" strokeWidth="1.5"/>
                  <circle cx="46" cy="130" r="4" fill="rgba(140,123,110,0.35)"/>

                  {/* Node 2 — medium */}
                  <circle cx="114" cy="90" r="12" fill="rgba(255,255,255,0.65)" stroke="rgba(200,194,185,0.50)" strokeWidth="1.5"/>
                  <circle cx="114" cy="90" r="5" fill="rgba(99,102,241,0.40)"/>

                  {/* Node 3 — PRIMARY elevated (indigo) */}
                  <circle cx="182" cy="60" r="26" fill="rgba(255,255,255,0.30)" stroke="rgba(255,255,255,0.40)" strokeWidth="1" filter="url(#p-shadow)"/>
                  <circle cx="182" cy="60" r="22" fill="url(#p-card1)" stroke="rgba(255,255,255,0.90)" strokeWidth="1.8" filter="url(#p-node-glow)"/>
                  <circle cx="182" cy="60" r="9" fill="rgba(99,102,241,0.85)"/>
                  <circle cx="178" cy="56" r="3" fill="rgba(255,255,255,0.60)"/>
                  {/* Label card for node 3 */}
                  <rect x="148" y="26" width="68" height="22" rx="8" fill="rgba(255,255,255,0.80)" stroke="rgba(99,102,241,0.25)" strokeWidth="1" filter="url(#p-shadow)"/>
                  <rect x="156" y="32" width="32" height="3.5" rx="1.75" fill="rgba(99,102,241,0.60)"/>
                  <rect x="156" y="38" width="22" height="3" rx="1.5" fill="rgba(140,123,110,0.30)"/>

                  {/* Node 4 — SECONDARY elevated (gold) */}
                  <circle cx="240" cy="90" r="19" fill="rgba(255,255,255,0.30)" stroke="rgba(255,255,255,0.40)" strokeWidth="1" filter="url(#p-shadow)"/>
                  <circle cx="240" cy="90" r="16" fill="url(#p-card1)" stroke="rgba(255,255,255,0.90)" strokeWidth="1.5"/>
                  <circle cx="240" cy="90" r="7" fill="rgba(196,145,58,0.85)"/>
                  <circle cx="237" cy="87" r="2.5" fill="rgba(255,255,255,0.55)"/>

                  {/* Ranking labels */}
                  <rect x="20" y="148" width="52" height="18" rx="6" fill="rgba(255,255,255,0.70)" stroke="rgba(200,194,185,0.50)" strokeWidth="1"/>
                  <rect x="27" y="153" width="20" height="3" rx="1.5" fill="rgba(140,123,110,0.35)"/>
                  <rect x="27" y="159" width="30" height="3" rx="1.5" fill="rgba(140,123,110,0.20)"/>

                  <rect x="80" y="148" width="52" height="18" rx="6" fill="rgba(99,102,241,0.10)" stroke="rgba(99,102,241,0.22)" strokeWidth="1"/>
                  <rect x="87" y="153" width="26" height="3" rx="1.5" fill="rgba(99,102,241,0.50)"/>
                  <rect x="87" y="159" width="18" height="3" rx="1.5" fill="rgba(99,102,241,0.28)"/>

                  <rect x="148" y="148" width="60" height="18" rx="6" fill="rgba(196,145,58,0.10)" stroke="rgba(196,145,58,0.28)" strokeWidth="1"/>
                  <rect x="155" y="153" width="28" height="3" rx="1.5" fill="rgba(196,145,58,0.60)"/>
                  <rect x="155" y="159" width="20" height="3" rx="1.5" fill="rgba(196,145,58,0.32)"/>
                </svg>
              </div>
              <div className="ss-pcard-text">
                <h3 className="ss-pcard-title">Prioritize</h3>
                <p className="ss-pcard-body">Your issues are ranked by impact — so you always know what to fix first.</p>
              </div>
            </div>

            {/* ── 03 ACT ── */}
            <div className="ss-pcard ss-reveal ss-d3">
              <div className="ss-pcard-visual">
                <svg viewBox="0 0 280 196" fill="none" xmlns="http://www.w3.org/2000/svg" className="ss-pcard-svg">
                  <defs>
                    <filter id="a-shadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#1e1b18" floodOpacity="0.14"/>
                    </filter>
                    <filter id="a-shadow-sm" x="-10%" y="-10%" width="120%" height="120%">
                      <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#1e1b18" floodOpacity="0.10"/>
                    </filter>
                    <linearGradient id="a-card" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.82"/>
                      <stop offset="100%" stopColor="#f2efe9" stopOpacity="0.68"/>
                    </linearGradient>
                    <linearGradient id="a-indigo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.90"/>
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.95"/>
                    </linearGradient>
                    <linearGradient id="a-gold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d4a853" stopOpacity="0.90"/>
                      <stop offset="100%" stopColor="#b8832a" stopOpacity="0.95"/>
                    </linearGradient>
                  </defs>

                  {/* Tool card 4 — back-left (workflow) */}
                  <g transform="rotate(-8 60 160) translate(14, 60)">
                    <rect width="88" height="108" rx="14" fill="url(#a-card)" stroke="rgba(255,255,255,0.80)" strokeWidth="1.2" filter="url(#a-shadow-sm)"/>
                    <rect x="12" y="14" width="48" height="5" rx="2.5" fill="rgba(140,123,110,0.25)"/>
                    {/* Workflow diagram */}
                    <rect x="12" y="30" width="20" height="14" rx="5" fill="rgba(99,102,241,0.18)" stroke="rgba(99,102,241,0.35)" strokeWidth="1"/>
                    <line x1="32" y1="37" x2="44" y2="37" stroke="rgba(140,123,110,0.35)" strokeWidth="1.5"/>
                    <circle cx="50" cy="37" r="6" fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.45)" strokeWidth="1"/>
                    <line x1="56" y1="37" x2="64" y2="37" stroke="rgba(140,123,110,0.35)" strokeWidth="1.5"/>
                    <rect x="64" y="30" width="14" height="14" rx="4" fill="rgba(196,145,58,0.20)" stroke="rgba(196,145,58,0.45)" strokeWidth="1"/>
                    <rect x="12" y="56" width="64" height="3.5" rx="1.75" fill="rgba(140,123,110,0.18)"/>
                    <rect x="12" y="65" width="50" height="3.5" rx="1.75" fill="rgba(140,123,110,0.18)"/>
                    <rect x="12" y="74" width="58" height="3.5" rx="1.75" fill="rgba(140,123,110,0.14)"/>
                    <rect x="12" y="86" width="36" height="10" rx="5" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.28)" strokeWidth="1"/>
                    <rect x="16" y="89.5" width="28" height="3" rx="1.5" fill="rgba(99,102,241,0.45)"/>
                  </g>

                  {/* Tool card 3 — back-right (navigator / compass) */}
                  <g transform="rotate(7 220 50) translate(158, 18)">
                    <rect width="88" height="108" rx="14" fill="url(#a-card)" stroke="rgba(255,255,255,0.80)" strokeWidth="1.2" filter="url(#a-shadow-sm)"/>
                    <rect x="12" y="14" width="44" height="5" rx="2.5" fill="rgba(196,145,58,0.35)"/>
                    {/* Compass / nav circle */}
                    <circle cx="44" cy="52" r="28" fill="rgba(255,255,255,0.55)" stroke="rgba(200,194,185,0.55)" strokeWidth="1"/>
                    <circle cx="44" cy="52" r="22" fill="none" stroke="rgba(196,145,58,0.20)" strokeWidth="1" strokeDasharray="3 4"/>
                    <line x1="44" y1="30" x2="44" y2="38" stroke="rgba(196,145,58,0.70)" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="44" y1="66" x2="44" y2="74" stroke="rgba(140,123,110,0.35)" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="22" y1="52" x2="30" y2="52" stroke="rgba(140,123,110,0.35)" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="58" y1="52" x2="66" y2="52" stroke="rgba(196,145,58,0.70)" strokeWidth="2" strokeLinecap="round"/>
                    <polygon points="44,34 41,48 44,44 47,48" fill="rgba(196,145,58,0.90)"/>
                    <circle cx="44" cy="52" r="4" fill="rgba(255,255,255,0.90)" stroke="rgba(196,145,58,0.50)" strokeWidth="1"/>
                    <circle cx="44" cy="52" r="1.5" fill="rgba(196,145,58,0.85)"/>
                  </g>

                  {/* Tool card 2 — mid-left (shield) */}
                  <g transform="rotate(-4 80 100) translate(30, 72)">
                    <rect width="94" height="114" rx="15" fill="url(#a-card)" stroke="rgba(255,255,255,0.90)" strokeWidth="1.4" filter="url(#a-shadow)"/>
                    <rect x="14" y="16" width="50" height="5" rx="2.5" fill="rgba(140,123,110,0.25)"/>
                    {/* Shield */}
                    <path d="M47 34 L66 41 L66 57 C66 67 47 75 47 75 C47 75 28 67 28 57 L28 41 Z" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.40)" strokeWidth="1.5"/>
                    <path d="M47 39 L61 44.5 L61 57 C61 64.5 47 70.5 47 70.5 C47 70.5 33 64.5 33 57 L33 44.5 Z" fill="rgba(99,102,241,0.20)"/>
                    <path d="M40 54 L45 59 L56 48" stroke="rgba(99,102,241,0.85)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <rect x="14" y="86" width="66" height="3.5" rx="1.75" fill="rgba(140,123,110,0.18)"/>
                    <rect x="14" y="95" width="52" height="3.5" rx="1.75" fill="rgba(140,123,110,0.14)"/>
                  </g>

                  {/* Tool card 1 — front-center (document / dispute letter) */}
                  <g transform="rotate(3 160 80) translate(126, 52)">
                    <rect width="100" height="122" rx="16" fill="url(#a-card)" stroke="rgba(255,255,255,0.95)" strokeWidth="1.5" filter="url(#a-shadow)"/>
                    {/* Doc header strip */}
                    <rect x="0" y="0" width="100" height="28" rx="16" fill="rgba(99,102,241,0.10)"/>
                    <rect x="0" y="16" width="100" height="12" rx="0" fill="rgba(99,102,241,0.10)"/>
                    <rect x="14" y="8" width="44" height="5" rx="2.5" fill="rgba(99,102,241,0.60)"/>
                    {/* Doc lines */}
                    <rect x="14" y="38" width="72" height="4" rx="2" fill="rgba(140,123,110,0.22)"/>
                    <rect x="14" y="48" width="60" height="4" rx="2" fill="rgba(140,123,110,0.18)"/>
                    <rect x="14" y="58" width="68" height="4" rx="2" fill="rgba(140,123,110,0.22)"/>
                    <rect x="14" y="68" width="52" height="4" rx="2" fill="rgba(140,123,110,0.16)"/>
                    {/* Highlighted clause */}
                    <rect x="10" y="80" width="80" height="14" rx="4" fill="rgba(99,102,241,0.08)"/>
                    <rect x="14" y="83.5" width="64" height="3.5" rx="1.75" fill="rgba(99,102,241,0.50)"/>
                    <rect x="14" y="90" width="44" height="3.5" rx="1.75" fill="rgba(99,102,241,0.30)"/>
                    {/* Send button */}
                    <rect x="14" y="105" width="72" height="11" rx="5.5" fill="url(#a-indigo)"/>
                    <rect x="26" y="108.5" width="32" height="3.5" rx="1.75" fill="rgba(255,255,255,0.75)"/>
                    <polygon points="68,112 72,112 70,108.5" fill="rgba(255,255,255,0.65)"/>
                    {/* Shine */}
                    <ellipse cx="30" cy="10" rx="18" ry="6" fill="rgba(255,255,255,0.30)" transform="rotate(-15 30 10)"/>
                  </g>
                </svg>
              </div>
              <div className="ss-pcard-text">
                <h3 className="ss-pcard-title">Act</h3>
                <p className="ss-pcard-body">Every priority connects to a guided tool — disputes, payoff plans, and protection in one place.</p>
              </div>
            </div>

            {/* ── 04 TRACK ── */}
            <div className="ss-pcard ss-reveal ss-d4">
              <div className="ss-pcard-visual">
                <svg viewBox="0 0 280 196" fill="none" xmlns="http://www.w3.org/2000/svg" className="ss-pcard-svg">
                  <defs>
                    <filter id="t-shadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#1e1b18" floodOpacity="0.13"/>
                    </filter>
                    <linearGradient id="t-bg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75"/>
                      <stop offset="100%" stopColor="#f5f2ec" stopOpacity="0.60"/>
                    </linearGradient>
                    <linearGradient id="t-chart" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor="rgba(99,102,241,0.0)"/>
                      <stop offset="100%" stopColor="rgba(99,102,241,0.18)"/>
                    </linearGradient>
                    <linearGradient id="t-progress" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="rgba(99,102,241,0.70)"/>
                      <stop offset="100%" stopColor="rgba(196,145,58,0.80)"/>
                    </linearGradient>
                    <clipPath id="t-card-clip">
                      <rect x="18" y="20" width="244" height="158" rx="18"/>
                    </clipPath>
                  </defs>

                  {/* Glass backing */}
                  <rect x="18" y="20" width="244" height="158" rx="18" fill="url(#t-bg)" stroke="rgba(255,255,255,0.82)" strokeWidth="1.2" filter="url(#t-shadow)"/>

                  {/* Progress area fill */}
                  <path d="M 34 148 L 34 132 C 60 132 60 118 86 118 C 112 118 112 96 138 96 C 164 96 164 72 190 68 C 216 64 216 56 246 56 L 246 148 Z" fill="url(#t-chart)" clipPath="url(#t-card-clip)"/>

                  {/* Progress line */}
                  <path d="M 34 132 C 60 132 60 118 86 118 C 112 118 112 96 138 96 C 164 96 164 72 190 68 C 216 64 216 56 246 56" stroke="url(#t-progress)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>

                  {/* Timeline baseline */}
                  <line x1="34" y1="148" x2="246" y2="148" stroke="rgba(200,194,185,0.45)" strokeWidth="1.2"/>

                  {/* Milestone 1 — complete (indigo) */}
                  <line x1="34" y1="132" x2="34" y2="148" stroke="rgba(99,102,241,0.35)" strokeWidth="1.2" strokeDasharray="2 2"/>
                  <circle cx="34" cy="132" r="8" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.28)" strokeWidth="1" filter="url(#t-shadow)"/>
                  <circle cx="34" cy="132" r="5" fill="rgba(99,102,241,0.85)"/>
                  <circle cx="32.5" cy="130.5" r="1.5" fill="rgba(255,255,255,0.60)"/>
                  <rect x="20" y="154" width="28" height="9" rx="4.5" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.22)" strokeWidth="1"/>
                  <rect x="23" y="157" width="22" height="3" rx="1.5" fill="rgba(99,102,241,0.45)"/>

                  {/* Milestone 2 — complete */}
                  <line x1="86" y1="118" x2="86" y2="148" stroke="rgba(99,102,241,0.35)" strokeWidth="1.2" strokeDasharray="2 2"/>
                  <circle cx="86" cy="118" r="8" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.28)" strokeWidth="1"/>
                  <circle cx="86" cy="118" r="5" fill="rgba(99,102,241,0.85)"/>
                  <circle cx="84.5" cy="116.5" r="1.5" fill="rgba(255,255,255,0.60)"/>
                  <rect x="72" y="154" width="28" height="9" rx="4.5" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.22)" strokeWidth="1"/>
                  <rect x="75" y="157" width="22" height="3" rx="1.5" fill="rgba(99,102,241,0.45)"/>

                  {/* Milestone 3 — complete */}
                  <line x1="138" y1="96" x2="138" y2="148" stroke="rgba(140,123,110,0.30)" strokeWidth="1.2" strokeDasharray="2 2"/>
                  <circle cx="138" cy="96" r="8" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.28)" strokeWidth="1"/>
                  <circle cx="138" cy="96" r="5" fill="rgba(99,102,241,0.85)"/>
                  <circle cx="136.5" cy="94.5" r="1.5" fill="rgba(255,255,255,0.60)"/>
                  <rect x="124" y="154" width="28" height="9" rx="4.5" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.22)" strokeWidth="1"/>
                  <rect x="127" y="157" width="22" height="3" rx="1.5" fill="rgba(99,102,241,0.45)"/>

                  {/* Milestone 4 — ACTIVE elevated (gold glow) */}
                  <circle cx="190" cy="68" r="18" fill="rgba(196,145,58,0.10)" stroke="rgba(196,145,58,0.20)" strokeWidth="1" filter="url(#t-shadow)"/>
                  <line x1="190" y1="68" x2="190" y2="148" stroke="rgba(196,145,58,0.35)" strokeWidth="1.2" strokeDasharray="2 2"/>
                  <circle cx="190" cy="68" r="12" fill="rgba(255,255,255,0.72)" stroke="rgba(196,145,58,0.55)" strokeWidth="1.5" filter="url(#t-shadow)"/>
                  <circle cx="190" cy="68" r="7" fill="rgba(196,145,58,0.90)"/>
                  <circle cx="188" cy="66" r="2" fill="rgba(255,255,255,0.65)"/>
                  {/* Active score card */}
                  <rect x="158" y="38" width="64" height="22" rx="8" fill="rgba(255,255,255,0.85)" stroke="rgba(196,145,58,0.40)" strokeWidth="1" filter="url(#t-shadow)"/>
                  <rect x="166" y="43" width="28" height="4" rx="2" fill="rgba(196,145,58,0.70)"/>
                  <rect x="166" y="51" width="40" height="3" rx="1.5" fill="rgba(140,123,110,0.30)"/>
                  <rect x="176" y="154" width="28" height="9" rx="4.5" fill="rgba(196,145,58,0.12)" stroke="rgba(196,145,58,0.30)" strokeWidth="1"/>
                  <rect x="179" y="157" width="22" height="3" rx="1.5" fill="rgba(196,145,58,0.55)"/>

                  {/* Milestone 5 — upcoming (ghost) */}
                  <line x1="246" y1="56" x2="246" y2="148" stroke="rgba(200,194,185,0.30)" strokeWidth="1.2" strokeDasharray="2 2"/>
                  <circle cx="246" cy="56" r="8" fill="rgba(255,255,255,0.40)" stroke="rgba(200,194,185,0.45)" strokeWidth="1.2"/>
                  <circle cx="246" cy="56" r="4" fill="rgba(200,194,185,0.35)"/>
                  <rect x="232" y="154" width="28" height="9" rx="4.5" fill="rgba(255,255,255,0.50)" stroke="rgba(200,194,185,0.40)" strokeWidth="1"/>
                  <rect x="235" y="157" width="22" height="3" rx="1.5" fill="rgba(200,194,185,0.40)"/>

                  {/* Glass panel shine at top */}
                  <ellipse cx="120" cy="28" rx="60" ry="8" fill="rgba(255,255,255,0.30)"/>
                </svg>
              </div>
              <div className="ss-pcard-text">
                <h3 className="ss-pcard-title">Track</h3>
                <p className="ss-pcard-body">Watch your score rise through milestones — with a clear view of what changed and what's next.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          SCENE 6 — See The Path Forward (Product Reveal)
      ════════════════════════════════════════════════════════ */}
      <section className="ss-s4">
        <div className="ss-s4-parallax-wrap">
          <img src="/images/path-forward.jpg" alt="" className="ss-s4-img" aria-hidden="true" />
        </div>
        <div className="ss-s4-veil" />
        <div className="ss-s4-body">
          <h2 className="ss-s4-h2 ss-reveal">See the path forward.</h2>

          <div className="ss-plan-card ss-reveal ss-d2">
            <div className="ss-plan-card-top">
              <div>
                <div className="ss-plan-card-label">My Plan</div>
                <div className="ss-plan-card-updated">Updated today</div>
              </div>
              <div className="ss-plan-card-score-wrap">
                <div className="ss-plan-card-score-num">748</div>
                <div className="ss-plan-card-score-label">credit score</div>
              </div>
            </div>
            <div className="ss-plan-card-items">
              {[
                { done: true,  text: "Dispute Midland Funding collection",   tag: "Removed",  tagClass: "done" },
                { done: true,  text: "Lower Capital One utilization to 28%", tag: "Done",     tagClass: "done" },
                { done: false, text: "Send verification letter to Equifax",  tag: "Next",     tagClass: "next" },
                { done: false, text: "Resolve $430 medical balance",         tag: "Upcoming", tagClass: "" },
              ].map((item, i) => (
                <div key={i} className={`ss-plan-item ${item.done ? "done" : ""}`}>
                  <div className="ss-plan-check">{item.done ? "✓" : ""}</div>
                  <span className="ss-plan-text">{item.text}</span>
                  <span className={`ss-plan-tag ${item.tagClass}`}>{item.tag}</span>
                </div>
              ))}
            </div>
            <div className="ss-plan-card-footer">
              <span>Projected score in 60 days</span>
              <strong>760+</strong>
            </div>
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════════════════════
          SCENE 6 — Trust / Testimonials
      ════════════════════════════════════════════════════════ */}
      <section className="ss-s6" id="trust">
        <div className="ss-wrap">
          <div className="ss-s6-head ss-reveal">
            <h2 className="ss-s6-h2">
              Tired of not knowing<br />what to do next?
            </h2>
            <p className="ss-s6-copy">
              Most people can see their credit.
              Very few people know what to do with it.
            </p>
            <p className="ss-s6-copy-b">
              ScoreShift turns confusion into a clear plan and gives you the
              tools to take action — all in one place.
            </p>
          </div>
        </div>

        <div className="ss-tcard-track">
          {[
            { portrait: "/images/portrait-explorer.jpg", name: "Keisha R.", location: "Atlanta, GA",  delta: "+126 pts", quote: "I got approved for my first home loan. My score went from 588 to 714 in 4 months." },
            { portrait: "/images/portrait-builder.jpg",  name: "David M.",  location: "Houston, TX",  delta: "+89 pts",  quote: "3 collections wiped out in 6 weeks. The dispute letters were perfect on the first round." },
            { portrait: "/images/portrait-solo.jpg",     name: "Tamara L.", location: "Chicago, IL",  delta: "+62 pts",  quote: "I tried disputing on my own for a year. ScoreShift got results in 60 days." },
            { portrait: "/images/portrait-planner.jpg",  name: "Marcus W.", location: "Dallas, TX",   delta: "+47 pts",  quote: "I refinanced my car at 4.9% instead of 18%. This product pays for itself." },
            { portrait: "/images/portrait-couple.jpg",   name: "Nicole P.", location: "Miami, FL",    delta: "+89 pts",  quote: "Identity theft wrecked my credit. ScoreShift's plan walked me through every step." },
          ].map((t) => (
            <div key={t.name} className="ss-tcard">
              <div className="ss-tcard-img-side">
                <img src={t.portrait} alt={t.name} className="ss-tcard-portrait-img" />
              </div>
              <div className="ss-tcard-content">
                <div className="ss-tcard-delta">{t.delta}</div>
                <p className="ss-tcard-quote">"{t.quote}"</p>
                <div className="ss-tcard-meta">
                  <strong>{t.name}</strong>
                  <span>{t.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="ss-s6-tagline ss-reveal">
          <em>Know what matters. Know what to do next.</em>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          SCENE 7 — Final CTA
      ════════════════════════════════════════════════════════ */}
      <section className="ss-s7">
        <img src="/images/cta-horizon.jpg" alt="" className="ss-s7-photo" aria-hidden="true" />
        <div className="ss-s7-bg" />
        <div className="ss-s7-horizon" />
        <div className="ss-s7-body">
          <span className="ss-s7-eye ss-reveal">The next step is yours</span>
          <h2 className="ss-s7-h2 ss-reveal ss-d1">Start your guided plan.</h2>
          <p className="ss-s7-sub ss-reveal ss-d2">
            Join thousands of people who finally understand their credit
            — and know exactly what to do about it.
          </p>
          <div className="ss-s7-ctas ss-reveal ss-d3">
            <Link href="/auth" className="ss-btn-cta-primary">
              Start My Plan <ArrowRight />
            </Link>
            <a href="#product" className="ss-btn-cta-ghost">
              See How It Works
            </a>
          </div>
          <p className="ss-s7-fine ss-reveal ss-d4">No credit card required · Free to start</p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="ss-footer">
        <div className="ss-wrap ss-footer-inner">
          <Link href="/" className="ss-footer-logo">
            <img src="/images/scoreshift-logo-full.png" alt="ScoreShift" className="ss-footer-logo-img ss-footer-logo-bars" />
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
