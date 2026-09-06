import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Cached fetch for active course listings with weekly topic counts
 */
export const getCachedActiveCourses = unstable_cache(
  async () => {
    return prisma.course.findMany({
      where: { status: "ACTIVE" },
      include: {
        instructor: { select: { name: true } },
        _count: { select: { weeklyTopics: true, enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  },
  ["active-courses-list"],
  { revalidate: 60, tags: ["courses"] }
);

/**
 * Cached fetch for super admin / instructor count
 */
export const getCachedInstructorCount = unstable_cache(
  async () => {
    return prisma.user.count({
      where: { role: "SUPER_ADMIN" },
    });
  },
  ["instructor-count"],
  { revalidate: 120, tags: ["instructors"] }
);
