import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { InstructorListClient } from "./InstructorListClient";

export default async function AdminInstructorsPage() {
  const session = await auth();
  const currentUserId = session?.user?.id || "";

  const instructors = await prisma.user.findMany({
    where: {
      role: "SUPER_ADMIN",
    },
    include: {
      instructorProfile: {
        select: { title: true, bio: true },
      },
      _count: {
        select: { courses: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <InstructorListClient instructors={instructors} currentUserId={currentUserId} />;
}
