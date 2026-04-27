/**
 * Loads the Array.com web component scripts dynamically.
 * Called once at app level so the custom elements are registered globally.
 * Uses the sandbox app key with the account-enroll script.
 */
import { useEffect, useState } from "react";

export const ARRAY_SANDBOX_APP_KEY = "3F03D20E-5311-43D8-8A76-E4B5D77793BD";
export const ARRAY_SANDBOX_API_URL = "https://mock.array.io";

let scriptLoaded = false;
let scriptError = false;

export function useArrayScript() {
  const [loaded, setLoaded] = useState(scriptLoaded);
  const [error, setError] = useState(scriptError);

  useEffect(() => {
    if (scriptLoaded) { setLoaded(true); return; }

    const existing = document.querySelector('script[data-array-sdk]');
    if (existing) { scriptLoaded = true; setLoaded(true); return; }

    const script = document.createElement("script");
    script.src = `https://embed.array.io/cms/array-account-enroll.js?appKey=${ARRAY_SANDBOX_APP_KEY}`;
    script.type = "text/javascript";
    script.dataset.arraySdk = "true";
    script.onload = () => { scriptLoaded = true; setLoaded(true); };
    script.onerror = () => { scriptError = true; setError(true); };
    document.head.appendChild(script);
  }, []);

  return { loaded, error };
}
