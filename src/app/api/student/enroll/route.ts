import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createNotification } from "@/actions/notification-actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await request.json();
  const { courseId } = body;

  if (!courseId || typeof courseId !== "string") {
    return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  // Check if already enrolled
  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (existing) {
    return NextResponse.json({ error: "Already enrolled in this course" }, { status: 409 });
  }

  // Create enrollment with 30-day free trial
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 30);

  await prisma.enrollment.create({
    data: {
      userId,
      courseId,
      status: "ACTIVE",
      isTrial: true,
      trialEndsAt,
    },
  });

  // Notify the instructor
  createNotification({
    userId: course.instructorId,
    type: "enrollment",
    title: "New Course Registration",
    body: `${session.user.name} just registered for "${course.title}" (1-month free trial).`,
    href: "/instructor/students",
  }).catch((err) => console.error("Failed to create notification:", err));

  return NextResponse.json({ success: true, trialEndsAt: trialEndsAt.toISOString() });
}
