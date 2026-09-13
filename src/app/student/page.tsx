import { StatCard } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";
import { PageHeader } from "@/components/layout/PageHeader";
import { CourseCard } from "@/components/courses/CourseCard";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export default async function StudentDashboard() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  // Optimized: Single parallel fetch instead of sequential queries
  const [enrollments, pendingAssessments, attendanceCount, bundleCount, allCourses] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            currency: true,
            duration: true,
            image: true,
            instructor: { select: { name: true } },
            _count: { select: { weeklyTopics: true, assessments: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.assessment.count({
      where: {
        course: { enrollments: { some: { userId } } },
        submissions: { none: { userId } },
      },
    }),
    prisma.attendanceRecord.count({ 
      where: { userId, status: "PRESENT" } 
    }),
    prisma.bundleAssignment.count({ 
      where: { userId } 
    }),
    // Fetch all active courses so we can show available ones too
    prisma.course.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        currency: true,
        duration: true,
        image: true,
        pricingType: true,
        trialDays: true,
        instructor: { select: { name: true } },
        _count: { select: { weeklyTopics: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalTopics = enrollments.reduce((sum, e) => sum + e.course._count.weeklyTopics, 0);

  // Determine which courses the student is NOT enrolled in
  const enrolledCourseIds = new Set(enrollments.map((e) => e.course.id));
  const availableCourses = allCourses.filter((c) => !enrolledCourseIds.has(c.id));

  return (
    <div className="space-y-8">
      <OnboardingTour role="STUDENT" />
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

      {/* My Courses (enrolled) */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">My Courses</h2>
        {enrollments.length === 0 ? (
          <EmptyState
            title="No courses yet"
            description="Browse available courses below and register to get started."
          />
        ) : (
          <div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {enrollments.map(({ course }) => (
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
                  <div className="border-t border-[var(--border)] pt-3 text-right">
                    <a
                      href={`/student/courses/${course.id}`}
                      className="inline-flex items-center gap-1 rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[var(--accent-dark)] transition-colors"
                    >
                      View Topics & Progress →
                    </a>
                  </div>
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* Available Courses (not yet enrolled) */}
      {availableCourses.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
            Available Courses
            <span className="ml-2 text-sm font-normal text-[var(--muted)]">
              ({availableCourses.length})
            </span>
          </h2>
          <div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
                pricingType={course.pricingType}
                trialDays={course.trialDays}
                action={
                  <div className="border-t border-[var(--border)] pt-3 text-right">
                    <a
                      href={`/student/courses/${course.id}`}
                      className="inline-flex items-center gap-1 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-600 transition-colors"
                    >
                      Register for 1 Month Free →
                    </a>
                  </div>
                }
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
