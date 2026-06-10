import { useEffect } from "react";

/* ──────────────────────────────────────────────────────────────────
   ScoreShift → Array shadow-DOM style injector
   Watches for every array-* custom element, then injects a <style>
   block directly into its shadow root so ALL hardcoded colors are
   overridden — not just those wired to CSS custom properties.
   ────────────────────────────────────────────────────────────────── */

const SS = {
  /* ScoreShift brand — used ONLY for links/accents, not filled backgrounds */
  indigo:     "#8F7AFF",
  indigoHov:  "#7B6AE8",
  indigoDeep: "#6B5BD4",
  indigoTint: "rgba(143,122,255,0.12)",
  indigoTint2:"rgba(143,122,255,0.20)",
  /* Neutral dark — used as Array's "primary" so toolbars/action bars are charcoal, not purple */
  primaryDark: "#3D3A4E",
  primaryLight: "#F4F0E8",
  apricot:    "#EFA26F",
  terra:      "#C07050",
  cream:      "#F7F3EC",
  creamDk:    "#EDE8E0",
  white:      "#FFFFFF",
  card:       "#FFFFFF",
  textDark:   "#1E1B18",
  textMid:    "#4A4550",
  textMuted:  "#7A7670",
  border:     "#E8E2D8",
  borderMd:   "#D9D2C7",
  green:      "#6BAE8A",
  greenTint:  "rgba(107,174,138,0.12)",
  red:        "#D94F4F",
  redTint:    "rgba(217,79,79,0.10)",
} as const;

const INJECTED_MARKER = "__ss_themed_v4__";

