import type { ReactNode } from "react";

import DashboardSidebar from "@/components/DashboardSidebar";
import TopBar from "@/components/TopBar";

interface AppShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

const AppShell = ({ title, subtitle, children }: AppShellProps) => {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 lg:ml-64 p-4 md:p-8">
        <TopBar title={title} subtitle={subtitle} />
        {children}
      </main>
    </div>
  );
};

export default AppShell;
