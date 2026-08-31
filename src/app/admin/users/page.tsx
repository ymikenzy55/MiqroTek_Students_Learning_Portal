import { EmptyState } from "@/components/ui/States";

export default function AdminUsers() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Users</h1>
      <EmptyState title="No users" description="All platform users will appear here." />
    </div>
  );
}
