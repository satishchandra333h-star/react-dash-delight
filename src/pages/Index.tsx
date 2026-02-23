import DashboardSidebar from "../components/DashboardSidebar";
import TopBar from "../components/TopBar";
import StatsCards from "../components/StatsCards";
import RevenueChart from "../components/RevenueChart";
import RecentTransactions from "../components/RecentTransactions";

const Index = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 ml-64 p-8">
        <TopBar />
        <StatsCards />
        <div className="mt-6">
          <RevenueChart />
        </div>
        <div className="mt-6">
          <RecentTransactions />
        </div>
      </main>
    </div>
  );
};

export default Index;
