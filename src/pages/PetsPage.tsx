import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Heart, MapPin, PawPrint, Search, Filter } from "lucide-react";

const speciesEmoji = { dog: "🐕", cat: "🐱", rabbit: "🐰", bird: "🐦", other: "🐾" };

const PetsPage = () => {
  const [pets, setPets] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchPets = async () => {
      let query = supabase.from("pets").select("*").order("created_at", { ascending: false });
      if (filter !== "all") query = query.eq("species", filter as any);
      const { data } = await query;
      if (data) setPets(data);
    };
    fetchPets();
  }, [filter]);

  const filtered = pets.filter(
    (p) =>
      p.status !== "adopted" &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.breed && p.breed.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Find Your <span className="text-primary">Perfect</span> Companion
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Every pet deserves a loving home. Browse our shelter animals and start your adoption journey today.
          </p>
          <div className="relative max-w-md mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or breed..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-secondary border border-border rounded-xl pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          <Filter size={16} className="text-muted-foreground flex-shrink-0" />
          {["all", "dog", "cat", "rabbit", "bird", "other"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {s === "all" ? "All Pets" : `${speciesEmoji[s] || "🐾"} ${s.charAt(0).toUpperCase() + s.slice(1)}s`}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((pet, i) => (
            <Link
              to={`/pets/${pet.id}`}
              key={pet.id}
              className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all hover:-translate-y-1 animate-fade-in group"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={pet.image_url || "/placeholder.svg"}
                  alt={pet.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    pet.status === "available" ? "bg-success/90 text-primary-foreground" : "bg-warning/90 text-primary-foreground"
                  }`}>
                    {pet.status}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-semibold text-foreground">{pet.name}</h3>
                  <span className="text-lg">{speciesEmoji[pet.species] || "🐾"}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{pet.breed} · {pet.gender} · {Math.floor(pet.age_months / 12)}y {pet.age_months % 12}m</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin size={12} />
                  {pet.shelter_location}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <PawPrint size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No pets found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PetsPage;
