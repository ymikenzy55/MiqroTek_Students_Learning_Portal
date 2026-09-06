import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { InstructorsClient } from "./InstructorsClient";

export default async function InstructorsPage() {
  const session = await auth();

  const instructors = await prisma.user.findMany({
    where: { role: "SUPER_ADMIN" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      createdAt: true,
      instructorProfile: { select: { title: true, bio: true } },
      _count: { select: { courses: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Fetch students that can be promoted to instructor
  const promotableStudents = await prisma.user.findMany({
    where: { role: "STUDENT", status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { name: "asc" },
  });

  const currentUserId = session?.user?.id;

  return (
    <InstructorsClient
      instructors={instructors}
      currentUserId={currentUserId}
      promotableStudents={promotableStudents}
    />
  );
}
