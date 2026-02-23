import { Search, Bell } from "lucide-react";

const TopBar = () => {
  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Welcome back, Alex</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-secondary border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-56"
          />
        </div>
        <button className="relative p-2.5 rounded-lg bg-secondary border border-border hover:bg-muted transition-colors">
          <Bell size={16} className="text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </button>
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
          A
        </div>
      </div>
    </header>
  );
};

export default TopBar;
