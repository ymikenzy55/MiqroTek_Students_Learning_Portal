"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function createInstructorAction(formData: FormData) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { success: false, error: "Unauthorized. Super Admin access required." };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const phone = formData.get("phone") as string || undefined;
  const title = formData.get("title") as string || "Instructor";
  const bio = formData.get("bio") as string || undefined;
  const isSuperAdmin = formData.get("isSuperAdmin") === "true";

  if (!name || !email || !password) {
    return { success: false, error: "Name, email, and password are required." };
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return { success: false, error: "A user with this email already exists." };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const role = isSuperAdmin ? "SUPER_ADMIN" : "SUPER_ADMIN"; // All instructors are SUPER_ADMIN as per system rule

    const newInstructor = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role,
        instructorProfile: {
          create: {
            title,
            bio,
          },
        },
        studentProfile: {
          create: {},
        },
      },
    });

    revalidatePath("/admin/instructors");
    revalidatePath("/instructor");

    return { success: true, data: newInstructor };
  } catch (error: any) {
    console.error("Error creating instructor:", error);
    return { success: false, error: error.message || "Failed to create instructor." };
  }
}

export async function deleteInstructorAction(instructorId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { success: false, error: "Unauthorized. Super Admin access required." };
  }

  if (session.user.id === instructorId) {
    return { success: false, error: "You cannot delete your own account." };
  }

  try {
    // Delete instructor profile and user account
    await prisma.instructorProfile.deleteMany({ where: { userId: instructorId } });
    await prisma.studentProfile.deleteMany({ where: { userId: instructorId } });
    await prisma.user.delete({ where: { id: instructorId } });

    revalidatePath("/admin/instructors");
    revalidatePath("/instructor");

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting instructor:", error);
    return { success: false, error: error.message || "Failed to delete instructor." };
  }
}

export async function toggleSuperAdminAction(instructorId: string, makeSuperAdmin: boolean) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { success: false, error: "Unauthorized. Super Admin access required." };
  }

  try {
    await prisma.user.update({
      where: { id: instructorId },
      data: { role: makeSuperAdmin ? "SUPER_ADMIN" : "STUDENT" },
    });

    revalidatePath("/admin/instructors");
    revalidatePath("/instructor");

    return { success: true };
  } catch (error: any) {
    console.error("Error toggling role:", error);
    return { success: false, error: error.message || "Failed to update role." };
  }
}
