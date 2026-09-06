import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CourseDetailClient } from "./CourseDetailClient";

export default async function StudentCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await auth();
  const userId = session?.user?.id;

  const course = await prisma.course.findUnique({
    where: { id: resolvedParams.id },
    include: {
      instructor: { select: { name: true } },
      weeklyTopics: { orderBy: { weekNumber: "asc" } },
    },
  });

  if (!course) {
    notFound();
  }

  const enrollment = userId
    ? await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: course.id,
          },
        },
        include: {
          payment: true,
        },
      })
    : null;

  return <CourseDetailClient course={course} enrollment={enrollment} />;
}
