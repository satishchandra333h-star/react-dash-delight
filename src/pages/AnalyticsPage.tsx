import { useEffect, useState } from "react";
import { Activity, CheckCircle2, Clock3, XCircle } from "lucide-react";

import AppShell from "@/components/AppShell";
import PetCharts from "@/components/PetCharts";
import StatsCards from "@/components/StatsCards";
import { isMissingRequestsTableError, loadDemoRequests } from "@/lib/demoPetData";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type RequestStatus = Pick<Tables<"adoption_requests">, "status">;

interface RequestSummary {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

const initialSummary: RequestSummary = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
};

const AnalyticsPage = () => {
  const [summary, setSummary] = useState<RequestSummary>(initialSummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);

      const { data, error: requestsError } = await supabase.from("adoption_requests").select("status");

      if (requestsError) {
        if (isMissingRequestsTableError(requestsError.message)) {
          const requests = loadDemoRequests();
          const nextSummary: RequestSummary = {
            total: requests.length,
            pending: requests.filter((item) => item.status === "pending").length,
            approved: requests.filter((item) => item.status === "approved").length,
            rejected: requests.filter((item) => item.status === "rejected").length,
          };

          setSummary(nextSummary);
          setDemoMode(true);
          setLoading(false);
          return;
        }

        setError(requestsError.message);
        setLoading(false);
        return;
      }

      const requests = (data ?? []) as RequestStatus[];
      const nextSummary: RequestSummary = {
        total: requests.length,
        pending: requests.filter((item) => item.status === "pending").length,
        approved: requests.filter((item) => item.status === "approved").length,
        rejected: requests.filter((item) => item.status === "rejected").length,
      };

      setSummary(nextSummary);
      setDemoMode(false);
      setLoading(false);
    };

    fetchSummary();
  }, []);

  return (
    <AppShell title="Analytics" subtitle="Shelter performance and adoption trends">
      {demoMode && (
        <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary mb-6">
          Demo mode enabled: analytics is using local sample adoption data.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-6">
          Could not load adoption analytics: {error}
        </div>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Total Requests</p>
          <p className="text-2xl font-bold text-foreground mt-1">{loading ? "..." : summary.total}</p>
          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
            <Activity size={14} className="text-primary" />
            All-time submissions
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Pending Review</p>
          <p className="text-2xl font-bold text-foreground mt-1">{loading ? "..." : summary.pending}</p>
          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
            <Clock3 size={14} className="text-warning" />
            Action required
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Approved</p>
          <p className="text-2xl font-bold text-foreground mt-1">{loading ? "..." : summary.approved}</p>
          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
            <CheckCircle2 size={14} className="text-success" />
            Successful matches
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Rejected</p>
          <p className="text-2xl font-bold text-foreground mt-1">{loading ? "..." : summary.rejected}</p>
          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
            <XCircle size={14} className="text-destructive" />
            Closed requests
          </div>
        </div>
      </section>

      <section className="mt-6">
        <StatsCards />
      </section>

      <section className="mt-6">
        <PetCharts />
      </section>
    </AppShell>
  );
};

export default AnalyticsPage;
