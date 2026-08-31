import { StatCard } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";
import { PageHeader } from "@/components/layout/PageHeader";
import { CourseCard } from "@/components/courses/CourseCard";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export default async function AdminDashboard() {
  const session = await auth();

  const [
    studentCount,
    instructorCount,
    enrollmentCount,
    paymentCount,
    activeCourseCount,
    courses,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "INSTRUCTOR" } }),
    prisma.enrollment.count(),
    prisma.payment.count(),
    prisma.course.count({ where: { status: "ACTIVE" } }),
    prisma.course.findMany({
      include: {
        instructor: { select: { name: true } },
        _count: { select: { weeklyTopics: true, enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back${session?.user?.name ? ", " + session.user.name.split(" ")[0] : ""}`}
        description="Platform-wide overview and management"
      />

      <div className="stagger grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Students" value={studentCount} />
        <StatCard label="Instructors" value={instructorCount} />
        <StatCard label="Total Courses" value={courses.length} />
        <StatCard label="Active Courses" value={activeCourseCount} />
        <StatCard label="Enrollments" value={enrollmentCount} />
        <StatCard label="Payments" value={paymentCount} />
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Recent Courses</h2>
        {courses.length === 0 ? (
          <EmptyState
            title="No courses yet"
            description="Courses created by instructors will appear here."
          />
        ) : (
          <div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                title={course.title}
                description={course.description}
                instructorName={course.instructor.name}
                price={course.price}
                currency={course.currency}
                duration={course.duration}
                topicCount={course._count.weeklyTopics}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
