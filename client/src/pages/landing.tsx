import { useEffect } from "react";
import { Link } from "wouter";
import "../styles/landing.css";
import scoreshiftLogo from "@assets/scoreshift-logo.png";

const ArrowRightIcon = ({ size = 16 }: { size?: number }) => (
  <svg style={{ width: size, height: size }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const CheckIcon = ({ size = 9 }: { size?: number }) => (
  <svg style={{ width: size, height: size }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = ({ size = 10 }: { size?: number }) => (
  <svg style={{ width: size, height: size }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const LinkIcon = ({ size = 18 }: { size?: number }) => (
  <svg style={{ width: size, height: size }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

function Icon({ d, size = 20 }: { d: string | string[]; size?: number }) {
  const paths = Array.isArray(d) ? d : [d];
  return (
    <svg style={{ width: size, height: size }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {paths.map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}

// ── Icon path definitions ────────────────────────────────
const ICONS = {
  chart:    ["M3 3h18v18H3z", "M7 16l3-4 3 3 3-5"],
  brain:    ["M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z","M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z","M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"],
  letter:   ["M2 4h20a2 2 0 0 1 0 4v8a2 2 0 0 1-2 2H2V4z","m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"],
  send:     ["M22 2 11 13","M22 2 15 22 11 13 2 9l20-7z"],
  bell:     ["M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9","M10.3 21a1.94 1.94 0 0 0 3.4 0"],
  shield:   ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z","m9 12 2 2 4-4"],
  user:     ["M12 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z","M20 21a8 8 0 1 0-16 0"],
  card:     ["M2 5h20a2 2 0 0 1 0 14H2z","M2 10h20"],
  file:     ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z","M14 2v6h6","M8 13h8","M8 17h4"],
  search:   ["M11 11m-8 0a8 8 0 1 0 16 0 8 8 0 0 0-16 0","M21 21l-4.35-4.35"],
  strategy: ["M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5","M9 18h6","M10 22h4"],
  layers:   ["M12 2 2 7l10 5 10-5-10-5z","M2 17l10 5 10-5","M2 12l10 5 10-5"],
  truck:    ["M1 3h15a1 1 0 0 1 1 1v13","M16 8h4l3 5v3h-7V8z","M5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z","M18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"],
  workflow: ["M2 3h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H2V3z","M16 3h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-6V3z","M9 15h6a1 1 0 0 1 1 1v6h-8v-6a1 1 0 0 1 1-1z","M5 9v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9","M12 12v3"],
  lock:     ["M3 11h18v11H3z","M7 11V7a5 5 0 0 1 10 0v4"],
};

// ── Scroll animation hook ────────────────────────────────
function useScrollAnimations() {
  useEffect(() => {
    const els = document.querySelectorAll(".lp-fade-up");
    els.forEach(el => el.classList.add("will-animate"));
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add("visible"); observer.unobserve(e.target); }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ── Announcement Bar ─────────────────────────────────────
function AnnouncementBar() {
  return (
    <div className="lp-announcement">
      <svg className="lp-ann-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      </svg>
      ScoreShift now includes live 3-bureau monitoring, readiness tracking, and guided progress tools.
      <Link href="/credit-monitoring">See what's included <ArrowRightIcon size={12} /></Link>
    </div>
  );
}

// ── Navigation ───────────────────────────────────────────
function Nav() {
  return (
    <nav className="lp-nav">
      <div className="lp-container">
        <div className="lp-nav-inner">
          <Link href="/" className="lp-nav-logo">
            <img src={scoreshiftLogo} alt="ScoreShift" className="lp-nav-logo-icon" style={{ width: 28, height: 28, objectFit: "contain" }} />
            ScoreShift
          </Link>
          <ul className="lp-nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#workflow">How It Works</a></li>
            <li><a href="#integrations">Integrations</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><Link href="/pricing">For Business</Link></li>
          </ul>
          <div className="lp-nav-actions">
            <Link href="/auth" className="lp-btn lp-btn-ghost">Sign In</Link>
            <Link href="/auth" className="lp-btn lp-btn-primary">Check Your Credit Health <ArrowRightIcon /></Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ── Hero ─────────────────────────────────────────────────
function HeroSection() {
  const navItems = [
    { label: "Dashboard", active: true,  icon: ["M3 3h7v7H3z","M14 3h7v7h-7z","M3 14h7v7H3z","M14 14h7v7h-7z"] },
    { label: "Clients",   active: false, icon: ["M12 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z","M20 21a8 8 0 1 0-16 0"] },
    { label: "Disputes",  active: false, icon: ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z","M14 2v6h6"] },
    { label: "Letters",   active: false, icon: ["M2 4h20v16H2z","m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"] },
    { label: "Certified Mail", active: false, icon: ["M22 2 11 13","M22 2 15 22 11 13 2 9l20-7z"] },
    { label: "Monitoring",active: false, icon: ["M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9","M10.3 21a1.94 1.94 0 0 0 3.4 0"] },
    { label: "Billing",   active: false, icon: ["M2 5h20v14H2z","M2 10h20"] },
  ];
  const scores = [
    { bureau: "Bureau 1", num: "786", delta: "+18", color: "#22c55e" },
    { bureau: "Bureau 2", num: "729", delta: "+22", color: "#6366f1" },
    { bureau: "Bureau 3", num: "802", delta: "+7",  color: "#14b8a6" },
  ];
  const clients = [
    { init: "MJ", name: "Marcus Johnson",  score: "712", status: "Active",      cls: "lp-status-active"  },
    { init: "SR", name: "Simone Rivera",   score: "658", status: "In Progress", cls: "lp-status-pending" },
    { init: "DT", name: "David Thompson",  score: "741", status: "Active",      cls: "lp-status-active"  },
  ];
  const pipeline = [["done","Pull Report"],["done","Analyze"],["active","Strategy"],["","Letters"],["","Mail"],["","Track"]];

  return (
    <section className="lp-hero">
      <div className="lp-container">
        <div className="lp-hero-inner">
          {/* Left: content */}
          <div className="lp-hero-content">
            <div className="lp-hero-eyebrow lp-fade-up">
              <span className="lp-badge"><span className="lp-badge-dot" />Modern Credit &amp; Financial Readiness Platform</span>
            </div>
            <h1 className="lp-hero-headline lp-fade-up lp-delay-1">
              Built to move<br />
              <span className="lp-gradient-text">you forward.</span>
            </h1>
            <p className="lp-hero-subheadline lp-fade-up lp-delay-2">
              Modern credit monitoring, improvement, and readiness tools designed to help you move forward financially.
            </p>
            <div className="lp-hero-ctas lp-fade-up lp-delay-3">
              <Link href="/auth" className="lp-btn lp-btn-primary lp-btn-lg">Check Your Credit Health <ArrowRightIcon /></Link>
              <a href="#workflow" className="lp-btn lp-btn-outline lp-btn-lg">See How It Works</a>
            </div>
            <div className="lp-hero-social-proof lp-fade-up lp-delay-4">
              <div className="lp-hero-avatars">
                {["JM","KR","TS","AL"].map(i => <div key={i} className="lp-hero-avatar">{i}</div>)}
              </div>
              <p className="lp-hero-proof-text">Trusted by <strong>1,200+ people</strong> moving their credit forward</p>
            </div>
          </div>

          {/* Right: dashboard mockup */}
          <div className="lp-hero-visual lp-fade-up lp-delay-2">
            <div className="lp-float-badge top-right">
              <div className="lp-float-badge-icon" style={{ background: "#d1fae5", color: "#059669" }}>
                <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#9aa3b5", fontWeight: 500 }}>Score Change</div>
                <div style={{ color: "#059669" }}>+47 pts this month</div>
              </div>
            </div>

            <div className="lp-float-badge bottom-left">
              <div className="lp-float-badge-icon" style={{ background: "#ede9fe", color: "#4f46e5" }}>
                <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2 11 13" /><path d="M22 2 15 22 11 13 2 9l20-7z" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#9aa3b5", fontWeight: 500 }}>Certified Mail</div>
                <div>3 letters delivered</div>
              </div>
            </div>

            <div className="lp-dashboard-mockup">
              <div className="lp-dash-topbar">
                <div className="lp-dash-dots">
                  <div className="lp-dash-dot" style={{ background: "#ff5f57" }} />
                  <div className="lp-dash-dot" style={{ background: "#febc2e" }} />
                  <div className="lp-dash-dot" style={{ background: "#28c840" }} />
                </div>
                <div className="lp-dash-url-bar">app.scoreshiftapp.com/dashboard</div>
              </div>
              <div className="lp-dash-body">
                <div className="lp-dash-sidebar">
                  <div className="lp-dash-sidebar-logo">
                    <div className="lp-dash-sidebar-logo-dot" />ScoreShift
                  </div>
                  {navItems.map(item => (
                    <div key={item.label} className={`lp-dash-nav-item${item.active ? " active" : ""}`}>
                      <svg className="lp-dash-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        {item.icon.map((p, i) => <path key={i} d={p} />)}
                      </svg>
                      {item.label}
                    </div>
                  ))}
                </div>

                <div className="lp-dash-main">
                  <div className="lp-dash-header-row">
                    <div className="lp-dash-title">Dashboard</div>
                    <div className="lp-dash-tag" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white" }}>Live</div>
                  </div>

                  <div style={{ background: "linear-gradient(135deg,#0f1220,#1e1b4b)", borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: "#818cf8", textTransform: "uppercase", marginBottom: 4 }}>WELCOME BACK</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 8 }}>Good morning, Marcus.</div>
                    <div style={{ display: "flex", gap: 10 }}>
                      {[{val:"+47",label:"pts gained",color:"#34d399"},{val:"7",label:"removed",color:"#818cf8"},{val:"802",label:"top score",color:"#2dd4bf"}].map(s=>(
                        <div key={s.label} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: s.color }}>{s.val}</div>
                          <div style={{ fontSize: 8, color: "#6b7280" }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lp-dash-score-row">
                    {scores.map(s => (
                      <div key={s.bureau} className="lp-dash-score-card" style={{ borderTop: `2px solid ${s.color}` }}>
                        <div className="lp-dash-bureau-name">{s.bureau}</div>
                        <div className="lp-dash-score-num" style={{ color: s.color }}>{s.num}</div>
                        <div className="lp-dash-score-delta">↑ {s.delta}</div>
                      </div>
                    ))}
                  </div>

                  <div className="lp-dash-pipeline-label">Dispute Pipeline</div>
                  <div className="lp-dash-pipeline">
                    {pipeline.map(([cls,label]) => (
                      <div key={label} className={`lp-dash-pipe-step${cls ? " "+cls : ""}`}>{label}</div>
                    ))}
                  </div>

                  {clients.map(c => (
                    <div key={c.name} className="lp-dash-client-row">
                      <div className="lp-dash-client-avatar">{c.init}</div>
                      <div className="lp-dash-client-name">{c.name}</div>
                      <div className="lp-dash-client-score">{c.score}</div>
                      <div className={`lp-dash-client-status ${c.cls}`}>{c.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Trust Bar ────────────────────────────────────────────
function TrustBar() {
  const items = [
    { label: "SOC 2 Ready", icon: ICONS.lock },
    { label: "FCRA Compliant", icon: ICONS.shield },
    { label: "3-Bureau Live Data", icon: ICONS.chart },
    { label: "USPS Certified Mail", icon: ICONS.send },
    { label: "1,200+ Professionals", icon: ICONS.user },
    { label: "Dispute IQ Engine", icon: ICONS.brain },
  ];
  return (
    <div className="lp-trust-bar">
      <div className="lp-container">
        <div className="lp-trust-bar-inner">
          <span className="lp-trust-label">Built for real financial progress</span>
          {items.map(item => (
            <div key={item.label} className="lp-trust-logo">
              <Icon d={item.icon} size={20} />
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Problem Section ──────────────────────────────────────
function ProblemSection() {
  const problems = [
    "No single place to see your full credit picture",
    "No visibility into what's actually affecting your profile",
    "No clear path forward or readiness indicators",
    "No organized system to track progress over time",
  ];
  const cards = [
    { bg: "rgba(99,102,241,0.12)",  color: "#818cf8", icon: ICONS.workflow, title: "No Financial Visibility",       body: "You can't see your full credit picture in one place — scattered accounts, inconsistent data, and no clear view of what lenders actually see." },
    { bg: "rgba(251,191,36,0.12)",  color: "#fbbf24", icon: ICONS.file,     title: "Uncertainty Without Clarity",   body: "Not knowing what's hurting your profile or why creates anxiety and inaction. You need a clear, honest view of where you stand." },
    { bg: "rgba(239,68,68,0.12)",   color: "#f87171", icon: ICONS.truck,    title: "No Organized Progress Tracking",body: "Scattered paperwork, forgotten follow-ups, no single view of what's been sent, disputed, or resolved — progress gets lost." },
  ];
  return (
    <section className="lp-problem">
      <div className="lp-container">
        <div className="lp-problem-inner">
          <div className="lp-fade-up">
            <div className="lp-section-label" style={{ color: "#818cf8" }}>The Challenge</div>
            <h2 className="lp-problem-headline">Financial uncertainty is overwhelming.<br /><span className="lp-gradient-text">We built clarity.</span></h2>
            <p className="lp-problem-body">Managing your credit profile shouldn't mean navigating confusion, chasing paperwork, or wondering what's actually happening. There's a better way to move forward.</p>
            <ul className="lp-problem-list">
              {problems.map(p => (
                <li key={p}>
                  <div className="lp-problem-x-icon"><XIcon /></div>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="lp-pain-cards lp-fade-up lp-delay-2">
            {cards.map(c => (
              <div key={c.title} className="lp-pain-card">
                <div className="lp-pain-card-icon" style={{ background: c.bg, color: c.color }}>
                  <Icon d={c.icon} size={20} />
                </div>
                <div>
                  <div className="lp-pain-card-title">{c.title}</div>
                  <div className="lp-pain-card-body">{c.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Solution Section ─────────────────────────────────────
function SolutionSection() {
  const modules = [
    { bg: "#ede9fe", color: "#4f46e5", icon: ICONS.chart,  name: "Credit Reports",   desc: "Live tri-bureau visibility — see exactly what's affecting your profile." },
    { bg: "#fef3c7", color: "#d97706", icon: ICONS.brain,  name: "Dispute IQ",       desc: "Identifies what can be challenged and guides you through it." },
    { bg: "#d1fae5", color: "#059669", icon: ICONS.letter, name: "Smart Letters",    desc: "Guided dispute letters built around your specific profile." },
    { bg: "#fee2e2", color: "#dc2626", icon: ICONS.send,   name: "Certified Mail",   desc: "Automated USPS certified mail — no manual steps needed." },
    { bg: "#dbeafe", color: "#2563eb", icon: ICONS.bell,   name: "Monitoring",       desc: "Real-time alerts when anything changes across all 3 bureaus." },
    { bg: "#fce7f3", color: "#db2777", icon: ICONS.shield, name: "Identity Protect", desc: "Dark web surveillance and fraud alerts, always on." },
    { bg: "#ecfdf5", color: "#059669", icon: ICONS.user,   name: "Client Portal",    desc: "See your progress, disputes, and credit profile in one view." },
    { bg: "#f0fdf4", color: "#16a34a", icon: ICONS.card,   name: "Billing",          desc: "Manage your subscription and plan from your dashboard." },
  ];
  return (
    <section className="lp-solution" id="solution">
      <div className="lp-container">
        <div className="lp-solution-header">
          <div className="lp-section-label lp-fade-up">The Platform</div>
          <h2 className="lp-solution-headline lp-fade-up lp-delay-1">Everything that moves you forward.<br /><span className="lp-gradient-text">In one place.</span></h2>
          <p className="lp-solution-body lp-fade-up lp-delay-2">
            ScoreShift brings monitoring, visibility, dispute management, and readiness tools into one organized, intelligent platform — so you always know where you stand and what to do next.
          </p>
        </div>
        <div className="lp-solution-platform lp-fade-up lp-delay-2">
          {modules.map(m => (
            <div key={m.name} className="lp-platform-module">
              <div className="lp-platform-module-icon" style={{ background: m.bg, color: m.color }}>
                <Icon d={m.icon} size={18} />
              </div>
              <div className="lp-platform-module-name">{m.name}</div>
              <div className="lp-platform-module-desc">{m.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Features Section ─────────────────────────────────────
function FeaturesSection() {
  const features = [
    { span2: true,  delay: 0, bg: "#ede9fe", color: "#4f46e5", icon: ICONS.chart,  name: "Tri-Bureau Credit Reports",  desc: "See your full credit picture across all three bureaus — live, organized, and always up to date. Know exactly what's on your profile before you make any financial move." },
    { span2: false, delay: 1, bg: "#fef3c7", color: "#d97706", icon: ICONS.brain,  name: "Dispute IQ",                 desc: "ScoreShift identifies what can be challenged on your profile and builds a clear path forward — guided by FCRA and Metro 2 standards." },
    { span2: false, delay: 2, bg: "#d1fae5", color: "#059669", icon: ICONS.letter, name: "Personalized Letters",       desc: "Every dispute letter is built around your actual profile data — specific, compliant, and organized through your dashboard." },
    { span2: false, delay: 1, bg: "#fee2e2", color: "#dc2626", icon: ICONS.send,   name: "Certified Mail Automation",  desc: "Dispute letters go out via USPS certified mail automatically — tracked, confirmed, and visible inside your account." },
    { span2: false, delay: 2, bg: "#dbeafe", color: "#2563eb", icon: ICONS.bell,   name: "Credit Monitoring",          desc: "Live alerts the moment anything changes across all 3 bureaus — so you're never caught off guard." },
    { span2: false, delay: 3, bg: "#fce7f3", color: "#db2777", icon: ICONS.shield, name: "Identity Protection",        desc: "Dark web monitoring, SSN surveillance, and fraud alerts — running continuously in the background." },
    { span2: true,  delay: 1, bg: "#ecfdf5", color: "#059669", icon: ICONS.user,   name: "Client Portal & Billing",    desc: "Track your progress, view dispute status, and manage your profile — all organized in one clear view. Paired with integrated billing so everything you need is in one place." },
  ];
  return (
    <section className="lp-features" id="features">
      <div className="lp-container">
        <div className="lp-features-header">
          <div className="lp-section-label lp-fade-up">What You Get</div>
          <h2 className="lp-features-headline lp-fade-up lp-delay-1">Complete visibility. Guided progress.</h2>
          <p className="lp-features-subhead lp-fade-up lp-delay-2">Know where you stand. See what's affecting you. Understand what to do next.</p>
        </div>
        <div className="lp-feature-grid">
          {features.map(f => (
            <div key={f.name} className={`lp-feature-card lp-fade-up${f.span2 ? " span-2" : ""}${f.delay ? ` lp-delay-${f.delay}` : ""}`}>
              <div className="lp-feature-icon-wrap" style={{ background: f.bg, color: f.color }}>
                <Icon d={f.icon} size={22} />
              </div>
              <div className="lp-feature-name">{f.name}</div>
              <div className="lp-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Workflow Section ─────────────────────────────────────
function WorkflowSection() {
  const steps = [
    { icon: ICONS.file,     title: "See Your Profile",       desc: "Live tri-bureau data in one organized view" },
    { icon: ICONS.search,   title: "Understand What's There", desc: "See what's affecting your profile and why" },
    { icon: ICONS.strategy, title: "Build Your Path Forward", desc: "Clear, guided steps toward financial readiness" },
    { icon: ICONS.letter,   title: "Prepare Dispute Letters", desc: "Profile-specific, compliant dispute letters" },
    { icon: ICONS.send,     title: "Send & Track",            desc: "USPS certified mail — automated and tracked" },
    { icon: ICONS.layers,   title: "Monitor Progress",        desc: "Live monitoring and real-time score updates" },
  ];
  return (
    <section className="lp-workflow" id="workflow">
      <div className="lp-container">
        <div className="lp-workflow-header">
          <div className="lp-section-label lp-fade-up">How It Works</div>
          <h2 className="lp-workflow-headline lp-fade-up lp-delay-1">A clear path forward.</h2>
          <p className="lp-workflow-body lp-fade-up lp-delay-2">ScoreShift walks you through every step — from seeing your full credit picture to tracking your progress — so you always know where you are and what's next.</p>
        </div>
        <div className="lp-workflow-steps">
          {steps.map((s, i) => (
            <div key={s.title} className={`lp-workflow-step lp-fade-up${i > 0 ? ` lp-delay-${i}` : ""}`}>
              <div className="lp-workflow-step-num"><Icon d={s.icon} size={22} /></div>
              <div className="lp-workflow-step-title">{s.title}</div>
              <div className="lp-workflow-step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Integrations Section ─────────────────────────────────
function IntegrationsSection() {
  const check = <div className="lp-check-icon"><CheckIcon size={8} /></div>;
  return (
    <section className="lp-integrations" id="integrations">
      <div className="lp-container">
        <div className="lp-integrations-header">
          <div className="lp-section-label lp-fade-up">Platform Capabilities</div>
          <h2 className="lp-integrations-headline lp-fade-up lp-delay-1">The infrastructure<br /><span className="lp-gradient-text">behind your progress.</span></h2>
          <p className="lp-integrations-body lp-fade-up lp-delay-2">ScoreShift connects live credit data, dispute management, and certified mail into one organized experience — so everything affecting your financial profile is visible in one place.</p>
        </div>

        <div className="lp-integrations-layout lp-fade-up lp-delay-2">
          {/* Credit Intelligence Card */}
          <div className="lp-integration-card">
            <div className="lp-integration-logo">
              <div className="lp-integration-logo-icon" style={{ background: "#ede9fe", color: "#4f46e5" }}><Icon d={ICONS.chart} size={22} /></div>
              <div className="lp-integration-logo-name">Credit Intelligence</div>
            </div>
            <div className="lp-integration-tagline">Live Data & Score Monitoring</div>
            <p className="lp-integration-desc">ScoreShift delivers live tri-bureau credit data, real-time score tracking, and identity protection — all surfaced inside your branded platform.</p>
            <ul className="lp-integration-features">
              {["Live tri-bureau credit reports","Real-time score monitoring","Identity theft protection","Dark web surveillance"].map(f=><li key={f}>{check}{f}</li>)}
            </ul>
          </div>

          {/* Connector */}
          <div className="lp-integration-connector">
            <div className="lp-connector-line" />
            <div className="lp-connector-center"><LinkIcon size={18} /></div>
            <div className="lp-connector-line-2" />
          </div>

          {/* ScoreShift Center Card */}
          <div className="lp-integration-card lp-scoreshift-center">
            <div className="lp-integration-logo">
              <div className="lp-integration-logo-icon" style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8" }}><Icon d={ICONS.layers} size={22} /></div>
              <div className="lp-integration-logo-name">ScoreShift</div>
            </div>
            <div className="lp-integration-tagline">Your Branded Platform</div>
            <p className="lp-integration-desc">ScoreShift is the intelligence layer — combining data, automation, and workflow into one cohesive experience under your brand.</p>
            <ul className="lp-integration-features">
              {["Dispute IQ engine","Client portal & billing","Workflow automation","White-label ready"].map(f=><li key={f}>{check}{f}</li>)}
            </ul>
          </div>
        </div>

        {/* Mail Automation Row */}
        <div className="lp-integrations-mail-row lp-fade-up lp-delay-3">
          <div />
          <div className="lp-mail-connector">
            <div className="lp-mail-line" />
            <div className="lp-mail-dot"><Icon d={ICONS.send} size={18} /></div>
            <div className="lp-mail-line-2" />
          </div>
          <div className="lp-integration-card lp-mail-card">
            <div className="lp-integration-logo">
              <div className="lp-integration-logo-icon" style={{ background: "#d1fae5", color: "#059669" }}><Icon d={ICONS.truck} size={22} /></div>
              <div className="lp-integration-logo-name">Mail Automation</div>
            </div>
            <div className="lp-integration-tagline">Certified Mail — Built In</div>
            <p className="lp-integration-desc">ScoreShift automatically sends USPS certified mail the moment a dispute letter is ready — no printing, no trips to the post office, no manual steps.</p>
            <ul className="lp-integration-features">
              {["Automated USPS delivery","Real-time tracking numbers","14-day follow-up alerts","Delivery confirmation"].map(f=><li key={f}>{check}{f}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Pricing Section ──────────────────────────────────────
function PricingSection() {
  const plans = [
    {
      tier: "Starter", price: "29", period: "per month",
      note: "Start seeing your full credit picture", featured: false,
      features: ["Credit report import","3 dispute letters/month","Basic AI analysis","Email support"],
    },
    {
      tier: "Pro", price: "79", period: "per month",
      note: "Most popular — everything you need to move forward", featured: true,
      features: ["Unlimited dispute letters","Live 3-bureau monitoring","Score simulator","Certified mail automation","Priority support"],
    },
    {
      tier: "Elite", price: "149", period: "per month",
      note: "Complete readiness and protection suite", featured: false,
      features: ["Everything in Pro","Identity protection","Debt navigator","White-label portal","Dedicated account manager"],
    },
  ];
  return (
    <section className="lp-pricing" id="pricing">
      <div className="lp-container">
        <div className="lp-pricing-header">
          <div className="lp-section-label lp-fade-up">Simple Pricing</div>
          <h2 className="lp-pricing-headline lp-fade-up lp-delay-1">Plans built for where you are</h2>
          <p className="lp-pricing-subhead lp-fade-up lp-delay-2">Start free. Scale when you're ready. No hidden fees, no long-term contracts.</p>
        </div>
        <div className="lp-pricing-grid">
          {plans.map((p, i) => (
            <div key={p.tier} className={`lp-pricing-card lp-fade-up${p.featured ? " featured" : ""}${i > 0 ? ` lp-delay-${i}` : ""}`}>
              {p.featured && <div className="lp-pricing-badge">Most Popular</div>}
              <div className="lp-pricing-tier">{p.tier}</div>
              <div className="lp-pricing-price"><sup>$</sup>{p.price}</div>
              <div className="lp-pricing-period">{p.period}</div>
              <div className="lp-pricing-note">{p.note}</div>
              <div className="lp-pricing-divider" />
              <ul className="lp-pricing-features">
                {p.features.map(f => (
                  <li key={f}><div className="lp-pricing-check"><CheckIcon size={9} /></div>{f}</li>
                ))}
              </ul>
              <Link href="/auth" className={`lp-btn lp-btn-lg ${p.featured ? "lp-btn-accent" : "lp-btn-outline"}`} style={{ width: "100%", justifyContent: "center" }}>
                {p.tier === "Starter" ? "Start Monitoring" : p.tier === "Pro" ? "Check Your Readiness" : "Get Started"} <ArrowRightIcon />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Final CTA ────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="lp-final-cta">
      <div className="lp-container">
        <div className="lp-final-cta-inner">
          <div className="lp-final-cta-eyebrow">Join 1,200+ people moving their credit forward</div>
          <h2 className="lp-final-cta-headline">Built to move you forward.</h2>
          <p className="lp-final-cta-body">ScoreShift gives you the visibility, organization, and tools to understand your credit profile — and a clear path to move forward financially.</p>
          <div className="lp-final-cta-actions">
            <Link href="/auth" className="lp-btn lp-btn-white lp-btn-lg">Check Your Credit Health <ArrowRightIcon /></Link>
            <a href="#pricing" className="lp-btn lp-btn-ghost-white lp-btn-lg">See Pricing</a>
          </div>
          <p className="lp-final-cta-note">No credit card required · Cancel anytime</p>
        </div>
      </div>
    </section>
  );
}

// ── Footer ───────────────────────────────────────────────
function Footer() {
  return (
    <footer className="lp-footer">
      <div className="lp-container">
        <div className="lp-footer-inner">
          <div>
            <div className="lp-footer-brand-logo">
              <img src={scoreshiftLogo} alt="ScoreShift" className="lp-footer-brand-logo-icon" style={{ width: 28, height: 28, objectFit: "contain" }} />
              ScoreShift
            </div>
            <p className="lp-footer-tagline">Modern credit monitoring, progress tracking, and readiness tools — built to move you forward.</p>
            <div className="lp-footer-socials">
              <div className="lp-footer-social-btn">
                <svg style={{ width: 15, height: 15 }} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </div>
              <div className="lp-footer-social-btn">
                <svg style={{ width: 15, height: 15 }} viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
              </div>
            </div>
          </div>
          <div>
            <div className="lp-footer-col-title">Product</div>
            <ul className="lp-footer-links">
              {["Features","Pricing","How It Works","Credit Monitoring","Identity Protection"].map(l => <li key={l}><a href="#">{l}</a></li>)}
            </ul>
          </div>
          <div>
            <div className="lp-footer-col-title">Company</div>
            <ul className="lp-footer-links">
              {["About","Blog","Careers","Press"].map(l => <li key={l}><a href="#">{l}</a></li>)}
            </ul>
          </div>
          <div>
            <div className="lp-footer-col-title">Legal</div>
            <ul className="lp-footer-links">
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <div className="lp-footer-copy">© {new Date().getFullYear()} ScoreShift. All rights reserved.</div>
          <div className="lp-footer-legal">
            <Link href="/privacy-policy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Main Export ──────────────────────────────────────────
export default function LandingPage() {
  useScrollAnimations();
  return (
    <div className="landing-page">
      <AnnouncementBar />
      <Nav />
      <HeroSection />
      <TrustBar />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <WorkflowSection />
      <IntegrationsSection />
      <PricingSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
