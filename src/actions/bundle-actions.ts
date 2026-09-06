"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function createBundleAction(formData: FormData) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { success: false as const, error: "Unauthorized. Instructor access required." };
  }

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || undefined;
  const requiredAttendanceCount = parseInt(
    (formData.get("requiredAttendanceCount") as string) || "0",
    10
  );

  if (!name) {
    return { success: false as const, error: "Bundle name is required." };
  }

  try {
    await prisma.bundle.create({
      data: {
        name,
        description,
        instructorId: session.user.id,
        requiredAttendanceCount: isNaN(requiredAttendanceCount) ? 0 : requiredAttendanceCount,
      },
    });

    revalidatePath("/instructor/bundles");

    return { success: true as const };
  } catch (error) {
    console.error("Error creating bundle:", error);
    return { success: false as const, error: "Failed to create bundle." };
  }
}

export async function updateBundleThresholdAction(bundleId: string, threshold: number) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { success: false as const, error: "Unauthorized." };
  }

  try {
    const bundle = await prisma.bundle.findUnique({ where: { id: bundleId } });
    if (!bundle || bundle.instructorId !== session.user.id) {
      return { success: false as const, error: "Bundle not found or you do not own it." };
    }

    await prisma.bundle.update({
      where: { id: bundleId },
      data: { requiredAttendanceCount: Math.max(0, threshold) },
    });

    revalidatePath("/instructor/bundles");

    return { success: true as const };
  } catch (error) {
    console.error("Error updating bundle threshold:", error);
    return { success: false as const, error: "Failed to update threshold." };
  }
}

export async function deleteBundleAction(bundleId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { success: false as const, error: "Unauthorized." };
  }

  try {
    const bundle = await prisma.bundle.findUnique({ where: { id: bundleId } });
    if (!bundle || bundle.instructorId !== session.user.id) {
      return { success: false as const, error: "Bundle not found or you do not own it." };
    }

    await prisma.bundle.delete({ where: { id: bundleId } });

    revalidatePath("/instructor/bundles");

    return { success: true as const };
  } catch (error) {
    console.error("Error deleting bundle:", error);
    return { success: false as const, error: "Failed to delete bundle." };
  }
}
