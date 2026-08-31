import { StatCard } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";
import { PageHeader } from "@/components/layout/PageHeader";
import { CourseCard } from "@/components/courses/CourseCard";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export default async function StudentDashboard() {
  const session = await auth();
  const userId = session?.user?.id;

  const enrollments = userId
    ? await prisma.enrollment.findMany({
        where: { userId },
        include: {
          course: {
            include: {
              instructor: { select: { name: true } },
              _count: { select: { weeklyTopics: true, assessments: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const [pendingAssessments, attendanceCount, bundleCount] = userId
    ? await Promise.all([
        prisma.assessment.count({
          where: {
            course: { enrollments: { some: { userId } } },
            submissions: { none: { userId } },
          },
        }),
        prisma.attendanceRecord.count({ where: { userId, status: "PRESENT" } }),
        prisma.bundleAssignment.count({ where: { userId } }),
      ])
    : [0, 0, 0];

  const totalTopics = enrollments.reduce((sum, e) => sum + e.course._count.weeklyTopics, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back${session?.user?.name ? ", " + session.user.name.split(" ")[0] : ""}`}
        description="Here is an overview of your learning progress"
      />

      <div className="stagger grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Enrolled Courses" value={enrollments.length} />
        <StatCard label="Weekly Topics" value={totalTopics} />
        <StatCard label="Pending Assessments" value={pendingAssessments} />
        <StatCard label="Classes Attended" value={attendanceCount} />
        <StatCard label="Active Bundles" value={bundleCount} />
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">My Courses</h2>
        {enrollments.length === 0 ? (
          <EmptyState
            title="No courses yet"
            description="Browse available courses and enroll to get started."
          />
        ) : (
          <div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {enrollments.map(({ course }) => (
              <CourseCard
                key={course.id}
                title={course.title}
                description={course.description}
                instructorName={course.instructor.name}
                price={course.price}
                currency={course.currency}
                duration={course.duration}
                topicCount={course._count.weeklyTopics}
                enrolled
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