function buildStyleSheet(): string {
  return `
/* ── ScoreShift theme injection ── */

/* 1. Re-declare ALL Array CSS custom-property variants at :host */
:host {
  /* Primary — set to neutral dark so Array's action bars / toolbars are
     charcoal, not purple. Links/accents stay ScoreShift brand. */
  --primary:                      ${SS.primaryDark} !important;
  --primary-color:                ${SS.primaryDark} !important;
  --primary-dark:                 ${SS.primaryDark} !important;
  --primary-light:                ${SS.primaryLight} !important;
  --color-primary:                ${SS.primaryDark} !important;
  --color-primary-dark:           ${SS.primaryDark} !important;
  --color-primary-light:          ${SS.primaryLight} !important;
  --color-accent:                 ${SS.indigo} !important;
  --color-link:                   ${SS.indigo} !important;
  --color-info:                   #4A7FA5 !important;
  --array-color-primary:          ${SS.primaryDark} !important;
  --array-color-primary-light:    ${SS.primaryLight} !important;
  --array-color-accent:           ${SS.indigo} !important;
  --array-color-link:             ${SS.indigo} !important;
  --array-color-info:             #4A7FA5 !important;
  --arr-color-primary:            ${SS.primaryDark} !important;
  --arr-color-accent:             ${SS.indigo} !important;
  --arr-color-link:               ${SS.indigo} !important;

  /* Positive / negative / warning */
  --color-positive:               ${SS.green} !important;
  --color-negative:               ${SS.terra} !important;
  --color-warning:                ${SS.apricot} !important;
  --color-danger:                 ${SS.red} !important;
  --array-color-positive:         ${SS.green} !important;
  --array-color-negative:         ${SS.terra} !important;
  --array-color-warning:          ${SS.apricot} !important;
  --arr-color-positive:           ${SS.green} !important;
  --arr-color-negative:           ${SS.terra} !important;
  --arr-color-warning:            ${SS.apricot} !important;
  --success-color:                ${SS.green} !important;
  --danger-color:                 ${SS.red} !important;
  --warning-color:                ${SS.apricot} !important;

  /* Background / surface — solid values prevent parent glow bleed */
  --background:                   ${SS.cream} !important;
  --background-color:             ${SS.cream} !important;
  --surface:                      ${SS.white} !important;
  --surface-color:                ${SS.white} !important;
  --surface-secondary:            ${SS.creamDk} !important;
  --card-background:              ${SS.white} !important;
  --color-background:             ${SS.cream} !important;
  --color-surface:                ${SS.white} !important;
  --color-surface-secondary:      ${SS.creamDk} !important;
  --array-color-background:       ${SS.cream} !important;
  --array-color-surface:          ${SS.white} !important;
  --array-color-surface-secondary: ${SS.creamDk} !important;
  --array-color-card:             ${SS.white} !important;
  --arr-color-background:         ${SS.cream} !important;
  --arr-color-surface:            ${SS.white} !important;

  /* Text */
  --text-primary:                 ${SS.textDark} !important;
  --text-secondary:               ${SS.textMid} !important;
  --text-muted:                   ${SS.textMuted} !important;
  --text-color:                   ${SS.textDark} !important;
  --color-text:                   ${SS.textDark} !important;
  --color-text-primary:           ${SS.textDark} !important;
  --color-text-secondary:         ${SS.textMid} !important;
  --color-text-muted:             ${SS.textMuted} !important;
  --array-color-text-primary:     ${SS.textDark} !important;
  --array-color-text-secondary:   ${SS.textMid} !important;
  --array-color-text-muted:       ${SS.textMuted} !important;

  /* Border / divider */
  --border-color:                 ${SS.border} !important;
  --color-border:                 ${SS.border} !important;
  --color-divider:                ${SS.border} !important;
  --array-color-border:           ${SS.border} !important;
  --array-color-divider:          ${SS.border} !important;
  --arr-color-border:             ${SS.border} !important;
  --divider-color:                ${SS.border} !important;

  /* Radius / font */
  --border-radius:                14px !important;
  --border-radius-sm:             8px !important;
  --array-border-radius:          14px !important;
  --array-border-radius-sm:       8px !important;
  --font-family:                  'Inter', -apple-system, sans-serif !important;
  --array-font-family:            'Inter', -apple-system, sans-serif !important;
}

/* 2. Global background + text resets */
*, *::before, *::after { box-sizing: border-box; }

:host > * { font-family: 'Inter', -apple-system, sans-serif !important; }

/* Backgrounds — use solid white so parent indigo glow cannot bleed through */
[class*="container"], [class*="wrapper"], [class*="card"], [class*="panel"],
[class*="section"], [class*="box"], [class*="surface"],
[class*="modal"], [class*="dialog"], [class*="drawer"],
[class*="overview"], [class*="dashboard"],
[class*="content"], [class*="inner"], [class*="body"] {
  background-color: ${SS.white} !important;
}

/* ── Score gauge / chip override ──────────────────────────────────────
   Array's credit-score gauge boxes render with a solid primary-color
   fill (either via CSS vars or hardcoded inline styles).  Force every
   possible score-related container to cream/white with dark text so the
   rainbow bar and score number are legible on a neutral background.     */

/* Score containers — light fill */
[class*="score-gauge"], [class*="scoreGauge"],
[class*="score-card"], [class*="scoreCard"],
[class*="score-container"], [class*="scoreContainer"],
[class*="score-display"], [class*="scoreDisplay"],
[class*="score-overview"], [class*="scoreOverview"],
[class*="score-header"], [class*="scoreHeader"],
[class*="score-panel"], [class*="scorePanel"],
[class*="score-block"], [class*="scoreBlock"],
[class*="score-box"], [class*="scoreBox"],
[class*="score-chip"], [class*="scoreChip"],
[class*="score-band"], [class*="scoreBand"],
[class*="score-widget"], [class*="scoreWidget"],
[class*="score-section"], [class*="scoreSection"],
[class*="score-summary"], [class*="scoreSummary"],
[class*="score-history"], [class*="scoreHistory"],
[class*="gauge-container"], [class*="gaugeContainer"],
[class*="gauge-wrapper"], [class*="gaugeWrapper"],
[class*="gauge-display"], [class*="gaugeDisplay"],
[class*="gauge-card"], [class*="gaugeCard"],
[class*="credit-score"], [class*="creditScore"],
[class*="vantage-score"], [class*="vantageScore"],
[class*="fico-score"], [class*="ficoScore"],
[class*="bureau-score"], [class*="bureauScore"],
[class*="score-range"], [class*="scoreRange"] {
  background: ${SS.creamDk} !important;
  background-color: ${SS.creamDk} !important;
  background-image: none !important;
}

/* Score value text — must be dark on cream background */
[class*="score-value"], [class*="scoreValue"],
[class*="score-number"], [class*="scoreNumber"],
[class*="score-digit"], [class*="scoreDigit"],
[class*="score-label"], [class*="scoreLabel"],
[class*="score-rating"], [class*="scoreRating"],
[class*="score-grade"], [class*="scoreGrade"],
[class*="score-name"], [class*="scoreName"],
[class*="score-text"]:not(p):not(span),
[class*="gauge-value"], [class*="gaugeValue"],
[class*="gauge-label"], [class*="gaugeLabel"],
[class*="gauge-rating"], [class*="gaugeRating"] {
  color: ${SS.textDark} !important;
  background-color: transparent !important;
}

/* Inline style overrides: catch elements where Array sets
   background-color as an inline style with indigo/purple hex values */
[style*="background-color: #6366f1"], [style*="background-color:#6366f1"],
[style*="background-color: #4f46e5"], [style*="background-color:#4f46e5"],
[style*="background-color: #7c3aed"], [style*="background-color:#7c3aed"],
[style*="background-color: #818cf8"], [style*="background-color:#818cf8"],
[style*="background-color: #8F7AFF"], [style*="background-color:#8F7AFF"],
[style*="background-color: #8f7aff"], [style*="background-color:#8f7aff"],
[style*="background: #6366f1"],       [style*="background:#6366f1"],
[style*="background: #4f46e5"],       [style*="background:#4f46e5"],
[style*="background: #8F7AFF"],       [style*="background:#8F7AFF"],
[style*="background: #8f7aff"],       [style*="background:#8f7aff"] {
  background: ${SS.creamDk} !important;
  background-color: ${SS.creamDk} !important;
  background-image: none !important;
  color: ${SS.textDark} !important;
}

/* 3. Primary / blue → indigo overrides */
a, [class*="link"], [class*="Link"] {
  color: ${SS.indigo} !important;
}
a:hover, [class*="link"]:hover { color: ${SS.indigoHov} !important; }

/* Buttons — primary (do NOT include [class*="action"] — that catches export toolbars) */
button[class*="primary"], [class*="btn-primary"], [class*="button-primary"],
[class*="cta"], [class*="submit"],
button[type="submit"] {
  background: linear-gradient(135deg, ${SS.indigo} 0%, ${SS.indigoDeep} 100%) !important;
  background-color: ${SS.indigo} !important;
  color: #fff !important;
  border-color: ${SS.indigo} !important;
  box-shadow: 0 2px 10px rgba(143,122,255,0.28) !important;
}
button[class*="primary"]:hover, [class*="btn-primary"]:hover,
[class*="button-primary"]:hover {
  background: linear-gradient(135deg, ${SS.indigoHov} 0%, ${SS.indigoDeep} 100%) !important;
  background-color: ${SS.indigoHov} !important;
}

/* Buttons — secondary / outline */
button[class*="secondary"], [class*="btn-secondary"], [class*="button-secondary"],
button[class*="outline"], [class*="btn-outline"], [class*="button-outline"] {
  color: ${SS.indigo} !important;
  border-color: ${SS.indigo} !important;
  background: transparent !important;
}

/* Generic buttons */
button:not([class*="close"]):not([class*="icon"]):not([class*="back"]):not([aria-label]) {
  border-radius: 10px !important;
}

/* Progress bars / meters */
[class*="progress"] > *, [class*="meter"] > *, [class*="bar"] > *,
[role="progressbar"] > *, [role="meter"] > * {
  background-color: ${SS.indigo} !important;
}
[class*="progress-track"], [class*="track"], [class*="rail"] {
  background-color: ${SS.border} !important;
}

/* Score circles / donuts */
[class*="score"] circle[stroke*="3b82f6"],
[class*="score"] circle[stroke*="2563eb"],
[class*="score"] circle[stroke*="6366f1"],
[class*="score"] circle[stroke*="4f46e5"],
[class*="score"] path[fill*="3b82f6"],
[class*="score"] path[fill*="2563eb"] {
  stroke: ${SS.indigo} !important;
  fill: ${SS.indigo} !important;
}

/* Badges / pills / tags */
[class*="badge"], [class*="pill"], [class*="chip"], [class*="tag"] {
  font-size: 11px !important;
  border-radius: 999px !important;
}
[class*="badge"][class*="primary"], [class*="pill"][class*="primary"],
[class*="badge"][class*="blue"], [class*="pill"][class*="blue"],
[class*="badge"][class*="info"], [class*="pill"][class*="info"] {
  background-color: ${SS.indigoTint} !important;
  color: ${SS.indigo} !important;
  border-color: rgba(143,122,255,0.25) !important;
}
[class*="badge"][class*="success"], [class*="pill"][class*="success"],
[class*="badge"][class*="positive"], [class*="pill"][class*="positive"] {
  background-color: ${SS.greenTint} !important;
  color: ${SS.green} !important;
}
[class*="badge"][class*="warning"], [class*="pill"][class*="warning"] {
  background-color: rgba(239,162,111,0.12) !important;
  color: ${SS.apricot} !important;
}
[class*="badge"][class*="danger"], [class*="badge"][class*="negative"],
[class*="badge"][class*="error"] {
  background-color: ${SS.redTint} !important;
  color: ${SS.red} !important;
}

/* Alerts / banners */
[class*="alert"][class*="info"], [class*="banner"][class*="info"],
[class*="notice"][class*="info"] {
  background-color: ${SS.indigoTint} !important;
  color: ${SS.textDark} !important;
  border-color: rgba(143,122,255,0.25) !important;
}
[class*="alert"][class*="success"], [class*="banner"][class*="success"] {
  background-color: ${SS.greenTint} !important;
  border-color: rgba(107,174,138,0.25) !important;
}
[class*="alert"][class*="warning"], [class*="banner"][class*="warning"] {
  background-color: rgba(239,162,111,0.12) !important;
  border-color: rgba(239,162,111,0.28) !important;
}
[class*="alert"][class*="error"], [class*="alert"][class*="danger"] {
  background-color: ${SS.redTint} !important;
  border-color: rgba(217,79,79,0.28) !important;
}

/* Tabs */
[class*="tab"][class*="active"], [class*="tab"][aria-selected="true"],
[role="tab"][aria-selected="true"] {
  color: ${SS.indigo} !important;
  border-color: ${SS.indigo} !important;
}
[class*="tab-indicator"], [class*="tab-underline"], [class*="tab-bar"] {
  background-color: ${SS.indigo} !important;
}

/* Inputs / selects */
input, select, textarea {
  border-color: ${SS.border} !important;
  border-radius: 10px !important;
  font-family: 'Inter', -apple-system, sans-serif !important;
}
input:focus, select:focus, textarea:focus {
  border-color: ${SS.indigo} !important;
  box-shadow: 0 0 0 3px ${SS.indigoTint} !important;
  outline: none !important;
}

/* Checkboxes / radios */
input[type="checkbox"]:checked, input[type="radio"]:checked {
  accent-color: ${SS.indigo} !important;
  background-color: ${SS.indigo} !important;
  border-color: ${SS.indigo} !important;
}

/* Headings */
h1, h2, h3, h4, h5, h6, [class*="title"], [class*="heading"] {
  color: ${SS.textDark} !important;
  font-family: 'Inter', -apple-system, sans-serif !important;
}

/* Body text */
p, span, div, li, td, th, label {
  font-family: inherit !important;
}

/* Dividers / separators */
hr, [class*="divider"], [class*="separator"] {
  border-color: ${SS.border} !important;
  background-color: ${SS.border} !important;
}

/* Tooltip */
[class*="tooltip"] {
  background-color: ${SS.textDark} !important;
  color: #fff !important;
  border-radius: 8px !important;
}

/* Skeleton / loading shimmer */
[class*="skeleton"], [class*="shimmer"], [class*="placeholder"] {
  background: linear-gradient(90deg, ${SS.border} 25%, ${SS.creamDk} 50%, ${SS.border} 75%) !important;
  background-size: 200% 100% !important;
}

/* Specific inline SVG / icon color resets for blue */
svg[fill="#3b82f6"], svg[fill="#2563eb"], svg[fill="#1d4ed8"],
svg[fill="#60a5fa"], svg[fill="#93c5fd"], svg[fill="#6366f1"],
svg[fill="#4f46e5"], svg[fill="#818cf8"] { fill: ${SS.indigo} !important; }

path[fill="#3b82f6"], path[fill="#2563eb"], path[fill="#1d4ed8"],
path[fill="#60a5fa"], path[fill="#6366f1"], path[fill="#4f46e5"] {
  fill: ${SS.indigo} !important;
}
path[stroke="#3b82f6"], path[stroke="#2563eb"], path[stroke="#6366f1"],
circle[stroke="#3b82f6"], circle[stroke="#6366f1"] {
  stroke: ${SS.indigo} !important;
}

/* Scrollbar */
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: ${SS.cream}; }
::-webkit-scrollbar-thumb { background: ${SS.border}; border-radius: 999px; }
::-webkit-scrollbar-thumb:hover { background: ${SS.borderMd}; }
`;
}

