/**
 * ArrayTokenContext — single source of truth for the credit monitoring session token.
 * Fetches once on mount, then proactively refreshes every 4 minutes so web components
 * never encounter an expired token. Shared across all pages via context.
 */
import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from "react";

interface ArrayTokenState {
  token: string;
  appKey: string;
  /** true once the first fetch attempt has completed (success OR failure) */
  attempted: boolean;
  /** true when a valid token has been obtained */
  isReady: boolean;
  error: boolean;
  refresh: () => Promise<void>;
}

const ArrayTokenContext = createContext<ArrayTokenState>({
  token: "",
  appKey: "",
  attempted: false,
  isReady: false,
  error: false,
  refresh: async () => {},
});

const REFRESH_INTERVAL_MS = 4 * 60 * 1000; // 4 minutes (token expires in 5)

async function fetchToken(): Promise<{ token: string; appKey: string; arrayUserId: string }> {
  const authToken =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  const res = await fetch("/api/array/token", { headers });
  if (!res.ok) throw new Error(`Token fetch failed: ${res.status}`);
  return res.json();
}

export function ArrayTokenProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState("");
  const [appKey, setAppKey] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const doFetch = useCallback(async () => {
    try {
      const data = await fetchToken();
      if (!mountedRef.current) return;
      setToken(data.token);
      setAppKey(data.appKey);
      setIsReady(true);
      setError(false);
    } catch {
      if (!mountedRef.current) return;
      setError(true);
      setIsReady(false);
    } finally {
      if (mountedRef.current) setAttempted(true);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    doFetch();

    intervalRef.current = setInterval(() => {
      doFetch();
    }, REFRESH_INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [doFetch]);

  return (
    <ArrayTokenContext.Provider value={{ token, appKey, attempted, isReady, error, refresh: doFetch }}>
      {children}
    </ArrayTokenContext.Provider>
  );
}

export function useArrayToken() {
  return useContext(ArrayTokenContext);
}
