"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { Role } from "@/types";

export async function updateProfileAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Authentication required." };
  }

  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || undefined;
  const bio = (formData.get("bio") as string)?.trim() || undefined;
  const avatarUrl = (formData.get("avatarUrl") as string)?.trim() || undefined;
  const title = (formData.get("title") as string)?.trim() || undefined;
  const role = session.user.role as Role;

  if (!name) {
    return { success: false as const, error: "Name is required." };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone,
        image: avatarUrl || null,
        ...(role === "STUDENT"
          ? { studentProfile: { upsert: { create: { bio, avatarUrl }, update: { bio, avatarUrl } } } }
          : { instructorProfile: { upsert: { create: { title, bio, avatarUrl }, update: { title, bio, avatarUrl } } } }),
      },
    });

    revalidatePath("/student/profile");
    revalidatePath("/instructor/profile");
    revalidatePath("/admin/settings");

    return { success: true as const };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false as const, error: "Failed to update profile." };
  }
}

export async function updateSettingsAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Authentication required." };
  }

  const notifyOnMessage = formData.get("notifyOnMessage") === "on";

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { notifyOnMessage },
    });

    revalidatePath("/student/profile");
    revalidatePath("/instructor/profile");

    return { success: true as const };
  } catch (error) {
    console.error("Error updating settings:", error);
    return { success: false as const, error: "Failed to update settings." };
  }
}

export async function changePasswordAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Authentication required." };
  }

  const currentPassword = (formData.get("currentPassword") as string) || "";
  const newPassword = (formData.get("newPassword") as string) || "";
  const confirmPassword = (formData.get("confirmPassword") as string) || "";

  if (!currentPassword || !newPassword) {
    return { success: false as const, error: "All fields are required." };
  }

  if (newPassword.length < 6) {
    return { success: false as const, error: "New password must be at least 6 characters." };
  }

  if (newPassword !== confirmPassword) {
    return { success: false as const, error: "New passwords do not match." };
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return { success: false as const, error: "User not found." };
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return { success: false as const, error: "Current password is incorrect." };
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash },
    });

    return { success: true as const };
  } catch (error) {
    console.error("Error changing password:", error);
    return { success: false as const, error: "Failed to change password." };
  }
}
