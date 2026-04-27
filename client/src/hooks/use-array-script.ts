import { useEffect, useState } from "react";

export const ARRAY_SANDBOX_APP_KEY = "3F03D20E-5311-43D8-8A76-E4B5D77793BD";
export const ARRAY_SANDBOX_API_URL = "https://mock.array.io";

export const ARRAY_SANDBOX_TOKENS = {
  default: "AD45C4BF-5C0A-40B3-8A53-ED29D091FA11",
  creditAlerts: "31B6FCB6-D137-4F69-871C-CDA3385EA5FB",
  subscriptionManager: "57F4F530-0D64-463B-B997-B9A8309CACA6",
  studentLoanAid: "DFD90F1A-BB8F-4310-B921-8EC7A4BF7649",
};

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

let scriptsInjected = false;

export function useArrayScript() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!scriptsInjected) {
      scriptsInjected = true;
      ARRAY_COMPONENT_SCRIPTS.forEach((name) => {
        if (!document.querySelector(`script[data-array-component="${name}"]`)) {
          const script = document.createElement("script");
          script.src = `https://embed.array.io/cms/${name}.js?appKey=${ARRAY_SANDBOX_APP_KEY}`;
          script.type = "text/javascript";
          script.dataset.arrayComponent = name;
          document.head.appendChild(script);
        }
      });
    }

    const check = () => {
      if (customElements.get("array-account-enroll")) {
        setLoaded(true);
      }
    };
    check();
    const interval = setInterval(check, 200);
    return () => clearInterval(interval);
  }, []);

  return { loaded };
}
