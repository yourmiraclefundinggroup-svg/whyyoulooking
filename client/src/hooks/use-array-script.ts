import { useEffect, useState } from "react";

export const ARRAY_SANDBOX_APP_KEY = "3F03D20E-5311-43D8-8A76-E4B5D77793BD";
export const ARRAY_SANDBOX_API_URL = "https://mock.array.io";

export const ARRAY_SANDBOX_TOKENS = {
  default: "AD45C4BF-5C0A-40B3-8A53-ED29D091FA11",
  creditAlerts: "31B6FCB6-D137-4F69-871C-CDA3385EA5FB",
  subscriptionManager: "57F4F530-0D64-463B-B997-B9A8309CACA6",
  studentLoanAid: "DFD90F1A-BB8F-4310-B921-8EC7A4BF7649",
};

// One script per Array component — all confirmed from Array docs/user-provided examples
const ARRAY_COMPONENT_SCRIPTS = [
  "array-account-enroll",
  "array-credit-overview",
  "array-credit-report",
  "array-credit-score",
  "array-credit-debt-analysis",
  "array-credit-score-simulator",
  "array-credit-alerts",
  "array-identity-protect",
  "array-pip-dashboard",
  "array-pip-scan",
  "array-subscription-manager",
  "array-student-loan-navigator",
  "array-student-loan-aid",
  "array-debt-navigator",
];

// Module-level state so scripts are injected and tracked once per page load
let resolvedCount = 0;
let scriptsInjected = false;
const TOTAL = ARRAY_COMPONENT_SCRIPTS.length;
const listeners: Array<() => void> = [];

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

function isAllResolved() {
  return resolvedCount >= TOTAL;
}

export function useArrayScript() {
  const [loaded, setLoaded] = useState(isAllResolved);

  useEffect(() => {
    if (isAllResolved()) {
      setLoaded(true);
      return;
    }

    const listener = () => {
      if (isAllResolved()) setLoaded(true);
    };
    listeners.push(listener);

    if (!scriptsInjected) {
      scriptsInjected = true;
      ARRAY_COMPONENT_SCRIPTS.forEach((name) => {
        if (document.querySelector(`script[data-array-component="${name}"]`)) {
          resolvedCount++;
          return;
        }
        const script = document.createElement("script");
        script.src = `https://embed.array.io/cms/${name}.js?appKey=${ARRAY_SANDBOX_APP_KEY}`;
        script.type = "text/javascript";
        script.dataset.arrayComponent = name;
        const settle = () => {
          resolvedCount++;
          notifyListeners();
        };
        script.onload = settle;
        script.onerror = settle;
        document.head.appendChild(script);
      });
      // If all were already in DOM, trigger now
      if (isAllResolved()) notifyListeners();
    }

    return () => {
      const idx = listeners.indexOf(listener);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, []);

  return { loaded };
}
