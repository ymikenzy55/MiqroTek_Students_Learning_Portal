import { EmptyState } from "@/components/ui/States";

export default function StudentAssessments() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Assessments</h1>
      <EmptyState title="No assessments" description="Your assessments will appear here." />
    </div>
  );
}
