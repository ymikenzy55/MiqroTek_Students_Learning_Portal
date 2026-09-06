"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { updateCourseAction } from "@/actions/course-actions";
import { ImageUploader } from "@/components/courses/ImageUploader";

interface EditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    id: string;
    title: string;
    description: string | null;
    price: number;
    currency: string;
    duration: string | null;
    image: string | null;
    highlights: string[];
  };
}

const PRESET_IMAGES = [
  { label: "Web Dev", url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80" },
  { label: "Data/AI", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" },
  { label: "UI/UX", url: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80" },
  { label: "Mobile", url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80" },
  { label: "Security", url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80" },
];

export function EditCourseModal({ isOpen, onClose, course }: EditCourseModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(
    course.image || PRESET_IMAGES[0].url
  );

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("image", selectedImage);

    const result = await updateCourseAction(course.id, formData);
    setLoading(false);

    if (result.success) {
      showToast("Course updated successfully!", "success");
      onClose();
    } else {
      showToast(result.error || "Failed to update course", "error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--white)] p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div>
            <h3 className="text-xl font-semibold text-[var(--foreground)]">Edit Course</h3>
            <p className="text-xs text-[var(--muted)]">Update title, description, price, cover image, and highlights.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Course Title" name="title" defaultValue={course.title} required />

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Course Description</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={course.description || ""}
              placeholder="Detailed description..."
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Duration" name="duration" defaultValue={course.duration || "8 Weeks"} required />
            <Input
              label="Price (GHS)"
              name="price"
              type="number"
              step="0.01"
              defaultValue={course.price}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Cover Image</label>
            <ImageUploader value={selectedImage} onChange={setSelectedImage} presets={PRESET_IMAGES} />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
              What&apos;s Included (One per line)
            </label>
            <textarea
              name="highlights"
              rows={4}
              defaultValue={course.highlights.join("\n")}
              placeholder={`Hands-on projects\nCertificate of completion\nLifetime access`}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
