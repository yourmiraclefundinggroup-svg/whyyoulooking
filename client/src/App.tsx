import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { UserProvider, useUserContext } from "@/hooks/use-user-context";
import { ThemeProvider } from "@/components/theme-provider";
import { ArrayTokenProvider, useArrayToken } from "@/hooks/use-array-token";
import { useArrayScript } from "@/hooks/use-array-script";
import LandingPage from "@/pages/landing";
import LeadForm from "@/pages/lead-form";
import Dashboard from "@/pages/dashboard";
import CreditRepair from "@/pages/credit-repair";
import StudentLoans from "@/pages/student-loans";
import CreditBuilding from "@/pages/credit-building";
import CreditBuildingV2 from "@/pages/credit-building-v2";
import Pricing from "@/pages/pricing";
import Education from "@/pages/education";
import ExperianConnect from "@/pages/experian-connect";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminPortal from "@/pages/admin-portal";
import AdminPortalV2 from "@/pages/admin-portal-v2-full";
import SupportAdmin from "@/pages/support-admin";
import Billing from "@/pages/billing";
import SubscriptionCheckout from "@/pages/subscription-checkout";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import PrivacyPolicy from "@/pages/privacy-policy";
import Terms from "@/pages/terms";
import DenialDecoder from "@/pages/denial-decoder";
import WhiteLabelOnboarding from "@/pages/white-label-onboarding";
import CreditMonitoring from "@/pages/credit-monitoring";
import DebtNavigator from "@/pages/debt-navigator";
import DisputeIQ from "@/pages/disputes-diy";
import ProgressPage from "@/pages/progress-page";
import ChatPage from "@/pages/chat-page";
import NotFound from "@/pages/not-found";
import { TrialUpgradeWall } from "@/components/trial-upgrade-wall";

function WelcomeToast() {
  const { toast } = useToast();
  useEffect(() => {
    const name = sessionStorage.getItem("ss_welcome_name");
    if (name) {
      sessionStorage.removeItem("ss_welcome_name");
      setTimeout(() => {
        toast({
          title: `Welcome back, ${name}.`,
          description: "Here's your credit snapshot for today.",
          duration: 5000,
        });
      }, 600);
    }
  }, []);
  return null;
}

function ArrayScriptLoader() {
  const { appKey } = useArrayToken();
  useArrayScript();
  return null;
}

function AuthenticatedArrayProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUserContext();
  if (!user) return <>{children}</>;
  return (
    <ArrayTokenProvider>
      <ArrayScriptLoader />
      {children}
    </ArrayTokenProvider>
  );
}

/* Guard: only allow users with an active subscription tier (starter/pro/elite) or admins */
function DIYGate({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useUserContext();
  const tier = (user as (typeof user & { subscriptionTier?: string }) | null)?.subscriptionTier ?? "none";
  const hasAccess = isAdmin || tier === "starter" || tier === "pro" || tier === "elite";
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg-primary)" }}>
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(201,168,76,0.1)" }}>
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-xl font-black mb-2" style={{ color: "var(--text-primary)" }}>
            DIY Dispute Access Required
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            The Dispute IQ tool is available to Starter, Pro, and Elite subscribers.
          </p>
          <a href="/billing" className="ss-btn-primary inline-flex">Upgrade Your Plan</a>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

function Router() {
  const { user } = useUserContext();
  const [location] = useLocation();

  if (!user && location === "/") return <LandingPage />;
  if (!user && location === "/get-started") return <LeadForm />;
  if (location === "/privacy-policy") return <PrivacyPolicy />;
  if (location === "/terms") return <Terms />;
  if (location === "/signup") return <Signup />;
  if (location === "/denial-decoder") return <DenialDecoder />;
  if (location === "/pricing") return <Pricing />;
  if (!user) return <Login />;

  if (user && location === "/") {
    if (user.accessLevel === "ADMIN") {
      return (
        <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
          <Navigation />
          <AdminPortal />
        </div>
      );
    } else {
      return (
        <TrialUpgradeWall>
          <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
            <Navigation />
            <CreditRepair />
          </div>
        </TrialUpgradeWall>
      );
    }
  }

  return (
    <TrialUpgradeWall>
      <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
        <Switch>
          <Route path="/" component={LandingPage} />
          <Route path="/get-started" component={LeadForm} />
          <Route path="/auth" component={Login} />
          <Route path="/admin/auth" component={Login} />

          {/* ── Main client routes ── */}
          <Route path="/credit-repair">
            <Navigation /><CreditRepair />
          </Route>
          <Route path="/dashboard">
            <Navigation /><Dashboard />
          </Route>
          <Route path="/credit-monitoring">
            <Navigation /><CreditMonitoring />
          </Route>
          <Route path="/debt-navigator">
            <Navigation /><DebtNavigator />
          </Route>
          <Route path="/student-loans">
            <Navigation /><StudentLoans />
          </Route>
          <Route path="/progress">
            <Navigation /><ProgressPage />
          </Route>
          <Route path="/chat">
            <Navigation /><ChatPage />
          </Route>
          <Route path="/billing">
            <Navigation /><Billing />
          </Route>
          <Route path="/disputes-diy">
            <Navigation /><DIYGate><DisputeIQ /></DIYGate>
          </Route>

          {/* ── Legacy routes kept for backward compat ── */}
          <Route path="/credit-building">
            <Navigation /><CreditBuilding />
          </Route>
          <Route path="/credit-building-v2">
            <Navigation /><CreditBuildingV2 />
          </Route>
          <Route path="/education">
            <Navigation /><Education />
          </Route>
          <Route path="/experian">
            <Navigation /><ExperianConnect />
          </Route>

          {/* ── Admin routes ── */}
          <Route path="/admin">
            <Navigation /><AdminDashboard />
          </Route>
          <Route path="/admin-portal">
            <Navigation /><AdminPortal />
          </Route>
          <Route path="/admin-portal/:section">
            <Navigation /><AdminPortal />
          </Route>
          <Route path="/admin-portal/credit-reports/:id">
            <Navigation /><AdminPortal />
          </Route>
          <Route path="/support-admin">
            <Navigation /><SupportAdmin />
          </Route>

          {/* ── Public ── */}
          <Route path="/checkout" component={SubscriptionCheckout} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/denial-decoder" component={DenialDecoder} />
          <Route path="/white-label/onboarding" component={WhiteLabelOnboarding} />
          <Route path="/login" component={Login} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </TrialUpgradeWall>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <AuthenticatedArrayProvider>
            <TooltipProvider>
              <Toaster />
              <WelcomeToast />
              <Router />
            </TooltipProvider>
          </AuthenticatedArrayProvider>
        </UserProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