function injectIntoShadow(el: Element): void {
  const shadow = (el as any).shadowRoot as ShadowRoot | null;
  if (!shadow) return;
  if ((shadow as any)[INJECTED_MARKER]) return;
  (shadow as any)[INJECTED_MARKER] = true;
  /* Remove any stale style from a previous version before injecting */
  shadow.querySelectorAll("style[data-scoreshift]").forEach(s => s.remove());
  const style = document.createElement("style");
  style.setAttribute("data-scoreshift", "1");
  style.textContent = buildStyleSheet();
  shadow.prepend(style);

  /* Re-watch for nested custom elements inside this shadow root.
     Inject into ANY element that gains a shadowRoot — nested score
     gauge components may not use array-* tag names. */
  const inner = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      m.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const elem = node as Element;
          if ((elem as any).shadowRoot) injectIntoShadow(elem);
          /* Also scan children of the added node */
          elem.querySelectorAll?.("*").forEach((child) => {
            if ((child as any).shadowRoot) injectIntoShadow(child);
          });
        }
      });
    });
  });
  inner.observe(shadow, { childList: true, subtree: true });
}

function scanAndInject(root: Document | Element): void {
  root.querySelectorAll("*").forEach((el) => {
    /* Inject into any element that has a shadow root — not just array-* prefixed
       ones, because nested components (e.g. score gauges inside array-credit-report)
       may use different tag names like "array-score-gauge-wc" or internal ones */
    if ((el as any).shadowRoot) injectIntoShadow(el);
  });
}

export function useArrayThemeInjector(): void {
  useEffect(() => {
    /* Initial scan for any already-mounted array elements */
    scanAndInject(document);

    /* Watch for future additions */
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          const el = node as Element;
          if (el.tagName?.toLowerCase().startsWith("array-")) injectIntoShadow(el);
          scanAndInject(el);
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    /* Poll for a few seconds after mount — Array components can attach
       their shadow root asynchronously after the element is added */
    const intervals = [200, 500, 1000, 2000, 4000];
    const timers = intervals.map((ms) => setTimeout(() => scanAndInject(document), ms));

    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);
}
