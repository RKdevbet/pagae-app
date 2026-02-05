import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/Layout";
import { Loader2 } from "lucide-react";

import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Invoices from "@/pages/Invoices";
import Reports from "@/pages/Reports";
import ReportDetail from "@/pages/ReportDetail";
import Credits from "@/pages/Credits";
import NotFound from "@/pages/not-found";

// Wrapper for protected routes
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // Redirect to landing if not logged in
    window.location.href = "/";
    return null;
  }

  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
     return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Switch>
      {/* Public Route */}
      <Route path="/">
        {user ? <Layout><Dashboard /></Layout> : <Landing />}
      </Route>

      {/* Protected Routes */}
      <Route path="/invoices">
        <ProtectedRoute component={Invoices} />
      </Route>
      <Route path="/reports">
        <ProtectedRoute component={Reports} />
      </Route>
      <Route path="/reports/:id">
        <ProtectedRoute component={ReportDetail} />
      </Route>
       <Route path="/credits">
        <ProtectedRoute component={Credits} />
      </Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
