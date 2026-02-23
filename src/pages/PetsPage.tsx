import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Filter, MapPin, PawPrint, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import AppShell from "@/components/AppShell";
import {
  isMissingPetsTableError,
  loadDemoPets,
  saveDemoPets,
} from "@/lib/demoPetData";
import { supabase } from "@/integrations/supabase/client";
import type { Enums, Tables, TablesInsert } from "@/integrations/supabase/types";

type Pet = Tables<"pets">;
type PetInsert = TablesInsert<"pets">;
type PetSpecies = Enums<"pet_species">;
type PetStatus = Enums<"pet_status">;

interface PetFormValues {
  name: string;
  species: PetSpecies;
  breed: string;
  age_months: string;
  gender: string;
  status: PetStatus;
  shelter_location: string;
  weight_kg: string;
  image_url: string;
  description: string;
  is_vaccinated: boolean;
  is_neutered: boolean;
}

const speciesEmoji: Record<PetSpecies, string> = {
  dog: "\u{1F415}",
  cat: "\u{1F431}",
  rabbit: "\u{1F430}",
  bird: "\u{1F426}",
  other: "\u{1F43E}",
};

const speciesFilters: Array<PetSpecies | "all"> = ["all", "dog", "cat", "rabbit", "bird", "other"];
const statusOptions: PetStatus[] = ["available", "pending", "adopted"];

const speciesDefaultImage: Record<PetSpecies, string> = {
  dog: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=80",
  cat: "https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=900&q=80",
  rabbit: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=900&q=80",
  bird: "https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?auto=format&fit=crop&w=900&q=80",
  other: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=900&q=80",
};

const initialFormValues: PetFormValues = {
  name: "",
  species: "dog",
  breed: "",
  age_months: "12",
  gender: "unknown",
  status: "available",
  shelter_location: "",
  weight_kg: "",
  image_url: "",
  description: "",
  is_vaccinated: false,
  is_neutered: false,
};

const toFormValues = (pet: Pet): PetFormValues => ({
  name: pet.name,
  species: pet.species,
  breed: pet.breed || "",
  age_months: String(pet.age_months),
  gender: pet.gender,
  status: pet.status,
  shelter_location: pet.shelter_location || "",
  weight_kg: pet.weight_kg !== null ? String(pet.weight_kg) : "",
  image_url: pet.image_url || "",
  description: pet.description || "",
  is_vaccinated: Boolean(pet.is_vaccinated),
  is_neutered: Boolean(pet.is_neutered),
});

