"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import {
  createInstructorAction,
  removeInstructorAction,
} from "@/actions/instructor-management-actions";

interface InstructorRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
  createdAt: Date;
  instructorProfile: { title: string | null; bio: string | null } | null;
  _count: { courses: number };
}

export function InstructorsClient({
  instructors,
  currentUserId,
}: {
  instructors: InstructorRecord[];
  currentUserId?: string;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<InstructorRecord | null>(null);
  const { showToast } = useToast();

  async function handleCreateInstructor(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createInstructorAction(formData);
    setLoading(false);
    if (result.success) {
      showToast("Instructor added successfully!", "success");
      setIsModalOpen(false);
      (e.target as HTMLFormElement).reset();
    } else {
      showToast(result.error, "error");
    }
  }

  async function handleRemove(instructor: InstructorRecord) {
    setRemovingId(instructor.id);
    const result = await removeInstructorAction(instructor.id);
    setRemovingId(null);
    setConfirmRemove(null);
    if (result.success) {
      showToast(`Instructor "${instructor.name}" removed.`, "success");
    } else {
      showToast(result.error, "error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Instructors</h1>
          <p className="text-sm text-[var(--muted)]">
            View all instructors, add new ones, or remove access.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <span>+ Add Instructor</span>
        </Button>
      </div>

      {instructors.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] p-12 text-center">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">No instructors yet</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Click &quot;+ Add Instructor&quot; to create the first instructor account.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {instructors.map((instructor) => (
            <div
              key={instructor.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--white)] p-5 shadow-xs"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/10 font-bold text-[var(--accent)] overflow-hidden">
                  {instructor.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={instructor.image}
                      alt={instructor.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    instructor.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-[var(--foreground)]">
                      {instructor.name}
                    </p>
                    {instructor.id === currentUserId && (
                      <span className="shrink-0 rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--accent)]">
                        You
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-[var(--muted)]">{instructor.email}</p>
                  {instructor.instructorProfile?.title && (
                    <p className="mt-1 text-xs font-medium text-[var(--foreground)]">
                      {instructor.instructorProfile.title}
                    </p>
                  )}
                </div>
              </div>

              {instructor.instructorProfile?.bio && (
                <p className="mt-3 line-clamp-2 text-sm text-[var(--muted)]">
                  {instructor.instructorProfile.bio}
                </p>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3">
                <span className="text-xs text-[var(--muted)]">
                  📚 {instructor._count.courses} course{instructor._count.courses === 1 ? "" : "s"}
                </span>
                {instructor.id !== currentUserId && (
                  <button
                    onClick={() => setConfirmRemove(instructor)}
                    disabled={removingId === instructor.id}
                    className="text-xs font-medium text-rose-600 hover:underline dark:text-rose-400"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add instructor modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--white)] p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div>
                <h3 className="text-xl font-semibold text-[var(--foreground)]">Add Instructor</h3>
                <p className="text-xs text-[var(--muted)]">
                  Create a new instructor account with Super Admin access.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInstructor} className="space-y-4">
              <Input label="Full Name" name="name" placeholder="Jane Doe" required />
              <Input label="Email" name="email" type="email" placeholder="jane@miqrotek.com" required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Phone (optional)" name="phone" placeholder="+233..." />
                <Input
                  label="Password"
                  name="password"
                  type="text"
                  defaultValue="password123"
                  placeholder="password123"
                />
              </div>
              <Input
                label="Title (optional)"
                name="title"
                placeholder="e.g. Senior Instructor"
              />
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                  Bio (optional)
                </label>
                <textarea
                  name="bio"
                  rows={3}
                  placeholder="Short biography..."
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm focus:border-[var(--accent)] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Add Instructor"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove confirmation */}
      {confirmRemove && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          onClick={() => setConfirmRemove(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--white)] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[var(--foreground)]">Remove instructor?</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              This will permanently delete <strong>{confirmRemove.name}</strong> ({confirmRemove.email})
              and all their courses, enrollments, and data. This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmRemove(null)}>
                Cancel
              </Button>
              <button
                onClick={() => handleRemove(confirmRemove)}
                disabled={removingId === confirmRemove.id}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
              >
                {removingId === confirmRemove.id ? "Removing..." : "Remove permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
