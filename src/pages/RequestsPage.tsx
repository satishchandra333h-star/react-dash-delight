import { useCallback, useEffect, useMemo, useState } from "react";
import { Filter, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
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
import type { Enums, Tables } from "@/integrations/supabase/types";

type AdoptionRequest = Tables<"adoption_requests">;
type AdoptionStatus = Enums<"adoption_status">;
type PetNameOnly = Pick<Tables<"pets">, "id" | "name">;
type StatusFilter = "all" | AdoptionStatus;

type RequestWithPet = AdoptionRequest & {
  pet_name: string | null;
};

const statusStyles: Record<AdoptionStatus, string> = {
  pending: "bg-warning/15 text-warning",
  approved: "bg-success/15 text-success",
  rejected: "bg-destructive/15 text-destructive",
};

const filterOptions: StatusFilter[] = ["all", "pending", "approved", "rejected"];
const statusOptions: AdoptionStatus[] = ["pending", "approved", "rejected"];

const RequestsPage = () => {
  const [requests, setRequests] = useState<RequestWithPet[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const mapRequestsWithPets = useCallback((rows: AdoptionRequest[], pets: Array<Pick<Tables<"pets">, "id" | "name">>) => {
    const petMap = new Map<string, string>();
    pets.forEach((pet) => {
      petMap.set(pet.id, pet.name);
    });

    return rows.map((request) => ({
      ...request,
      pet_name: petMap.get(request.pet_id) ?? null,
    }));
  }, []);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: requestRows, error: requestError } = await supabase
      .from("adoption_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (requestError) {
      if (isMissingRequestsTableError(requestError.message)) {
        const demoRows = loadDemoRequests();
        const demoPets = loadDemoPets();

        setRequests(mapRequestsWithPets(demoRows, demoPets));
        setDemoMode(true);
        setLoading(false);
        return;
      }

      setError(requestError.message);
      setLoading(false);
      return;
    }

    const rows = requestRows ?? [];
    const petIds = Array.from(new Set(rows.map((request) => request.pet_id)));

    if (petIds.length === 0) {
      setRequests(rows.map((request) => ({ ...request, pet_name: null })));
      setDemoMode(false);
      setLoading(false);
      return;
    }

    const { data: petRows, error: petError } = await supabase.from("pets").select("id, name").in("id", petIds);

    if (petError) {
      if (isMissingPetsTableError(petError.message)) {
        const demoPets = loadDemoPets();
        setRequests(mapRequestsWithPets(rows, demoPets));
        setDemoMode(false);
        setLoading(false);
        return;
      }

      setError(petError.message);
      setLoading(false);
      return;
    }

    setRequests(mapRequestsWithPets(rows, (petRows ?? []) as PetNameOnly[]));
    setDemoMode(false);
    setLoading(false);
  }, [mapRequestsWithPets]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const filteredRequests = useMemo(() => {
    if (filter === "all") {
      return requests;
    }

    return requests.filter((request) => request.status === filter);
  }, [filter, requests]);

  const handleStatusChange = async (requestId: string, nextStatus: AdoptionStatus) => {
    if (demoMode) {
      const demoRows = loadDemoRequests();
      const nextRows = demoRows.map((request) =>
        request.id === requestId ? { ...request, status: nextStatus, updated_at: new Date().toISOString() } : request,
      );

      saveDemoRequests(nextRows);
      setRequests((prev) =>
        prev.map((request) => (request.id === requestId ? { ...request, status: nextStatus } : request)),
      );
      toast.success("Request status updated in demo mode.");
      return;
    }

    setUpdatingId(requestId);

    const { error: updateError } = await supabase
      .from("adoption_requests")
      .update({ status: nextStatus })
      .eq("id", requestId);

    if (updateError) {
      toast.error(updateError.message || "Failed to update request status.");
      setUpdatingId(null);
      return;
    }

    setRequests((prev) =>
      prev.map((request) => (request.id === requestId ? { ...request, status: nextStatus } : request)),
    );
    toast.success("Request status updated.");
    setUpdatingId(null);
  };

  const handleDeleteRequest = async (requestId: string) => {
    const confirmed = window.confirm("Delete this adoption request?");
    if (!confirmed) {
      return;
    }

    if (demoMode) {
      const nextRows = loadDemoRequests().filter((request) => request.id !== requestId);
      saveDemoRequests(nextRows);
      setRequests((prev) => prev.filter((request) => request.id !== requestId));
      toast.success("Request deleted in demo mode.");
      return;
    }

    setDeletingId(requestId);

    const { error: deleteError } = await supabase.from("adoption_requests").delete().eq("id", requestId);

    if (deleteError) {
      toast.error(deleteError.message || "Failed to delete request.");
      setDeletingId(null);
      return;
    }

    setRequests((prev) => prev.filter((request) => request.id !== requestId));
    toast.success("Request deleted.");
    setDeletingId(null);
  };

  return (
    <AppShell title="Requests" subtitle="Review adoption requests from potential pet parents">
      {demoMode && (
        <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary mb-6">
          Demo mode enabled: using local sample adoption requests.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-6">
          Could not load requests: {error}
        </div>
      )}

      <section className="bg-card border border-border rounded-xl p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <h3 className="text-base font-semibold text-foreground">Adoption Requests</h3>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter size={15} className="text-muted-foreground shrink-0" />
            {filterOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                  filter === option
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs border-b border-border">
                <th className="text-left pb-3 font-medium">Pet</th>
                <th className="text-left pb-3 font-medium">Requester</th>
                <th className="text-left pb-3 font-medium hidden md:table-cell">Email</th>
                <th className="text-left pb-3 font-medium hidden lg:table-cell">Phone</th>
                <th className="text-left pb-3 font-medium">Status</th>
                <th className="text-left pb-3 font-medium hidden md:table-cell">Created</th>
                <th className="text-left pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                filteredRequests.map((request) => (
                  <tr key={request.id} className="border-b border-border/60 last:border-0 hover:bg-secondary/40 transition-colors">
                    <td className="py-3 text-foreground font-medium">
                      {request.pet_name ? (
                        <Link className="hover:text-primary transition-colors" to={`/pets/${request.pet_id}`}>
                          {request.pet_name}
                        </Link>
                      ) : (
                        "Unknown pet"
                      )}
                    </td>
                    <td className="py-3 text-foreground">{request.requester_name}</td>
                    <td className="py-3 text-muted-foreground hidden md:table-cell">{request.requester_email}</td>
                    <td className="py-3 text-muted-foreground hidden lg:table-cell">{request.requester_phone || "-"}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[request.status]}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="py-3 text-muted-foreground hidden md:table-cell">
                      {new Date(request.created_at).toLocaleString()}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={request.status}
                          onChange={(event) => handleStatusChange(request.id, event.target.value as AdoptionStatus)}
                          disabled={updatingId === request.id}
                          className="bg-secondary border border-border rounded-md px-2 py-1 text-xs capitalize"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => handleDeleteRequest(request.id)}
                          disabled={deletingId === request.id}
                          className="inline-flex items-center gap-1 rounded-md bg-destructive/90 px-2 py-1 text-xs font-medium text-destructive-foreground hover:opacity-90 disabled:opacity-50"
                        >
                          <Trash2 size={12} />
                          {deletingId === request.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading && filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No requests found for this filter.
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    Loading requests...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
};

export default RequestsPage;
