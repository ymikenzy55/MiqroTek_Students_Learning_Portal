import { prisma } from "@/lib/prisma";

/**
 * Checks if a course's free trial has expired and updates enrollments
 * from ACTIVE (trial) to PAYMENT_REQUIRED.
 *
 * Called when:
 * - A student views a course detail page
 * - A student views their dashboard
 * - An instructor views their students
 *
 * Returns the number of enrollments that were expired.
 */
export async function expireTrialsForCourse(courseId: string): Promise<number> {
  const now = new Date();

  const result = await prisma.enrollment.updateMany({
    where: {
      courseId,
      isTrial: true,
      status: "ACTIVE",
      trialEndsAt: { lt: now },
    },
    data: {
      status: "PAYMENT_REQUIRED",
      isTrial: false,
    },
  });

  return result.count;
}

/**
 * Expires all trials that have passed their end date across all courses.
 * Can be called from a cron job or on page load.
 */
export async function expireAllTrials(): Promise<number> {
  const now = new Date();

  const result = await prisma.enrollment.updateMany({
    where: {
      isTrial: true,
      status: "ACTIVE",
      trialEndsAt: { lt: now },
    },
    data: {
      status: "PAYMENT_REQUIRED",
      isTrial: false,
    },
  });

  return result.count;
}

/**
 * Checks if a specific enrollment's trial is still active.
 * If expired, updates the enrollment status.
 */
export async function checkTrialStatus(enrollmentId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: { id: true, isTrial: true, trialEndsAt: true, status: true },
  });

  if (!enrollment || !enrollment.isTrial || !enrollment.trialEndsAt) {
    return { isTrialActive: false, expired: false };
  }

  const now = new Date();
  if (enrollment.trialEndsAt > now && enrollment.status === "ACTIVE") {
    return { isTrialActive: true, expired: false, trialEndsAt: enrollment.trialEndsAt };
  }

  // Trial has expired — update status
  if (enrollment.status === "ACTIVE") {
    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status: "PAYMENT_REQUIRED", isTrial: false },
    });
  }

  return { isTrialActive: false, expired: true, trialEndsAt: enrollment.trialEndsAt };
}

/**
 * Formats a trial end date as a human-readable countdown.
 */
export function formatTrialCountdown(trialEndsAt: Date): string {
  const now = new Date();
  const diff = trialEndsAt.getTime() - now.getTime();

  if (diff <= 0) return "Trial expired";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} left`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} left`;
  return "Less than an hour left";
}
