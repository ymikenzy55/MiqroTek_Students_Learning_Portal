import { EmptyState } from "@/components/ui/States";

export default function InstructorStudents() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Students</h1>
      <EmptyState title="No students yet" description="Students enrolled in your courses will appear here." />
    </div>
  );
}
