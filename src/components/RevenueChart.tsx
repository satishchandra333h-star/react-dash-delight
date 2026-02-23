import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", revenue: 18500, orders: 820 },
  { month: "Feb", revenue: 22300, orders: 932 },
  { month: "Mar", revenue: 19800, orders: 870 },
  { month: "Apr", revenue: 27600, orders: 1100 },
  { month: "May", revenue: 32400, orders: 1250 },
  { month: "Jun", revenue: 29100, orders: 1180 },
  { month: "Jul", revenue: 35800, orders: 1340 },
  { month: "Aug", revenue: 38200, orders: 1420 },
  { month: "Sep", revenue: 34600, orders: 1290 },
  { month: "Oct", revenue: 42100, orders: 1560 },
  { month: "Nov", revenue: 45300, orders: 1680 },
  { month: "Dec", revenue: 48295, orders: 1750 },
];

const RevenueChart = () => {
  return (
    <div className="bg-card border border-border rounded-xl p-6 animate-fade-in" style={{ animationDelay: "320ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-foreground">Revenue Overview</h3>
          <p className="text-sm text-muted-foreground">Monthly revenue for 2025</p>
        </div>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            Revenue
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-chart-2" />
            Orders
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(174, 72%, 50%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(174, 72%, 50%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(200, 70%, 55%)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="hsl(200, 70%, 55%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
          <XAxis dataKey="month" stroke="hsl(215, 12%, 52%)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="hsl(215, 12%, 52%)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(220, 18%, 13%)",
              border: "1px solid hsl(220, 14%, 18%)",
              borderRadius: "8px",
              fontSize: "13px",
            }}
            labelStyle={{ color: "hsl(210, 20%, 92%)" }}
          />
          <Area type="monotone" dataKey="revenue" stroke="hsl(174, 72%, 50%)" fill="url(#colorRevenue)" strokeWidth={2} />
          <Area type="monotone" dataKey="orders" stroke="hsl(200, 70%, 55%)" fill="url(#colorOrders)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
