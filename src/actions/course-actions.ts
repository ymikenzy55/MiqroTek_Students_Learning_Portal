"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function createCourseAction(formData: FormData) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { success: false, error: "Unauthorized. Instructor/Super Admin access required." };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string || undefined;
  const price = parseFloat(formData.get("price") as string) || 0;
  const duration = formData.get("duration") as string || "8 Weeks";
  const image = formData.get("image") as string || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80";
  const rawTopics = formData.get("topics") as string || "";
  const rawHighlights = (formData.get("highlights") as string) || "";
  const highlights = rawHighlights
    .split("\n")
    .map((h) => h.trim())
    .filter((h) => h.length > 0);

  if (!title) {
    return { success: false, error: "Course title is required." };
  }

  // Parse line-by-line topics
  const topicTitles = rawTopics
    .split("\n")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  try {
    const course = await prisma.course.create({
      data: {
        title,
        description,
        price,
        currency: "GHS",
        duration,
        image,
        highlights,
        status: "ACTIVE",
        instructorId: session.user.id,
        weeklyTopics: {
          create: topicTitles.map((tTitle, idx) => ({
            weekNumber: idx + 1,
            title: tTitle,
          })),
        },
      },
    });

    revalidatePath("/instructor/courses");
    revalidatePath("/student/courses");
    revalidatePath("/admin/courses");

    return { success: true, data: course };
  } catch (error: any) {
    console.error("Error creating course:", error);
    return { success: false, error: error.message || "Failed to create course." };
  }
}

export async function deleteCourseAction(courseId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { success: false, error: "Unauthorized. Instructor/Super Admin access required." };
  }

  try {
    await prisma.course.delete({ where: { id: courseId } });

    revalidatePath("/instructor/courses");
    revalidatePath("/student/courses");
    revalidatePath("/admin/courses");

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting course:", error);
    return { success: false, error: error.message || "Failed to delete course." };
  }
}

export async function updateCourseAction(courseId: string, formData: FormData) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { success: false as const, error: "Unauthorized. Instructor/Super Admin access required." };
  }

  const title = (formData.get("title") as string)?.trim();
  if (!title) {
    return { success: false as const, error: "Course title is required." };
  }

  const description = (formData.get("description") as string) || undefined;
  const price = parseFloat(formData.get("price") as string) || 0;
  const duration = (formData.get("duration") as string) || "8 Weeks";
  const image = (formData.get("image") as string) || undefined;
  const rawHighlights = (formData.get("highlights") as string) || "";
  const highlights = rawHighlights
    .split("\n")
    .map((h) => h.trim())
    .filter((h) => h.length > 0);

  // Verify ownership
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || course.instructorId !== session.user.id) {
    return { success: false as const, error: "Course not found or you do not own it." };
  }

  try {
    await prisma.course.update({
      where: { id: courseId },
      data: {
        title,
        description: description || null,
        price,
        duration,
        image: image || null,
        highlights,
      },
    });

    revalidatePath("/instructor/courses");
    revalidatePath(`/student/courses/${courseId}`);
    revalidatePath("/student/courses");
    revalidatePath("/admin/courses");

    return { success: true as const };
  } catch (error: any) {
    console.error("Error updating course:", error);
    return { success: false as const, error: error.message || "Failed to update course." };
  }
}

/**
 * Add a single weekly topic to an existing course.
 */
export async function addWeeklyTopicAction(courseId: string, title: string, description?: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { success: false as const, error: "Unauthorized. Instructor access required." };
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true },
  });

  if (!course || course.instructorId !== session.user.id) {
    return { success: false as const, error: "Course not found or you do not own it." };
  }

  const trimmed = title.trim();
  if (!trimmed) {
    return { success: false as const, error: "Topic title is required." };
  }

  // Get the next week number
  const lastTopic = await prisma.weeklyTopic.findFirst({
    where: { courseId },
    orderBy: { weekNumber: "desc" },
    select: { weekNumber: true },
  });

  const weekNumber = (lastTopic?.weekNumber || 0) + 1;

  try {
    const topic = await prisma.weeklyTopic.create({
      data: { courseId, title: trimmed, description: description?.trim() || undefined, weekNumber },
    });

    revalidatePath(`/instructor/courses`);
    revalidatePath(`/student/courses/${courseId}`);

    return { success: true as const, data: { id: topic.id, weekNumber: topic.weekNumber, title: topic.title } };
  } catch (error: any) {
    console.error("Error adding topic:", error);
    return { success: false as const, error: error.message || "Failed to add topic." };
  }
}

/**
 * Delete a weekly topic from a course.
 */
export async function deleteWeeklyTopicAction(topicId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { success: false as const, error: "Unauthorized. Instructor access required." };
  }

  const topic = await prisma.weeklyTopic.findUnique({
    where: { id: topicId },
    select: { id: true, courseId: true, course: { select: { instructorId: true } } },
  });

  if (!topic || topic.course.instructorId !== session.user.id) {
    return { success: false as const, error: "Topic not found or you do not own it." };
  }

  try {
    await prisma.weeklyTopic.delete({ where: { id: topicId } });

    revalidatePath(`/instructor/courses`);
    revalidatePath(`/student/courses/${topic.courseId}`);

    return { success: true as const };
  } catch (error: any) {
    console.error("Error deleting topic:", error);
    return { success: false as const, error: error.message || "Failed to delete topic." };
  }
}

/**
 * Toggle the instructor-driven milestone: mark a weekly topic as covered
 * (completed) or not. Students see covered topics as completed progress.
 */
export async function toggleTopicCoveredAction(topicId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { success: false as const, error: "Unauthorized. Instructor access required." };
  }

  try {
    const topic = await prisma.weeklyTopic.findUnique({
      where: { id: topicId },
      select: { id: true, covered: true, courseId: true, course: { select: { instructorId: true } } },
    });

    if (!topic) {
      return { success: false as const, error: "Topic not found." };
    }

    if (topic.course.instructorId !== session.user.id) {
      return { success: false as const, error: "You do not own this course." };
    }

    const updated = await prisma.weeklyTopic.update({
      where: { id: topicId },
      data: {
        covered: !topic.covered,
        coveredAt: !topic.covered ? new Date() : null,
      },
    });

    revalidatePath(`/student/courses/${topic.courseId}`);
    revalidatePath("/instructor/courses");
    revalidatePath("/student");

    return { success: true as const, data: { covered: updated.covered } };
  } catch (error: any) {
    console.error("Error toggling topic:", error);
    return { success: false as const, error: error.message || "Failed to update topic." };
  }
}
