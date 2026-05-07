# ScoreShift — Replit Handoff Document

This document contains everything Replit needs to build the new ScoreShift Landing Page and Client Portal. 

Provide Replit with this document alongside the two HTML files (`index.html` and `portal.html`).

---

## 1. The Build Strategy

Tell Replit: 
> *"I have two fully coded HTML/CSS mocks: `index.html` (Landing Page) and `portal.html` (Client Portal). I want you to build the React/Next.js application using these files as the exact design spec. Do not change the design — extract the CSS tokens, components, and layout structures exactly as they are in the mock files."*

---

## 2. Design System Tokens (Extract from Mocks)

Replit should set up the following design tokens based on the mocks:

### Colors
*   **Background:** `#f8f9fb` (with the custom Mercury-style SVG noise texture)
*   **Surface:** `#ffffff`
*   **Text Primary:** `#0f1220`
*   **Text Secondary:** `#6b7280`
*   **Borders:** `#e4e7ef`
*   **Primary Accent:** `#6366f1` (Indigo)
*   **Gradient Accent:** `linear-gradient(135deg, #6366f1, #8b5cf6, #14b8a6)`

### Typography
*   **Headlines & Numbers:** `Sora` (Google Fonts) — Weights: 600, 700, 800
*   **Body Text:** `Inter` (Google Fonts) — Weights: 400, 500, 600

### Key UI Components
*   **Cards:** Soft shadows (`box-shadow: 0 4px 20px rgba(0,0,0,0.03)`), hover lift (`transform: translateY(-2px)`), and a 3px colored top border for status cards.
*   **Buttons:** Gradient background with a soft glow shadow on hover.
*   **Icons:** Inline stroke SVGs (no emojis, no heavy icon libraries).
*   **Progress Bars:** Custom shimmer animation (`background-size: 200% 100%; animation: shimmer 2s infinite`).

---

## 3. The Landing Page (`index.html`)

Replit should build the public-facing site using the exact structure in `index.html`. 

**Critical Rules for Replit:**
1.  **No Array Branding:** Do not expose the names "Array", "Lob", "Experian", "Equifax", or "TransUnion" anywhere on the public site. Use the exact copy provided in the mock.
2.  **Hero Dashboard:** The floating dashboard in the hero section is a pure HTML/CSS component. Do not try to embed the actual app here — just use the mock HTML.
3.  **Animations:** Implement the `IntersectionObserver` scroll fade-up animations exactly as written in the mock's script tag.

---

## 4. The Client Portal (`portal.html`)

Replit should build the authenticated client portal using the layout in `portal.html`.

**Architecture:**
*   **Layout:** Fixed left sidebar (scrollable nav, pinned logo/footer) + main content area.
*   **Background:** Use the custom SVG dot grid and gradient washes behind the main content area.
*   **Navigation:** 19 distinct views mapped to sidebar items.

### The Array Embed Map

Tell Replit: 
> *"The portal relies on 12 embedded web components from Array.io. Here is the exact mapping of which Array component goes on which portal screen. Wrap each component in the `.array-wrapper` CSS class provided in the mock to ensure it fits the design system."*

| Portal Screen | Array Component Tag | Array Script URL |
| :--- | :--- | :--- |
| **Dashboard** | `<array-credit-overview>` | `/cms/array-credit-overview.js` |
| **Score Tracker** | `<array-credit-score>` | `/cms/array-credit-score.js` |
| **Credit Issues & Alerts** | `<array-credit-alerts>` | `/cms/array-credit-alerts.js` |
| **Identity Protection** | `<array-identity-protect>` | `/cms/array-identity-protect.js` |
| **Privacy Protection** | `<array-pip-dashboard>` | `/cms/array-pip-dashboard.js` |
| **PIP Scan Results** | `<array-pip-scan>` | `/cms/array-pip-scan.js` |
| **Score Simulator** | `<array-credit-score-simulator>` | `/cms/array-credit-score-simulator.js` |
| **Full Report** | `<array-credit-report>` | `/cms/array-credit-report.js` |
| **Debt Analysis** | `<array-credit-debt-analysis>` | `/cms/array-credit-debt-analysis.js` |
| **Debt Navigator** | `<array-debt-navigator>` | `/cms/array-debt-navigator.js` |
| **Student Loan Aid** | `<array-student-loan-aid>` | `/cms/array-student-loan-aid.js` |
| **Subscription Manager** | `<array-subscription-manager>` | `/cms/array-subscription-manager.js` |

**Array Integration Rules for Replit:**
1.  **App Key & API Keys:** **Keep the existing production keys already configured in your Replit environment.** Do not use the sandbox `appKey` or `userToken` values from the mock HTML files — those are test credentials only used to build the visual mock.
2.  **Sandbox Mode:** Remove `sandbox="true"` and `apiUrl="https://mock.array.io"` from all components — the production environment should use the live Array endpoints.
3.  **User Tokens:** Dynamically pass the authenticated user's real Array `userToken` to the `userToken` attribute of each component. This should come from your existing auth/session system.
4.  **Credit Issues Page Layout:** This page is a stacked layout. The custom ScoreShift "Active Negative Items" table goes on top, and the `<array-credit-alerts>` component goes directly below it.

---

## 5. Next Steps for Replit

Paste this exact prompt into Replit along with the files:

> *"I have attached `index.html` and `portal.html`. These are the final, approved design mocks for ScoreShift. I also provided `REPLIT-HANDOFF.md` which contains the design system tokens and the Array.io component mapping. Please review all three files. Your first task is to initialize the project, extract the global CSS tokens from the mocks, and build the layout shell for the Client Portal with the sidebar navigation. Let me know when you are ready to begin."*
