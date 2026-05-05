import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { X, CheckCircle, ArrowRight, Shield } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

interface ArrayWelcomeBannerProps {
  userId: number;
  firstName: string;
  productCodes: string[];
  enrolledAt: string | null;
  welcomeShown: boolean;
}

// Array product-code prefixes → bureau names
const BUREAU_CODE_MAP: Record<string, string> = {
  tuc: "TransUnion",
  tu:  "TransUnion",
  eq:  "Equifax",
  exp: "Experian",
  ex:  "Experian",
};

function getBureauNames(productCodes: string[]): string[] {
  const found = new Set<string>();
  for (const code of productCodes) {
    const lower = code.toLowerCase();
    for (const [prefix, bureau] of Object.entries(BUREAU_CODE_MAP)) {
      if (lower.startsWith(prefix)) {
        found.add(bureau);
        break;
      }
    }
  }
  return [...found];
}

function getBureauLabel(productCodes: string[]): string {
  const names = getBureauNames(productCodes);
  if (names.length > 0) return names.join(", ");
  const count = productCodes?.length ?? 0;
  if (count >= 3) return "3-bureau credit monitoring";
  if (count === 2) return "2-bureau credit monitoring";
  if (count === 1) return "1-bureau credit monitoring";
  return "Credit monitoring";
}

function getLocalKey(userId: number) {
  return `array_welcome_seen_${userId}`;
}

export function ArrayWelcomeBanner({
  userId,
  firstName,
  productCodes,
  enrolledAt,
  welcomeShown,
}: ArrayWelcomeBannerProps) {
  const [visible, setVisible] = useState(false);
  const markedRef = useRef(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    // Server flag takes precedence; also check local storage as fast path
    const localSeen = localStorage.getItem(getLocalKey(userId)) === "true";
    if (welcomeShown || localSeen) {
      setVisible(false);
      return;
    }
    setVisible(true);
  }, [userId, welcomeShown]);

  // Mark as seen on first render — fire once regardless of whether the user
  // clicks dismiss or navigates away, so it is never shown again.
  useEffect(() => {
    if (!visible || markedRef.current) return;
    markedRef.current = true;
    // Optimistic local flag (fast path, survives JS errors)
    localStorage.setItem(getLocalKey(userId), "true");
    // Durable server-side flag
    apiRequest("POST", "/api/array/enrollment/welcome-shown", {})
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/array/enrollment"] });
      })
      .catch(() => {
        // Local flag still prevents re-show on this device
      });
  }, [visible, userId, queryClient]);

  function dismiss() {
    setVisible(false);
  }

  if (!visible) return null;

  const bureauLabel = getBureauLabel(productCodes);
  const name = firstName?.trim() || "there";

  return (
    <div
      role="alert"
      className="relative rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 px-5 py-4 flex items-start gap-4 shadow-sm"
    >
      {/* Icon */}
      <div className="shrink-0 mt-0.5">
        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h2 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
            Your credit profile is connected, {name}!
          </h2>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3" />
            Active
          </span>
        </div>
        <p className="text-sm text-emerald-800 dark:text-emerald-200 leading-snug">
          {bureauLabel} is now active.{" "}
          <span className="text-emerald-700 dark:text-emerald-300">
            Here's what we found — review your full report to see every item
            ScoreShift is working on for you.
          </span>
        </p>
        <div className="mt-3">
          <Link href="/credit-monitoring">
            <button
              onClick={dismiss}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white text-xs font-semibold transition-colors"
            >
              View your full credit report
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </div>

      {/* Dismiss */}
      <button
        onClick={dismiss}
        aria-label="Dismiss welcome banner"
        className="shrink-0 mt-0.5 rounded-md p-1 text-emerald-500 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