const sortByCreatedAtDesc = (rows: Pet[]) => {
  return [...rows].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

const createLocalId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `local-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
};

const PetsPage = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [filter, setFilter] = useState<PetSpecies | "all">("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPetId, setEditingPetId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<PetFormValues>(initialFormValues);

  const fetchPets = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase.from("pets").select("*").order("created_at", { ascending: false });

    if (fetchError) {
      if (isMissingPetsTableError(fetchError.message)) {
        const demoPets = sortByCreatedAtDesc(loadDemoPets());
        setPets(demoPets);
        setDemoMode(true);
        setLoading(false);
        return;
      }

      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setDemoMode(false);
    setPets(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const filteredPets = useMemo(() => {
    const query = search.trim().toLowerCase();

    return pets.filter((pet) => {
      const matchesSpecies = filter === "all" || pet.species === filter;
      const matchesSearch =
        query.length === 0 ||
        pet.name.toLowerCase().includes(query) ||
        (pet.breed && pet.breed.toLowerCase().includes(query));

      return matchesSpecies && matchesSearch;
    });
  }, [pets, filter, search]);

  const openCreateForm = () => {
    setEditingPetId(null);
    setFormValues(initialFormValues);
    setShowForm(true);
  };

  const openEditForm = (pet: Pet) => {
    setEditingPetId(pet.id);
    setFormValues(toFormValues(pet));
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingPetId(null);
    setFormValues(initialFormValues);
  };

  const handleSavePet = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const ageMonths = Number(formValues.age_months);
    const weightValue = formValues.weight_kg.trim();
    const weight = weightValue ? Number(weightValue) : null;

    if (!Number.isFinite(ageMonths) || ageMonths < 0) {
      toast.error("Age in months must be a valid positive number.");
      setIsSubmitting(false);
      return;
    }

    if (weightValue && (!Number.isFinite(weight) || (weight !== null && weight < 0))) {
      toast.error("Weight must be a valid positive number.");
      setIsSubmitting(false);
      return;
    }

    const now = new Date().toISOString();
    const payload: PetInsert = {
      name: formValues.name.trim(),
      species: formValues.species,
      breed: formValues.breed.trim() || null,
      age_months: Math.floor(ageMonths),
      gender: formValues.gender.trim() || "unknown",
      status: formValues.status,
      shelter_location: formValues.shelter_location.trim() || null,
      weight_kg: weight,
      image_url: formValues.image_url.trim() || speciesDefaultImage[formValues.species],
      description: formValues.description.trim() || null,
      is_vaccinated: formValues.is_vaccinated,
      is_neutered: formValues.is_neutered,
    };

    if (demoMode) {
      if (editingPetId) {
        const nextPets = sortByCreatedAtDesc(
          pets.map((pet) =>
            pet.id === editingPetId
              ? {
                  ...pet,
                  ...payload,
                  id: editingPetId,
                  created_at: pet.created_at,
                  updated_at: now,
                }
              : pet,
          ),
        );

        setPets(nextPets);
        saveDemoPets(nextPets);
        toast.success("Pet updated in demo mode.");
      } else {
        const newPet: Pet = {
          id: createLocalId(),
          name: payload.name,
          species: payload.species ?? "dog",
          breed: payload.breed ?? null,
          age_months: payload.age_months ?? 0,
          gender: payload.gender ?? "unknown",
          description: payload.description ?? null,
          image_url: payload.image_url ?? null,
          status: payload.status ?? "available",
          shelter_location: payload.shelter_location ?? null,
          weight_kg: payload.weight_kg ?? null,
          is_vaccinated: payload.is_vaccinated ?? false,
          is_neutered: payload.is_neutered ?? false,
          created_at: now,
          updated_at: now,
        };

        const nextPets = sortByCreatedAtDesc([newPet, ...pets]);
        setPets(nextPets);
        saveDemoPets(nextPets);
        toast.success("Pet created in demo mode.");
      }

      setIsSubmitting(false);
      closeForm();
      return;
    }

    if (editingPetId) {
      const { error: updateError } = await supabase.from("pets").update(payload).eq("id", editingPetId);

      if (updateError) {
        toast.error(updateError.message || "Failed to update pet.");
        setIsSubmitting(false);
        return;
      }

      toast.success("Pet updated successfully.");
    } else {
      const { error: insertError } = await supabase.from("pets").insert(payload);

      if (insertError) {
        toast.error(insertError.message || "Failed to create pet.");
        setIsSubmitting(false);
        return;
      }

      toast.success("Pet added successfully.");
    }

    setIsSubmitting(false);
    closeForm();
    fetchPets();
  };

  const handleDeletePet = async (petId: string) => {
    const confirmed = window.confirm("Delete this pet? This action cannot be undone.");
    if (!confirmed) {
      return;
    }

    if (demoMode) {
      const nextPets = pets.filter((pet) => pet.id !== petId);
      setPets(nextPets);
      saveDemoPets(nextPets);
      toast.success("Pet deleted in demo mode.");
      return;
    }

    setIsDeletingId(petId);
    const { error: deleteError } = await supabase.from("pets").delete().eq("id", petId);

    if (deleteError) {
      toast.error(deleteError.message || "Failed to delete pet.");
      setIsDeletingId(null);
      return;
    }

    toast.success("Pet deleted.");
    setIsDeletingId(null);
    fetchPets();
  };

  return (
    <AppShell title="Pets" subtitle="Browse and manage animals available for adoption">
      {demoMode && (
        <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary mb-6">
          Demo mode enabled: your database is missing <span className="font-mono">public.pets</span>, so 5 default
          animals with photos are loaded automatically.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-6">
          Could not load pets: {error}
        </div>
      )}

      <section className="bg-card border border-border rounded-xl p-4 md:p-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-foreground">Find your perfect companion</h3>
            <p className="text-sm text-muted-foreground mt-1">Search, filter, and manage pet records.</p>
          </div>

          <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-2">
            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or breed..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full bg-secondary border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              <Plus size={16} />
              Add Pet
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
          <Filter size={16} className="text-muted-foreground flex-shrink-0" />
          {speciesFilters.map((species) => (
            <button
              key={species}
              type="button"
              onClick={() => setFilter(species)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filter === species
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {species === "all"
                ? "All Pets"
                : `${speciesEmoji[species]} ${species.charAt(0).toUpperCase() + species.slice(1)}s`}
            </button>
          ))}
        </div>
      </section>

      {showForm && (
        <section className="mt-6 bg-card border border-border rounded-xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground">{editingPetId ? "Edit Pet" : "Add New Pet"}</h3>
            <button type="button" onClick={closeForm} className="text-sm text-muted-foreground hover:text-foreground">
              Cancel
            </button>
          </div>

          <form onSubmit={handleSavePet} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <input
                required
                value={formValues.name}
                onChange={(event) => setFormValues((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Name"
                className="bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm"
              />

              <select
                value={formValues.species}
                onChange={(event) => setFormValues((prev) => ({ ...prev, species: event.target.value as PetSpecies }))}
                className="bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm"
              >
                {speciesFilters
                  .filter((item): item is PetSpecies => item !== "all")
                  .map((species) => (
                    <option key={species} value={species}>
                      {species}
                    </option>
                  ))}
              </select>

              <input
                value={formValues.breed}
                onChange={(event) => setFormValues((prev) => ({ ...prev, breed: event.target.value }))}
                placeholder="Breed"
                className="bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm"
              />

              <input
                type="number"
                min="0"
                value={formValues.age_months}
                onChange={(event) => setFormValues((prev) => ({ ...prev, age_months: event.target.value }))}
                placeholder="Age (months)"
                className="bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm"
              />

              <input
                value={formValues.gender}
                onChange={(event) => setFormValues((prev) => ({ ...prev, gender: event.target.value }))}
                placeholder="Gender"
                className="bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm"
              />

              <select
                value={formValues.status}
                onChange={(event) => setFormValues((prev) => ({ ...prev, status: event.target.value as PetStatus }))}
                className="bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <input
                value={formValues.shelter_location}
                onChange={(event) => setFormValues((prev) => ({ ...prev, shelter_location: event.target.value }))}
                placeholder="Shelter location"
                className="bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm"
              />

              <input
                type="number"
                step="0.1"
                min="0"
                value={formValues.weight_kg}
                onChange={(event) => setFormValues((prev) => ({ ...prev, weight_kg: event.target.value }))}
                placeholder="Weight (kg)"
                className="bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm"
              />

              <input
                value={formValues.image_url}
                onChange={(event) => setFormValues((prev) => ({ ...prev, image_url: event.target.value }))}
                placeholder="Image URL (optional)"
                className="bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm"
              />
            </div>

            <textarea
              value={formValues.description}
              onChange={(event) => setFormValues((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Description"
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm min-h-24"
            />

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formValues.is_vaccinated}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, is_vaccinated: event.target.checked }))}
                />
                Vaccinated
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formValues.is_neutered}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, is_neutered: event.target.checked }))}
                />
                Neutered
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : editingPetId ? "Update Pet" : "Create Pet"}
            </button>
          </form>
        </section>
      )}

      <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {!loading &&
          filteredPets.map((pet, index) => (
            <div
              key={pet.id}
              className="bg-card border border-border rounded-xl overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <Link to={`/pets/${pet.id}`} className="block group hover:border-primary/50 transition-all hover:-translate-y-1">
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={pet.image_url || speciesDefaultImage[pet.species]}
                    alt={pet.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        pet.status === "available"
                          ? "bg-success/90 text-primary-foreground"
                          : pet.status === "pending"
                            ? "bg-warning/90 text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {pet.status}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-semibold text-foreground">{pet.name}</h3>
                    <span className="text-lg">{speciesEmoji[pet.species]}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {pet.breed || "Unknown breed"} - {pet.gender} - {Math.floor(pet.age_months / 12)}y {pet.age_months % 12}m
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin size={12} />
                    {pet.shelter_location || "Unknown"}
                  </div>
                </div>
              </Link>

              <div className="border-t border-border p-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditForm(pet)}
                  className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground hover:bg-muted"
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePet(pet.id)}
                  disabled={isDeletingId === pet.id}
                  className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-destructive/90 px-3 py-2 text-xs font-medium text-destructive-foreground hover:opacity-90 disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  {isDeletingId === pet.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
      </section>

      {loading && <div className="text-center py-12 text-sm text-muted-foreground">Loading pets...</div>}

      {!loading && !error && filteredPets.length === 0 && (
        <div className="text-center py-16">
          <PawPrint size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No pets found matching your criteria.</p>
        </div>
      )}
    </AppShell>
  );
};

export default PetsPage;
