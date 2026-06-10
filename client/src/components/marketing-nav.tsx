import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";

const ArrowRight = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const handler = () => nav.classList.toggle("scrolled", window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <nav className="ss-nav" ref={navRef}>
        <div className="ss-wrap ss-nav-inner">
          <Link href="/" className="ss-nav-logo">
            <img src="/images/scoreshift-wordmark-transparent.png" alt="ScoreShift" className="ss-nav-logo-img" />
          </Link>
          <ul className="ss-nav-links">
            <li><Link href="/#product">Product</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/#trust">Results</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
          <div className="ss-nav-actions">
            <Link href="/login" className="ss-nav-ghost">Sign in</Link>
            <Link href="/pricing" className="ss-btn-nav">
              Start My Plan <ArrowRight size={13} />
            </Link>
            <button className="ss-hamburger" onClick={() => setOpen(true)} aria-label="Open menu">
              <MenuIcon />
            </button>
          </div>
        </div>
      </nav>

      <div className={`ss-mobile-overlay${open ? " open" : ""}`} onClick={close} aria-hidden="true" />

      <div className={`ss-mobile-menu${open ? " open" : ""}`} role="dialog" aria-label="Navigation menu">
        <div className="ss-mobile-header">
          <Link href="/" className="ss-mobile-brand" onClick={close}>
            <img
              src="/images/scoreshift-wordmark-transparent.png"
              alt="ScoreShift"
              style={{ height: "48px", width: "auto", filter: "brightness(0)" }}
            />
          </Link>
          <button className="ss-mobile-close" onClick={close} aria-label="Close menu">
            <CloseIcon />
          </button>
        </div>

        <nav className="ss-mobile-links">
          <Link href="/#product" className="ss-mobile-link" onClick={close}>Product</Link>
          <Link href="/pricing" className="ss-mobile-link" onClick={close}>Pricing</Link>
          <Link href="/#trust" className="ss-mobile-link" onClick={close}>Results</Link>
          <Link href="/contact" className="ss-mobile-link" onClick={close}>Contact</Link>
        </nav>

        <div className="ss-mobile-ctas">
          <Link href="/login" className="ss-mobile-signin" onClick={close}>Sign in</Link>
          <Link href="/pricing" className="ss-mobile-start" onClick={close}>
            Start My Plan <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </>
  );
}
