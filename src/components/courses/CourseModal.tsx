"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { createCourseAction } from "@/actions/course-actions";
import { ImageUploader } from "@/components/courses/ImageUploader";

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_IMAGES = [
  { label: "Web Dev", url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80" },
  { label: "Data/AI", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" },
  { label: "UI/UX", url: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80" },
  { label: "Mobile", url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80" },
  { label: "Security", url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80" },
];

export function CourseModal({ isOpen, onClose }: CourseModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(PRESET_IMAGES[0].url);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("image", selectedImage);

    const result = await createCourseAction(formData);
    setLoading(false);

    if (result.success) {
      showToast("Course created successfully!", "success");
      onClose();
    } else {
      showToast(result.error || "Failed to create course", "error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--white)] p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-4">
          <div>
            <h3 className="text-xl font-semibold text-[var(--foreground)]">Create New Course</h3>
            <p className="text-xs text-[var(--muted)]">Add title, duration, price, cover image, highlights, and topics</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Course Title" name="title" placeholder="e.g. Modern React & Next.js Masterclass" required />

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Course Description</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Detailed description of what students will learn..."
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Duration" name="duration" placeholder="e.g. 10 Weeks" defaultValue="8 Weeks" required />
            <Input label="Price (GHS)" name="price" type="number" step="0.01" placeholder="450" defaultValue="450" required />
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
              placeholder={`Hands-on projects\nCertificate of completion\nLifetime access\nCommunity support`}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm focus:border-[var(--accent)] focus:outline-none"
              defaultValue={`Hands-on real-world projects\nCertificate of completion\nLifetime access to materials\nCommunity Discord support`}
            />
            <p className="mt-1 text-xs text-[var(--muted)]">
              These bullets appear on the course detail page as &quot;what&apos;s included&quot;.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Weekly Topics (One per line)</label>
            <textarea
              name="topics"
              rows={4}
              placeholder={`Week 1: HTML5 & Semantic Web\nWeek 2: CSS Flexbox & Grid\nWeek 3: JavaScript ES6+\nWeek 4: React 19 Fundamentals`}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm font-mono focus:border-[var(--accent)] focus:outline-none"
              defaultValue={`Week 1: HTML5 & Modern Semantic Web\nWeek 2: CSS3 Grid & Responsive Layouts\nWeek 3: JavaScript ES6+ Async Programming\nWeek 4: React 19 & State Management`}
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-[var(--border)] pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Publishing..." : "Publish Course"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
