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
import ClientPortal from "@/pages/client-portal";
import Demo from "@/pages/demo";
import PortalDemo from "@/pages/portal-demo";
import NotFound from "@/pages/not-found";
import { TrialUpgradeWall } from "@/components/trial-upgrade-wall";

// Shows a personalized welcome toast once after login
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

// Loads the Array SDK script globally once the shared token context has an appKey.
function ArrayScriptLoader() {
  const { appKey } = useArrayToken();
  useArrayScript(appKey || undefined);
  return null;
}

// Wraps children with ArrayTokenProvider only when the user is authenticated,
// so we avoid making unauthenticated token requests.
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

function Router() {
  const { user } = useUserContext();
  const [location] = useLocation();

  // Show landing page if no user is authenticated and on root path
  if (!user && location === "/") {
    return <LandingPage />;
  }

  // Allow access to lead form without authentication
  if (!user && location === "/get-started") {
    return <LeadForm />;
  }

  // Allow access to public pages without authentication
  if (location === "/privacy-policy") {
    return <PrivacyPolicy />;
  }
  if (location === "/terms") {
    return <Terms />;
  }
  if (location === "/signup") {
    return <Signup />;
  }
  if (location === "/denial-decoder") {
    return <DenialDecoder />;
  }
  if (location === "/pricing") {
    return <Pricing />;
  }
  if (location === "/demo") {
    return <Demo />;
  }
  if (location === "/portal-demo") {
    return <PortalDemo />;
  }

  // Show login if no user is authenticated and not on other allowed pages
  if (!user) {
    return <Login />;
  }

  // CLIENT_VIEWER users always use the new portal — block all old routes
  const CLIENT_OLD_ROUTES = ["/dashboard", "/credit-repair", "/credit-monitoring",
    "/credit-building", "/student-loans", "/education", "/billing", "/dispute-iq"];
  if (user && user.accessLevel !== "ADMIN" && (location === "/" || CLIENT_OLD_ROUTES.some(r => location.startsWith(r)))) {
    return <ClientPortal />;
  }

  // Auto-redirect admins on root page
  if (user && location === "/" && user.accessLevel === "ADMIN") {
    return (
      <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
        <Navigation />
        <AdminPortal />
      </div>
    );
  }

  return (
    <TrialUpgradeWall>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
        <Switch>
          <Route path="/" component={LandingPage} />
          <Route path="/get-started" component={LeadForm} />
          <Route path="/auth" component={Login} />
          <Route path="/admin/auth" component={Login} />
          <Route path="/dashboard">
            <Navigation />
            <Dashboard />
          </Route>
          <Route path="/credit-repair">
            <Navigation />
            <CreditRepair />
          </Route>
          <Route path="/student-loans">
            <Navigation />
            <StudentLoans />
          </Route>
          <Route path="/credit-building">
            <Navigation />
            <CreditBuilding />
          </Route>
          <Route path="/education">
            <Navigation />
            <Education />
          </Route>
          <Route path="/experian">
            <Navigation />
            <ExperianConnect />
          </Route>
          <Route path="/admin">
            <Navigation />
            <AdminDashboard />
          </Route>
          <Route path="/admin-portal">
            <Navigation />
            <AdminPortal />
          </Route>
          <Route path="/admin-portal/:section">
            <Navigation />
            <AdminPortal />
          </Route>
          <Route path="/admin-portal/credit-reports/:id">
            <Navigation />
            <AdminPortal />
          </Route>
          <Route path="/support-admin">
            <Navigation />
            <SupportAdmin />
          </Route>
          <Route path="/billing">
            <Navigation />
            <Billing />
          </Route>
          <Route path="/checkout" component={SubscriptionCheckout} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/denial-decoder" component={DenialDecoder} />
          <Route path="/white-label/onboarding" component={WhiteLabelOnboarding} />
          <Route path="/credit-monitoring">
            <Navigation />
            <CreditMonitoring />
          </Route>
          <Route path="/portal" component={ClientPortal} />
          <Route path="/demo" component={Demo} />
          <Route path="/credit-building-v2">
            <Navigation />
            <CreditBuildingV2 />
          </Route>
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
