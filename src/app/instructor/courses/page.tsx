import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { InstructorCoursesClient } from "./InstructorCoursesClient";

export default async function InstructorCoursesPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const courses = userId
    ? await prisma.course.findMany({
        where: { instructorId: userId },
        include: {
          instructor: { select: { name: true } },
          weeklyTopics: {
            select: { id: true, weekNumber: true, title: true, covered: true },
            orderBy: { weekNumber: "asc" },
          },
          _count: { select: { weeklyTopics: true, enrollments: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return <InstructorCoursesClient courses={courses} />;
}
