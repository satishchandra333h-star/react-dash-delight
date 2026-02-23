import AppShell from "@/components/AppShell";
import PetCharts from "@/components/PetCharts";
import RecentTransactions from "@/components/RecentTransactions";
import RevenueChart from "@/components/RevenueChart";
import StatsCards from "@/components/StatsCards";

const Index = () => {
  return (
    <AppShell title="Dashboard" subtitle="PawHome Shelter Management">
      <section>
        <StatsCards />
      </section>
      <section className="mt-6">
        <PetCharts />
      </section>
      <section className="mt-6">
        <RevenueChart />
      </section>
      <section className="mt-6">
        <RecentTransactions />
      </section>
    </AppShell>
  );
};

export default Index;
