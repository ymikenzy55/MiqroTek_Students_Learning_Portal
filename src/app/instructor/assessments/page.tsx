import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { InstructorAssessmentsClient } from "./InstructorAssessmentsClient";

export default async function InstructorAssessmentsPage() {
  const session = await auth();
  const instructorId = session?.user?.id;

  if (!instructorId) {
    return <InstructorAssessmentsClient assessments={[]} courses={[]} />;
  }

  const courses = await prisma.course.findMany({
    where: { instructorId },
    select: { id: true, title: true },
  });

  const courseIds = courses.map((c) => c.id);

  const assessments = await prisma.assessment.findMany({
    where: { courseId: { in: courseIds } },
    include: {
      course: { select: { title: true } },
      submissions: {
        include: {
          user: { select: { name: true, email: true } },
        },
        orderBy: { submittedAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <InstructorAssessmentsClient assessments={assessments} courses={courses} />;
}
