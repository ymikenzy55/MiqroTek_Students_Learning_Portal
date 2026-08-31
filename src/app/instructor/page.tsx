import { StatCard } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";
import { PageHeader } from "@/components/layout/PageHeader";
import { CourseCard } from "@/components/courses/CourseCard";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export default async function InstructorDashboard() {
  const session = await auth();
  const userId = session?.user?.id;

  const courses = userId
    ? await prisma.course.findMany({
        where: { instructorId: userId },
        include: {
          instructor: { select: { name: true } },
          _count: { select: { weeklyTopics: true, enrollments: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const [studentCount, assessmentCount, sessionCount] = userId
    ? await Promise.all([
        prisma.enrollment.count({ where: { course: { instructorId: userId } } }),
        prisma.assessment.count({ where: { course: { instructorId: userId } } }),
        prisma.attendanceSession.count({ where: { instructorId: userId } }),
      ])
    : [0, 0, 0];

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back${session?.user?.name ? ", " + session.user.name.split(" ")[0] : ""}`}
        description="Here is an overview of your courses and students"
      />

      <div className="stagger grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="My Courses" value={courses.length} />
        <StatCard label="Total Students" value={studentCount} />
        <StatCard label="Assessments" value={assessmentCount} />
        <StatCard label="Attendance Sessions" value={sessionCount} />
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">My Courses</h2>
        {courses.length === 0 ? (
          <EmptyState
            title="No courses yet"
            description="Create your first course to get started."
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
