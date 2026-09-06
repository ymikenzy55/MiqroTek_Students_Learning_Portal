"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { createInstructorAction } from "@/actions/instructor-actions";

interface InstructorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstructorModal({ isOpen, onClose }: InstructorModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createInstructorAction(formData);

    setLoading(false);

    if (result.success) {
      showToast("Instructor created successfully!", "success");
      onClose();
    } else {
      showToast(result.error || "Failed to create instructor", "error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--white)] p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-4">
          <h3 className="text-xl font-semibold text-[var(--foreground)]">Add New Instructor</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" name="name" placeholder="e.g. John Doe" required />
          <Input label="Email Address" name="email" type="email" placeholder="instructor@example.com" required />
          <Input label="Password" name="password" type="password" placeholder="••••••••" required />
          <Input label="Phone Number" name="phone" placeholder="+233 24 123 4567" />
          <Input label="Title / Role" name="title" placeholder="e.g. Senior Frontend Instructor" defaultValue="Instructor" />
          
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Biography / Expertise</label>
            <textarea
              name="bio"
              rows={3}
              placeholder="Short bio and technical expertise..."
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-[var(--surface)] p-3 border border-[var(--border)]">
            <input
              type="checkbox"
              id="isSuperAdmin"
              name="isSuperAdmin"
              value="true"
              defaultChecked
              className="h-4 w-4 rounded accent-[var(--accent)]"
            />
            <label htmlFor="isSuperAdmin" className="text-sm font-medium text-[var(--foreground)]">
              Grant Super Admin Access (Can add/delete instructors and manage platform)
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-[var(--border)] pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Instructor"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
