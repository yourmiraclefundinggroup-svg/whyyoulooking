/**
 * ArrayTokenContext — provides a real Array app key and short-lived user token
 * fetched from the backend session endpoint GET /api/array/token.
 * Falls back to sandbox credentials when the endpoint is unavailable
 * (unauthenticated state, non-starter tiers, network error).
 */
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { ARRAY_SANDBOX_APP_KEY, ARRAY_SANDBOX_TOKENS } from "./use-array-script";

interface ArrayTokenState {
  token: string;
  appKey: string;
  attempted: boolean;
  isReady: boolean;
  error: boolean;
  isSandbox: boolean;
  refresh: () => Promise<void>;
}

const defaultState: ArrayTokenState = {
  token: "",
  appKey: ARRAY_SANDBOX_APP_KEY,
  attempted: false,
  isReady: false,
  error: false,
  isSandbox: true,
  refresh: async () => {},
};

const ArrayTokenContext = createContext<ArrayTokenState>(defaultState);

export function ArrayTokenProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<ArrayTokenState, "refresh">>({
    token: "",
    appKey: ARRAY_SANDBOX_APP_KEY,
    attempted: false,
    isReady: false,
    error: false,
    isSandbox: true,
  });

  const fetchToken = useCallback(async () => {
    try {
      const authToken = localStorage.getItem("auth_token");
      if (!authToken) throw new Error("not authenticated");
      const res = await fetch("/api/array/token", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json() as { token: string; appKey: string; arrayUserId: string };
        if (data.token && data.appKey) {
          setState({ token: data.token, appKey: data.appKey, attempted: true, isReady: true, error: false, isSandbox: false });
          return;
        }
      }
    } catch {
      // fall through to sandbox
    }
    // Fallback: sandbox credentials
    setState({
      token: ARRAY_SANDBOX_TOKENS.default,
      appKey: ARRAY_SANDBOX_APP_KEY,
      attempted: true,
      isReady: true,
      error: false,
      isSandbox: true,
    });
  }, []);

  useEffect(() => {
    fetchToken();
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
