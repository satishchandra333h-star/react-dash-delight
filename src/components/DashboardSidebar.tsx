import { LayoutDashboard, BarChart3, Users, ShoppingCart, Settings, Bell, LogOut, Wallet } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: BarChart3, label: "Analytics" },
  { icon: Users, label: "Customers" },
  { icon: ShoppingCart, label: "Orders" },
  { icon: Wallet, label: "Payments" },
  { icon: Bell, label: "Notifications" },
  { icon: Settings, label: "Settings" },
];

const DashboardSidebar = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-foreground tracking-tight">
          <span className="text-primary">●</span> Apex
        </h1>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              item.active
                ? "bg-sidebar-accent text-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <item.icon size={18} className={item.active ? "text-primary" : ""} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
