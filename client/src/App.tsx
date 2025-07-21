import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/navigation";
import { UserProvider, useUserContext } from "@/hooks/use-user-context";
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

  // Show login if no user is authenticated
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
      <Navigation />
      <Switch>
        <Route path="/" component={() => user?.accessLevel === "ADMIN" ? <AdminPortal /> : <CreditRepair />} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/credit-repair" component={CreditRepair} />
        <Route path="/credit-building" component={CreditBuilding} />
        <Route path="/education" component={Education} />
        <Route path="/experian" component={ExperianConnect} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin-portal" component={AdminPortal} />
        <Route path="/admin-portal/:section" component={AdminPortal} />
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
