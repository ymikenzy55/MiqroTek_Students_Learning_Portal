import { EmptyState } from "@/components/ui/States";

export default function AdminStudents() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Students</h1>
      <EmptyState title="No students" description="All student records will appear here." />
    </div>
  );
}
