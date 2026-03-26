import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/navigation";
import { UserProvider, useUserContext } from "@/hooks/use-user-context";
import { ThemeProvider } from "@/components/theme-provider";
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
import AdminPortalV2 from "@/pages/admin-portal-v2";
import SupportAdmin from "@/pages/support-admin";
import Billing from "@/pages/billing";
import SubscriptionCheckout from "@/pages/subscription-checkout";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import PrivacyPolicy from "@/pages/privacy-policy";
import Terms from "@/pages/terms";
import DenialDecoder from "@/pages/denial-decoder";
import WhiteLabelOnboarding from "@/pages/white-label-onboarding";
import NotFound from "@/pages/not-found";
import { TrialUpgradeWall } from "@/components/trial-upgrade-wall";

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

  // Show login if no user is authenticated and not on other allowed pages
  if (!user) {
    return <Login />;
  }

  // Auto-redirect users to their correct portal if they're on the root page
  if (user && location === "/") {
    if (user.accessLevel === "ADMIN") {
      return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
          <Navigation />
          <AdminPortal />
        </div>
      );
    } else {
      return (
        <TrialUpgradeWall>
          <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
            <Navigation />
            <CreditRepair />
          </div>
        </TrialUpgradeWall>
      );
    }
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
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </UserProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
