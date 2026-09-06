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
