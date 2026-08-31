import { EmptyState } from "@/components/ui/States";

export default function AdminPayments() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Payments</h1>
      <EmptyState title="No payments" description="All payment transactions will appear here." />
    </div>
  );
}
