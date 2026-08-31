import { EmptyState } from "@/components/ui/States";
import { PageHeader } from "@/components/layout/PageHeader";
import { CourseCard } from "@/components/courses/CourseCard";
import { prisma } from "@/lib/prisma";

export default async function AdminCourses() {
  const courses = await prisma.course.findMany({
    include: {
      instructor: { select: { name: true } },
      _count: { select: { weeklyTopics: true, enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses"
        description="All courses across the platform with their instructors"
      />
      {courses.length === 0 ? (
        <EmptyState title="No courses" description="All platform courses will appear here." />
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
