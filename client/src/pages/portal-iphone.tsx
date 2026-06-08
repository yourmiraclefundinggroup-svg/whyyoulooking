import { UserContext } from "@/hooks/use-user-context";
import { ArrayTokenContext } from "@/hooks/use-array-token";
import { ArrayScriptOverrideContext } from "@/hooks/use-array-script";
import ClientPortal from "@/pages/client-portal";
import { DEMO_USER, DemoDataProvider } from "@/lib/demo-data.tsx";

const DEMO_ARRAY_STATE = {
  token: "",
  appKey: "",
  apiUrl: "",
  restApiUrl: "",
  sandboxMode: false,
  attempted: true,
  isReady: true,
  error: false,
  refresh: async () => {},
};

function navigateToAuth() {
  try {
    if (window.top && window.top !== window) {
      window.top.location.href = "/auth";
    } else {
      window.location.href = "/auth";
    }
  } catch {
    window.location.href = "/auth";
  }
}

export default function PortalIphone() {
  return (
    <UserContext.Provider
      value={{
        user: DEMO_USER,
        isAdmin: false,
        isBetaTester: false,
        isClientViewer: true,
        canCreateDisputes: false,
        canAccessAI: false,
        canAccessCreditBuilding: false,
        canAccessEducation: false,
        setCurrentUserId: () => {},
        logout: navigateToAuth,
      }}
    >
      <ArrayTokenContext.Provider value={DEMO_ARRAY_STATE}>
        <ArrayScriptOverrideContext.Provider value={{ loaded: true }}>
          <DemoDataProvider>
            <ClientPortal initialPage="home" />
          </DemoDataProvider>
        </ArrayScriptOverrideContext.Provider>
      </ArrayTokenContext.Provider>
    </UserContext.Provider>
  );
}
