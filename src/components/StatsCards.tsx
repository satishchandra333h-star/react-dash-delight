import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Eye } from "lucide-react";

const stats = [
  { label: "Revenue", value: "$48,295", change: "+12.5%", up: true, icon: DollarSign },
  { label: "Customers", value: "2,845", change: "+8.2%", up: true, icon: Users },
  { label: "Orders", value: "1,294", change: "-3.1%", up: false, icon: ShoppingCart },
  { label: "Page Views", value: "54.2K", change: "+24.3%", up: true, icon: Eye },
];

const StatsCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className="bg-card border border-border rounded-xl p-5 animate-fade-in"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">{stat.label}</span>
            <div className="p-2 rounded-lg bg-secondary">
              <stat.icon size={16} className="text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          <div className="flex items-center gap-1 mt-1">
            {stat.up ? (
              <TrendingUp size={14} className="text-success" />
            ) : (
              <TrendingDown size={14} className="text-destructive" />
            )}
            <span className={`text-xs font-medium ${stat.up ? "text-success" : "text-destructive"}`}>
              {stat.change}
            </span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
