/* ─────────────────────────────────────────────────────────────────────────────
   ScoreShift Analytics — GA4 (G-03RNSYCEDZ) + Microsoft Clarity (x52g2lsgd3)

   Privacy rules:
   - NEVER pass SSNs, account numbers, credit report data, dispute content,
     Array consumer data, or payment card numbers to any analytics call.
   - Parameters here are limited to plan names, tiers, step names, and counts.
   ───────────────────────────────────────────────────────────────────────────── */

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    clarity: (...args: unknown[]) => void;
  }
}

function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag(...args);
  }
}

export function trackPageView(path: string, title?: string) {
  gtag("event", "page_view", {
    page_path: path,
    page_title: title ?? document.title,
    page_location: window.location.href,
  });
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  gtag("event", name, params ?? {});
}

/* ─── Named custom events ─────────────────────────────────────────────────── */

export function trackPricingViewed() {
  trackEvent("pricing_viewed");
}

export function trackSignupStarted() {
  trackEvent("signup_started");
}

export function trackSignupCompleted() {
  trackEvent("signup_completed");
}

export function trackPlanSelected(planName: string, planType: "self-service" | "concierge") {
  trackEvent("plan_selected", { plan_name: planName, plan_type: planType });
}

export function trackConciergeSelected() {
  trackEvent("concierge_selected");
}

export function trackCreditPullStarted() {
  trackEvent("credit_pull_started");
}

export function trackCreditPullCompleted(skipped = false) {
  trackEvent("credit_pull_completed", { skipped });
}

export function trackSmartLetterCreated(letterType?: string) {
  trackEvent("smart_letter_created", letterType ? { letter_type: letterType } : {});
}

export function trackMailWalletPurchase(quantity: number, priceLabel: string) {
  trackEvent("mail_wallet_purchase", { quantity, price_label: priceLabel });
}

export function trackSubscriptionCancelled() {
  trackEvent("subscription_cancelled");
}
