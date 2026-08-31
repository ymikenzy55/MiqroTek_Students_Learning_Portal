import { EmptyState } from "@/components/ui/States";

export default function StudentAttendance() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Attendance</h1>
      <EmptyState title="No attendance records" description="Your attendance history will appear here." />
    </div>
  );
}
