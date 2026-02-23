const transactions = [
  { id: "#TXN-2841", customer: "Sarah Connor", amount: "$1,250.00", status: "Completed", date: "Feb 23, 2026" },
  { id: "#TXN-2840", customer: "James Wilson", amount: "$890.50", status: "Pending", date: "Feb 23, 2026" },
  { id: "#TXN-2839", customer: "Emily Chen", amount: "$2,100.00", status: "Completed", date: "Feb 22, 2026" },
  { id: "#TXN-2838", customer: "Marcus Brown", amount: "$455.75", status: "Failed", date: "Feb 22, 2026" },
  { id: "#TXN-2837", customer: "Lisa Park", amount: "$3,200.00", status: "Completed", date: "Feb 21, 2026" },
  { id: "#TXN-2836", customer: "David Kim", amount: "$678.90", status: "Pending", date: "Feb 21, 2026" },
];

const statusStyles = {
  Completed: "bg-success/15 text-success",
  Pending: "bg-warning/15 text-warning",
  Failed: "bg-destructive/15 text-destructive",
};

const RecentTransactions = () => {
  return (
    <div className="bg-card border border-border rounded-xl p-6 animate-fade-in" style={{ animationDelay: "400ms" }}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-foreground">Recent Transactions</h3>
        <button className="text-xs text-primary hover:underline">View all</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground text-xs border-b border-border">
              <th className="text-left pb-3 font-medium">ID</th>
              <th className="text-left pb-3 font-medium">Customer</th>
              <th className="text-left pb-3 font-medium">Amount</th>
              <th className="text-left pb-3 font-medium">Status</th>
              <th className="text-left pb-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/50 transition-colors">
                <td className="py-3 text-muted-foreground font-mono text-xs">{tx.id}</td>
                <td className="py-3 text-foreground">{tx.customer}</td>
                <td className="py-3 text-foreground font-medium">{tx.amount}</td>
                <td className="py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[tx.status]}`}>
                    {tx.status}
                  </span>
                </td>
                <td className="py-3 text-muted-foreground">{tx.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTransactions;
