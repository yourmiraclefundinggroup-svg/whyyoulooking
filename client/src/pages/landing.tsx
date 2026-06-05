import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import "../styles/landing.css";
import scoreshiftLogo from "@assets/scoreshift-logo.png";

// ── Hooks ─────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".lp2-reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("lp2-visible"); obs.unobserve(e.target); }
      }),
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

function useNavScroll() {
  useEffect(() => {
    const nav = document.querySelector(".lp2-nav");
    const handler = () => nav?.classList.toggle("scrolled", window.scrollY > 48);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
}

// ── Cinematic scroll progress ──────────────────────────────
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

// ── Count-up hook ──────────────────────────────────────────
function useCountUp(from: number, to: number, duration = 1600) {
  const [value, setValue] = useState(from);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setValue(to); return;
      }
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
  return { value, ref };
}

// ── 3D Tilt ───────────────────────────────────────────────
function tiltMove(e: React.MouseEvent<HTMLDivElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width * 2 - 1;
  const y = (e.clientY - r.top) / r.height * 2 - 1;
  el.style.transform = `perspective(900px) rotateX(${-y * 2}deg) rotateY(${x * 3}deg) translateY(-4px)`;
  el.style.boxShadow = `0 2px 6px rgba(42,40,37,0.06),0 12px 32px rgba(42,40,37,0.12),0 36px 64px rgba(42,40,37,0.09),inset 0 1px 0 rgba(255,255,255,0.9)`;
}
function tiltLeave(e: React.MouseEvent<HTMLDivElement>) {
  e.currentTarget.style.transform = "";
  e.currentTarget.style.boxShadow = "";
}

// ══════════════════════════════════════════════════════════
// ILLUSTRATIONS — Miniature 3D product objects
// ══════════════════════════════════════════════════════════

function PlanIllus() {
  return (
    <svg viewBox="0 0 120 90" fill="none" className="lp2-illus" aria-hidden="true">
      <defs>
        <radialGradient id="pl-bg" cx="55%" cy="65%" r="55%">
          <stop offset="0%" stopColor="#8F7AFF" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#8F7AFF" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="pl-path" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6B5FD9"/>
          <stop offset="100%" stopColor="#A89CFF"/>
        </linearGradient>
        <filter id="pl-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#8F7AFF" floodOpacity="0.32"/>
        </filter>
        <filter id="pl-active" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#8F7AFF" floodOpacity="0.5"/>
        </filter>
      </defs>
      <ellipse cx="62" cy="56" rx="52" ry="30" fill="url(#pl-bg)"/>
      <path d="M18 70 C32 60 44 66 58 60 C72 54 84 46 104 28"
        stroke="url(#pl-path)" strokeWidth="1.5" strokeDasharray="3.5 3"
        strokeLinecap="round" opacity="0.55"/>
      <circle cx="18" cy="70" r="8" fill="#6B5FD9" filter="url(#pl-shadow)"/>
      <path d="M15 70l2.5 2.5 5.5-5.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="58" cy="60" r="8" fill="#7B6FED" filter="url(#pl-shadow)"/>
      <path d="M55 60l2.5 2.5 5.5-5.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="85" cy="46" r="16" fill="#8F7AFF" fillOpacity="0.14"/>
      <circle cx="85" cy="46" r="11" fill="#8F7AFF" filter="url(#pl-active)"/>
      <circle cx="85" cy="46" r="11" fill="none" stroke="white" strokeWidth="1" opacity="0.35"/>
      <circle cx="85" cy="46" r="4" fill="white"/>
      <circle cx="104" cy="28" r="7.5" fill="none" stroke="#8F7AFF" strokeWidth="1.5" opacity="0.4"/>
      <circle cx="104" cy="28" r="2.5" fill="#8F7AFF" opacity="0.4"/>
      <rect x="22" y="76" width="30" height="8" rx="4" fill="#8F7AFF" fillOpacity="0.1"/>
      <rect x="26" y="79" width="18" height="2.5" rx="1.25" fill="#8F7AFF" fillOpacity="0.45"/>
    </svg>
  );
}

function DisputeIllus() {
  return (
    <svg viewBox="0 0 120 90" fill="none" className="lp2-illus" aria-hidden="true">
      <defs>
        <linearGradient id="dq-g" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#B4A8FF"/>
          <stop offset="55%" stopColor="#8F7AFF"/>
          <stop offset="100%" stopColor="#5448CC"/>
        </linearGradient>
        <radialGradient id="dq-shine" cx="33%" cy="22%" r="42%">
          <stop offset="0%" stopColor="white" stopOpacity="0.55"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>
        <filter id="dq-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="7" floodColor="#5448CC" floodOpacity="0.38"/>
        </filter>
      </defs>
      <ellipse cx="60" cy="54" rx="44" ry="28" fill="#8F7AFF" fillOpacity="0.07"/>
      <path d="M60 11 L92 46 L60 81 L28 46 Z" fill="url(#dq-g)" filter="url(#dq-shadow)"/>
      <line x1="60" y1="11" x2="60" y2="81" stroke="white" strokeWidth="0.5" opacity="0.18"/>
      <line x1="28" y1="46" x2="92" y2="46" stroke="white" strokeWidth="0.5" opacity="0.18"/>
      <line x1="60" y1="11" x2="28" y2="46" stroke="white" strokeWidth="0.35" opacity="0.12"/>
      <line x1="60" y1="11" x2="92" y2="46" stroke="white" strokeWidth="0.35" opacity="0.12"/>
      <path d="M60 11 L92 46 L60 81 L28 46 Z" fill="url(#dq-shine)"/>
      <path d="M60 11 L92 46" stroke="white" strokeWidth="1.8" opacity="0.55"/>
      <circle cx="14" cy="30" r="3" fill="#8F7AFF" opacity="0.35"/>
      <circle cx="106" cy="26" r="3" fill="#8F7AFF" opacity="0.35"/>
      <circle cx="110" cy="58" r="2" fill="#8F7AFF" opacity="0.28"/>
      <circle cx="12" cy="60" r="2" fill="#8F7AFF" opacity="0.28"/>
    </svg>
  );
}

function ProtectionIllus() {
  return (
    <svg viewBox="0 0 120 90" fill="none" className="lp2-illus" aria-hidden="true">
      <defs>
        <radialGradient id="pr-sp" cx="38%" cy="32%" r="62%">
          <stop offset="0%" stopColor="#9DDBB8"/>
          <stop offset="58%" stopColor="#6BAE8A"/>
          <stop offset="100%" stopColor="#4A8068"/>
        </radialGradient>
        <radialGradient id="pr-sh" cx="32%" cy="28%" r="38%">
          <stop offset="0%" stopColor="white" stopOpacity="0.52"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>
        <filter id="pr-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="7" floodColor="#6BAE8A" floodOpacity="0.42"/>
        </filter>
        <clipPath id="pr-clip"><circle cx="60" cy="45" r="27"/></clipPath>
      </defs>
      <circle cx="60" cy="45" r="39" fill="none" stroke="#6BAE8A" strokeWidth="1" opacity="0.22"/>
      <circle cx="60" cy="45" r="33" fill="none" stroke="#6BAE8A" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.28"/>
      <circle cx="60" cy="45" r="27" fill="url(#pr-sp)" filter="url(#pr-glow)"/>
      <g clipPath="url(#pr-clip)" opacity="0.18">
        <ellipse cx="60" cy="45" rx="27" ry="13" fill="none" stroke="white" strokeWidth="0.7"/>
        <ellipse cx="60" cy="45" rx="27" ry="21" fill="none" stroke="white" strokeWidth="0.7" transform="rotate(60 60 45)"/>
        <ellipse cx="60" cy="45" rx="27" ry="21" fill="none" stroke="white" strokeWidth="0.7" transform="rotate(-60 60 45)"/>
        <line x1="33" y1="45" x2="87" y2="45" stroke="white" strokeWidth="0.7"/>
        <line x1="60" y1="18" x2="60" y2="72" stroke="white" strokeWidth="0.7"/>
      </g>
      <circle cx="60" cy="45" r="27" fill="url(#pr-sh)"/>
      <path d="M60 33 L60 57 C60 57 49 51 49 44 L49 38 L60 33 Z" fill="white" fillOpacity="0.82"/>
      <path d="M60 33 L60 57 C60 57 71 51 71 44 L71 38 L60 33 Z" fill="white" fillOpacity="0.62"/>
      <path d="M55 44 L58.5 48 L66 39" stroke="#4A8068" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function DebtIllus() {
  const bars = [
    { x: 10, h: 52, f: "#D97050", t: "#F0A080", r: "#A85030" },
    { x: 36, h: 38, f: "#D08860", t: "#E8A870", r: "#9A6038" },
    { x: 62, h: 24, f: "#78AC8E", t: "#90C8A8", r: "#568468" },
    { x: 88, h: 12, f: "#6BAE8A", t: "#88CAA8", r: "#4A8068" },
  ];
  const d = 6; const by = 78;
  return (
    <svg viewBox="0 0 120 90" fill="none" className="lp2-illus" aria-hidden="true">
      <defs>
        <filter id="db-s" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#2A2825" floodOpacity="0.18"/>
        </filter>
      </defs>
      <line x1="8" y1={by+2} x2="116" y2={by+2} stroke="#C8BFB4" strokeWidth="1.5" strokeLinecap="round"/>
      {bars.map((b, i) => {
        const top = by - b.h;
        return (
          <g key={i} filter="url(#db-s)">
            <rect x={b.x} y={top} width={20} height={b.h} rx="2" fill={b.f}/>
            <path d={`M${b.x} ${top} L${b.x+d} ${top-d} L${b.x+20+d} ${top-d} L${b.x+20} ${top} Z`} fill={b.t}/>
            <path d={`M${b.x+20} ${top} L${b.x+20+d} ${top-d} L${b.x+20+d} ${by-d} L${b.x+20} ${by} Z`} fill={b.r}/>
            <rect x={b.x} y={top} width={20} height={b.h*0.28} rx="2" fill="white" fillOpacity="0.13"/>
          </g>
        );
      })}
      <path d="M20 24 C38 18 56 26 70 34 C82 41 92 52 102 68"
        stroke="#8F7AFF" strokeWidth="1.5" strokeDasharray="3 2.5" strokeLinecap="round" opacity="0.45"/>
      <path d="M99 65 L102 69 L105 65" stroke="#8F7AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.45"/>
    </svg>
  );
}

function LoanIllus() {
  return (
    <svg viewBox="0 0 120 90" fill="none" className="lp2-illus" aria-hidden="true">
      <defs>
        <linearGradient id="ln-s" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#90D0AA"/>
          <stop offset="100%" stopColor="#538870"/>
        </linearGradient>
        <filter id="ln-sf" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#4A8068" floodOpacity="0.32"/>
        </filter>
        <filter id="ln-cap" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#2A2825" floodOpacity="0.28"/>
        </filter>
      </defs>
      <rect x="15" y="65" width="20" height="14" rx="3" fill="url(#ln-s)" filter="url(#ln-sf)" opacity="0.7"/>
      <rect x="38" y="53" width="20" height="26" rx="3" fill="url(#ln-s)" filter="url(#ln-sf)" opacity="0.82"/>
      <rect x="61" y="41" width="20" height="38" rx="3" fill="url(#ln-s)" filter="url(#ln-sf)" opacity="0.92"/>
      <rect x="84" y="29" width="20" height="50" rx="3" fill="url(#ln-s)" filter="url(#ln-sf)"/>
      <path d="M60 27 C63 34 72 37 92 37" stroke="#6BAE8A" strokeWidth="1.5" strokeDasharray="3 2.5" strokeLinecap="round" opacity="0.5"/>
      <rect x="34" y="13" width="52" height="11" rx="2.5" fill="#2A2825" filter="url(#ln-cap)"/>
      <path d="M42 24 L78 24 L74 35 L46 35 Z" fill="#3A3530"/>
      <circle cx="80" cy="13" r="4" fill="#EFA26F"/>
      <line x1="80" y1="17" x2="80" y2="27" stroke="#EFA26F" strokeWidth="1.5"/>
      <path d="M78 27 L82 27 L81 32 L79 32 Z" fill="#EFA26F"/>
      <rect x="34" y="13" width="52" height="4.5" rx="2.5" fill="white" fillOpacity="0.12"/>
    </svg>
  );
}

function SubsIllus() {
  const cards = [
    { y: 54, c1: "#ECE8E0", c2: "#DAD4CA", acc: "#EFA26F" },
    { y: 38, c1: "#E8E4F2", c2: "#D8D2EA", acc: "#8F7AFF" },
    { y: 22, c1: "#E2EEE8", c2: "#CEE4D8", acc: "#6BAE8A" },
  ];
  return (
    <svg viewBox="0 0 120 90" fill="none" className="lp2-illus" aria-hidden="true">
      <defs>
        <filter id="sc-s" x="-10%" y="-10%" width="120%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#2A2825" floodOpacity="0.15"/>
        </filter>
      </defs>
      {cards.map((c, i) => (
        <g key={i} filter="url(#sc-s)">
          <rect x="16" y={c.y} width="88" height="26" rx="9" fill={c.c1}/>
          <rect x="16" y={c.y} width="88" height="10" rx="9" fill={c.c2} fillOpacity="0.55"/>
          <circle cx="34" cy={c.y+13} r="5.5" fill={c.acc} opacity="0.88"/>
          <rect x="46" y={c.y+9} width="32" height="4" rx="2" fill="#8C7B6E" fillOpacity="0.38"/>
          <rect x="46" y={c.y+17} width="22" height="3" rx="1.5" fill="#8C7B6E" fillOpacity="0.22"/>
          <rect x="82" y={c.y+10} width="18" height="6" rx="3" fill={c.acc} fillOpacity="0.22"/>
          <rect x="16" y={c.y} width="88" height="26" rx="9" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.62"/>
        </g>
      ))}
    </svg>
  );
}

function ReportIllus() {
  return (
    <svg viewBox="0 0 120 90" fill="none" className="lp2-illus" aria-hidden="true">
      <defs>
        <linearGradient id="rp-g" x1="0.3" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#F2F0FF"/>
          <stop offset="100%" stopColor="#DDD8FF"/>
        </linearGradient>
        <filter id="rp-s" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="5" stdDeviation="8" floodColor="#8F7AFF" floodOpacity="0.28"/>
        </filter>
      </defs>
      <ellipse cx="60" cy="50" rx="48" ry="30" fill="#8F7AFF" fillOpacity="0.07"/>
      <rect x="20" y="9" width="80" height="72" rx="9" fill="url(#rp-g)" filter="url(#rp-s)"/>
      <rect x="20" y="9" width="80" height="72" rx="9" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.72"/>
      <rect x="20" y="9" width="80" height="18" rx="9" fill="#8F7AFF" fillOpacity="0.13"/>
      <circle cx="33" cy="18" r="4.5" fill="#8F7AFF" fillOpacity="0.6"/>
      <rect x="42" y="15" width="28" height="4" rx="2" fill="#8F7AFF" fillOpacity="0.4"/>
      <rect x="80" y="13" width="16" height="10" rx="5" fill="#8F7AFF" fillOpacity="0.7"/>
      {[33, 44, 55, 65].map((y, i) => (
        <g key={i}>
          <rect x="28" y={y} width={[48, 36, 42, 28][i]} height="4" rx="2" fill="#8C7B6E" fillOpacity={0.32 - i * 0.04}/>
          <circle cx="82" cy={y+2} r="3" fill="#5590D8" fillOpacity="0.7"/>
          <circle cx="90" cy={y+2} r="3" fill="#E05050" fillOpacity="0.7"/>
          <circle cx="98" cy={y+2} r="3" fill="#8860CC" fillOpacity="0.7"/>
        </g>
      ))}
      <rect x="28" y="72" width="64" height="7" rx="3.5" fill="#8F7AFF" fillOpacity="0.16"/>
      <rect x="38" y="74" width="44" height="3" rx="1.5" fill="#8F7AFF" fillOpacity="0.48"/>
    </svg>
  );
}

function ProgressIllus() {
  const nodes = [
    { cx: 18, cy: 74, r: 5.5, fill: "#B0A898" },
    { cx: 36, cy: 63, r: 7, fill: "#9880CC" },
    { cx: 58, cy: 50, r: 8.5, fill: "#8F7AFF" },
    { cx: 80, cy: 35, r: 10, fill: "#7060DD" },
    { cx: 100, cy: 18, r: 12, fill: "#5C4FC8" },
  ];
  return (
    <svg viewBox="0 0 120 90" fill="none" className="lp2-illus" aria-hidden="true">
      <defs>
        <linearGradient id="pg-l" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#B0A898" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#5C4FC8"/>
        </linearGradient>
        <filter id="pg-g" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="5" floodColor="#5C4FC8" floodOpacity="0.48"/>
        </filter>
      </defs>
      <ellipse cx="96" cy="20" rx="28" ry="18" fill="#8F7AFF" fillOpacity="0.1"/>
      <path d="M18 74 C28 68 32 67 36 63 C46 56 52 54 58 50 C68 44 74 40 80 35 C90 28 95 24 100 18"
        stroke="url(#pg-l)" strokeWidth="2.2" strokeLinecap="round"/>
      {nodes.map((n, i) => (
        <g key={i}>
          {i === nodes.length-1 && <circle cx={n.cx} cy={n.cy} r={n.r+9} fill="#8F7AFF" fillOpacity="0.15"/>}
          <circle cx={n.cx} cy={n.cy} r={n.r} fill={n.fill}
            filter={i === nodes.length-1 ? "url(#pg-g)" : undefined}
            opacity={0.55 + i * 0.12}/>
          <circle cx={n.cx} cy={n.cy} r={n.r} fill="none" stroke="white" strokeWidth="1" opacity={0.3 + i * 0.05}/>
          {i === nodes.length-1 && <circle cx={n.cx} cy={n.cy} r={n.r*0.42} fill="white" opacity="0.85"/>}
        </g>
      ))}
      <path d="M97 12 L100 7 L103 12" stroke="#5C4FC8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="100" y1="8" x2="100" y2="20" stroke="#5C4FC8" strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  );
}

function LettersIllus() {
  return (
    <svg viewBox="0 0 120 90" fill="none" className="lp2-illus" aria-hidden="true">
      <defs>
        <linearGradient id="lt-g" x1="0.3" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#F0EEFF"/>
          <stop offset="100%" stopColor="#DDD8FF"/>
        </linearGradient>
        <filter id="lt-s" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="5" stdDeviation="7" floodColor="#8F7AFF" floodOpacity="0.25"/>
        </filter>
        <filter id="lt-seal" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#6B5FD9" floodOpacity="0.4"/>
        </filter>
      </defs>
      <rect x="14" y="28" width="82" height="56" rx="6" fill="#E8E4F2"/>
      <rect x="14" y="28" width="82" height="56" rx="6" fill="url(#lt-g)" filter="url(#lt-s)"/>
      <rect x="14" y="28" width="82" height="56" rx="6" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.68"/>
      <path d="M14 28 L55 54 L96 28" fill="none" stroke="#8F7AFF" strokeWidth="1.2" opacity="0.28"/>
      <rect x="24" y="55" width="36" height="3.5" rx="1.75" fill="#8C7B6E" fillOpacity="0.3"/>
      <rect x="24" y="62" width="28" height="3.5" rx="1.75" fill="#8C7B6E" fillOpacity="0.22"/>
      <rect x="24" y="69" width="20" height="3.5" rx="1.75" fill="#8C7B6E" fillOpacity="0.16"/>
      <circle cx="82" cy="62" r="13" fill="#8F7AFF" fillOpacity="0.15" filter="url(#lt-seal)"/>
      <circle cx="82" cy="62" r="10" fill="#8F7AFF"/>
      <circle cx="82" cy="62" r="10" fill="none" stroke="white" strokeWidth="0.75" opacity="0.4"/>
      <path d="M78 62 l2.8 2.8 5.8-5.8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="78" y="10" width="24" height="15" rx="3" fill="none" stroke="#EFA26F" strokeWidth="1.5" opacity="0.5" strokeDasharray="3 2"/>
      <rect x="82" y="13" width="16" height="3.5" rx="1.75" fill="#EFA26F" opacity="0.45"/>
      <rect x="85" y="18" width="10" height="3" rx="1.5" fill="#EFA26F" opacity="0.3"/>
    </svg>
  );
}

// ── Portal tilt handlers ───────────────────────────────────
function portalTiltMove(e: React.MouseEvent<HTMLDivElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width  * 2 - 1;
  const y = (e.clientY - r.top)  / r.height * 2 - 1;
  el.style.transform = `perspective(1100px) rotateY(${-3 + x * 3}deg) rotateX(${1 - y * 2}deg) translateY(-4px)`;
  el.style.boxShadow = `0 0 0 1px rgba(255,255,255,0.15), 0 16px 64px rgba(0,0,0,0.48), 0 64px 120px rgba(0,0,0,0.32)`;
}
function portalTiltLeave(e: React.MouseEvent<HTMLDivElement>) {
  e.currentTarget.style.transform = `perspective(1100px) rotateY(-3deg) rotateX(1deg)`;
  e.currentTarget.style.boxShadow = "";
}

// ── Interactive Mock Portal ────────────────────────────────
const PORTAL_NAV = [
  { id: "dashboard", label: "Dashboard",    badge: null,
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { id: "plan",      label: "My Plan",      badge: null,
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { id: "report",    label: "Credit Report", badge: null,
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg> },
  { id: "disputes",  label: "Dispute IQ",   badge: "3",
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
  { id: "letters",   label: "Smart Letters", badge: null,
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
  { id: "progress",  label: "Progress",     badge: null,
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg> },
  { id: "identity",  label: "Identity Guard", badge: null,
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
];

const SCREEN_TITLES: Record<string, string> = {
  dashboard: "My Dashboard", plan: "My Plan",
  report: "Credit Report",   disputes: "Dispute IQ",
  letters: "Smart Letters",  progress: "Progress Tracker",
  identity: "Identity Guard",
};

// ── Screen: Dashboard ──────────────────────────────────────
function PSDashboard() {
  return (
    <div className="lp2-pscreen">
      <div className="lp2-portal-scores">
        {([["712","Experian","#3B82F6"],["705","Equifax","#EF4444"],["718","TransUnion","#8B5CF6"]] as const).map(([v,n,c]) => (
          <div key={n} className="lp2-portal-score-chip">
            <div className="lp2-portal-score-num" style={{ color: c }}>{v}</div>
            <div className="lp2-portal-score-bur">{n}</div>
          </div>
        ))}
      </div>
      <div className="lp2-portal-cards-row">
        <div className="lp2-portal-action-card">
          <div className="lp2-portal-card-label">Next Best Action</div>
          <div className="lp2-portal-action-body">
            <span className="lp2-portal-action-icon">⚡</span>
            <div>
              <div className="lp2-portal-action-title">Dispute MIDLAND CREDIT</div>
              <div className="lp2-portal-action-sub">Est. +18 pts · Ready to send</div>
            </div>
          </div>
        </div>
        <div className="lp2-portal-prog-card">
          <div className="lp2-portal-card-label">Plan Progress</div>
          <div className="lp2-portal-prog-val">68%</div>
          <div className="lp2-portal-prog-track"><div className="lp2-portal-prog-fill" style={{ width:"68%" }}/></div>
          <div className="lp2-portal-prog-note">4 of 6 complete</div>
        </div>
      </div>
      <div className="lp2-portal-disputes">
        <div className="lp2-portal-disp-header">Recent Disputes</div>
        {[
          { name:"MIDLAND FUNDING LLC",  meta:"Collection · Opened 2021", bureau:"EX",  status:"pending", color:"#3B82F6" },
          { name:"CAPITAL ONE AUTO",     meta:"Late 30d · Aug 2023",       bureau:"EQ",  status:"won",     color:"#EF4444" },
          { name:"SYNC BANK CREDIT",     meta:"Inquiry · Mar 2024",        bureau:"TU",  status:"won",     color:"#8B5CF6" },
        ].map(d => (
          <div key={d.name} className="lp2-portal-disp-item">
            <div className={`lp2-portal-disp-dot ${d.status}`}/>
            <div className="lp2-portal-disp-body">
              <div className="lp2-portal-disp-name">{d.name}</div>
              <div className="lp2-portal-disp-meta">{d.meta}</div>
            </div>
            <div className="lp2-portal-disp-bureau" style={{ color:d.color, borderColor:`${d.color}30`, background:`${d.color}14` }}>{d.bureau}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Screen: Dispute IQ ─────────────────────────────────────
function PSDisputes() {
  const items = [
    { name:"MIDLAND FUNDING LLC",  type:"Collection Account",  bureaus:[{l:"EX",c:"#3B82F6"},{l:"EQ",c:"#EF4444"}], pts:"+22", status:"ready" },
    { name:"CAPITAL ONE AUTO",     type:"Late Payment 30d",    bureaus:[{l:"EQ",c:"#EF4444"}],                       pts:"+11", status:"pending" },
    { name:"SYNC BANK / AMAZON",   type:"Hard Inquiry",        bureaus:[{l:"TU",c:"#8B5CF6"},{l:"EX",c:"#3B82F6"}], pts:"+7",  status:"draft" },
    { name:"JEFFERSON CAPITAL",    type:"Charged-Off Account", bureaus:[{l:"EX",c:"#3B82F6"},{l:"TU",c:"#8B5CF6"}], pts:"+18", status:"ready" },
  ];
  return (
    <div className="lp2-pscreen">
      <div className="lp2-pscreen-hdr">
        <span className="lp2-pscreen-count">{items.length} issues found</span>
        <div style={{ display:"flex", gap:"4px" }}>
          <span className="lp2-pscreen-pill indigo">AI Scored</span>
          <span className="lp2-pscreen-pill sage">FCRA Ready</span>
        </div>
      </div>
      {items.map(it => (
        <div key={it.name} className="lp2-pdrow">
          <div className="lp2-pdrow-main">
            <div className="lp2-pdrow-name">{it.name}</div>
            <div className="lp2-pdrow-type">{it.type}</div>
          </div>
          <div className="lp2-pdrow-bureaus">
            {it.bureaus.map(b => (
              <span key={b.l} className="lp2-pbur" style={{ color:b.c, borderColor:`${b.c}30`, background:`${b.c}14` }}>{b.l}</span>
            ))}
          </div>
          <span className="lp2-pdrow-pts">{it.pts}</span>
          <span className={`lp2-pdrow-status lp2-pst-${it.status}`}>{it.status}</span>
        </div>
      ))}
    </div>
  );
}

// ── Screen: My Plan ────────────────────────────────────────
function PSPlan() {
  const steps = [
    { num:"01", title:"Connect credit profile",    sub:"Linked — 3 bureaus active",   done:true,  active:false },
    { num:"02", title:"Review Dispute IQ report",  sub:"4 high-priority items found", done:true,  active:false },
    { num:"03", title:"Send dispute letters",       sub:"2 ready · Est. +40 pts",      done:false, active:true  },
    { num:"04", title:"Monitor bureau responses",  sub:"14-day certified mail window", done:false, active:false },
    { num:"05", title:"Rebuild positive history",  sub:"Credit builder recommended",  done:false, active:false },
  ];
  return (
    <div className="lp2-pscreen">
      {steps.map(s => (
        <div key={s.num} className={`lp2-pstep${s.active ? " active" : ""}`}>
          <div className={`lp2-pstep-num${s.active ? " active" : ""}`}>{s.done ? "✓" : s.num}</div>
          <div className="lp2-pstep-body">
            <div className="lp2-pstep-title">{s.title}</div>
            <div className="lp2-pstep-sub">{s.sub}</div>
          </div>
          {s.active && <span className="lp2-pstep-arrow">→</span>}
        </div>
      ))}
    </div>
  );
}

// ── Screen: Credit Report ──────────────────────────────────
function PSReport() {
  const factors = [
    { label:"On-time payments",  val:"98%",    color:"#6BAE8A", pct:98 },
    { label:"Credit utilization",val:"32%",    color:"#EFA26F", pct:32 },
    { label:"Account age",       val:"6.2 yrs",color:"#8F7AFF", pct:72 },
    { label:"Derogatory marks",  val:"2 items",color:"#EF4444", pct:18 },
  ];
  return (
    <div className="lp2-pscreen">
      <div className="lp2-preport-scores">
        {([["712","Experian","#3B82F6"],["705","Equifax","#EF4444"],["718","TransUnion","#8B5CF6"]] as const).map(([v,n,c]) => (
          <div key={n} className="lp2-portal-score-chip">
            <div className="lp2-portal-score-num" style={{ color:c, fontSize:"18px" }}>{v}</div>
            <div className="lp2-portal-score-bur">{n}</div>
          </div>
        ))}
      </div>
      <div className="lp2-preport-factors">
        {factors.map(f => (
          <div key={f.label} className="lp2-pfactor">
            <div className="lp2-pfactor-row">
              <span className="lp2-pfactor-label">{f.label}</span>
              <span className="lp2-pfactor-val" style={{ color:f.color }}>{f.val}</span>
            </div>
            <div className="lp2-pfactor-bar">
              <div className="lp2-pfactor-fill" style={{ width:`${f.pct}%`, background:f.color }}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Mock Portal shell ──────────────────────────────────────
function MockPortal({ cinematic = false }: { cinematic?: boolean }) {
  const [activeNav, setActiveNav] = useState("dashboard");
  const screenNav = new Set(["dashboard","plan","report","disputes"]);
  const screen = screenNav.has(activeNav) ? activeNav : "dashboard";

  return (
    <div className={`lp2-portal-wrap${cinematic ? " lp2-portal-wrap--cin" : ""}`}>
      <div className="lp2-portal-ambient-a"/>
      <div className="lp2-portal-ambient-b"/>
      <div className="lp2-portal-frame" onMouseMove={cinematic ? portalTiltMove : undefined} onMouseLeave={cinematic ? portalTiltLeave : undefined}>
        <aside className="lp2-portal-sb">
          <div className="lp2-portal-sb-logo">
            <img src={scoreshiftLogo} alt="" width={18} height={18} style={{ objectFit:"contain", flexShrink:0 }}/>
            <span className="lp2-portal-sb-brand">ScoreShift</span>
          </div>
          <nav className="lp2-portal-sb-nav">
            {PORTAL_NAV.map(item => (
              <button
                key={item.id}
                className={`lp2-portal-nav-item${activeNav === item.id ? " active" : ""}`}
                onClick={() => setActiveNav(item.id)}
              >
                <span className="lp2-portal-nav-icon">{item.icon}</span>
                <span className="lp2-portal-nav-label">{item.label}</span>
                {item.badge && <span className="lp2-portal-nav-badge">{item.badge}</span>}
              </button>
            ))}
          </nav>
          <div className="lp2-portal-sb-user">
            <div className="lp2-portal-user-av">JK</div>
            <div className="lp2-portal-user-info">
              <div className="lp2-portal-user-name">Jordan K.</div>
              <div className="lp2-portal-user-plan">Pro Plan</div>
            </div>
          </div>
        </aside>
        <div className="lp2-portal-main">
          <div className="lp2-portal-topbar">
            <div className="lp2-portal-topbar-title">{SCREEN_TITLES[activeNav]}</div>
            <div className="lp2-portal-topbar-chip">
              <span className="lp2-portal-chip-dot"/>Active
            </div>
          </div>
          <div className="lp2-portal-body">
            {screen === "dashboard" && <PSDashboard key="dashboard"/>}
            {screen === "disputes"  && <PSDisputes  key="disputes"/>}
            {screen === "plan"      && <PSPlan      key="plan"/>}
            {screen === "report"    && <PSReport    key="report"/>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Nav ────────────────────────────────────────────────────
function Nav() {
  const [open, setOpen] = useState(false);
  useNavScroll();
  return (
    <>
      <nav className="lp2-nav">
        <div className="lp2-container lp2-nav-inner">
          <Link href="/" className="lp2-nav-logo">
            <div className="lp2-nav-logo-wrap">
              <video className="lp2-nav-logo-video" autoPlay muted loop playsInline preload="auto" aria-hidden="true">
                <source src="/videos/ascend-logo.mp4" type="video/mp4"/>
              </video>
              <img src={scoreshiftLogo} alt="" className="lp2-nav-logo-fallback" aria-hidden="true"/>
            </div>
            <span>ScoreShift</span>
          </Link>
          <ul className="lp2-nav-links">
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#workflow">How It Works</a></li>
            <li><Link href="/pricing">For Business</Link></li>
          </ul>
          <div className="lp2-nav-actions">
            <Link href="/auth" className="lp2-nav-ghost">Sign In</Link>
            <Link href="/auth" className="lp2-btn-primary lp2-nav-cta">
              <span className="lp2-nav-cta-long">Get Started Free</span>
              <span className="lp2-nav-cta-short">Get Started</span>
            </Link>
            <button className="lp2-hamburger" onClick={() => setOpen(o => !o)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
              {open
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              }
            </button>
          </div>
        </div>
      </nav>
      <div className={`lp2-mobile-drawer${open ? " open" : ""}`} onClick={() => setOpen(false)}>
        <div className="lp2-mobile-menu" onClick={e => e.stopPropagation()}>
          <a href="#pricing"  className="lp2-mobile-link" onClick={() => setOpen(false)}>Pricing</a>
          <a href="#workflow" className="lp2-mobile-link" onClick={() => setOpen(false)}>How It Works</a>
          <Link href="/pricing" className="lp2-mobile-link" onClick={() => setOpen(false)}>For Business</Link>
          <div className="lp2-mobile-divider"/>
          <Link href="/auth" className="lp2-mobile-link" onClick={() => setOpen(false)}>Sign In</Link>
          <Link href="/auth" className="lp2-btn-primary lp2-mobile-cta" onClick={() => setOpen(false)}>
            Get Started Free →
          </Link>
        </div>
      </div>
    </>
  );
}

// ── Hero ── dark, centered, massive type ──────────────────
function HeroSection() {
  return (
    <section className="lp2-hero">
      {/* Atmospheric CSS glow orbs */}
      <div className="lp2-hero-orb-a"/>
      <div className="lp2-hero-orb-b"/>
      <div className="lp2-hero-orb-c"/>
      {/* Noise grain overlay */}
      <div className="lp2-hero-grain"/>

      <div className="lp2-container lp2-hero-body">
        <div className="lp2-badge lp2-badge--dark lp2-reveal lp2-d0">
          <span className="lp2-badge-dot"/>
          Modern Credit &amp; Financial Readiness Platform
        </div>
        <h1 className="lp2-hero-h1 lp2-reveal lp2-d1">
          Built to move<br/>
          <span className="lp2-gradient-text">you forward.</span>
        </h1>
        <p className="lp2-hero-sub lp2-reveal lp2-d2">
          Credit monitoring, AI-powered dispute letters, and a personalized action plan — all in one place.
        </p>
        <div className="lp2-hero-ctas lp2-reveal lp2-d3">
          <Link href="/auth" className="lp2-btn-hero-primary lp2-btn-lg">
            Check Your Credit Health
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </Link>
          <a href="#dashboard-reveal" className="lp2-btn-hero-ghost lp2-btn-lg">See the Dashboard</a>
        </div>
        <div className="lp2-proof lp2-proof--dark lp2-reveal lp2-d4">
          <div className="lp2-avatars">
            {["JM","KR","TS","AL"].map(a => <div key={a} className="lp2-avatar">{a}</div>)}
          </div>
          <span>Trusted by <strong>1,200+ people</strong> moving forward</span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="lp2-hero-scroll-cue">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
    </section>
  );
}

// ── Cinematic Reveal ── Cleo-style scroll reveal ───────────
function CinematicRevealSection() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const progress = useCinematicProgress(wrapRef);

  const veilOpacity    = Math.max(0, 1 - progress * 2.2);
  const copyOpacity    = Math.max(0, 1 - progress * 3.5);
  const portalOpacity  = Math.min(1, Math.max(0, (progress - 0.18) / 0.55));
  const portalY        = Math.max(-20, 90 - progress * 130);
  const portalScale    = Math.min(1, 0.84 + progress * 0.22);
  const cueOpacity     = Math.max(0, 1 - progress * 8);

  return (
    <div ref={wrapRef} className="lp2-cin-wrap" id="dashboard-reveal">
      <div className="lp2-cin-sticky">
        {/* Background atmosphere */}
        <div className="lp2-cin-atmo-a"/>
        <div className="lp2-cin-atmo-b"/>

        {/* Dark veil that fades away */}
        <div className="lp2-cin-veil" style={{ opacity: veilOpacity }}/>

        {/* Headline copy — fades out as portal rises */}
        <div className="lp2-cin-copy" style={{ opacity: copyOpacity, pointerEvents: copyOpacity < 0.05 ? "none" : "auto" }}>
          <span className="lp2-cin-eyebrow">Your command center</span>
          <h2 className="lp2-cin-h2">Everything in one<br/>intelligent dashboard.</h2>
          <p className="lp2-cin-sub">Click any tab. This is the real product.</p>
        </div>

        {/* Portal rising up from below */}
        <div
          className="lp2-cin-portal-stage"
          style={{
            opacity: portalOpacity,
            transform: `translateY(${portalY}px) scale(${portalScale})`,
            pointerEvents: portalOpacity > 0.4 ? "auto" : "none",
          }}
        >
          <MockPortal cinematic/>
        </div>

        {/* Scroll nudge */}
        <div className="lp2-cin-scroll-cue" style={{ opacity: cueOpacity }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>
    </div>
  );
}

// ── Stats Section ── Spade-style scroll-triggered counters ─
function StatBlock({ from, to, prefix = "", suffix = "", label, sub }: {
  from: number; to: number; prefix?: string; suffix?: string; label: string; sub: string;
}) {
  const { value, ref } = useCountUp(from, to);
  return (
    <div className="lp2-stat-block" ref={ref}>
      <div className="lp2-stat-num">
        {prefix}{value.toLocaleString()}{suffix}
      </div>
      <div className="lp2-stat-label">{label}</div>
      <div className="lp2-stat-sub">{sub}</div>
    </div>
  );
}

function DisputeProgressBar() {
  const ref = useRef<HTMLDivElement>(null);
  const [filled, setFilled] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setFilled(true); obs.disconnect(); }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div className="lp2-stat-progress-wrap" ref={ref}>
      <div className="lp2-stat-prog-header">
        <span className="lp2-stat-prog-label">Disputes resolved this month</span>
        <span className="lp2-stat-prog-pct">4,892 / 5,100</span>
      </div>
      <div className="lp2-stat-prog-track">
        <div className="lp2-stat-prog-fill" style={{ width: filled ? "96%" : "0%", transition: filled ? "width 1.8s cubic-bezier(0.22,1,0.36,1)" : "none" }}/>
      </div>
      <div className="lp2-stat-prog-bureaus">
        <span style={{ color:"#3B82F6" }}>● Experian</span>
        <span style={{ color:"#EF4444" }}>● Equifax</span>
        <span style={{ color:"#8B5CF6" }}>● TransUnion</span>
      </div>
    </div>
  );
}

function StatsSection() {
  return (
    <section className="lp2-stats">
      <div className="lp2-container">
        <div className="lp2-stats-inner">
          <div className="lp2-stats-grid">
            <StatBlock from={480} to={712} label="Avg. Score Reached" sub="After 90 days on ScoreShift" />
            <StatBlock from={0} to={14} label="Items Removed" sub="Avg. per client, first dispute round" />
            <StatBlock from={0} to={97} suffix="%" label="Client Satisfaction" sub="Across all active subscribers" />
          </div>
          <DisputeProgressBar/>
        </div>
      </div>
    </section>
  );
}

// ── Trust Strip ────────────────────────────────────────────
function TrustStrip() {
  const items = ["FCRA-Aware Workflows","3-Bureau Live Data","USPS Certified Mail","SOC 2 Ready","Secure Data Handling","Guided Dispute Process","No False Guarantees"];
  return (
    <div className="lp2-trust">
      <div className="lp2-container">
        <div className="lp2-trust-inner">
          <span className="lp2-trust-label">Built for real financial progress</span>
          {items.map(t => <span key={t} className="lp2-trust-item">{t}</span>)}
        </div>
      </div>
    </div>
  );
}

// ── Problem ────────────────────────────────────────────────
function ProblemSection() {
  const cards = [
    { icon: "🧩", title: "Data everywhere, clarity nowhere", body: "Credit reports are scattered, inconsistent, and hard to read. You can't see what lenders actually see in one place.", accent: "#8F7AFF" },
    { icon: "🔇", title: "No one tells you what to do next", body: "Most tools show you data and stop there. ScoreShift turns data into a specific, guided action plan.", accent: "#EFA26F" },
    { icon: "🔀", title: "Disputes, debt, alerts — disconnected", body: "Managing your credit means juggling multiple tools, portals, and trackers. There's a better way.", accent: "#6BAE8A" },
  ];
  return (
    <section className="lp2-problem">
      <div className="lp2-container">
        <div className="lp2-section-label lp2-reveal">The Problem</div>
        <h2 className="lp2-h2 lp2-reveal lp2-d1">
          Most credit tools show you data.<br/>
          <span className="lp2-gradient-text">ScoreShift shows you direction.</span>
        </h2>
        <div className="lp2-problem-cards">
          {cards.map((c, i) => (
            <div key={c.title} className={`lp2-problem-card lp2-reveal lp2-d${i+1}`}
              style={{"--card-accent": c.accent} as React.CSSProperties}>
              <span className="lp2-problem-icon">{c.icon}</span>
              <h3 className="lp2-problem-title">{c.title}</h3>
              <p className="lp2-problem-body">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How It Works ───────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    { num: "01", icon: "🔗", title: "Connect your credit profile", body: "Securely link your tri-bureau credit data. No score impact, no guesswork." },
    { num: "02", icon: "🎯", title: "ScoreShift identifies what matters", body: "Our Dispute IQ engine pinpoints exactly what's hurting your score and why." },
    { num: "03", icon: "📍", title: "Follow your guided action plan", body: "Every screen answers one question: what should I do next? Clear, specific, actionable." },
  ];
  return (
    <section className="lp2-how" id="workflow">
      <div className="lp2-container">
        <div className="lp2-section-label lp2-reveal lp2-text-center">How It Works</div>
        <h2 className="lp2-h2 lp2-reveal lp2-d1 lp2-text-center">
          Your report is complicated.<br/>
          <span className="lp2-gradient-text">Your next step should not be.</span>
        </h2>
        <div className="lp2-how-steps">
          {steps.map((s, i) => (
            <div key={s.title} className={`lp2-how-card lp2-reveal lp2-d${i+1}`}>
              <div className="lp2-how-num">{s.num}</div>
              <div className="lp2-how-icon">{s.icon}</div>
              <h3 className="lp2-how-title">{s.title}</h3>
              <p className="lp2-how-body">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Bento Section — dark Linear style ─────────────────────
const MODULES = [
  { id: "plan",     name: "My Plan",              label: "Guided Roadmap",      span: 2, Illus: PlanIllus,     accent: "#8F7AFF" },
  { id: "protect",  name: "Protection Center",    label: "Identity Guard",      span: 1, Illus: ProtectionIllus, accent: "#6BAE8A" },
  { id: "report",   name: "Credit Report",        label: "Tri-Bureau Data",     span: 1, Illus: ReportIllus,   accent: "#8F7AFF" },
  { id: "dispute",  name: "Dispute IQ",           label: "Precision Analysis",  span: 2, Illus: DisputeIllus,  accent: "#8F7AFF" },
  { id: "debt",     name: "Debt Navigator",       label: "Payoff Planning",     span: 1, Illus: DebtIllus,     accent: "#EFA26F" },
  { id: "loans",    name: "Student Loan Aid",     label: "Repayment Guidance",  span: 1, Illus: LoanIllus,     accent: "#6BAE8A" },
  { id: "letters",  name: "Smart Letters & Mail", label: "Certified Disputes",  span: 1, Illus: LettersIllus,  accent: "#8F7AFF" },
  { id: "subs",     name: "Subscription Manager", label: "Recurring Clarity",   span: 1, Illus: SubsIllus,     accent: "#EFA26F" },
  { id: "progress", name: "Progress Tracker",     label: "Milestone View",      span: 2, Illus: ProgressIllus, accent: "#8F7AFF" },
];

const BENTO_DESC: Record<string, string> = {
  plan:     "Your personalized credit and financial readiness roadmap. Every priority action, in order.",
  protect:  "Dark web monitoring, fraud alerts, and identity protection — always active.",
  report:   "Live tri-bureau data in one organized view. See exactly what lenders see.",
  dispute:  "AI-powered engine that identifies exactly what can be challenged — and how.",
  debt:     "See your debt reduction path. Avalanche or snowball — your pace, your plan.",
  loans:    "Navigate IDR plans, forgiveness eligibility, and repayment strategies.",
  letters:  "Profile-specific dispute letters sent via USPS certified mail — automated.",
  subs:     "Every recurring charge visible. Find savings, cancel leaks, stay in control.",
  progress: "Track every improvement. Visualize your credit journey from first step to goal.",
};

function BentoSection() {
  return (
    <section className="lp2-bento lp2-bento--dark">
      <div className="lp2-container">
        <div className="lp2-section-label lp2-section-label--dark lp2-reveal">Product Modules</div>
        <h2 className="lp2-h2 lp2-h2--dark lp2-reveal lp2-d1">
          Every tool you need,<br/>
          <span className="lp2-gradient-text">connected.</span>
        </h2>
        <div className="lp2-bento-grid">
          {MODULES.map((m, i) => {
            const IllusComp = m.Illus;
            return (
              <div
                key={m.id}
                className={`lp2-bento-card lp2-bento-card--dark lp2-reveal lp2-d${(i % 3) + 1}${m.span === 2 ? " lp2-span2" : ""}`}
                onMouseMove={tiltMove}
                onMouseLeave={tiltLeave}
              >
                <div className="lp2-bento-illus">
                  <IllusComp/>
                </div>
                <div className="lp2-bento-label" style={{ color: m.accent }}>{m.label}</div>
                <div className="lp2-bento-name lp2-bento-name--dark">{m.name}</div>
                <div className="lp2-bento-body lp2-bento-body--dark">{BENTO_DESC[m.id]}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Pricing ────────────────────────────────────────────────
function PricingSection() {
  const plans = [
    { tier: "Starter", price: "29", note: "Start seeing your full credit picture", featured: false,
      features: ["Credit report import","3 dispute letters/month","Basic AI analysis","Email support"] },
    { tier: "Pro", price: "79", note: "Most popular — everything to move forward", featured: true,
      features: ["Unlimited dispute letters","Live 3-bureau monitoring","Score simulator","Certified mail automation","Priority support"] },
    { tier: "Elite", price: "149", note: "Complete readiness and protection suite", featured: false,
      features: ["Everything in Pro","Identity protection","Debt Navigator","Student Loan Aid","Dedicated account manager"] },
  ];
  return (
    <section className="lp2-pricing" id="pricing">
      <div className="lp2-container">
        <div className="lp2-section-label lp2-reveal lp2-text-center">Pricing</div>
        <h2 className="lp2-h2 lp2-reveal lp2-d1 lp2-text-center">Plans built for where you are</h2>
        <p className="lp2-section-sub lp2-reveal lp2-d2 lp2-text-center">Start free. Scale when you're ready. No hidden fees.</p>
        <div className="lp2-pricing-grid">
          {plans.map((p, i) => (
            <div key={p.tier} className={`lp2-pricing-card lp2-reveal lp2-d${i+1}${p.featured ? " featured" : ""}`}
              onMouseMove={tiltMove} onMouseLeave={tiltLeave}>
              {p.featured && <div className="lp2-pricing-badge">Most Popular</div>}
              <div className="lp2-pricing-tier">{p.tier}</div>
              <div className="lp2-pricing-price"><sup>$</sup>{p.price}<span>/mo</span></div>
              <div className="lp2-pricing-note">{p.note}</div>
              <ul className="lp2-pricing-features">
                {p.features.map(f => (
                  <li key={f}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth" className={`lp2-pricing-cta${p.featured ? " lp2-btn-primary" : " lp2-btn-outline"}`}>
                Get Started →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Final CTA ──────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="lp2-final">
      <div className="lp2-container">
        <div className="lp2-final-card lp2-reveal">
          <div className="lp2-final-glow-a"/>
          <div className="lp2-final-glow-b"/>
          <div className="lp2-final-eyebrow">Start with clarity. Move with certainty.</div>
          <h2 className="lp2-final-h2">Built to move you forward.</h2>
          <p className="lp2-final-sub">ScoreShift turns your credit data into a guided financial readiness plan.</p>
          <div className="lp2-final-ctas">
            <Link href="/auth" className="lp2-final-btn-primary">Create Your ScoreShift Plan →</Link>
            <a href="#pricing" className="lp2-final-btn-ghost">See Pricing</a>
          </div>
          <div className="lp2-final-note">No credit card required · Cancel anytime</div>
        </div>
      </div>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="lp2-footer">
      <div className="lp2-container">
        <div className="lp2-footer-inner">
          <div>
            <div className="lp2-footer-brand">
              <img src={scoreshiftLogo} alt="ScoreShift" width={24} height={24} style={{ objectFit: "contain" }}/>
              ScoreShift
            </div>
            <p className="lp2-footer-tag">Modern credit monitoring, progress tracking, and readiness tools — built to move you forward.</p>
          </div>
          <div>
            <div className="lp2-footer-col">Product</div>
            <ul>{["Features","Pricing","How It Works","Credit Monitoring","Identity Protection"].map(l => <li key={l}><a href="#">{l}</a></li>)}</ul>
          </div>
          <div>
            <div className="lp2-footer-col">Company</div>
            <ul>{["About","Blog","Careers","Press"].map(l => <li key={l}><a href="#">{l}</a></li>)}</ul>
          </div>
          <div>
            <div className="lp2-footer-col">Legal</div>
            <ul>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="lp2-footer-bottom">
          <div>© {new Date().getFullYear()} ScoreShift. All rights reserved.</div>
          <div className="lp2-footer-legal">
            <Link href="/privacy-policy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Main Export ────────────────────────────────────────────
export default function LandingPage() {
  useScrollReveal();
  return (
    <div className="lp2-page">
      <Nav/>
      <HeroSection/>
      <CinematicRevealSection/>
      <StatsSection/>
      <TrustStrip/>
      <ProblemSection/>
      <HowItWorksSection/>
      <BentoSection/>
      <PricingSection/>
      <FinalCTA/>
      <Footer/>
    </div>
  );
}
