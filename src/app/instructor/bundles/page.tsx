import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { BundlesClient } from "./BundlesClient";

export default async function InstructorBundlesPage() {
  const session = await auth();
  const instructorId = session?.user?.id;

  if (!instructorId) {
    return <BundlesClient bundles={[]} students={[]} />;
  }

  // Fetch the instructor's bundles
  const bundles = await prisma.bundle.findMany({
    where: { instructorId },
    orderBy: { createdAt: "desc" },
  });

  // Fetch all students enrolled in this instructor's courses, with their
  // attendance counts across the instructor's courses.
  const enrollments = await prisma.enrollment.findMany({
    where: { course: { instructorId } },
    select: {
      userId: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
        },
      },
      course: { select: { id: true, title: true } },
    },
  });

  // Group by student
  const studentMap = new Map<
    string,
    {
      id: string;
      name: string;
      email: string;
      phone: string | null;
      createdAt: Date;
      courses: { id: string; title: string }[];
    }
  >();

  for (const e of enrollments) {
    if (!studentMap.has(e.user.id)) {
      studentMap.set(e.user.id, {
        id: e.user.id,
        name: e.user.name,
        email: e.user.email,
        phone: e.user.phone,
        createdAt: e.user.createdAt,
        courses: [],
      });
    }
    studentMap.get(e.user.id)!.courses.push({ id: e.course.id, title: e.course.title });
  }

  const studentIds = Array.from(studentMap.keys());

  // Count attendance (PRESENT or LATE) per student across instructor's courses
  const attendanceMap = new Map<string, number>();
  if (studentIds.length > 0) {
    const attendanceCounts = await prisma.attendanceRecord.groupBy({
      by: ["userId"],
      where: {
        userId: { in: studentIds },
        status: { in: ["PRESENT", "LATE"] },
        session: { course: { instructorId } },
      },
      _count: { id: true },
    });
    for (const a of attendanceCounts) {
      attendanceMap.set(a.userId, a._count.id);
    }
  }

  const students = Array.from(studentMap.values()).map((s) => ({
    ...s,
    attendanceCount: attendanceMap.get(s.id) ?? 0,
  }));

  return <BundlesClient bundles={bundles} students={students} />;
}
