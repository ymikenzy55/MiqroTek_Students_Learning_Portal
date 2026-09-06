"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function createAssessmentAction(formData: FormData) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { success: false, error: "Unauthorized. Instructor access required." };
  }

  const courseId = formData.get("courseId") as string;
  const title = formData.get("title") as string;
  const instructions = formData.get("instructions") as string || undefined;
  const totalMarks = parseFloat(formData.get("totalMarks") as string) || 100;
  const type = formData.get("type") as string || "ASSIGNMENT";

  if (!courseId || !title) {
    return { success: false, error: "Course selection and assignment title are required." };
  }

  try {
    const assessment = await prisma.assessment.create({
      data: {
        courseId,
        title,
        instructions,
        totalMarks,
        type,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
      },
    });

    revalidatePath("/instructor/assessments");
    revalidatePath("/student/assessments");

    return { success: true, data: assessment };
  } catch (error: any) {
    console.error("Error creating assessment:", error);
    return { success: false, error: error.message || "Failed to create assessment." };
  }
}

export async function gradeSubmissionAction(submissionId: string, score: number, feedback: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { success: false, error: "Unauthorized. Instructor access required." };
  }

  try {
    const submission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        score,
        feedback,
        status: "REVIEWED",
        reviewedAt: new Date(),
      },
    });

    revalidatePath("/instructor/assessments");
    revalidatePath("/student/assessments");

    return { success: true, data: submission };
  } catch (error: any) {
    console.error("Error grading submission:", error);
    return { success: false, error: error.message || "Failed to grade submission." };
  }
}
