import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { InstructorStudentsClient } from "./InstructorStudentsClient";

export default async function InstructorStudentsPage() {
  const session = await auth();
  const instructorId = session?.user?.id;

  if (!instructorId) {
    return <InstructorStudentsClient students={[]} courses={[]} />;
  }

  // 1. Fetch courses taught by this instructor
  const instructorCourses = await prisma.course.findMany({
    where: { instructorId },
    select: { id: true, title: true },
  });

  const courseIds = instructorCourses.map((c) => c.id);

  // 2. Fetch enrollments for these courses
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: { in: courseIds } },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          createdAt: true,
        },
      },
      course: {
        select: {
          id: true,
          title: true,
          duration: true,
        },
      },
    },
  });

  // Group by student
  const studentMap = new Map<string, any>();

  for (const e of enrollments) {
    if (!studentMap.has(e.user.id)) {
      studentMap.set(e.user.id, {
        id: e.user.id,
        name: e.user.name,
        email: e.user.email,
        phone: e.user.phone,
        status: e.user.status,
        createdAt: e.user.createdAt,
        enrollments: [],
        submissionsCount: 0,
        attendanceCount: 0,
      });
    }
    studentMap.get(e.user.id).enrollments.push({ course: e.course });
  }

  // 3. If this is the super admin (yeboahmichael), also fetch ALL students
  //    in the system, not just those enrolled in their courses.
  const isSuperAdmin = session.user.role === "SUPER_ADMIN";
  if (isSuperAdmin) {
    const allStudents = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        enrollments: {
          select: {
            course: { select: { id: true, title: true, duration: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    for (const s of allStudents) {
      if (!studentMap.has(s.id)) {
        studentMap.set(s.id, {
          id: s.id,
          name: s.name,
          email: s.email,
          phone: s.phone,
          status: s.status,
          createdAt: s.createdAt,
          enrollments: s.enrollments.map((e) => ({ course: e.course })),
          submissionsCount: 0,
          attendanceCount: 0,
        });
      } else {
        // Merge any additional enrollments
        const existing = studentMap.get(s.id);
        for (const e of s.enrollments) {
          if (!existing.enrollments.some((en: any) => en.course.id === e.course.id)) {
            existing.enrollments.push({ course: e.course });
          }
        }
      }
    }
  }

  const studentIds = Array.from(studentMap.keys());

  // 4. Count submissions and attendance records for these students
  if (studentIds.length > 0) {
    const [submissions, attendance] = await Promise.all([
      prisma.submission.groupBy({
        by: ["userId"],
        where: { userId: { in: studentIds } },
        _count: { id: true },
      }),
      prisma.attendanceRecord.groupBy({
        by: ["userId"],
        where: { userId: { in: studentIds }, status: "PRESENT" },
        _count: { id: true },
      }),
    ]);

    for (const sub of submissions) {
      if (studentMap.has(sub.userId)) {
        studentMap.get(sub.userId).submissionsCount = sub._count.id;
      }
    }

    for (const att of attendance) {
      if (studentMap.has(att.userId)) {
        studentMap.get(att.userId).attendanceCount = att._count.id;
      }
    }
  }

  const studentsList = Array.from(studentMap.values());

  return (
    <InstructorStudentsClient
      students={studentsList}
      courses={instructorCourses}
      isSuperAdmin={isSuperAdmin}
    />
  );
}
