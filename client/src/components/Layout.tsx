import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Receipt, 
  Sparkles, 
  CreditCard, 
  LogOut, 
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useCredits } from "@/hooks/use-credits";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout, user } = useAuth();
  const { data: credits } = useCredits();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/invoices", label: "Invoices", icon: Receipt },
    { href: "/reports", label: "AI Reports", icon: Sparkles },
    { href: "/credits", label: "Credits", icon: CreditCard },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-2 mb-1">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="text-white size-4" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">BillSmart</span>
        </div>
        <div className="mt-4 p-3 bg-secondary/50 rounded-lg backdrop-blur-sm border border-border/50">
           <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1">AI Credits</p>
           <div className="flex items-baseline gap-1">
             <span className="text-2xl font-bold font-display text-primary">{credits?.balance ?? 0}</span>
             <span className="text-xs text-muted-foreground">remaining</span>
           </div>
           <Button variant="outline" size="sm" className="w-full mt-2 h-7 text-xs" asChild>
             <Link href="/credits">Top Up</Link>
           </Button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium",
              isActive 
                ? "bg-primary/10 text-primary shadow-sm" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )} onClick={() => setIsMobileOpen(false)}>
              <item.icon className={cn("size-5 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="size-8 rounded-full bg-gradient-to-tr from-primary to-primary/50 flex items-center justify-center text-white text-sm font-bold shadow-md">
            {user?.firstName?.[0] || user?.email?.[0] || "U"}
          </div>
          <div className="flex-1 min-w-0">
             <p className="text-sm font-medium truncate">{user?.firstName || "User"}</p>
             <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => logout()}
        >
          <LogOut className="size-4 mr-2" />
          Log Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 border-r border-border/50 bg-card/50 backdrop-blur-xl fixed inset-y-0 z-30">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-border/50 bg-background/80 backdrop-blur-md z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
           <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="text-white size-4" />
          </div>
          <span className="font-display font-bold text-lg">BillSmart</span>
        </div>
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      <main className="flex-1 md:ml-64 min-h-screen pt-16 md:pt-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
