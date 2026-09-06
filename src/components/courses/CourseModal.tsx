"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { createCourseAction } from "@/actions/course-actions";
import { ImageUploader } from "@/components/courses/ImageUploader";
import { cn } from "@/lib/utils";

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

const STEPS = [
  { num: 1, label: "Basics" },
  { num: 2, label: "Pricing" },
  { num: 3, label: "Cover" },
  { num: 4, label: "Highlights" },
  { num: 5, label: "Topics" },
];

export function CourseModal({ isOpen, onClose }: CourseModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("8 Weeks");
  const [price, setPrice] = useState("450");
  const [selectedImage, setSelectedImage] = useState(PRESET_IMAGES[0].url);
  const [highlights, setHighlights] = useState(
    "Hands-on real-world projects\nCertificate of completion\nLifetime access to materials\nCommunity Discord support"
  );
  const [topics, setTopics] = useState("");
  const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);

  // Pricing model state
  const [pricingType, setPricingType] = useState<"PAID" | "FREE_TRIAL">("PAID");
  const [trialDays, setTrialDays] = useState("30");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [allowPartialPayment, setAllowPartialPayment] = useState(false);
  const [minimumPayment, setMinimumPayment] = useState("");

  if (!isOpen) return null;

  function reset() {
    setStep(1);
    setTitle("");
    setDescription("");
    setDuration("8 Weeks");
    setPrice("450");
    setSelectedImage(PRESET_IMAGES[0].url);
    setHighlights("Hands-on real-world projects\nCertificate of completion\nLifetime access to materials\nCommunity Discord support");
    setTopics("");
    setCreatedCourseId(null);
    setPricingType("PAID");
    setTrialDays("30");
    setRegistrationDeadline("");
    setAllowPartialPayment(false);
    setMinimumPayment("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  function canProceed(): boolean {
    if (step === 1) return title.trim().length > 0;
    if (step === 2) {
      if (pricingType === "FREE_TRIAL") return parseFloat(price) > 0;
      return true;
    }
    return true;
  }

  async function handleSubmit() {
    setLoading(true);

    const formData = new FormData();
    formData.set("title", title);
    formData.set("description", description);
    formData.set("duration", duration);
    formData.set("price", price);
    formData.set("image", selectedImage);
    formData.set("highlights", highlights);
    formData.set("topics", topics);
    formData.set("pricingType", pricingType);
    formData.set("trialDays", trialDays);
    formData.set("registrationDeadline", registrationDeadline);
    if (allowPartialPayment) formData.set("allowPartialPayment", "on");
    formData.set("minimumPayment", minimumPayment);

    const result = await createCourseAction(formData);
    setLoading(false);

    if (result.success) {
      setCreatedCourseId(result.data?.id || null);
      setStep(6); // Completion step
    } else {
      showToast(result.error || "Failed to create course", "error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--white)] p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-4">
          <div>
            <h3 className="text-xl font-semibold text-[var(--foreground)]">
              {step <= 5 ? "Create New Course" : "Course Created!"}
            </h3>
            <p className="text-xs text-[var(--muted)]">
              {step <= 5 ? `Step ${step} of 5 — ${STEPS[step - 1].label}` : "Your course is now live"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
          >
            ✕
          </button>
        </div>

        {/* Step indicator */}
        {step <= 5 && (
          <div className="mb-6 flex items-center gap-1">
            {STEPS.map((s, idx) => (
              <div key={s.num} className="flex flex-1 items-center gap-1">
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all",
                    step > s.num
                      ? "bg-emerald-500 text-white"
                      : step === s.num
                        ? "bg-[var(--accent)] text-white"
                        : "bg-[var(--surface)] text-[var(--muted)]"
                  )}
                >
                  {step > s.num ? "✓" : s.num}
                </div>
                <span
                  className={cn(
                    "hidden text-xs font-medium sm:block",
                    step >= s.num ? "text-[var(--foreground)]" : "text-[var(--muted)]"
                  )}
                >
                  {s.label}
                </span>
                {idx < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "ml-1 h-0.5 flex-1 rounded-full transition-colors",
                      step > s.num ? "bg-emerald-500" : "bg-[var(--border)]"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Basics */}
        {step === 1 && (
          <div className="space-y-4">
            <Input
              label="Course Title"
              name="title"
              placeholder="e.g. Modern React & Next.js Masterclass"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Course Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Detailed description of what students will learn..."
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
            <Input
              label="Duration"
              name="duration"
              placeholder="e.g. 10 Weeks"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
          </div>
        )}

        {/* Step 2: Pricing */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Pricing type selector */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Pricing Model
              </label>
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
                  <p className="mt-1.5 text-xs text-[var(--muted)]">Students get free access for a limited time, then pay.</p>
                </button>
              </div>
            </div>

            {/* Price input */}
            <Input
              label={pricingType === "FREE_TRIAL" ? "Regular Price (after trial)" : "Price (GHS)"}
              name="price"
              type="number"
              step="0.01"
              placeholder="450"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            {pricingType === "FREE_TRIAL" && (
              <p className="text-xs text-[var(--muted)]">
                Students will see the price with a strikethrough and a &quot;Free for X days&quot; badge.
                After the trial, they&apos;ll need to pay this amount to continue.
              </p>
            )}

            {/* Trial days (only for FREE_TRIAL) */}
            {pricingType === "FREE_TRIAL" && (
              <Input
                label="Trial Duration (days)"
                name="trialDays"
                type="number"
                placeholder="30"
                value={trialDays}
                onChange={(e) => setTrialDays(e.target.value)}
                required
              />
            )}

            {/* Registration deadline */}
            <Input
              label="Registration Deadline (optional)"
              name="registrationDeadline"
              type="date"
              value={registrationDeadline}
              onChange={(e) => setRegistrationDeadline(e.target.value)}
            />
            <p className="-mt-3 text-xs text-[var(--muted)]">
              Students cannot register after this date. Leave empty for no deadline.
            </p>

            {/* Partial payment */}
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] p-4">
              <input
                type="checkbox"
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
                placeholder="225"
                value={minimumPayment}
                onChange={(e) => setMinimumPayment(e.target.value)}
                required
              />
            )}
          </div>
        )}

        {/* Step 3: Cover image */}
        {step === 3 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Cover Image
            </label>
            <ImageUploader value={selectedImage} onChange={setSelectedImage} presets={PRESET_IMAGES} />
            <p className="text-xs text-[var(--muted)]">
              Choose a preset, paste a URL, or upload your own image.
            </p>
          </div>
        )}

        {/* Step 4: Highlights */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                What&apos;s Included (One per line)
              </label>
              <textarea
                value={highlights}
                onChange={(e) => setHighlights(e.target.value)}
                rows={6}
                placeholder={`Hands-on projects\nCertificate of completion\nLifetime access\nCommunity support`}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm focus:border-[var(--accent)] focus:outline-none"
              />
              <p className="mt-1 text-xs text-[var(--muted)]">
                These bullets appear on the course detail page as &quot;what&apos;s included&quot;.
              </p>
            </div>
          </div>
        )}

        {/* Step 5: Topics (optional) */}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-[var(--foreground)]">
                  Weekly Topics
                </label>
                <span className="text-xs text-[var(--muted)]">Optional</span>
              </div>
              <textarea
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
                rows={6}
                placeholder={`Week 1: HTML5 & Semantic Web\nWeek 2: CSS Flexbox & Grid\nWeek 3: JavaScript ES6+\nWeek 4: React 19 Fundamentals`}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm font-mono focus:border-[var(--accent)] focus:outline-none"
              />
              <p className="mt-1 text-xs text-[var(--muted)]">
                List one topic per line. You can skip this step and add topics later from the course card.
              </p>
            </div>
          </div>
        )}

        {/* Step 6: Completion */}
        {step === 6 && (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
              ✓
            </div>
            <h3 className="text-lg font-semibold text-[var(--foreground)]">Course Published!</h3>
            <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
              {pricingType === "FREE_TRIAL"
                ? `Your course is live with a ${trialDays}-day free trial. Students can enroll for free and will need to pay GHS ${price} after the trial.`
                : "Your course is now live and visible to students. You can add or manage weekly topics anytime from the course card."}
            </p>
            <Button onClick={handleClose} className="mt-6">
              Done
            </Button>
          </div>
        )}

        {/* Navigation buttons */}
        {step <= 5 && (
          <div className="mt-6 flex justify-between border-t border-[var(--border)] pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={step === 1 ? handleClose : () => setStep(step - 1)}
              disabled={loading}
            >
              {step === 1 ? "Cancel" : "← Back"}
            </Button>
            {step < 5 ? (
              <Button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed() || loading}
              >
                Next →
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Publishing..." : "Publish Course"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
