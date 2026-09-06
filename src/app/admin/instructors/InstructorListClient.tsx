"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { InstructorModal } from "@/components/instructors/InstructorModal";
import { useToast } from "@/components/ui/Toast";
import { deleteInstructorAction, toggleSuperAdminAction } from "@/actions/instructor-actions";

interface InstructorData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: Date;
  instructorProfile: {
    title: string | null;
    bio: string | null;
  } | null;
  _count: {
    courses: number;
  };
}

interface InstructorListClientProps {
  instructors: InstructorData[];
  currentUserId: string;
}

export function InstructorListClient({ instructors, currentUserId }: InstructorListClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { showToast } = useToast();

  async function handleDelete(instructorId: string, name: string) {
    if (!confirm(`Are you sure you want to delete instructor "${name}"? This action cannot be undone.`)) {
      return;
    }

    setLoadingId(instructorId);
    const result = await deleteInstructorAction(instructorId);
    setLoadingId(null);

    if (result.success) {
      showToast(`Instructor ${name} deleted.`, "success");
    } else {
      showToast(result.error || "Failed to delete instructor", "error");
    }
  }

  async function handleToggleSuperAdmin(instructorId: string, currentRole: string) {
    const makeSuperAdmin = currentRole !== "SUPER_ADMIN";
    setLoadingId(instructorId);
    const result = await toggleSuperAdminAction(instructorId, makeSuperAdmin);
    setLoadingId(null);

    if (result.success) {
      showToast(`Updated role for instructor.`, "success");
    } else {
      showToast(result.error || "Failed to update role", "error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Instructor Management</h1>
          <p className="text-sm text-[var(--muted)]">Manage instructors, grant super admin privileges, and assign courses.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <span>+ Add Instructor</span>
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--white)] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--surface)] text-xs uppercase font-semibold text-[var(--muted)]">
              <tr>
                <th className="px-6 py-4">Instructor</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Role / Permissions</th>
                <th className="px-6 py-4 text-center">Courses</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {instructors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--muted)]">
                    No instructors found. Click &quot;Add Instructor&quot; above to create one.
                  </td>
                </tr>
              ) : (
                instructors.map((inst) => (
                  <tr key={inst.id} className="hover:bg-[var(--surface)]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white font-bold">
                          {inst.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--foreground)]">{inst.name}</p>
                          <p className="text-xs text-[var(--muted)]">{inst.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--muted)]">
                      {inst.phone || "N/A"}
                    </td>
                    <td className="px-6 py-4 font-medium text-[var(--foreground)]">
                      {inst.instructorProfile?.title || "Instructor"}
                    </td>
                    <td className="px-6 py-4">
                      {inst.role === "SUPER_ADMIN" ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          👑 Super Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                          Instructor
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-[var(--foreground)]">
                      {inst._count.courses}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {inst.id !== currentUserId && (
                          <>
                            <button
                              onClick={() => handleToggleSuperAdmin(inst.id, inst.role)}
                              disabled={loadingId === inst.id}
                              className="rounded-lg px-2.5 py-1.5 text-xs font-medium border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]"
                            >
                              {inst.role === "SUPER_ADMIN" ? "Make Instructor" : "Make Super Admin"}
                            </button>
                            <button
                              onClick={() => handleDelete(inst.id, inst.name)}
                              disabled={loadingId === inst.id}
                              className="rounded-lg px-2.5 py-1.5 text-xs font-medium border border-rose-500/20 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
                            >
                              Delete
                            </button>
                          </>
                        )}
                        {inst.id === currentUserId && (
                          <span className="text-xs text-[var(--muted)] italic">You (Super Admin)</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InstructorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
