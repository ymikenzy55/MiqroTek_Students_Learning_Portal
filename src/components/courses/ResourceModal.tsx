"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { createResourceAction, deleteResourceAction } from "@/actions/resource-actions";

interface ResourceData {
  id: string;
  title: string;
  type: string;
  url: string;
  createdAt: string;
}

interface ResourceModalProps {
  courseId: string;
  courseTitle: string;
  resources: ResourceData[];
  weeklyTopics: { id: string; weekNumber: number; title: string }[];
  onClose: () => void;
}

export function ResourceModal({ courseId, courseTitle, resources, weeklyTopics, onClose }: ResourceModalProps) {
  const { showToast } = useToast();
  const [resourceList, setResourceList] = useState<ResourceData[]>(resources);
  const [title, setTitle] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!title.trim()) {
      showToast("Please enter a title for the resource.", "error");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];

    if (!allowedTypes.includes(file.type)) {
      showToast("Please upload a PDF or PPT file.", "error");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      showToast("File must be less than 20 MB.", "error");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "resources");
      const res = await fetch("/api/upload/file", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Upload failed.", "error");
        return;
      }
      const data = await res.json();

      // Determine type label
      const typeLabel = file.type === "application/pdf" ? "PDF" : "PPT";

      // Create resource record
      const formData = new FormData();
      formData.set("title", title.trim());
      formData.set("url", data.url);
      formData.set("type", typeLabel);
      if (selectedTopicId) formData.set("weeklyTopicId", selectedTopicId);

      const result = await createResourceAction(courseId, formData);
      if (result.success && result.data) {
        setResourceList([
          ...resourceList,
          {
            id: result.data.id,
            title: result.data.title,
            type: result.data.type,
            url: result.data.url,
            createdAt: new Date().toISOString(),
          },
        ]);
        setTitle("");
        setSelectedTopicId("");
        showToast("Resource uploaded successfully!", "success");
      } else {
        showToast(result.error || "Failed to save resource.", "error");
      }
    } catch {
      showToast("Upload failed.", "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDelete(resourceId: string) {
    setDeleting(resourceId);
    try {
      const result = await deleteResourceAction(resourceId);
      if (result.success) {
        setResourceList(resourceList.filter((r) => r.id !== resourceId));
        showToast("Resource deleted.", "success");
      } else {
        showToast(result.error || "Failed to delete.", "error");
      }
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--white)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div>
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              Manage Resources
            </h3>
            <p className="text-xs text-[var(--muted)]">
              {courseTitle} — upload PDFs and PPTs for students to download.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
          >
            ✕
          </button>
        </div>

        {/* Upload form */}
        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Resource title (e.g. Week 1 Lecture Slides)"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
          />

          {weeklyTopics.length > 0 && (
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
            >
              <option value="">No specific week (general resource)</option>
              {weeklyTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  Week {t.weekNumber}: {t.title}
                </option>
              ))}
            </select>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            onChange={handleUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading || !title.trim()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--border)] p-6 text-sm text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
                Uploading...
              </>
            ) : (
              <>
                <span className="text-2xl">📎</span>
                Click to upload PDF or PPT (max 20 MB)
              </>
            )}
          </button>
        </div>

        {/* Existing resources */}
        <div className="mt-6 space-y-2">
          <h4 className="text-sm font-semibold text-[var(--foreground)]">
            Uploaded Resources ({resourceList.length})
          </h4>
          {resourceList.length === 0 ? (
            <p className="rounded-xl bg-[var(--surface)] p-4 text-center text-xs text-[var(--muted)]">
              No resources uploaded yet.
            </p>
          ) : (
            <div className="space-y-2">
              {resourceList.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {r.type === "PDF" ? "📄" : "📊"}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">{r.title}</p>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[var(--accent)] hover:underline"
                      >
                        View {r.type} →
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(r.id)}
                    disabled={deleting === r.id}
                    className="rounded-lg bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-500/20 disabled:opacity-50"
                  >
                    {deleting === r.id ? "..." : "Delete"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end border-t border-[var(--border)] pt-4">
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
