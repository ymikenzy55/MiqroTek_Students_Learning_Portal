import { EmptyState } from "@/components/ui/States";

export default function AdminInstructors() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Instructors</h1>
      <EmptyState title="No instructors" description="All instructor records will appear here." />
    </div>
  );
}
