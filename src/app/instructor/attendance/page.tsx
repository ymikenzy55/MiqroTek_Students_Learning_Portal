import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { InstructorAttendanceClient } from "./InstructorAttendanceClient";

export default async function InstructorAttendancePage() {
  const session = await auth();
  const instructorId = session?.user?.id;

  if (!instructorId) {
    return <InstructorAttendanceClient courses={[]} recentSessions={[]} />;
  }

  const courses = await prisma.course.findMany({
    where: { instructorId },
    include: {
      enrollments: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const courseIds = courses.map((c) => c.id);

  const recentSessions = await prisma.attendanceSession.findMany({
    where: { courseId: { in: courseIds } },
    include: {
      course: { select: { title: true } },
      records: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
    },
    orderBy: { date: "desc" },
    take: 10,
  });

  return <InstructorAttendanceClient courses={courses} recentSessions={recentSessions} />;
}
