import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { MapPin, Mail, Phone, MessageCircle, Wrench, Users } from "lucide-react";
import "../styles/landing.css";

import creamEnvImg     from "@assets/ChatGPT_Image_Jun_9,_2026,_03_48_17_PM_1781054065070.png";
import windingPathImg  from "@assets/ChatGPT_Image_Jun_9,_2026,_04_17_47_PM_1781047072844.png";

const HEADER_H = 90;

const C = {
  cream:       "#F7F3EC",
  bone:        "#EDE8DF",
  surface:     "#FFFCF5",
  indigo:      "#4338CA",
  indigoDeep:  "#1E1B4B",
  indigoMid:   "#6366F1",
  indigoShadow:"rgba(67,56,202,0.32)",
  text:        "#1E1B18",
  muted:       "#8C7B6E",
};

const ArrowRight = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

const contactOptions = [
  {
    icon: MessageCircle,
    title: "General Questions",
    description: "Questions about the platform, plans, or account setup.",
    accent: "rgba(67,56,202,0.12)",
    iconColor: C.indigo,
  },
  {
    icon: Wrench,
    title: "Self-Service Support",
    description: "Help navigating tools, reports, monitoring, and guidance features.",
    accent: "rgba(120,113,108,0.10)",
    iconColor: C.muted,
  },
  {
    icon: Users,
    title: "Concierge Services",
    description: "Speak with the ScoreShift team about hands-on support and implementation.",
    accent: "rgba(99,102,241,0.10)",
    iconColor: C.indigoMid,
  },
];

