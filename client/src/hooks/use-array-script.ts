/**
 * Loads the Array.com web component script dynamically.
 * Called once at app level so the custom elements are registered globally.
 */
import { useEffect, useState } from "react";

let scriptLoaded = false;
let scriptError = false;

export function useArrayScript(appKey: string | undefined) {
  const [loaded, setLoaded] = useState(scriptLoaded);
  const [error, setError] = useState(scriptError);

  useEffect(() => {
    if (!appKey) return;
    if (scriptLoaded) { setLoaded(true); return; }

    const existing = document.querySelector('script[data-array-sdk]');
    if (existing) { scriptLoaded = true; setLoaded(true); return; }

    const script = document.createElement("script");
    script.src = `https://embed.array.io/cms/array-web-component.js?appKey=${appKey}`;
    script.type = "text/javascript";
    script.dataset.arraySdk = "true";
    script.onload = () => { scriptLoaded = true; setLoaded(true); };
    script.onerror = () => { scriptError = true; setError(true); };
    document.head.appendChild(script);
  }, [appKey]);

  return { loaded, error };
}
