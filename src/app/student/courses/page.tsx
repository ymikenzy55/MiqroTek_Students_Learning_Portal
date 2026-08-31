import { EmptyState } from "@/components/ui/States";
import { PageHeader } from "@/components/layout/PageHeader";
import { CourseCard } from "@/components/courses/CourseCard";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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
    }),
    userId
      ? prisma.enrollment.findMany({
          where: { userId },
          select: { courseId: true },
        })
      : Promise.resolve([]),
  ]);

  const enrolledIds = new Set(enrollments.map((e) => e.courseId));
  const myCourses = courses.filter((c) => enrolledIds.has(c.id));
  const availableCourses = courses.filter((c) => !enrolledIds.has(c.id));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Courses"
        description="Browse available courses and view the ones you are enrolled in"
      />

      <section>
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
          My Courses
          <span className="ml-2 text-sm font-normal text-[var(--muted)]">({myCourses.length})</span>
        </h2>
        {myCourses.length === 0 ? (
          <EmptyState
            title="No courses enrolled"
            description="Enroll in a course below to get started with your learning."
          />
        ) : (
          <div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {myCourses.map((course) => (
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

      <section>
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
          Available Courses
          <span className="ml-2 text-sm font-normal text-[var(--muted)]">
            ({availableCourses.length})
          </span>
        </h2>
        {availableCourses.length === 0 ? (
          <EmptyState
            title="No courses available"
            description="New courses published by instructors will appear here."
          />
        ) : (
          <div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {availableCourses.map((course) => (
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
