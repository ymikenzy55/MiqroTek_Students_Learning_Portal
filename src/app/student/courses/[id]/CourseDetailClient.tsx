"use client";

import { useState } from "react";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { PaymentModal } from "@/components/payments/PaymentModal";
import { Button } from "@/components/ui/Button";

interface CourseDetailClientProps {
  course: {
    id: string;
    title: string;
    description: string | null;
    price: number;
    currency: string;
    duration: string | null;
    image: string | null;
    highlights: string[];
    instructor: { name: string };
    weeklyTopics: {
      id: string;
      weekNumber: number;
      title: string;
      description: string | null;
      covered: boolean;
    }[];
  };
  enrollment: {
    id: string;
    status: string;
    payment: {
      id: string;
      status: string;
      amount: number;
      reference: string;
    } | null;
  } | null;
}

export function CourseDetailClient({ course, enrollment }: CourseDetailClientProps) {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const isPaid = enrollment?.payment?.status === "PAID" || course.price === 0;
  const isEnrolled = !!enrollment;

  const totalTopics = course.weeklyTopics.length;
  // Instructor-driven progress: count topics the instructor has marked covered.
  const coveredTopics = course.weeklyTopics.filter((t) => t.covered).length;
  const progressPercent =
    isPaid && totalTopics > 0
      ? Math.min(100, Math.round((coveredTopics / totalTopics) * 100))
      : 0;

  const defaultImg = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="space-y-8">
      {/* Course Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--white)] shadow-sm">
        <div className="relative h-64 w-full overflow-hidden sm:h-80">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={course.image || defaultImg}
            alt={course.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-xs">
                ⏱️ {course.duration || "8 Weeks"}
              </span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-xs">
                📚 {totalTopics} Topics
              </span>
            </div>
            <h1 className="text-2xl font-bold sm:text-4xl text-white leading-tight">{course.title}</h1>
            <p className="mt-1 text-sm text-white/80">Instructor: {course.instructor.name}</p>
          </div>
        </div>

        <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-[var(--border)]">
          <div>
            <p className="text-xs text-[var(--muted)]">Course Price</p>
            <p className="text-2xl font-extrabold text-[var(--accent)]">
              {course.price > 0 ? `${course.currency} ${course.price.toFixed(2)}` : "FREE"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isPaid ? (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span>✅ Paid & Active Enrollment</span>
              </div>
            ) : (
              <Button onClick={() => setIsPaymentOpen(true)} className="px-6 py-3 text-base">
                💳 Pay & Enroll Now ({course.currency} {course.price.toFixed(2)})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Overview Grid: Circular Progress + Payment Details */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Clean Circular Progress Show */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--white)] p-6 shadow-xs flex flex-col items-center justify-center text-center">
          <h3 className="text-base font-semibold text-[var(--foreground)] mb-4">Course Learning Progress</h3>
          <CircularProgress
            percentage={progressPercent}
            size={150}
            strokeWidth={12}
            label={isPaid ? (progressPercent === 100 ? "Complete" : "In Progress") : "Not Started"}
            sublabel={`${isPaid ? coveredTopics : 0} of ${totalTopics} Topics`}
          />
          <p className="mt-4 text-xs text-[var(--muted)]">
            {isPaid
              ? "Progress is updated by your instructor as topics are covered in class."
              : "Pay to unlock full weekly topics and assignments."}
          </p>
        </div>

        {/* Duration & Payment Tab Info */}
        <div className="md:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--white)] p-6 shadow-xs space-y-4">
          <h3 className="text-base font-semibold text-[var(--foreground)]">Course Details & Billing Tab</h3>
          {course.description && (
            <p className="text-sm leading-relaxed text-[var(--muted)]">{course.description}</p>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="rounded-xl bg-[var(--surface)] p-3 border border-[var(--border)]">
              <p className="text-xs text-[var(--muted)]">Total Course Duration</p>
              <p className="text-lg font-bold text-[var(--foreground)] mt-0.5">{course.duration || "8 Weeks"}</p>
            </div>
            <div className="rounded-xl bg-[var(--surface)] p-3 border border-[var(--border)]">
              <p className="text-xs text-[var(--muted)]">Payment Status</p>
              <p className={`text-lg font-bold mt-0.5 ${isPaid ? "text-emerald-600" : "text-amber-600"}`}>
                {isPaid ? "PAID" : "UNPAID"}
              </p>
            </div>
          </div>

          {enrollment?.payment && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-xs text-[var(--muted)] flex items-center justify-between">
              <span>Receipt Ref: <strong className="text-[var(--foreground)]">{enrollment.payment.reference}</strong></span>
              <span>Amount: <strong className="text-[var(--accent)]">{course.currency} {enrollment.payment.amount}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* What's included */}
      {course.highlights.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[var(--foreground)]">What&apos;s Included</h2>
          <div className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--white)] p-6 shadow-xs sm:grid-cols-2">
            {course.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-600">
                  ✓
                </span>
                <span className="text-sm text-[var(--foreground)]">{h}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Topics List set by Instructor */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--foreground)]">Course Topics & Syllabus</h2>
        <div className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--white)] overflow-hidden shadow-xs">
          {course.weeklyTopics.length === 0 ? (
            <div className="p-8 text-center text-sm text-[var(--muted)]">No weekly topics set for this course yet.</div>
          ) : (
            course.weeklyTopics.map((topic) => (
              <div key={topic.id} className="p-5 flex items-start gap-4 hover:bg-[var(--surface)]/50 transition-colors">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 font-bold text-[var(--accent)] text-sm">
                  W{topic.weekNumber}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[var(--foreground)] text-base">
                    Week {topic.weekNumber}: {topic.title}
                  </h3>
                  {topic.description && <p className="mt-1 text-sm text-[var(--muted)]">{topic.description}</p>}
                </div>
                <div className="text-right">
                  {topic.covered ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      ✓ Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-[var(--surface)] px-2.5 py-1 text-xs font-semibold text-[var(--muted)] border border-[var(--border)]">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        courseId={course.id}
        courseTitle={course.title}
        price={course.price}
        currency={course.currency}
      />
    </div>
  );
}
