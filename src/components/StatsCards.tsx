import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, PawPrint, Heart, Clock, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const StatsCards = () => {
  const [stats, setStats] = useState([
    { label: "Total Pets", value: "0", change: "", up: true, icon: PawPrint },
    { label: "Available", value: "0", change: "", up: true, icon: Heart },
    { label: "Pending", value: "0", change: "", up: false, icon: Clock },
    { label: "Adopted", value: "0", change: "", up: true, icon: CheckCircle },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: pets } = await supabase.from("pets").select("status");
      if (!pets) return;

      const total = pets.length;
      const available = pets.filter((p) => p.status === "available").length;
      const pending = pets.filter((p) => p.status === "pending").length;
      const adopted = pets.filter((p) => p.status === "adopted").length;

      setStats([
        { label: "Total Pets", value: String(total), change: "+3 this week", up: true, icon: PawPrint },
        { label: "Available", value: String(available), change: `${Math.round((available / total) * 100)}% of total`, up: true, icon: Heart },
        { label: "Pending", value: String(pending), change: `${pending} awaiting`, up: false, icon: Clock },
        { label: "Adopted", value: String(adopted), change: "Great news!", up: true, icon: CheckCircle },
      ]);
    };
    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div key={stat.label} className="bg-card border border-border rounded-xl p-5 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">{stat.label}</span>
            <div className="p-2 rounded-lg bg-secondary">
              <stat.icon size={16} className="text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          <div className="flex items-center gap-1 mt-1">
            {stat.up ? <TrendingUp size={14} className="text-success" /> : <TrendingDown size={14} className="text-warning" />}
            <span className="text-xs text-muted-foreground">{stat.change}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
