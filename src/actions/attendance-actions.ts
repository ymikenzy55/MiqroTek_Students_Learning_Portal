"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function createAttendanceSessionAction(courseId: string, studentRecords: { userId: string; status: "PRESENT" | "ABSENT" | "LATE" }[]) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { success: false, error: "Unauthorized. Instructor access required." };
  }

  try {
    const attendanceSession = await prisma.attendanceSession.create({
      data: {
        courseId,
        instructorId: session.user.id,
        date: new Date(),
        records: {
          create: studentRecords.map((r) => ({
            userId: r.userId,
            status: r.status,
          })),
        },
      },
    });

    revalidatePath("/instructor/attendance");
    revalidatePath("/student/attendance");

    return { success: true, data: attendanceSession };
  } catch (error: any) {
    console.error("Error saving attendance session:", error);
    return { success: false, error: error.message || "Failed to record attendance." };
  }
}
