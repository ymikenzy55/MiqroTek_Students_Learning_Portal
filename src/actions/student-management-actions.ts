"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function enrollStudentInCourseAction(courseId: string, studentEmail: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { success: false, error: "Unauthorized. Instructor access required." };
  }

  try {
    const student = await prisma.user.findUnique({
      where: { email: studentEmail },
    });

    if (!student) {
      return { success: false, error: `Student with email ${studentEmail} not found.` };
    }

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: student.id,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return { success: false, error: "Student is already enrolled in this course." };
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: student.id,
        courseId,
        status: "ACTIVE",
      },
    });

    // Create payment record
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (course) {
      await prisma.payment.create({
        data: {
          userId: student.id,
          courseId,
          enrollmentId: enrollment.id,
          amount: course.price,
          currency: course.currency,
          reference: `PAY-MANUAL-${Date.now()}`,
          status: "PAID",
        },
      });
    }

    revalidatePath("/instructor/students");
    revalidatePath("/student/courses");

    return { success: true };
  } catch (error: any) {
    console.error("Error enrolling student:", error);
    return { success: false, error: error.message || "Failed to enroll student." };
  }
}

export async function createAndEnrollStudentAction(formData: FormData) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { success: false, error: "Unauthorized. Instructor access required." };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string || undefined;
  const password = formData.get("password") as string || "password123";
  const courseId = formData.get("courseId") as string;

  if (!name || !email || !courseId) {
    return { success: false, error: "Name, email, and course selection are required." };
  }

  try {
    let student = await prisma.user.findUnique({ where: { email } });

    if (!student) {
      const passwordHash = await bcrypt.hash(password, 10);
      student = await prisma.user.create({
        data: {
          name,
          email,
          phone,
          passwordHash,
          role: "STUDENT",
          studentProfile: { create: {} },
        },
      });
    }

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: student.id,
          courseId,
        },
      },
    });

    if (!existingEnrollment) {
      const enrollment = await prisma.enrollment.create({
        data: {
          userId: student.id,
          courseId,
          status: "ACTIVE",
        },
      });

      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (course) {
        await prisma.payment.create({
          data: {
            userId: student.id,
            courseId,
            enrollmentId: enrollment.id,
            amount: course.price,
            currency: course.currency,
            reference: `PAY-REG-${Date.now()}`,
            status: "PAID",
          },
        });
      }
    }

    revalidatePath("/instructor/students");
    revalidatePath("/student/courses");

    return { success: true };
  } catch (error: any) {
    console.error("Error creating student:", error);
    return { success: false, error: error.message || "Failed to register student." };
  }
}

/**
 * Suspend a student — sets status to SUSPENDED so they can't log in.
 * Only instructors (SUPER_ADMIN) can do this, and only for students
 * enrolled in their courses (or any student if they're the super admin
 * who owns all courses).
 */
export async function suspendStudentAction(studentId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { success: false as const, error: "Unauthorized. Instructor access required." };
  }

  try {
    const student = await prisma.user.findUnique({ where: { id: studentId } });
    if (!student) {
      return { success: false as const, error: "Student not found." };
    }
    if (student.role !== "STUDENT") {
      return { success: false as const, error: "Cannot suspend non-student accounts." };
    }

    await prisma.user.update({
      where: { id: studentId },
      data: { status: "SUSPENDED" },
    });

    revalidatePath("/instructor/students");
    revalidatePath("/instructor");

    return { success: true as const };
  } catch (error) {
    console.error("Error suspending student:", error);
    return { success: false as const, error: "Failed to suspend student." };
  }
}

/** Reactivate a suspended student. */
export async function unsuspendStudentAction(studentId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { success: false as const, error: "Unauthorized. Instructor access required." };
  }

  try {
    const student = await prisma.user.findUnique({ where: { id: studentId } });
    if (!student) {
      return { success: false as const, error: "Student not found." };
    }

    await prisma.user.update({
      where: { id: studentId },
      data: { status: "ACTIVE" },
    });

    revalidatePath("/instructor/students");
    revalidatePath("/instructor");

    return { success: true as const };
  } catch (error) {
    console.error("Error unsuspending student:", error);
    return { success: false as const, error: "Failed to reactivate student." };
  }
}

/**
 * Permanently delete a student and all their data (cascade).
 */
export async function deleteStudentAction(studentId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { success: false as const, error: "Unauthorized. Instructor access required." };
  }

  try {
    const student = await prisma.user.findUnique({ where: { id: studentId } });
    if (!student) {
      return { success: false as const, error: "Student not found." };
    }
    if (student.role !== "STUDENT") {
      return { success: false as const, error: "Cannot delete non-student accounts." };
    }

    await prisma.user.delete({ where: { id: studentId } });

    revalidatePath("/instructor/students");
    revalidatePath("/instructor");

    return { success: true as const };
  } catch (error) {
    console.error("Error deleting student:", error);
    return { success: false as const, error: "Failed to delete student." };
  }
}
