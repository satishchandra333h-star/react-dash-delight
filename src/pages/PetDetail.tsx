import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Heart, MapPin, X } from "lucide-react";
import { toast } from "sonner";

import AppShell from "@/components/AppShell";
import {
  isMissingPetsTableError,
  isMissingRequestsTableError,
  loadDemoPets,
  loadDemoRequests,
  saveDemoRequests,
} from "@/lib/demoPetData";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Pet = Tables<"pets">;
type AdoptionRequest = Tables<"adoption_requests">;

interface AdoptionForm {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const initialForm: AdoptionForm = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

const createLocalId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `local-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
};

const PetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AdoptionForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPet = async () => {
      if (!id) {
        setError("Missing pet id in URL.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase.from("pets").select("*").eq("id", id).maybeSingle();

      if (fetchError) {
        if (isMissingPetsTableError(fetchError.message)) {
          const localPet = loadDemoPets().find((item) => item.id === id);

          if (!localPet) {
            setError("Pet not found.");
            setLoading(false);
            return;
          }

          setPet(localPet);
          setDemoMode(true);
          setLoading(false);
          return;
        }

        setError(fetchError.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setError("Pet not found.");
        setLoading(false);
        return;
      }

      setDemoMode(false);
      setPet(data);
      setLoading(false);
    };

    fetchPet();
  }, [id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!id || !pet) {
      toast.error("Cannot submit request: missing pet id.");
      return;
    }

    setSubmitting(true);

    const saveDemoRequest = () => {
      const now = new Date().toISOString();
      const newRequest: AdoptionRequest = {
        id: createLocalId(),
        pet_id: id,
        requester_name: form.name,
        requester_email: form.email,
        requester_phone: form.phone || null,
        message: form.message || null,
        status: "pending",
        created_at: now,
        updated_at: now,
      };

      const nextRequests = [newRequest, ...loadDemoRequests()];
      saveDemoRequests(nextRequests);
      toast.success("Adoption request submitted in demo mode.");
    };

    if (demoMode) {
      saveDemoRequest();
      setSubmitting(false);
      setShowForm(false);
      setForm(initialForm);
      return;
    }

    const { error: submitError } = await supabase.from("adoption_requests").insert({
      pet_id: id,
      requester_name: form.name,
      requester_email: form.email,
      requester_phone: form.phone || null,
      message: form.message || null,
    });

    setSubmitting(false);

    if (submitError) {
      if (isMissingRequestsTableError(submitError.message)) {
        saveDemoRequest();
        setShowForm(false);
        setForm(initialForm);
        return;
      }

      toast.error(submitError.message || "Failed to submit request");
      return;
    }

    toast.success("Adoption request submitted!");
    setShowForm(false);
    setForm(initialForm);
  };

  if (loading) {
    return (
      <AppShell title="Pet Details" subtitle="Loading pet information">
        <div className="py-12 text-center text-muted-foreground">Loading...</div>
      </AppShell>
    );
  }

  if (error || !pet) {
    return (
      <AppShell title="Pet Details" subtitle="Detailed profile and adoption request">
        <div className="py-8 flex justify-center">
          <div className="max-w-lg w-full rounded-xl border border-destructive/40 bg-destructive/10 p-5 text-sm text-destructive">
            {error || "Pet record is unavailable."}
            <div className="mt-3">
              <Link to="/pets" className="underline hover:opacity-80">
                Back to pets
              </Link>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={pet.name} subtitle="Detailed profile and adoption request">
      {demoMode && (
        <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary mb-6">
          Demo mode enabled for this pet (database table is missing).
        </div>
      )}

      <div className="max-w-5xl mx-auto py-2 md:py-4">
        <Link
          to="/pets"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to pets
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-xl overflow-hidden border border-border">
            <img src={pet.image_url || "/placeholder.svg"} alt={pet.name} className="w-full h-80 md:h-full object-cover" />
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{pet.name}</h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  pet.status === "available"
                    ? "bg-success/15 text-success"
                    : pet.status === "pending"
                      ? "bg-warning/15 text-warning"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {pet.status}
              </span>
            </div>

            <p className="text-muted-foreground mb-6">
              {pet.breed || "Unknown breed"} - {pet.gender} - {Math.floor(pet.age_months / 12)} years {pet.age_months % 12} months
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-card border border-border rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Weight</p>
                <p className="font-semibold text-foreground">{pet.weight_kg ?? "-"} kg</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-semibold text-foreground text-sm flex items-center justify-center gap-1">
                  <MapPin size={12} />
                  {pet.shelter_location || "Unknown"}
                </p>
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

            <p className="text-foreground mb-6 leading-relaxed">{pet.description || "No description provided yet."}</p>

            {pet.status === "available" && !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                type="button"
              >
                <Heart size={18} /> Adopt {pet.name}
              </button>
            )}

            {showForm && (
              <form onSubmit={handleSubmit} className="space-y-3 bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-2">Adoption Request</h3>
                <input
                  required
                  placeholder="Your name"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  required
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  placeholder="Phone (optional)"
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <textarea
                  placeholder="Tell us why you would be a great pet parent..."
                  value={form.message}
                  onChange={(event) => setForm({ ...form, message: event.target.value })}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary h-24 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit Request"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default PetDetail;
