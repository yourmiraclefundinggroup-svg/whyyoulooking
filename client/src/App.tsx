import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/navigation";
import { UserProvider, useUserContext } from "@/hooks/use-user-context";
import LandingPage from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import CreditRepair from "@/pages/credit-repair";
import CreditBuilding from "@/pages/credit-building";
import Education from "@/pages/education";
import ExperianConnect from "@/pages/experian-connect";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminPortal from "@/pages/admin-portal";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

function Router() {
  const { user } = useUserContext();
  const [location] = useLocation();

  // Show landing page if no user is authenticated and on root path
  if (!user && location === "/") {
    return <LandingPage />;
  }

  // Show login if no user is authenticated and not on landing page
  if (!user) {
    return <Login />;
  }

  // Auto-redirect users to their correct portal if they're on the root page
  if (user && location === "/") {
    if (user.accessLevel === "ADMIN") {
      return (
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <AdminPortal />
        </div>
      );
    } else {
      return (
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <CreditRepair />
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Switch>
        <Route path="/" component={LandingPage} />
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
        <Route path="/login" component={Login} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
