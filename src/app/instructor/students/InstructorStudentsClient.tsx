"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { createAndEnrollStudentAction } from "@/actions/student-management-actions";

interface StudentRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: Date;
  enrollments: {
    course: { id: string; title: string; duration: string | null };
  }[];
  submissionsCount: number;
  attendanceCount: number;
}

interface CourseOption {
  id: string;
  title: string;
}

export function InstructorStudentsClient({
  students,
  courses,
}: {
  students: StudentRecord[];
  courses: CourseOption[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  async function handleRegisterStudent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createAndEnrollStudentAction(formData);
    setLoading(false);

    if (result.success) {
      showToast("Student registered and enrolled successfully!", "success");
      setIsModalOpen(false);
    } else {
      showToast(result.error || "Failed to register student", "error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Registered Students</h1>
          <p className="text-sm text-[var(--muted)]">Students registered under your courses, attendance, and performance tracking</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <span>+ Enroll New Student</span>
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--white)] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--surface)] text-xs uppercase font-semibold text-[var(--muted)]">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Enrolled Course(s)</th>
                <th className="px-6 py-4 text-center">Submissions</th>
                <th className="px-6 py-4 text-center">Attendance</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--muted)]">
                    No students registered under your courses yet. Click &quot;+ Enroll New Student&quot; to add students.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-[var(--surface)]/50 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <Link href={`/instructor/students/${student.id}`} className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/10 font-bold text-[var(--accent)]">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--foreground)] hover:text-[var(--accent)]">{student.name}</p>
                          <p className="text-xs text-[var(--muted)]">{student.email}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-[var(--muted)]">
                      {student.phone || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {student.enrollments.map((e) => (
                          <span
                            key={e.course.id}
                            className="inline-flex items-center rounded-full bg-[var(--surface)] px-2.5 py-1 text-xs font-medium text-[var(--foreground)] border border-[var(--border)]"
                          >
                            📖 {e.course.title}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-[var(--foreground)]">
                      {student.submissionsCount}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {student.attendanceCount} Sessions Present
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/instructor/students/${student.id}`}
                        className="inline-flex items-center rounded-lg bg-[var(--accent)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/20"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal to Register/Enroll Student */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--white)] p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-4">
              <h3 className="text-xl font-semibold text-[var(--foreground)]">Enroll Student</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterStudent} className="space-y-4">
              <Input label="Student Full Name" name="name" placeholder="e.g. Kwame Mensah" required />
              <Input label="Student Email" name="email" type="email" placeholder="student@example.com" required />
              <Input label="Phone Number" name="phone" placeholder="+233 24 123 4567" />
              <Input label="Default Password" name="password" type="password" defaultValue="password123" required />

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Select Course</label>
                <select
                  name="courseId"
                  required
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm focus:border-[var(--accent)] focus:outline-none"
                >
                  <option value="">Select a course to enroll in...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-[var(--border)] pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Registering..." : "Enroll Student"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
