"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * Create a new instructor (SUPER_ADMIN) account. Only existing
 * SUPER_ADMIN users may do this.
 */
export async function createInstructorAction(formData: FormData) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { success: false as const, error: "Unauthorized. Super Admin access required." };
  }

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const phone = (formData.get("phone") as string)?.trim() || undefined;
  const password = (formData.get("password") as string) || "password123";
  const title = (formData.get("title") as string)?.trim() || undefined;
  const bio = (formData.get("bio") as string)?.trim() || undefined;

  if (!name || !email) {
    return { success: false as const, error: "Name and email are required." };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false as const, error: `A user with email ${email} already exists.` };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: "SUPER_ADMIN",
        instructorProfile: { create: { title, bio } },
      },
    });

    revalidatePath("/instructor/instructors");
    revalidatePath("/admin/instructors");

    return { success: true as const };
  } catch (error) {
    console.error("Error creating instructor:", error);
    return { success: false as const, error: "Failed to create instructor." };
  }
}

/** Remove instructor privileges by deleting the user (and cascade). */
export async function removeInstructorAction(instructorId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { success: false as const, error: "Unauthorized. Super Admin access required." };
  }

  if (instructorId === session.user.id) {
    return { success: false as const, error: "You cannot remove yourself." };
  }

  try {
    const target = await prisma.user.findUnique({ where: { id: instructorId } });
    if (!target || target.role !== "SUPER_ADMIN") {
      return { success: false as const, error: "User not found or not an instructor." };
    }

    await prisma.user.delete({ where: { id: instructorId } });

    revalidatePath("/instructor/instructors");
    revalidatePath("/admin/instructors");

    return { success: true as const };
  } catch (error) {
    console.error("Error removing instructor:", error);
    return { success: false as const, error: "Failed to remove instructor." };
  }
}

/**
 * Promote a STUDENT to SUPER_ADMIN (instructor). Only existing SUPER_ADMIN
 * users can do this. Creates an instructor profile if one doesn't exist.
 */
export async function promoteToInstructorAction(userId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { success: false as const, error: "Unauthorized. Super Admin access required." };
  }

  if (userId === session.user.id) {
    return { success: false as const, error: "You are already a Super Admin." };
  }

  try {
    const target = await prisma.user.findUnique({
      where: { id: userId },
      include: { instructorProfile: true },
    });

    if (!target) {
      return { success: false as const, error: "User not found." };
    }

    if (target.role === "SUPER_ADMIN") {
      return { success: false as const, error: "User is already an instructor." };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        role: "SUPER_ADMIN",
        instructorProfile: target.instructorProfile
          ? undefined
          : { create: { title: "Instructor" } },
      },
    });

    revalidatePath("/instructor/instructors");
    revalidatePath("/instructor/students");
    revalidatePath("/admin/instructors");

    return { success: true as const };
  } catch (error) {
    console.error("Error promoting user:", error);
    return { success: false as const, error: "Failed to promote user." };
  }
}

/**
 * Demote a SUPER_ADMIN back to STUDENT. Removes their instructor privileges.
 * Cannot demote yourself.
 */
export async function demoteInstructorAction(instructorId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { success: false as const, error: "Unauthorized. Super Admin access required." };
  }

  if (instructorId === session.user.id) {
    return { success: false as const, error: "You cannot demote yourself." };
  }

  try {
    const target = await prisma.user.findUnique({ where: { id: instructorId } });
    if (!target || target.role !== "SUPER_ADMIN") {
      return { success: false as const, error: "User not found or not an instructor." };
    }

    await prisma.user.update({
      where: { id: instructorId },
      data: { role: "STUDENT" },
    });

    revalidatePath("/instructor/instructors");
    revalidatePath("/instructor/students");
    revalidatePath("/admin/instructors");

    return { success: true as const };
  } catch (error) {
    console.error("Error demoting instructor:", error);
    return { success: false as const, error: "Failed to demote instructor." };
  }
}
