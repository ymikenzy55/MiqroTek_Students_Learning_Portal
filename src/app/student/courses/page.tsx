import { PageHeader } from "@/components/layout/PageHeader";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { StudentCoursesClient } from "./StudentCoursesClient";

export default async function StudentCourses() {
  const session = await auth();
  const userId = session?.user?.id;

  const [courses, enrollments] = await Promise.all([
    prisma.course.findMany({
      where: { status: "ACTIVE" },
      include: {
        instructor: { select: { name: true } },
        _count: { select: { weeklyTopics: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    userId
      ? prisma.enrollment.findMany({
          where: { userId },
          include: { payment: true },
        })
      : Promise.resolve([]),
  ]);

  // Serialize for client component
  const serializedCourses = courses.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    price: c.price,
    currency: c.currency,
    duration: c.duration,
    image: c.image,
    instructor: { name: c.instructor.name },
    _count: { weeklyTopics: c._count.weeklyTopics },
  }));

  const serializedEnrollments = enrollments.map((e) => ({
    courseId: e.courseId,
    payment: e.payment ? { status: e.payment.status } : null,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Student Courses & Learning Syllabus"
        description="View registered courses, pay easily, track weekly topics and view course duration progress"
      />
      <StudentCoursesClient courses={serializedCourses} enrollments={serializedEnrollments} />
    </div>
  );
}
