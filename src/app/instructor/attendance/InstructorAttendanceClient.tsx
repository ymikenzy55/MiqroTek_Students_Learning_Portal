"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { createAttendanceSessionAction } from "@/actions/attendance-actions";

interface CourseData {
  id: string;
  title: string;
  enrollments: {
    user: { id: string; name: string; email: string };
  }[];
}

interface SessionData {
  id: string;
  date: Date;
  course: { title: string };
  records: {
    id: string;
    status: string;
    user: { name: string; email: string };
  }[];
}

export function InstructorAttendanceClient({
  courses,
  recentSessions,
}: {
  courses: CourseData[];
  recentSessions: SessionData[];
}) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || "");
  const [attendanceState, setAttendanceState] = useState<Record<string, "PRESENT" | "ABSENT" | "LATE">>({});
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const activeCourse = courses.find((c) => c.id === selectedCourseId);
  const activeStudents = activeCourse?.enrollments.map((e) => e.user) || [];

  function handleStatusChange(userId: string, status: "PRESENT" | "ABSENT" | "LATE") {
    setAttendanceState((prev) => ({ ...prev, [userId]: status }));
  }

  async function handleSaveAttendance() {
    if (!selectedCourseId || activeStudents.length === 0) return;

    setLoading(true);
    const records = activeStudents.map((s) => ({
      userId: s.id,
      status: attendanceState[s.id] || "PRESENT",
    }));

    const result = await createAttendanceSessionAction(selectedCourseId, records);
    setLoading(false);

    if (result.success) {
      showToast("Attendance session recorded successfully!", "success");
    } else {
      showToast(result.error || "Failed to record attendance", "error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Attendance & Participation</h1>
          <p className="text-sm text-[var(--muted)]">Track live class attendance and student participation records</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Attendance Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--white)] p-6 shadow-xs space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Select Course for Live Session</label>
              <select
                value={selectedCourseId}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  setAttendanceState({});
                }}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm focus:outline-none"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.enrollments.length} registered students)
                  </option>
                ))}
              </select>
            </div>

            {activeStudents.length === 0 ? (
              <p className="text-center text-sm text-[var(--muted)] py-8">
                No students currently enrolled in this course to take attendance.
              </p>
            ) : (
              <div className="space-y-3 pt-2">
                <p className="text-sm font-semibold text-[var(--foreground)]">Class Roll Call ({activeStudents.length} Students)</p>
                <div className="divide-y divide-[var(--border)] border-t border-[var(--border)]">
                  {activeStudents.map((student) => {
                    const currentStatus = attendanceState[student.id] || "PRESENT";
                    return (
                      <div key={student.id} className="flex items-center justify-between py-3">
                        <div>
                          <p className="font-semibold text-sm text-[var(--foreground)]">{student.name}</p>
                          <p className="text-xs text-[var(--muted)]">{student.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, "PRESENT")}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                              currentStatus === "PRESENT"
                                ? "bg-emerald-500 text-white shadow-xs"
                                : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]"
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, "LATE")}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                              currentStatus === "LATE"
                                ? "bg-amber-500 text-white shadow-xs"
                                : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]"
                            }`}
                          >
                            Late
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, "ABSENT")}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                              currentStatus === "ABSENT"
                                ? "bg-rose-500 text-white shadow-xs"
                                : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]"
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-[var(--border)] flex justify-end">
                  <Button onClick={handleSaveAttendance} disabled={loading}>
                    {loading ? "Saving Session..." : "Save Attendance Record"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History / Recent Sessions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Recent Session History</h2>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--white)] p-5 shadow-xs space-y-4">
            {recentSessions.length === 0 ? (
              <p className="text-center text-xs text-[var(--muted)] py-4">No recent attendance sessions saved.</p>
            ) : (
              recentSessions.map((session) => (
                <div key={session.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--foreground)]">{session.course.title}</span>
                    <span className="text-[var(--muted)]">{new Date(session.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                    <span className="text-emerald-600 font-semibold dark:text-emerald-400">
                      {session.records.filter((r) => r.status === "PRESENT").length} Present
                    </span>
                    •
                    <span>{session.records.length} Total</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
