import { EmptyState } from "@/components/ui/States";
import { PageHeader } from "@/components/layout/PageHeader";
import { CourseCard } from "@/components/courses/CourseCard";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export default async function InstructorCourses() {
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Courses"
        description="Courses you have created and manage"
      />
      {courses.length === 0 ? (
        <EmptyState title="No courses yet" description="Create your first course to get started." />
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
    </div>
  );
}
