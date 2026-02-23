import type { Tables } from "@/integrations/supabase/types";

type Pet = Tables<"pets">;
type AdoptionRequest = Tables<"adoption_requests">;

const DEMO_PETS_STORAGE_KEY = "pawhome_demo_pets";
const DEMO_REQUESTS_STORAGE_KEY = "pawhome_demo_requests";

const DEFAULT_PETS: Pet[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Max",
    species: "dog",
    breed: "Labrador Retriever",
    age_months: 30,
    gender: "male",
    description: "Friendly, energetic, and great with children.",
    image_url:
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=80",
    status: "available",
    shelter_location: "Downtown Shelter",
    weight_kg: 24.5,
    is_vaccinated: true,
    is_neutered: true,
    created_at: "2026-02-20T09:00:00.000Z",
    updated_at: "2026-02-20T09:00:00.000Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Luna",
    species: "cat",
    breed: "Domestic Shorthair",
    age_months: 18,
    gender: "female",
    description: "Calm indoor cat who loves cozy spaces.",
    image_url:
      "https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=900&q=80",
    status: "available",
    shelter_location: "North Branch",
    weight_kg: 4.2,
    is_vaccinated: true,
    is_neutered: false,
    created_at: "2026-02-19T10:00:00.000Z",
    updated_at: "2026-02-19T10:00:00.000Z",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    name: "Coco",
    species: "rabbit",
    breed: "Holland Lop",
    age_months: 10,
    gender: "female",
    description: "Gentle rabbit that enjoys soft toys and quiet corners.",
    image_url:
      "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=900&q=80",
    status: "pending",
    shelter_location: "East Care Center",
    weight_kg: 1.7,
    is_vaccinated: true,
    is_neutered: false,
    created_at: "2026-02-18T11:00:00.000Z",
    updated_at: "2026-02-18T11:00:00.000Z",
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    name: "Kiwi",
    species: "bird",
    breed: "Parakeet",
    age_months: 8,
    gender: "male",
    description: "Social bird with bright feathers and a playful nature.",
    image_url:
      "https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?auto=format&fit=crop&w=900&q=80",
    status: "available",
    shelter_location: "Green Aviary",
    weight_kg: 0.12,
    is_vaccinated: false,
    is_neutered: false,
    created_at: "2026-02-17T12:00:00.000Z",
    updated_at: "2026-02-17T12:00:00.000Z",
  },
  {
    id: "55555555-5555-4555-8555-555555555555",
    name: "Rocky",
    species: "other",
    breed: "Guinea Pig",
    age_months: 14,
    gender: "male",
    description: "Curious and sweet, enjoys fresh veggies and gentle care.",
    image_url:
      "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=900&q=80",
    status: "available",
    shelter_location: "West Habitat",
    weight_kg: 0.95,
    is_vaccinated: false,
    is_neutered: false,
    created_at: "2026-02-16T13:00:00.000Z",
    updated_at: "2026-02-16T13:00:00.000Z",
  },
];

const DEFAULT_REQUESTS: AdoptionRequest[] = [
  {
    id: "aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
    pet_id: "11111111-1111-4111-8111-111111111111",
    requester_name: "Riya Sharma",
    requester_email: "riya@example.com",
    requester_phone: "+1-555-1001",
    message: "I have experience caring for large dogs.",
    status: "pending",
    created_at: "2026-02-21T10:15:00.000Z",
    updated_at: "2026-02-21T10:15:00.000Z",
  },
  {
    id: "aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2",
    pet_id: "22222222-2222-4222-8222-222222222222",
    requester_name: "Anita Verma",
    requester_email: "anita@example.com",
    requester_phone: "+1-555-1002",
    message: "Looking for a calm companion cat.",
    status: "approved",
    created_at: "2026-02-20T08:40:00.000Z",
    updated_at: "2026-02-22T11:00:00.000Z",
  },
  {
    id: "aaaaaaa3-aaaa-4aaa-8aaa-aaaaaaaaaaa3",
    pet_id: "33333333-3333-4333-8333-333333333333",
    requester_name: "Rahul Jain",
    requester_email: "rahul@example.com",
    requester_phone: null,
    message: "We have a safe indoor setup for rabbits.",
    status: "rejected",
    created_at: "2026-02-19T07:30:00.000Z",
    updated_at: "2026-02-20T09:45:00.000Z",
  },
];

const isBrowser = () => typeof window !== "undefined";

const safeJsonParse = <T>(value: string | null): T | null => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

export const isMissingTableInSchemaCache = (message: string | null | undefined, tableName: string) => {
  if (!message) {
    return false;
  }

  return message.includes(`'${tableName}'`) || message.includes(`"${tableName}"`);
};

export const isMissingPetsTableError = (message: string | null | undefined) =>
  isMissingTableInSchemaCache(message, "public.pets");

export const isMissingRequestsTableError = (message: string | null | undefined) =>
  isMissingTableInSchemaCache(message, "public.adoption_requests");

export const loadDemoPets = (): Pet[] => {
  if (!isBrowser()) {
    return DEFAULT_PETS;
  }

  const saved = safeJsonParse<Pet[]>(window.localStorage.getItem(DEMO_PETS_STORAGE_KEY));
  if (saved && saved.length > 0) {
    return saved;
  }

  window.localStorage.setItem(DEMO_PETS_STORAGE_KEY, JSON.stringify(DEFAULT_PETS));
  return DEFAULT_PETS;
};

export const saveDemoPets = (pets: Pet[]) => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(DEMO_PETS_STORAGE_KEY, JSON.stringify(pets));
};

export const loadDemoRequests = (): AdoptionRequest[] => {
  if (!isBrowser()) {
    return DEFAULT_REQUESTS;
  }

  const saved = safeJsonParse<AdoptionRequest[]>(window.localStorage.getItem(DEMO_REQUESTS_STORAGE_KEY));
  if (saved && saved.length > 0) {
    return saved;
  }

  window.localStorage.setItem(DEMO_REQUESTS_STORAGE_KEY, JSON.stringify(DEFAULT_REQUESTS));
  return DEFAULT_REQUESTS;
};

export const saveDemoRequests = (requests: AdoptionRequest[]) => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(DEMO_REQUESTS_STORAGE_KEY, JSON.stringify(requests));
};
