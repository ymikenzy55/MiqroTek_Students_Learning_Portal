"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import {
  createBundleAction,
  deleteBundleAction,
  updateBundleThresholdAction,
} from "@/actions/bundle-actions";

interface BundleData {
  id: string;
  name: string;
  description: string | null;
  requiredAttendanceCount: number;
  status: string;
  createdAt: Date;
}

interface StudentData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: Date;
  courses: { id: string; title: string }[];
  attendanceCount: number;
}

export function BundlesClient({
  bundles,
  students,
}: {
  bundles: BundleData[];
  students: StudentData[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<BundleData | null>(null);
  const [thresholdEditing, setThresholdEditing] = useState<string | null>(null);
  const [thresholdValue, setThresholdValue] = useState("0");
  const [, startUpdate] = useTransition();
  const { showToast } = useToast();

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createBundleAction(formData);
    setLoading(false);
    if (result.success) {
      showToast("Bundle created successfully!", "success");
      setIsModalOpen(false);
      (e.target as HTMLFormElement).reset();
    } else {
      showToast(result.error, "error");
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete bundle "${name}"? This cannot be undone.`)) return;
    const result = await deleteBundleAction(id);
    if (result.success) {
      showToast(`Bundle "${name}" deleted.`, "success");
      setSelectedBundle(null);
    } else {
      showToast(result.error, "error");
    }
  }

  async function handleSaveThreshold(bundleId: string) {
    const threshold = parseInt(thresholdValue, 10);
    if (isNaN(threshold) || threshold < 0) {
      showToast("Please enter a valid number.", "error");
      return;
    }
    startUpdate(async () => {
      const result = await updateBundleThresholdAction(bundleId, threshold);
      setThresholdEditing(null);
      if (result.success) {
        showToast("Attendance threshold updated.", "success");
      } else {
        showToast(result.error, "error");
      }
    });
  }

  const requiredThreshold = selectedBundle?.requiredAttendanceCount ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Bundles</h1>
          <p className="text-sm text-[var(--muted)]">
            Create bundles, set attendance eligibility thresholds, and track student eligibility.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <span>+ Create Bundle</span>
        </Button>
      </div>

      {/* Bundles list */}
      {bundles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] p-12 text-center">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">No bundles yet</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Create a bundle and set an attendance threshold for eligibility.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bundles.map((bundle) => (
            <div
              key={bundle.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--white)] p-5 shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-[var(--foreground)]">{bundle.name}</h3>
                  {bundle.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">
                      {bundle.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(bundle.id, bundle.name)}
                  className="shrink-0 text-xs font-medium text-rose-600 hover:underline dark:text-rose-400"
                >
                  Delete
                </button>
              </div>

              {/* Threshold editor */}
              <div className="mt-4 border-t border-[var(--border)] pt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Required Attendance
                </p>
                {thresholdEditing === bundle.id ? (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={thresholdValue}
                      onChange={(e) => setThresholdValue(e.target.value)}
                      className="h-8 w-20 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-sm focus:border-[var(--accent)] focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveThreshold(bundle.id)}
                      className="rounded-lg bg-[var(--accent)] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[var(--accent-dark)]"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setThresholdEditing(null)}
                      className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setThresholdEditing(bundle.id);
                      setThresholdValue(String(bundle.requiredAttendanceCount));
                    }}
                    className="mt-1 flex items-center gap-2 text-left"
                  >
                    <span className="text-2xl font-bold text-[var(--accent)]">
                      {bundle.requiredAttendanceCount}
                    </span>
                    <span className="text-xs text-[var(--muted)]">
                      sessions required
                      <br />
                      <span className="text-[var(--accent)] hover:underline">Click to edit</span>
                    </span>
                  </button>
                )}
              </div>

              {/* View students button */}
              <button
                onClick={() => setSelectedBundle(bundle)}
                className="mt-4 w-full rounded-lg bg-[var(--accent)]/10 px-3 py-2 text-xs font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/20"
              >
                View Student Eligibility →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Student eligibility view for a selected bundle */}
      {selectedBundle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          onClick={() => setSelectedBundle(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--white)] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  {selectedBundle.name} — Student Eligibility
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  {requiredThreshold} attendance session{requiredThreshold === 1 ? "" : "s"} required to be eligible
                </p>
              </div>
              <button
                onClick={() => setSelectedBundle(null)}
                className="rounded-lg p-1 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
              >
                ✕
              </button>
            </div>

            {/* Student table */}
            <div className="max-h-[60vh] overflow-y-auto">
              {students.length === 0 ? (
                <p className="p-8 text-center text-sm text-[var(--muted)]">
                  No students enrolled in your courses yet.
                </p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 border-b border-[var(--border)] bg-[var(--surface)] text-xs uppercase font-semibold text-[var(--muted)]">
                    <tr>
                      <th className="px-5 py-3">Student</th>
                      <th className="px-5 py-3">Courses</th>
                      <th className="px-5 py-3 text-center">Sessions Attended</th>
                      <th className="px-5 py-3 text-center">Eligibility</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {students.map((student) => {
                      const isEligible =
                        student.attendanceCount >= requiredThreshold &&
                        requiredThreshold > 0;
                      return (
                        <tr key={student.id} className="hover:bg-[var(--surface)]/50">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/10 text-xs font-bold text-[var(--accent)]">
                                {student.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-medium text-[var(--foreground)]">
                                  {student.name}
                                </p>
                                <p className="truncate text-xs text-[var(--muted)]">
                                  {student.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex flex-wrap gap-1">
                              {student.courses.slice(0, 2).map((c) => (
                                <span
                                  key={c.id}
                                  className="inline-flex items-center rounded-full bg-[var(--surface)] px-2 py-0.5 text-[10px] font-medium text-[var(--foreground)] border border-[var(--border)]"
                                >
                                  {c.title}
                                </span>
                              ))}
                              {student.courses.length > 2 && (
                                <span className="text-[10px] text-[var(--muted)]">
                                  +{student.courses.length - 2}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className="text-lg font-bold text-[var(--foreground)]">
                              {student.attendanceCount}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-center">
                            {requiredThreshold === 0 ? (
                              <span className="inline-flex rounded-full bg-[var(--surface)] px-2.5 py-1 text-xs font-semibold text-[var(--muted)] border border-[var(--border)]">
                                No threshold set
                              </span>
                            ) : isEligible ? (
                              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                ✓ Eligible
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                                ✕ Not Eligible
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Summary footer */}
            {students.length > 0 && requiredThreshold > 0 && (
              <div className="border-t border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-xs text-[var(--muted)]">
                {students.filter((s) => s.attendanceCount >= requiredThreshold).length} of{" "}
                {students.length} students are eligible
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create bundle modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--white)] p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-[var(--border)] pb-4">
              <h3 className="text-xl font-semibold text-[var(--foreground)]">Create Bundle</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <Input label="Bundle Name" name="name" placeholder="e.g. Final Exam Materials" required />

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                  Description (optional)
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="What's included in this bundle..."
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm focus:border-[var(--accent)] focus:outline-none"
                />
              </div>

              <Input
                label="Required Attendance Sessions"
                name="requiredAttendanceCount"
                type="number"
                min={0}
                defaultValue="0"
                placeholder="e.g. 10"
              />
              <p className="text-xs text-[var(--muted)]">
                Students must have attended at least this many sessions (Present or Late)
                across your courses to be eligible for this bundle.
              </p>

              <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Bundle"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
