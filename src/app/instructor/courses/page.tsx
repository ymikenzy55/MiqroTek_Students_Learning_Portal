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
          resources: {
            select: { id: true, title: true, type: true, url: true, createdAt: true },
            orderBy: { createdAt: "desc" },
          },
          _count: { select: { weeklyTopics: true, enrollments: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  // Serialize dates for the client component
  const serializedCourses = courses.map((c) => ({
    ...c,
    registrationDeadline: c.registrationDeadline?.toISOString() || null,
    resources: c.resources.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
  }));

  return <InstructorCoursesClient courses={serializedCourses} />;
}
