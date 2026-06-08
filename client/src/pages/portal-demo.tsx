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

export default function PortalDemo() {
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
        logout: () => { window.location.href = "/auth"; },
      }}
    >
      <ArrayTokenContext.Provider value={DEMO_ARRAY_STATE}>
        <ArrayScriptOverrideContext.Provider value={{ loaded: true }}>
          <DemoDataProvider>
            <ClientPortal />
          </DemoDataProvider>
        </ArrayScriptOverrideContext.Provider>
      </ArrayTokenContext.Provider>
    </UserContext.Provider>
  );
}
