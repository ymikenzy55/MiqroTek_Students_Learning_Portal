import Link from "next/link";
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
      take: 100,
    }),
    userId
      ? prisma.enrollment.findMany({
          where: { userId },
          include: { payment: true },
        })
      : Promise.resolve([]),
  ]);

  const enrollmentMap = new Map(enrollments.map((e) => [e.courseId, e]));

  const myCourses = courses.filter((c) => enrollmentMap.has(c.id));
  const availableCourses = courses.filter((c) => !enrollmentMap.has(c.id));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Student Courses & Learning Syllabus"
        description="View registered courses, pay easily, track weekly topics and view course duration progress"
      />

      {/* Registered Courses */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
          My Registered Courses
          <span className="ml-2 text-sm font-normal text-[var(--muted)]">({myCourses.length})</span>
        </h2>
        {myCourses.length === 0 ? (
          <EmptyState
            title="No courses registered"
            description="Explore available courses below and enroll to get started."
          />
        ) : (
          <div className="stagger grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {myCourses.map((course) => {
              const enr = enrollmentMap.get(course.id);
              const isPaid = enr?.payment?.status === "PAID" || course.price === 0;

              return (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  instructorName={course.instructor.name}
                  price={course.price}
                  currency={course.currency}
                  duration={course.duration}
                  image={course.image}
                  topicCount={course._count.weeklyTopics}
                  enrolled
                  action={
                    <div className="flex items-center justify-between gap-2 border-t border-[var(--border)] pt-3">
                      <span className={`text-xs font-bold ${isPaid ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600"}`}>
                        {isPaid ? "✅ Paid & Active" : "⚠️ Payment Pending"}
                      </span>
                      <Link
                        href={`/student/courses/${course.id}`}
                        className="inline-flex items-center gap-1 rounded-xl bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[var(--accent-dark)] transition-colors"
                      >
                        {isPaid ? "View Topics & Progress →" : "Pay & View Topics →"}
                      </Link>
                    </div>
                  }
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Available Courses */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
          Available Courses
          <span className="ml-2 text-sm font-normal text-[var(--muted)]">
            ({availableCourses.length})
          </span>
        </h2>
        {availableCourses.length === 0 ? (
          <EmptyState
            title="No additional courses available"
            description="You are currently enrolled in all available courses."
          />
        ) : (
          <div className="stagger grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {availableCourses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                instructorName={course.instructor.name}
                price={course.price}
                currency={course.currency}
                duration={course.duration}
                image={course.image}
                topicCount={course._count.weeklyTopics}
                action={
                  <div className="border-t border-[var(--border)] pt-3 text-right">
                    <Link
                      href={`/student/courses/${course.id}`}
                      className="inline-flex items-center gap-1 rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[var(--accent-dark)] transition-colors"
                    >
                      View Details & Enroll →
                    </Link>
                  </div>
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
