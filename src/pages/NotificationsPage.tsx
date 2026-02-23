import { useEffect, useState } from "react";
import { BellRing, PawPrint } from "lucide-react";
import { Link } from "react-router-dom";

import AppShell from "@/components/AppShell";
import {
  isMissingPetsTableError,
  isMissingRequestsTableError,
  loadDemoPets,
  loadDemoRequests,
} from "@/lib/demoPetData";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type AdoptionRequest = Pick<Tables<"adoption_requests">, "id" | "pet_id" | "requester_name" | "created_at" | "status">;
type PetRow = Pick<Tables<"pets">, "id" | "name" | "status" | "created_at">;
type RequestNotification = AdoptionRequest & { pet_name: string | null };

const NotificationsPage = () => {
  const [pendingRequests, setPendingRequests] = useState<RequestNotification[]>([]);
  const [recentPets, setRecentPets] = useState<PetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);

      const { data: requestRows, error: requestError } = await supabase
        .from("adoption_requests")
        .select("id, pet_id, requester_name, created_at, status")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(8);

      if (requestError) {
        if (isMissingRequestsTableError(requestError.message)) {
          const demoPets = loadDemoPets();
          const demoPetMap = new Map(demoPets.map((pet) => [pet.id, pet.name]));
          const pending = loadDemoRequests().filter((request) => request.status === "pending").slice(0, 8);

          setPendingRequests(
            pending.map((request) => ({
              id: request.id,
              pet_id: request.pet_id,
              requester_name: request.requester_name,
              created_at: request.created_at,
              status: request.status,
              pet_name: demoPetMap.get(request.pet_id) ?? null,
            })),
          );

          setRecentPets(
            demoPets
              .slice()
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 8)
              .map((pet) => ({ id: pet.id, name: pet.name, status: pet.status, created_at: pet.created_at })),
          );

          setDemoMode(true);
          setLoading(false);
          return;
        }

        setError(requestError.message);
        setLoading(false);
        return;
      }

      const pending = (requestRows ?? []) as AdoptionRequest[];
      const petIds = Array.from(new Set(pending.map((request) => request.pet_id)));

      const petMap = new Map<string, string>();
      if (petIds.length > 0) {
        const { data: petNames, error: petNamesError } = await supabase.from("pets").select("id, name").in("id", petIds);

        if (petNamesError) {
          if (isMissingPetsTableError(petNamesError.message)) {
            const demoPetMap = new Map(loadDemoPets().map((pet) => [pet.id, pet.name]));
            setPendingRequests(
              pending.map((request) => ({
                ...request,
                pet_name: demoPetMap.get(request.pet_id) ?? null,
              })),
            );
            setDemoMode(true);
          } else {
            setError(petNamesError.message);
            setLoading(false);
            return;
          }
        } else {
          (petNames ?? []).forEach((pet) => {
            petMap.set(pet.id, pet.name);
          });

          setPendingRequests(
            pending.map((request) => ({
              ...request,
              pet_name: petMap.get(request.pet_id) ?? null,
            })),
          );
        }
      } else {
        setPendingRequests([]);
      }

      const { data: recentPetRows, error: recentPetError } = await supabase
        .from("pets")
        .select("id, name, status, created_at")
        .order("created_at", { ascending: false })
        .limit(8);

      if (recentPetError) {
        if (isMissingPetsTableError(recentPetError.message)) {
          const demoPets = loadDemoPets()
            .slice()
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 8)
            .map((pet) => ({ id: pet.id, name: pet.name, status: pet.status, created_at: pet.created_at }));

          setRecentPets(demoPets);
          setDemoMode(true);
          setLoading(false);
          return;
        }

        setError(recentPetError.message);
        setLoading(false);
        return;
      }

      setRecentPets((recentPetRows ?? []) as PetRow[]);
      setDemoMode(false);
      setLoading(false);
    };

    fetchNotifications();
  }, []);

  return (
    <AppShell title="Notifications" subtitle="Recent shelter activity and pending actions">
      {demoMode && (
        <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary mb-6">
          Demo mode enabled: notifications are using local sample data.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-6">
          Could not load notifications: {error}
        </div>
      )}

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BellRing size={18} className="text-primary" />
            <h3 className="font-semibold text-foreground">Pending Adoption Requests</h3>
          </div>

          {loading && <p className="text-sm text-muted-foreground">Loading notifications...</p>}

          {!loading && pendingRequests.length === 0 && (
            <p className="text-sm text-muted-foreground">No pending requests right now.</p>
          )}

          <ul className="space-y-3">
            {pendingRequests.map((request) => (
              <li key={request.id} className="border border-border rounded-lg px-3 py-2.5">
                <p className="text-sm text-foreground">
                  <span className="font-medium">{request.requester_name}</span> submitted a request for{" "}
                  {request.pet_name ? (
                    <Link className="text-primary hover:underline" to={`/pets/${request.pet_id}`}>
                      {request.pet_name}
                    </Link>
                  ) : (
                    "an unavailable pet record"
                  )}
                  .
                </p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(request.created_at).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <PawPrint size={18} className="text-primary" />
            <h3 className="font-semibold text-foreground">Recently Added Pets</h3>
          </div>

          {loading && <p className="text-sm text-muted-foreground">Loading latest pets...</p>}

          {!loading && recentPets.length === 0 && (
            <p className="text-sm text-muted-foreground">No pet records available yet.</p>
          )}

          <ul className="space-y-3">
            {recentPets.map((pet) => (
              <li key={pet.id} className="border border-border rounded-lg px-3 py-2.5">
                <p className="text-sm text-foreground">
                  <Link className="font-medium text-primary hover:underline" to={`/pets/${pet.id}`}>
                    {pet.name}
                  </Link>{" "}
                  was added with status <span className="capitalize">{pet.status}</span>.
                </p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(pet.created_at).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </AppShell>
  );
};

export default NotificationsPage;
