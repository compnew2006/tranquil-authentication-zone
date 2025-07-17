import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Settings, 
  MessageCircle,
  Users,
  Shield,
  LogOut
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const adminItems = [
  { title: "Admin Dashboard", url: "/admin/dashboard", icon: Shield },
  { title: "Chat", url: "/chat", icon: MessageSquare },
  { title: "WhatsApp Connect", url: "/whatsapp-connect", icon: MessageCircle },
  { title: "Settings", url: "/settings", icon: Settings },
];

const userItems = [
  { title: "Dashboard", url: "/user/dashboard", icon: LayoutDashboard },
  { title: "Chat", url: "/chat", icon: MessageSquare },
  { title: "WhatsApp Connect", url: "/whatsapp-connect", icon: MessageCircle },
  { title: "Settings", url: "/settings", icon: Settings },
];

export const AppSidebar: React.FC = () => {
  const { state } = useSidebar();
  const { user, logout } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  const items = user?.role === 'admin' ? adminItems : userItems;
  const isCollapsed = state === 'collapsed';
  
  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

  return (
    <Sidebar
      className={isCollapsed ? "w-14" : "w-64"}
      collapsible="icon"
    >
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        {/* Brand */}
        {!isCollapsed && (
          <div className="p-4 border-b border-sidebar-border">
            <h2 className="text-xl font-bold text-sidebar-foreground">GOWA</h2>
            <p className="text-sm text-sidebar-foreground/70">
              {user?.role === 'admin' ? 'Admin Panel' : 'User Portal'}
            </p>
          </div>
        )}

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>
            {user?.role === 'admin' ? 'Admin Tools' : 'Navigation'}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Section */}
        <div className="mt-auto p-4 border-t border-sidebar-border">
          {!isCollapsed && (
            <div className="mb-3">
              <p className="text-sm font-medium text-sidebar-foreground">
                {user?.username}
              </p>
              <p className="text-xs text-sidebar-foreground/70">
                {user?.email}
              </p>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};