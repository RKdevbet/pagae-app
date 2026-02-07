import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, CreditCard } from "lucide-react";

import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Invoices from "@/pages/Invoices";
import Reports from "@/pages/Reports";
import ReportDetail from "@/pages/ReportDetail";
import Settings from "@/pages/Settings";
import Credits from "@/pages/Credits";
import NotFound from "@/pages/not-found";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeToggle } from "@/components/ThemeToggle"

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

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex min-h-screen w-full bg-background overflow-x-hidden">
        {user && <AppSidebar />}
        <div className="flex flex-col flex-1 min-w-0">
          {user && (
            <header className="sticky top-0 z-50 flex items-center justify-between p-2 md:p-4 border-b bg-background/80 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <div className="md:hidden flex items-center gap-2">
                  <CreditCard className="size-5 text-primary" />
                  <span className="font-display font-bold text-lg tracking-tight">Pagaê</span>
                </div>
              </div>
              <ThemeToggle />
            </header>
          )}
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              <Switch>
                {/* Public Route */}
                <Route path="/">
                  {user ? <Dashboard /> : <Landing />}
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
                <Route path="/settings">
                  <ProtectedRoute component={Settings} />
                </Route>

                {/* Fallback */}
                <Route component={NotFound} />
              </Switch>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
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
