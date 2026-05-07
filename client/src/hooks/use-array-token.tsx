/**
 * ArrayTokenContext — fetches a real Array appKey + short-lived userToken from
 * the backend session endpoint GET /api/array/token (calls Array /v2/user/token).
 * When the backend is unavailable (unauthenticated / wrong tier / error),
 * isReady stays false and error is true — callers should show a locked/upgrade
 * state rather than falling back to sandbox credentials.
 */
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

interface ArrayTokenState {
  token: string;
  appKey: string;
  attempted: boolean;
  isReady: boolean;
  error: boolean;
  refresh: () => Promise<void>;
}

const defaultState: ArrayTokenState = {
  token: "",
  appKey: "",
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
    attempted: false,
    isReady: false,
    error: false,
  });

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
        const data = await res.json() as { token: string; appKey: string; arrayUserId: string };
        if (data.token && data.appKey) {
          setState({ token: data.token, appKey: data.appKey, attempted: true, isReady: true, error: false });
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