export default function ContactPage() {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const nav = navRef.current;
    if (!nav) return;
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ background: C.cream, minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="ss-nav" ref={navRef}>
        <div className="ss-wrap ss-nav-inner">
          <Link href="/" className="ss-nav-logo">
            <img src="/images/scoreshift-wordmark-transparent.png" alt="ScoreShift" className="ss-nav-logo-img" />
          </Link>
          <ul className="ss-nav-links">
            <li><Link href="/#product">Product</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/#trust">Results</Link></li>
          </ul>
          <div className="ss-nav-actions">
            <Link href="/login" className="ss-nav-ghost">Sign in</Link>
            <Link href="/pricing" className="ss-btn-nav">
              Start My Plan <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1 — HERO
          ══════════════════════════════════════════════════════════════════════ */}
      <div style={{
        position: "relative",
        minHeight: "72vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}>
        <img
          src={creamEnvImg} alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,8,5,0.58) 0%, rgba(10,8,5,0.32) 52%, rgba(247,243,236,1) 100%)" }} />

        <div style={{
          position: "relative", zIndex: 2,
          textAlign: "center",
          padding: `${HEADER_H + 60}px 32px 120px`,
        }}>
          <p style={{
            color: "rgba(180,172,220,0.85)", fontSize: "11px", fontWeight: 700,
            letterSpacing: "0.20em", textTransform: "uppercase", marginBottom: "28px",
          }}>
            ScoreShift — Contact
          </p>
          <h1 style={{
            color: "#FFFCF5",
            fontSize: "clamp(38px, 6vw, 72px)",
            fontWeight: 500, letterSpacing: "-2px", lineHeight: "1.06",
            maxWidth: "760px", margin: "0 auto 28px",
          }}>
            Let's talk about where<br />you're trying to go.
          </h1>
          <p style={{
            color: "rgba(245,235,215,0.68)", fontSize: "18px",
            lineHeight: "1.72", maxWidth: "560px",
            margin: "0 auto",
          }}>
            Whether you're exploring Self-Service, Concierge support,<br />partnerships, or general questions — we're here to help.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2 — CONTACT CARD
          ══════════════════════════════════════════════════════════════════════ */}
      <div style={{ padding: "0 24px 100px", marginTop: "-32px", position: "relative", zIndex: 3 }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>

          {/* Main glass card — dark, Mail Wallet style */}
          <div style={{
            borderRadius: "32px",
            overflow: "hidden",
            position: "relative",
            border: "1px solid rgba(255,252,245,0.12)",
            boxShadow: `0 32px 80px rgba(10,8,5,0.22), 0 4px 24px rgba(10,8,5,0.14), 0 0 0 1px rgba(255,252,245,0.06), inset 0 1px 0 rgba(255,252,245,0.08)`,
          }}>
            {/* Card dark base */}
            <div style={{ position: "absolute", inset: 0, background: "#1A1612" }} />
            {/* Subtle environment image at low opacity */}
            <img
              src={creamEnvImg} alt=""
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 35%", opacity: 0.14 }}
            />
            {/* Indigo glow — top left corner */}
            <div style={{
              position: "absolute", top: -60, left: -60,
              width: 300, height: 300,
              background: "radial-gradient(ellipse, rgba(99,102,241,0.22) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            <div style={{ position: "relative", zIndex: 2, padding: "44px 44px 40px" }}>

              {/* Card header */}
              <div style={{ marginBottom: "40px" }}>
                <div style={{ color: "rgba(255,252,245,0.95)", fontSize: "22px", fontWeight: 600, letterSpacing: "-0.4px", marginBottom: "4px" }}>
                  ScoreShift LLC
                </div>
                <div style={{ color: "rgba(255,252,245,0.32)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase" }}>
                  Credit Repair Platform
                </div>
              </div>

              {/* Contact rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

                {/* Address */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "18px" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "14px", flexShrink: 0,
                    background: "rgba(255,252,245,0.07)",
                    border: "1px solid rgba(255,252,245,0.10)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <MapPin size={18} style={{ color: "rgba(255,252,245,0.50)" }} />
                  </div>
                  <div>
                    <div style={{ color: "rgba(255,252,245,0.40)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "6px" }}>
                      Address
                    </div>
                    <div style={{ color: "rgba(255,252,245,0.90)", fontSize: "16px", lineHeight: "1.6" }}>
                      1201 West Peachtree St NW<br />Unit 2300<br />Atlanta, GA 30309
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: "1px", background: "rgba(255,252,245,0.07)" }} />

                {/* Email */}
                <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "14px", flexShrink: 0,
                    background: "rgba(99,102,241,0.14)",
                    border: "1px solid rgba(99,102,241,0.22)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Mail size={18} style={{ color: "rgba(130,136,210,0.90)" }} />
                  </div>
                  <div>
                    <div style={{ color: "rgba(255,252,245,0.40)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "6px" }}>
                      Email
                    </div>
                    <a
                      href="mailto:info@scoreshiftcapital.com"
                      style={{ color: "rgba(180,172,220,0.95)", fontSize: "16px", fontWeight: 500, textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#A5B4FC")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(180,172,220,0.95)")}
                    >
                      info@scoreshiftcapital.com
                    </a>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: "1px", background: "rgba(255,252,245,0.07)" }} />

                {/* Phone */}
                <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "14px", flexShrink: 0,
                    background: "rgba(255,252,245,0.07)",
                    border: "1px solid rgba(255,252,245,0.10)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Phone size={18} style={{ color: "rgba(255,252,245,0.50)" }} />
                  </div>
                  <div>
                    <div style={{ color: "rgba(255,252,245,0.40)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "6px" }}>
                      Phone
                    </div>
                    <a
                      href="tel:7707126626"
                      style={{ color: "rgba(255,252,245,0.90)", fontSize: "16px", fontWeight: 500, textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFCF5")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,252,245,0.90)")}
                    >
                      770-712-6626
                    </a>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 3 — CONTACT OPTIONS
          ══════════════════════════════════════════════════════════════════════ */}
      <div style={{ position: "relative", overflow: "hidden", padding: "100px 32px" }}>
        <img
          src={creamEnvImg} alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(247,243,236,0.12)" }} />

        <div style={{ position: "relative", zIndex: 2, maxWidth: "1020px", margin: "0 auto" }}>

          <div style={{ textAlign: "center", marginBottom: "72px" }}>
            <p style={{
              color: C.indigo, fontSize: "11px", fontWeight: 700,
              letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "18px",
            }}>
              How Can We Help
            </p>
            <h2 style={{
              color: C.text,
              fontSize: "clamp(36px, 5.5vw, 58px)",
              fontWeight: 500, letterSpacing: "-1.5px", lineHeight: "1.06",
              maxWidth: "600px", margin: "0 auto",
            }}>
              What are you reaching out about?
            </h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
          }}>
            {contactOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <div
                  key={opt.title}
                  style={{
                    background: "rgba(255,252,245,0.88)",
                    backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
                    borderRadius: "28px",
                    border: "1px solid rgba(30,27,24,0.08)",
                    boxShadow: "0 8px 48px rgba(10,8,5,0.08), 0 1px 0 rgba(255,255,255,0.80) inset",
                    padding: "36px 32px",
                    transition: "transform 0.28s cubic-bezier(0.23,1,0.32,1), box-shadow 0.28s",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 20px 60px rgba(10,8,5,0.12), 0 1px 0 rgba(255,255,255,0.80) inset";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "none";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 48px rgba(10,8,5,0.08), 0 1px 0 rgba(255,255,255,0.80) inset";
                  }}
                >
                  <div style={{
                    width: 52, height: 52, borderRadius: "16px",
                    background: opt.accent,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: "24px",
                  }}>
                    <Icon size={22} style={{ color: opt.iconColor }} />
                  </div>
                  <h3 style={{
                    color: C.text, fontSize: "20px", fontWeight: 600,
                    letterSpacing: "-0.3px", marginBottom: "10px",
                  }}>
                    {opt.title}
                  </h3>
                  <p style={{
                    color: C.muted, fontSize: "15px", lineHeight: "1.65",
                  }}>
                    {opt.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Email nudge below cards */}
          <div style={{ textAlign: "center", marginTop: "52px" }}>
            <p style={{ color: C.muted, fontSize: "14px", lineHeight: "1.6" }}>
              For any of the above, reach us at{" "}
              <a
                href="mailto:info@scoreshiftcapital.com"
                style={{ color: C.indigo, fontWeight: 500, textDecoration: "none" }}
              >
                info@scoreshiftcapital.com
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 4 — CLOSING CTA
          ══════════════════════════════════════════════════════════════════════ */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <img
          src={windingPathImg} alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,8,5,0.68) 0%, rgba(10,8,5,0.60) 100%)" }} />

        <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "100px 32px 110px" }}>
          <p style={{
            color: "rgba(160,165,220,0.80)", fontSize: "11px", fontWeight: 700,
            letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "24px",
          }}>
            Ready to Begin
          </p>
          <h2 style={{
            color: "#FFFCF5",
            fontSize: "clamp(36px, 6vw, 68px)",
            fontWeight: 500, letterSpacing: "-1.5px", lineHeight: "1.06",
            maxWidth: "700px", margin: "0 auto 24px",
          }}>
            Ready to move forward?
          </h2>
          <p style={{
            color: "rgba(245,235,218,0.65)", fontSize: "17px",
            lineHeight: "1.7", maxWidth: "420px", margin: "0 auto 52px",
          }}>
            Start your guided plan or explore Concierge support.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/pricing">
              <button
                style={{
                  background: C.indigo, color: "#FFFCF5", border: "none",
                  borderRadius: "100px", padding: "18px 48px",
                  fontSize: "15px", fontWeight: 600, cursor: "pointer",
                  boxShadow: `0 12px 36px ${C.indigoShadow}`,
                  transition: "background 0.22s, transform 0.22s",
                  letterSpacing: "0.02em",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = C.indigoDeep; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = C.indigo; e.currentTarget.style.transform = "none"; }}
              >
                Start My Plan →
              </button>
            </Link>
            <Link href="/pricing">
              <button
                style={{
                  background: "rgba(255,252,245,0.10)",
                  backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                  color: "rgba(255,252,245,0.90)", border: "1px solid rgba(255,252,245,0.22)",
                  borderRadius: "100px", padding: "18px 48px",
                  fontSize: "15px", fontWeight: 500, cursor: "pointer",
                  transition: "background 0.22s, border-color 0.22s, transform 0.22s",
                  letterSpacing: "0.02em",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,252,245,0.18)";
                  e.currentTarget.style.borderColor = "rgba(255,252,245,0.40)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,252,245,0.10)";
                  e.currentTarget.style.borderColor = "rgba(255,252,245,0.22)";
                  e.currentTarget.style.transform = "none";
                }}
              >
                Explore Concierge
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="ss-footer">
        <div className="ss-wrap ss-footer-inner">
          <Link href="/" className="ss-footer-logo">
            <img src="/images/scoreshift-logo-full.png" alt="ScoreShift" className="ss-footer-logo-img ss-footer-logo-bars" />
          </Link>
          <ul className="ss-footer-links">
            <li><Link href="/privacy-policy">Privacy</Link></li>
            <li><Link href="/terms">Terms</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
          <span className="ss-footer-copy">© {new Date().getFullYear()} ScoreShift, LLC.</span>
        </div>
      </footer>

    </div>
  );
}
