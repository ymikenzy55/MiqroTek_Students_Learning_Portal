"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { publish } from "@/lib/realtime";

/**
 * Internal helper — creates a notification and pushes it in real time.
 * Not exported; called from other server actions.
 */
export async function createNotification(params: {
  userId: string;
  type: string;
  title: string;
  body: string;
  href?: string;
}) {
  const notification = await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      href: params.href,
    },
  });

  // Push real-time event
  publish(params.userId, {
    type: "notification:new",
    notificationId: notification.id,
    notificationType: params.type,
    title: params.title,
    body: params.body,
    href: params.href || null,
    createdAt: notification.createdAt.toISOString(),
  });

  return notification;
}

/** Fetch unread + recent notifications for the current user. */
export async function getNotificationsAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Authentication required." };
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return {
    success: true as const,
    notifications: notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      href: n.href,
      readAt: n.readAt?.toISOString() || null,
      createdAt: n.createdAt.toISOString(),
    })),
  };
}

/** Mark a single notification as read and return its href for navigation. */
export async function markNotificationReadAction(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Authentication required." };
  }

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification || notification.userId !== session.user.id) {
    return { success: false as const, error: "Notification not found." };
  }

  if (!notification.readAt) {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });
  }

  revalidatePath("/student");
  revalidatePath("/instructor");

  return {
    success: true as const,
    href: notification.href,
  };
}

/** Mark all unread notifications as read for the current user. */
export async function markAllNotificationsReadAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Authentication required." };
  }

  await prisma.notification.updateMany({
    where: { userId: session.user.id, readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath("/student");
  revalidatePath("/instructor");

  return { success: true as const };
}

/** Count unread notifications for the current user. */
export async function getUnreadNotificationCountAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return 0;
  }

  const count = await prisma.notification.count({
    where: { userId: session.user.id, readAt: null },
  });

  return count;
}
