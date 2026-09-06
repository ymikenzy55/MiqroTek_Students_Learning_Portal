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
