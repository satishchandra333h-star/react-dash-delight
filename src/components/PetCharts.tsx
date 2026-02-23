import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { supabase } from "@/integrations/supabase/client";

const COLORS = ["hsl(174, 72%, 50%)", "hsl(200, 70%, 55%)", "hsl(150, 60%, 45%)", "hsl(40, 85%, 60%)", "hsl(0, 72%, 55%)"];

const PetCharts = () => {
  const [speciesData, setSpeciesData] = useState([]);
  const [breedData, setBreedData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: pets } = await supabase.from("pets").select("species, breed");
      if (!pets) return;

      // Species breakdown
      const speciesCount = {};
      pets.forEach((p) => {
        const s = p.species || "other";
        speciesCount[s] = (speciesCount[s] || 0) + 1;
      });
      setSpeciesData(Object.entries(speciesCount).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })));

      // Top breeds
      const breedCount = {};
      pets.forEach((p) => {
        if (p.breed) breedCount[p.breed] = (breedCount[p.breed] || 0) + 1;
      });
      const sorted = Object.entries(breedCount)
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);
      setBreedData(sorted);
    };
    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Donut chart */}
      <div className="bg-card border border-border rounded-xl p-6 animate-fade-in" style={{ animationDelay: "320ms" }}>
        <h3 className="text-base font-semibold text-foreground mb-1">Species Breakdown</h3>
        <p className="text-sm text-muted-foreground mb-4">Distribution by animal type</p>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={speciesData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
              {speciesData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(220, 18%, 13%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: "8px", fontSize: "13px" }}
              labelStyle={{ color: "hsl(210, 20%, 92%)" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-3 justify-center mt-2">
          {speciesData.map((item, i) => (
            <span key={item.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              {item.name} ({item.value})
            </span>
          ))}
        </div>
      </div>

      {/* Bar chart */}
      <div className="bg-card border border-border rounded-xl p-6 animate-fade-in" style={{ animationDelay: "400ms" }}>
        <h3 className="text-base font-semibold text-foreground mb-1">Top Breeds</h3>
        <p className="text-sm text-muted-foreground mb-4">Most common breeds in shelter</p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={breedData} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" horizontal={false} />
            <XAxis type="number" stroke="hsl(215, 12%, 52%)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="name" stroke="hsl(215, 12%, 52%)" fontSize={11} tickLine={false} axisLine={false} width={100} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(220, 18%, 13%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: "8px", fontSize: "13px" }}
              cursor={{ fill: "hsl(220, 14%, 16%)" }}
            />
            <Bar dataKey="count" fill="hsl(174, 72%, 50%)" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PetCharts;
