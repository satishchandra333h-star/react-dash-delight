import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, MapPin, Heart, Check, X, Syringe, Scissors } from "lucide-react";
import { toast } from "sonner";

const PetDetail = () => {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPet = async () => {
      const { data } = await supabase.from("pets").select("*").eq("id", id).single();
      if (data) setPet(data);
    };
    fetchPet();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("adoption_requests").insert({
      pet_id: id,
      requester_name: form.name,
      requester_email: form.email,
      requester_phone: form.phone,
      message: form.message,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Failed to submit request");
    } else {
      toast.success("Adoption request submitted!");
      setShowForm(false);
      setForm({ name: "", email: "", phone: "", message: "" });
    }
  };

  if (!pet) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link to="/pets" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to pets
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-xl overflow-hidden border border-border">
            <img src={pet.image_url || "/placeholder.svg"} alt={pet.name} className="w-full h-80 md:h-full object-cover" />
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{pet.name}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                pet.status === "available" ? "bg-success/15 text-success" : pet.status === "pending" ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground"
              }`}>
                {pet.status}
              </span>
            </div>

            <p className="text-muted-foreground mb-6">{pet.breed} · {pet.gender} · {Math.floor(pet.age_months / 12)} years {pet.age_months % 12} months</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-card border border-border rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Weight</p>
                <p className="font-semibold text-foreground">{pet.weight_kg} kg</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-semibold text-foreground text-sm flex items-center justify-center gap-1"><MapPin size={12} />{pet.shelter_location}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-3 flex items-center justify-center gap-2">
                {pet.is_vaccinated ? <Check size={14} className="text-success" /> : <X size={14} className="text-destructive" />}
                <span className="text-sm text-foreground">Vaccinated</span>
              </div>
              <div className="bg-card border border-border rounded-lg p-3 flex items-center justify-center gap-2">
                {pet.is_neutered ? <Check size={14} className="text-success" /> : <X size={14} className="text-destructive" />}
                <span className="text-sm text-foreground">Neutered</span>
              </div>
            </div>

            <p className="text-foreground mb-6 leading-relaxed">{pet.description}</p>

            {pet.status === "available" && !showForm && (
              <button onClick={() => setShowForm(true)} className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <Heart size={18} /> Adopt {pet.name}
              </button>
            )}

            {showForm && (
              <form onSubmit={handleSubmit} className="space-y-3 bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-2">Adoption Request</h3>
                <input required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                <input required type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                <input placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                <textarea placeholder="Tell us why you'd be a great pet parent..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary h-24 resize-none" />
                <div className="flex gap-2">
                  <button type="submit" disabled={submitting} className="flex-1 bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                    {submitting ? "Submitting..." : "Submit Request"}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetDetail;
