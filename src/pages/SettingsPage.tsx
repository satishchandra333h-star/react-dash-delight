import { useMemo, useState } from "react";
import { CheckCircle2, Database, Loader2, TriangleAlert } from "lucide-react";

import AppShell from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

const SettingsPage = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "Not configured";
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || "Not configured";
  const publishableKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    "Not configured";

  const maskedPublishableKey = useMemo(() => {
    if (publishableKey === "Not configured" || publishableKey.length < 12) {
      return publishableKey;
    }

    return `${publishableKey.slice(0, 18)}...${publishableKey.slice(-6)}`;
  }, [publishableKey]);

  const [connectionState, setConnectionState] = useState<"idle" | "checking" | "success" | "error">("idle");
  const [connectionMessage, setConnectionMessage] = useState<string>("");

  const verifyConnection = async () => {
    setConnectionState("checking");
    setConnectionMessage("");

    const { count, error } = await supabase.from("pets").select("id", { count: "exact", head: true });

    if (error) {
      setConnectionState("error");
      const missingTable = error.message.includes("Could not find the table");
      setConnectionMessage(
        missingTable
          ? `${error.message}. Run SQL from supabase/migrations/20260223130500_pawhome_pet_crud_setup.sql in Supabase SQL Editor.`
          : error.message,
      );
      return;
    }

    setConnectionState("success");
    setConnectionMessage(`Connected successfully. Pets table is reachable (count: ${count ?? 0}).`);
  };

  return (
    <AppShell title="Settings" subtitle="Project configuration and Supabase connectivity">
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Database size={18} className="text-primary" />
            <h3 className="font-semibold text-foreground">Supabase Configuration</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
              <p className="text-xs text-muted-foreground mb-1">Project URL</p>
              <p className="text-foreground break-all">{supabaseUrl}</p>
            </div>

            <div className="rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
              <p className="text-xs text-muted-foreground mb-1">Project ID</p>
              <p className="text-foreground">{projectId}</p>
            </div>

            <div className="rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
              <p className="text-xs text-muted-foreground mb-1">Publishable Key</p>
              <p className="text-foreground break-all">{maskedPublishableKey}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-2">Connection Test</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Run a read check against Supabase to confirm your app is connected.
          </p>

          <button
            type="button"
            onClick={verifyConnection}
            disabled={connectionState === "checking"}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {connectionState === "checking" ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Checking...
              </>
            ) : (
              "Verify Connection"
            )}
          </button>

          {connectionState === "success" && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-success/40 bg-success/10 px-3 py-2.5 text-sm text-success">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              {connectionMessage}
            </div>
          )}

          {connectionState === "error" && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              <TriangleAlert size={16} className="mt-0.5 shrink-0" />
              {connectionMessage}
            </div>
          )}

          {connectionState === "idle" && (
            <p className="text-xs text-muted-foreground mt-3">No connection check has been run yet.</p>
          )}
        </div>
      </section>
    </AppShell>
  );
};

export default SettingsPage;
