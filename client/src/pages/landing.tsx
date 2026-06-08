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
            {[
              {
                num: "01",
                title: "Understand",
                body: "We identify what impacts your profile.",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/>
                    <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                  </svg>
                ),
              },
              {
                num: "02",
                title: "Prioritize",
                body: "We organize what matters most.",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                    <line x1="8" y1="18" x2="21" y2="18"/>
                    <circle cx="3" cy="6" r="1.5"/><circle cx="3" cy="12" r="1.5"/><circle cx="3" cy="18" r="1.5"/>
                  </svg>
                ),
              },
              {
                num: "03",
                title: "Act",
                body: "Access tools built for the next step.",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                ),
              },
              {
                num: "04",
                title: "Track",
                body: "Monitor progress over time.",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                    <polyline points="16 7 22 7 22 13"/>
                  </svg>
                ),
              },
            ].map((step, i) => (
              <div
                key={step.num}
                className="ss-pcard ss-reveal"
                style={{ "--delay": `${i * 100}ms` } as React.CSSProperties}
              >
                <div className="ss-pcard-icon">{step.icon}</div>
                <div className="ss-pcard-num">{step.num}</div>
                <h3 className="ss-pcard-title">{step.title}</h3>
                <p className="ss-pcard-body">{step.body}</p>
              </div>
            ))}
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
