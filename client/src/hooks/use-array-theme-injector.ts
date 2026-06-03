import { useEffect } from "react";

/* ──────────────────────────────────────────────────────────────────
   ScoreShift → Array shadow-DOM style injector
   Watches for every array-* custom element, then injects a <style>
   block directly into its shadow root so ALL hardcoded colors are
   overridden — not just those wired to CSS custom properties.
   ────────────────────────────────────────────────────────────────── */

const SS = {
  indigo:     "#8F7AFF",
  indigoHov:  "#7B6AE8",
  indigoDeep: "#6B5BD4",
  indigoTint: "rgba(143,122,255,0.12)",
  indigoTint2:"rgba(143,122,255,0.20)",
  apricot:    "#EFA26F",
  terra:      "#C07050",
  cream:      "#F7F3EC",
  creamDk:    "#EDE8E0",
  white:      "#FFFFFF",
  card:       "rgba(255,255,255,0.94)",
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

const INJECTED_MARKER = "__ss_themed__";

function buildStyleSheet(): string {
  return `
/* ── ScoreShift theme injection ── */

/* 1. Re-declare ALL Array CSS custom-property variants at :host */
:host {
  /* Primary / accent */
  --primary:                      ${SS.indigo} !important;
  --primary-color:                ${SS.indigo} !important;
  --primary-dark:                 ${SS.indigoHov} !important;
  --primary-light:                ${SS.indigoTint} !important;
  --color-primary:                ${SS.indigo} !important;
  --color-primary-dark:           ${SS.indigoHov} !important;
  --color-primary-light:          ${SS.indigoTint} !important;
  --color-accent:                 ${SS.indigo} !important;
  --color-link:                   ${SS.indigo} !important;
  --color-info:                   ${SS.indigo} !important;
  --array-color-primary:          ${SS.indigo} !important;
  --array-color-primary-light:    ${SS.indigoTint} !important;
  --array-color-accent:           ${SS.indigo} !important;
  --array-color-link:             ${SS.indigo} !important;
  --array-color-info:             ${SS.indigo} !important;
  --arr-color-primary:            ${SS.indigo} !important;
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

  /* Background / surface */
  --background:                   ${SS.cream} !important;
  --background-color:             ${SS.cream} !important;
  --surface:                      ${SS.card} !important;
  --surface-color:                ${SS.card} !important;
  --surface-secondary:            ${SS.creamDk} !important;
  --card-background:              ${SS.card} !important;
  --color-background:             ${SS.cream} !important;
  --color-surface:                ${SS.card} !important;
  --color-surface-secondary:      ${SS.creamDk} !important;
  --array-color-background:       ${SS.cream} !important;
  --array-color-surface:          ${SS.card} !important;
  --arr-color-background:         ${SS.cream} !important;
  --arr-color-surface:            ${SS.card} !important;

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

/* Backgrounds */
[class*="container"], [class*="wrapper"], [class*="card"], [class*="panel"],
[class*="section"], [class*="box"], [class*="surface"],
[class*="modal"], [class*="dialog"], [class*="drawer"],
[class*="overview"], [class*="dashboard"], [class*="header"],
[class*="content"], [class*="inner"], [class*="body"] {
  background-color: transparent !important;
}

/* 3. Primary / blue → indigo overrides */
a, [class*="link"], [class*="Link"] {
  color: ${SS.indigo} !important;
}
a:hover, [class*="link"]:hover { color: ${SS.indigoHov} !important; }

/* Buttons — primary */
button[class*="primary"], [class*="btn-primary"], [class*="button-primary"],
[class*="cta"], [class*="submit"], [class*="action"],
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
  const style = document.createElement("style");
  style.setAttribute("data-scoreshift", "1");
  style.textContent = buildStyleSheet();
  shadow.prepend(style);

  /* Re-watch for nested custom elements inside this shadow root */
  const inner = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      m.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const elem = node as Element;
          if (elem.tagName?.toLowerCase().startsWith("array-")) injectIntoShadow(elem);
          elem.querySelectorAll?.("[class]").forEach(() => {});
        }
      });
    });
  });
  inner.observe(shadow, { childList: true, subtree: true });
}

function scanAndInject(root: Document | Element): void {
  root.querySelectorAll("*").forEach((el) => {
    if (el.tagName?.toLowerCase().startsWith("array-")) injectIntoShadow(el);
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
