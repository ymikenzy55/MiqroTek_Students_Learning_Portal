import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyAndConfirmPaymentAction } from "@/actions/payment-actions";

export const dynamic = "force-dynamic";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  if (!ref) {
    redirect("/student/courses");
  }

  // Verify the payment server-side (the redirect is a notification, not proof)
  const result = await verifyAndConfirmPaymentAction(ref);

  // Load the payment to show course details
  const payment = await prisma.payment.findUnique({
    where: { reference: ref },
  });

  // Fetch course separately since Payment has courseId but no relation include
  const course = payment
    ? await prisma.course.findUnique({
        where: { id: payment.courseId },
        select: { id: true, title: true, instructor: { select: { name: true } } },
      })
    : null;

  const isPaid = result.success && payment?.status === "PAID";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--white)] p-8 text-center shadow-lg">
        {isPaid ? (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
              <svg
                className="h-8 w-8 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Payment Successful!</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Your payment has been confirmed and you are now enrolled.
            </p>

            {course && (
              <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Course
                </p>
                <p className="mt-1 font-semibold text-[var(--foreground)]">
                  {course.title}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  Instructor: {course.instructor.name}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3">
                  <span className="text-xs text-[var(--muted)]">Amount Paid</span>
                  <span className="font-bold text-[var(--accent)]">
                    {payment.currency} {payment.amount.toFixed(2)}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-[var(--muted)]">Reference</span>
                  <span className="text-xs font-mono text-[var(--foreground)]">{ref}</span>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-2">
              {course && (
                <Link
                  href={`/student/courses/${course.id}`}
                  className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-dark)]"
                >
                  Go to Course →
                </Link>
              )}
              <Link
                href="/student/courses"
                className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface)]"
              >
                Browse All Courses
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
              <svg
                className="h-8 w-8 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              Payment Verification Pending
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              We received your payment but are still confirming it with Moolre.
              If you completed the payment, your enrollment will be activated
              shortly. You can check back in a few minutes.
            </p>
            <p className="mt-3 text-xs text-[var(--muted)]">Reference: {ref}</p>

            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/student/courses"
                className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface)]"
              >
                Back to Courses
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
