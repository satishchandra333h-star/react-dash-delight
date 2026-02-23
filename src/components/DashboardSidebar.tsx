import { useState } from "react";
import { LayoutDashboard, PawPrint, BarChart3, Users, Settings, Bell, LogOut, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: PawPrint, label: "Pets", path: "/pets" },
  { icon: BarChart3, label: "Analytics", path: "/" },
  { icon: Users, label: "Requests", path: "/" },
  { icon: Bell, label: "Notifications", path: "/" },
  { icon: Settings, label: "Settings", path: "/" },
];

const DashboardSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const sidebarContent = (
    <>
      <div className={`p-6 flex items-center justify-between ${collapsed ? "px-3 justify-center" : ""}`}>
        {!collapsed && (
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            <span className="text-primary">🐾</span> PawHome
          </h1>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:block text-muted-foreground hover:text-foreground transition-colors">
          {collapsed ? <Menu size={20} /> : <X size={16} />}
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-sidebar-accent text-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <item.icon size={18} className={active ? "text-primary" : ""} />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors ${collapsed ? "justify-center" : ""}`}>
          <LogOut size={18} />
          {!collapsed && "Log out"}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <aside className="w-64 h-full bg-sidebar border-r border-sidebar-border flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 flex justify-end">
              <button onClick={() => setMobileOpen(false)} className="text-muted-foreground"><X size={20} /></button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
        {sidebarContent}
      </aside>
    </>
  );
};

export default DashboardSidebar;
export const useSidebarWidth = () => {
  return "lg:ml-64";
};
