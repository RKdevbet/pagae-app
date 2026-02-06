import { Calendar, Home, Inbox, Search, Settings, CreditCard, LayoutDashboard, FileText, Bell } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Link, useLocation } from "wouter"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const menuItems = [
    {
      title: user?.language === "pt-BR" ? "Painel" : "Dashboard",
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: user?.language === "pt-BR" ? "Faturas" : "Invoices",
      url: "/invoices",
      icon: CreditCard,
    },
    {
      title: user?.language === "pt-BR" ? "Relatórios IA" : "AI Reports",
      url: "/reports",
      icon: FileText,
    },
    {
      title: user?.language === "pt-BR" ? "Configurações" : "Settings",
      url: "/settings",
      icon: Settings,
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
         <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                <CreditCard className="size-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">FinTrack</span>
         </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{user?.language === "pt-BR" ? "Aplicação" : "Application"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={location === item.url}>
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="size-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
          </div>
      </SidebarFooter>
    </Sidebar>
  )
}