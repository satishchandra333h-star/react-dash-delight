import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const statusStyles = {
  pending: "bg-warning/15 text-warning",
  approved: "bg-success/15 text-success",
  rejected: "bg-destructive/15 text-destructive",
};

const RecentTransactions = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      const { data } = await supabase
        .from("adoption_requests")
        .select("*, pets(name)")
        .order("created_at", { ascending: false })
        .limit(6);
      if (data) setRequests(data);
    };
    fetchRequests();
  }, []);

  return (
    <div className="bg-card border border-border rounded-xl p-6 animate-fade-in" style={{ animationDelay: "480ms" }}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-foreground">Recent Adoption Requests</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground text-xs border-b border-border">
              <th className="text-left pb-3 font-medium">Pet</th>
              <th className="text-left pb-3 font-medium">Requester</th>
              <th className="text-left pb-3 font-medium hidden sm:table-cell">Email</th>
              <th className="text-left pb-3 font-medium">Status</th>
              <th className="text-left pb-3 font-medium hidden md:table-cell">Date</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/50 transition-colors">
                <td className="py-3 text-foreground font-medium">{req.pets?.name || "Unknown"}</td>
                <td className="py-3 text-foreground">{req.requester_name}</td>
                <td className="py-3 text-muted-foreground hidden sm:table-cell">{req.requester_email}</td>
                <td className="py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[req.status] || ""}`}>
                    {req.status}
                  </span>
                </td>
                <td className="py-3 text-muted-foreground hidden md:table-cell">
                  {new Date(req.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No adoption requests yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTransactions;
