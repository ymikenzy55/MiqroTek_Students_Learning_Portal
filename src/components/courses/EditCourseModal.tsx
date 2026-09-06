"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { updateCourseAction } from "@/actions/course-actions";
import { ImageUploader } from "@/components/courses/ImageUploader";
import { cn } from "@/lib/utils";

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
    pricingType?: string;
    trialDays?: number;
    registrationDeadline?: Date | string | null;
    allowPartialPayment?: boolean;
    minimumPayment?: number | null;
  };
}

const PRESET_IMAGES = [
  { label: "Web Dev", url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80" },
  { label: "Data/AI", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" },
  { label: "UI/UX", url: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80" },
  { label: "Mobile", url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80" },
  { label: "Security", url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80" },
];

function formatDateForInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

export function EditCourseModal({ isOpen, onClose, course }: EditCourseModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(
    course.image || PRESET_IMAGES[0].url
  );
  const [pricingType, setPricingType] = useState<"PAID" | "FREE_TRIAL">(
    (course.pricingType as "PAID" | "FREE_TRIAL") || "PAID"
  );
  const [allowPartialPayment, setAllowPartialPayment] = useState(
    course.allowPartialPayment || false
  );

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("image", selectedImage);
    formData.set("pricingType", pricingType);
    if (allowPartialPayment) formData.set("allowPartialPayment", "on");

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
            <p className="text-xs text-[var(--muted)]">Update title, pricing, cover image, and highlights.</p>
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

          <Input label="Duration" name="duration" defaultValue={course.duration || "8 Weeks"} required />

          {/* Pricing model selector */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Pricing Model</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPricingType("PAID")}
                className={cn(
                  "rounded-xl border-2 p-4 text-left transition-all",
                  pricingType === "PAID"
                    ? "border-[var(--accent)] bg-[var(--accent)]/5"
                    : "border-[var(--border)] hover:border-[var(--accent)]/50"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border-2",
                    pricingType === "PAID" ? "border-[var(--accent)] bg-[var(--accent)]" : "border-[var(--border)]"
                  )}>
                    {pricingType === "PAID" && <span className="text-[10px] text-white">✓</span>}
                  </div>
                  <span className="text-sm font-semibold text-[var(--foreground)]">Paid Course</span>
                </div>
                <p className="mt-1.5 text-xs text-[var(--muted)]">Students pay the full price to enroll.</p>
              </button>

              <button
                type="button"
                onClick={() => setPricingType("FREE_TRIAL")}
                className={cn(
                  "rounded-xl border-2 p-4 text-left transition-all",
                  pricingType === "FREE_TRIAL"
                    ? "border-[var(--accent)] bg-[var(--accent)]/5"
                    : "border-[var(--border)] hover:border-[var(--accent)]/50"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border-2",
                    pricingType === "FREE_TRIAL" ? "border-[var(--accent)] bg-[var(--accent)]" : "border-[var(--border)]"
                  )}>
                    {pricingType === "FREE_TRIAL" && <span className="text-[10px] text-white">✓</span>}
                  </div>
                  <span className="text-sm font-semibold text-[var(--foreground)]">Free for 1 Month</span>
                </div>
                <p className="mt-1.5 text-xs text-[var(--muted)]">Free access for a limited time, then pay.</p>
              </button>
            </div>
          </div>

          <Input
            label={pricingType === "FREE_TRIAL" ? "Regular Price (after trial)" : "Price (GHS)"}
            name="price"
            type="number"
            step="0.01"
            defaultValue={course.price}
            required
          />

          {pricingType === "FREE_TRIAL" && (
            <Input
              label="Trial Duration (days)"
              name="trialDays"
              type="number"
              defaultValue={course.trialDays || 30}
              required
            />
          )}

          <Input
            label="Registration Deadline (optional)"
            name="registrationDeadline"
            type="date"
            defaultValue={formatDateForInput(course.registrationDeadline)}
          />
          <p className="-mt-3 text-xs text-[var(--muted)]">
            Students cannot register after this date. Leave empty for no deadline.
          </p>

          {/* Partial payment */}
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] p-4">
            <input
              type="checkbox"
              name="allowPartialPayment"
              checked={allowPartialPayment}
              onChange={(e) => setAllowPartialPayment(e.target.checked)}
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--accent)]"
            />
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">Allow partial payment</p>
              <p className="text-xs text-[var(--muted)]">Let students pay a minimum amount to get access.</p>
            </div>
          </label>

          {allowPartialPayment && (
            <Input
              label="Minimum Payment (GHS)"
              name="minimumPayment"
              type="number"
              step="0.01"
              defaultValue={course.minimumPayment || ""}
              required
            />
          )}

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
