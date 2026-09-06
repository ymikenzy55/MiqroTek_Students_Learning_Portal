"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generatePaymentLink, verifyPayment } from "@/lib/moolre";
import { createNotification } from "@/actions/notification-actions";

/**
 * Initiate a Moolre hosted checkout for a course enrollment.
 * Creates a pending enrollment + payment record, then returns the Moolre
 * authorization URL the student should be redirected to.
 */
export async function initiateMoolrePaymentAction(courseId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false as const, error: "Authentication required to complete payment." };
  }

  const userId = session.user.id;
  const userEmail = session.user.email;

  try {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return { success: false as const, error: "Course not found." };
    }

    if (course.price === 0) {
      // Free course — enroll directly without going through Moolre.
      await prisma.enrollment.upsert({
        where: { userId_courseId: { userId, courseId } },
        update: { status: "ACTIVE" },
        create: { userId, courseId, status: "ACTIVE" },
      });

      // Notify the instructor about the new enrollment
      createNotification({
        userId: course.instructorId,
        type: "enrollment",
        title: "New Course Enrollment",
        body: `${session.user.name} just enrolled in "${course.title}".`,
        href: "/instructor/students",
      }).catch((err) => console.error("Failed to create notification:", err));

      revalidatePath(`/student/courses/${courseId}`);
      revalidatePath("/student/courses");
      revalidatePath("/student");

      return { success: true as const, free: true as const };
    }

    // Create or update enrollment as PENDING
    const enrollment = await prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: { status: "ACTIVE" },
      create: { userId, courseId, status: "ACTIVE" },
    });

    const externalRef = `MIQ-${courseId.slice(-8)}-${Date.now()}`;

    // Create a PENDING payment record
    await prisma.payment.upsert({
      where: { enrollmentId: enrollment.id },
      update: {
        amount: course.price,
        currency: course.currency,
        reference: externalRef,
        status: "PENDING",
        paystackRef: null,
      },
      create: {
        userId,
        courseId,
        enrollmentId: enrollment.id,
        amount: course.price,
        currency: course.currency,
        reference: externalRef,
        status: "PENDING",
      },
    });

    // Generate the Moolre hosted payment link
    const link = await generatePaymentLink({
      amount: course.price,
      currency: course.currency,
      email: userEmail || "student@miqrotek.com",
      externalRef,
      metadata: {
        courseId,
        userId,
        enrollmentId: enrollment.id,
      },
    });

    return {
      success: true as const,
      authorizationUrl: link.authorizationUrl,
      reference: externalRef,
    };
  } catch (error: any) {
    console.error("Error initiating Moolre payment:", error);
    return {
      success: false as const,
      error: error.message || "Could not start payment. Please try again.",
    };
  }
}

/**
 * Verify a Moolre payment by reference and mark the enrollment as paid.
 * Called by the callback webhook and the success page (as a fallback).
 */
export async function verifyAndConfirmPaymentAction(reference: string) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { reference },
      include: { enrollment: true },
    });

    if (!payment) {
      return { success: false as const, error: "Payment record not found." };
    }

    if (payment.status === "PAID") {
      // Already confirmed — idempotent
      return { success: true as const, alreadyConfirmed: true as const };
    }

    // Verify with Moolre
    const verification = await verifyPayment(reference);
    if (!verification || verification.txstatus !== 1) {
      return { success: false as const, error: "Payment not yet completed or verification failed." };
    }

    // Mark as paid
    await prisma.payment.update({
      where: { reference },
      data: {
        status: "PAID",
        paystackRef: verification.transactionid,
      },
    });

    if (payment.enrollment) {
      await prisma.enrollment.update({
        where: { id: payment.enrollment.id },
        data: { status: "ACTIVE" },
      });
    }

    // Fetch course + user for notifications
    const course = await prisma.course.findUnique({
      where: { id: payment.courseId },
      select: { title: true, instructorId: true },
    });
    const student = await prisma.user.findUnique({
      where: { id: payment.userId },
      select: { name: true },
    });

    if (course) {
      // Notify the instructor about the payment
      createNotification({
        userId: course.instructorId,
        type: "payment",
        title: "Payment Received",
        body: `${student?.name || "A student"} paid for "${course.title}".`,
        href: "/instructor/students",
      }).catch((err) => console.error("Failed to create notification:", err));
    }

    // Notify the student about the successful payment
    createNotification({
      userId: payment.userId,
      type: "payment",
      title: "Payment Successful",
      body: `Your payment for "${course?.title || "your course"}" has been confirmed.`,
      href: "/student/courses",
    }).catch((err) => console.error("Failed to create notification:", err));

    revalidatePath(`/student/courses/${payment.courseId}`);
    revalidatePath("/student/courses");
    revalidatePath("/student");
    revalidatePath("/instructor/students");
    revalidatePath("/instructor");

    return { success: true as const };
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return { success: false as const, error: error.message || "Verification failed." };
  }
}
