/**
 * ArrayTokenContext — provides the Array app key and sandbox config.
 * In sandbox mode, no server-side token generation is needed.
 * The Array web components use apiUrl="https://mock.array.io" + sandbox="true"
 * and handle authentication internally through the mock API.
 */
import { createContext, useContext, type ReactNode } from "react";
import { ARRAY_SANDBOX_APP_KEY } from "./use-array-script";

interface ArrayTokenState {
  token: string;
  appKey: string;
  attempted: boolean;
  isReady: boolean;
  error: boolean;
  refresh: () => Promise<void>;
}

const ArrayTokenContext = createContext<ArrayTokenState>({
  token: "",
  appKey: ARRAY_SANDBOX_APP_KEY,
  attempted: true,
  isReady: true,
  error: false,
  refresh: async () => {},
});

export function ArrayTokenProvider({ children }: { children: ReactNode }) {
  return (
    <ArrayTokenContext.Provider value={{
      token: "",
      appKey: ARRAY_SANDBOX_APP_KEY,
      attempted: true,
      isReady: true,
      error: false,
      refresh: async () => {},
    }}>
      {children}
    </ArrayTokenContext.Provider>
  );
}

export function useArrayToken() {
  return useContext(ArrayTokenContext);
}
