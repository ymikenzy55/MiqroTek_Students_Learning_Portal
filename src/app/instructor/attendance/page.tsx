import { EmptyState } from "@/components/ui/States";

export default function InstructorAttendance() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Attendance</h1>
      <EmptyState title="No attendance sessions" description="Record attendance for your courses here." />
    </div>
  );
}
