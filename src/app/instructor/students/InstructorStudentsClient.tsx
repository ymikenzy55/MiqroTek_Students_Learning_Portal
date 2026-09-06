"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { useSearchAndPaginate } from "@/lib/useSearchAndPaginate";
import { SearchBar, Pagination } from "@/components/ui/SearchAndPagination";
import {
  createAndEnrollStudentAction,
  suspendStudentAction,
  unsuspendStudentAction,
  deleteStudentAction,
} from "@/actions/student-management-actions";

interface StudentRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
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
  isSuperAdmin = false,
}: {
  students: StudentRecord[];
  courses: CourseOption[];
  isSuperAdmin?: boolean;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<StudentRecord | null>(null);
  const { showToast } = useToast();

  const { query, setQuery, page, setPage, totalPages, totalItems, paginated, pageSize } =
    useSearchAndPaginate(students, {
      searchKeys: ["name", "email", "phone"],
      pageSize: 10,
    });

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

  async function handleSuspend(student: StudentRecord) {
    setActionLoading(student.id);
    const result = await suspendStudentAction(student.id);
    setActionLoading(null);
    if (result.success) {
      showToast(`${student.name} has been suspended.`, "success");
    } else {
      showToast(result.error, "error");
    }
  }

  async function handleUnsuspend(student: StudentRecord) {
    setActionLoading(student.id);
    const result = await unsuspendStudentAction(student.id);
    setActionLoading(null);
    if (result.success) {
      showToast(`${student.name} has been reactivated.`, "success");
    } else {
      showToast(result.error, "error");
    }
  }

  async function handleDelete(student: StudentRecord) {
    setActionLoading(student.id);
    const result = await deleteStudentAction(student.id);
    setActionLoading(null);
    setConfirmDelete(null);
    if (result.success) {
      showToast(`${student.name} has been permanently deleted.`, "success");
    } else {
      showToast(result.error, "error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Registered Students</h1>
          <p className="text-sm text-[var(--muted)]">
            {isSuperAdmin
              ? "All students in the system (Super Admin view)"
              : "Students registered under your courses, attendance, and performance tracking"}
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <span>+ Enroll New Student</span>
        </Button>
      </div>

      {/* Search bar */}
      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search students by name, email, or phone..."
      />

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
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[var(--muted)]">
                    {query ? "No students match your search." : "No students registered yet. Click \"+ Enroll New Student\" to add students."}
                  </td>
                </tr>
              ) : (
                paginated.map((student) => {
                  const isSuspended = student.status === "SUSPENDED";
                  return (
                    <tr
                      key={student.id}
                      className={cn(
                        "transition-colors hover:bg-[var(--surface)]/50",
                        isSuspended && "opacity-60"
                      )}
                    >
                      <td className="px-6 py-4">
                        <Link href={`/instructor/students/${student.id}`} className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/10 font-bold text-[var(--accent)]">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--foreground)] hover:text-[var(--accent)]">
                              {student.name}
                            </p>
                            <p className="text-xs text-[var(--muted)]">{student.email}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-[var(--muted)]">
                        {student.phone || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {student.enrollments.length === 0 ? (
                            <span className="text-xs text-[var(--muted)]">No courses</span>
                          ) : (
                            student.enrollments.map((e) => (
                              <span
                                key={e.course.id}
                                className="inline-flex items-center rounded-full bg-[var(--surface)] px-2.5 py-1 text-xs font-medium text-[var(--foreground)] border border-[var(--border)]"
                              >
                                📖 {e.course.title}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-[var(--foreground)]">
                        {student.submissionsCount}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          {student.attendanceCount} Present
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isSuspended ? (
                          <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/instructor/students/${student.id}`}
                            className="inline-flex items-center rounded-lg bg-[var(--accent)]/10 px-2.5 py-1.5 text-xs font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/20"
                          >
                            Details
                          </Link>
                          {isSuspended ? (
                            <button
                              onClick={() => handleUnsuspend(student)}
                              disabled={actionLoading === student.id}
                              className="inline-flex items-center rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
                            >
                              {actionLoading === student.id ? "..." : "Reactivate"}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSuspend(student)}
                              disabled={actionLoading === student.id}
                              className="inline-flex items-center rounded-lg bg-amber-500/10 px-2.5 py-1.5 text-xs font-semibold text-amber-600 transition-colors hover:bg-amber-500/20 disabled:opacity-50"
                            >
                              {actionLoading === student.id ? "..." : "Suspend"}
                            </button>
                          )}
                          <button
                            onClick={() => setConfirmDelete(student)}
                            disabled={actionLoading === student.id}
                            className="inline-flex items-center rounded-lg bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-500/20 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={totalItems}
        pageSize={pageSize}
      />

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

      {/* Delete confirmation */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--white)] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[var(--foreground)]">Delete student?</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              This will permanently delete <strong>{confirmDelete.name}</strong> ({confirmDelete.email})
              and all their enrollments, submissions, attendance, and data. This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>
                Cancel
              </Button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={actionLoading === confirmDelete.id}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
              >
                {actionLoading === confirmDelete.id ? "Deleting..." : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
