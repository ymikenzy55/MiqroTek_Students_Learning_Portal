import { EmptyState } from "@/components/ui/States";

export default function InstructorAssessments() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Assessments</h1>
      <EmptyState title="No assessments yet" description="Create assessments for your courses." />
    </div>
  );
}
