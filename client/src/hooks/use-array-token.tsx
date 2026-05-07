/**
 * ArrayTokenContext — fetches a real Array appKey + short-lived userToken from
 * the backend session endpoint GET /api/array/token (calls Array /v2/user/token).
 * For accounts flagged as test users the backend returns sandbox credentials
 * automatically (mock.array.io), so the portal works end-to-end in sandbox mode.
 * Automatically refreshes the token 5 minutes before it expires.
 */
import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from "react";

const REFRESH_BEFORE_EXPIRY_MS = 5 * 60 * 1000;

interface ArrayTokenState {
  token: string;
  appKey: string;
  apiUrl: string;
  sandboxMode: boolean;
  attempted: boolean;
  isReady: boolean;
  error: boolean;
  refresh: () => Promise<void>;
}

const defaultState: ArrayTokenState = {
  token: "",
  appKey: "",
  apiUrl: "",
  sandboxMode: false,
  attempted: false,
  isReady: false,
  error: false,
  refresh: async () => {},
};

const ArrayTokenContext = createContext<ArrayTokenState>(defaultState);

export function ArrayTokenProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<ArrayTokenState, "refresh">>({
    token: "",
    appKey: "",
    apiUrl: "",
    sandboxMode: false,
    attempted: false,
    isReady: false,
    error: false,
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRefreshTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const fetchToken = useCallback(async () => {
    const authToken = localStorage.getItem("auth_token");
    if (!authToken) {
      setState(s => ({ ...s, attempted: true, error: true }));
      return;
    }
    try {
      const res = await fetch("/api/array/token", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json() as {
          token: string;
          appKey: string;
          apiUrl?: string;
          sandboxMode?: boolean;
          arrayUserId: string;
          expiresAt?: string;
        };
        if (data.token && data.appKey) {
          setState({
            token: data.token,
            appKey: data.appKey,
            apiUrl: data.apiUrl || "",
            sandboxMode: data.sandboxMode ?? false,
            attempted: true,
            isReady: true,
            error: false,
          });

          clearRefreshTimer();
          if (data.expiresAt) {
            const msUntilExpiry = new Date(data.expiresAt).getTime() - Date.now();
            const msUntilRefresh = Math.max(msUntilExpiry - REFRESH_BEFORE_EXPIRY_MS, 60_000);
            timerRef.current = setTimeout(() => { fetchToken(); }, msUntilRefresh);
          }
          return;
        }
      }
      setState(s => ({ ...s, attempted: true, error: true }));
    } catch {
      setState(s => ({ ...s, attempted: true, error: true }));
    }
  }, []);

  useEffect(() => {
    fetchToken();
    return () => clearRefreshTimer();
  }, [fetchToken]);

  return (
    <ArrayTokenContext.Provider value={{ ...state, refresh: fetchToken }}>
      {children}
    </ArrayTokenContext.Provider>
  );
}

export function useArrayToken() {
  return useContext(ArrayTokenContext);
}
