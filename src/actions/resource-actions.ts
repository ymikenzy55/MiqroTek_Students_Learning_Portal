"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * Upload a course resource (PDF/PPT) — instructor only.
 */
export async function createResourceAction(courseId: string, formData: FormData) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { success: false as const, error: "Unauthorized. Instructor access required." };
  }

  const title = (formData.get("title") as string)?.trim();
  const url = formData.get("url") as string;
  const type = formData.get("type") as string;
  const weeklyTopicId = (formData.get("weeklyTopicId") as string) || null;

  if (!title || !url || !type) {
    return { success: false as const, error: "Title, file, and type are required." };
  }

  // Verify course ownership
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || course.instructorId !== session.user.id) {
    return { success: false as const, error: "Course not found or you do not own it." };
  }

  try {
    const resource = await prisma.resource.create({
      data: {
        courseId,
        weeklyTopicId: weeklyTopicId || null,
        title,
        type,
        url,
      },
    });

    revalidatePath(`/student/courses/${courseId}`);
    revalidatePath("/instructor/courses");

    return { success: true as const, data: resource };
  } catch (error: any) {
    console.error("Error creating resource:", error);
    return { success: false as const, error: error.message || "Failed to create resource." };
  }
}

/**
 * Delete a course resource — instructor only.
 */
export async function deleteResourceAction(resourceId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { success: false as const, error: "Unauthorized. Instructor access required." };
  }

  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    include: { course: true },
  });

  if (!resource || resource.course.instructorId !== session.user.id) {
    return { success: false as const, error: "Resource not found or you do not own it." };
  }

  try {
    await prisma.resource.delete({ where: { id: resourceId } });

    revalidatePath(`/student/courses/${resource.courseId}`);
    revalidatePath("/instructor/courses");

    return { success: true as const };
  } catch (error: any) {
    console.error("Error deleting resource:", error);
    return { success: false as const, error: error.message || "Failed to delete resource." };
  }
}

/**
 * Update student's CV URL — student only.
 */
export async function updateCvAction(cvUrl: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false as const, error: "Authentication required." };
  }

  try {
    await prisma.studentProfile.upsert({
      where: { userId: session.user.id },
      update: { cvUrl },
      create: { userId: session.user.id, cvUrl },
    });

    revalidatePath("/student/profile");
    revalidatePath("/instructor/students");

    return { success: true as const };
  } catch (error: any) {
    console.error("Error updating CV:", error);
    return { success: false as const, error: error.message || "Failed to update CV." };
  }
}
