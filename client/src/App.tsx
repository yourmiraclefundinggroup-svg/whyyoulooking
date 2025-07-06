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
    console.log("User data in App.tsx:", user);
    console.log("User access level:", user.accessLevel);
    console.log("Is admin check:", user.accessLevel === "ADMIN");
    
    if (user.accessLevel === "ADMIN") {
      console.log("Redirecting to AdminPortal");
      return <AdminPortal />;
    } else {
      console.log("Redirecting to Dashboard");
      return <Dashboard />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Switch>
        <Route path="/" component={() => user?.accessLevel === "ADMIN" ? <AdminPortal /> : <Dashboard />} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/credit-repair" component={CreditRepair} />
        <Route path="/credit-building" component={CreditBuilding} />
        <Route path="/education" component={Education} />
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
