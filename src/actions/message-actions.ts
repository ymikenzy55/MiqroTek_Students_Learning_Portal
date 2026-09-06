"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { publish, publishToMany } from "@/lib/realtime";
import { allowedRecipientIds, canMessage, getThread } from "@/lib/messages";
import type { Role } from "@/types";

const MAX_BODY_LENGTH = 4000;

function normalizeBody(raw: unknown) {
  if (typeof raw !== "string") return null;
  const body = raw.trim();
  if (!body || body.length > MAX_BODY_LENGTH) return null;
  return body;
}

export async function sendMessageAction(recipientId: string, rawBody: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Authentication required." };
  }

  const body = normalizeBody(rawBody);
  if (!body) {
    return {
      success: false as const,
      error: `Message must be between 1 and ${MAX_BODY_LENGTH} characters.`,
    };
  }

  const senderId = session.user.id;
  const role = session.user.role as Role;

  if (!(await canMessage(senderId, role, recipientId))) {
    console.warn(`⚠️ Blocked message from ${senderId} to ${recipientId} (no shared course)`);
    return {
      success: false as const,
      error:
        role === "STUDENT"
          ? "You can only message instructors of courses you are enrolled in."
          : "You can only message students enrolled in your courses.",
    };
  }

  try {
    const message = await prisma.message.create({
      data: { senderId, recipientId, body },
    });

    publish(recipientId, {
      type: "message:new",
      messageId: message.id,
      senderId,
      senderName: session.user.name || "Someone",
      preview: body.slice(0, 140),
      broadcast: false,
      createdAt: message.createdAt.toISOString(),
    });

    revalidatePath("/student/messages");
    revalidatePath("/instructor/messages");

    return { success: true as const, data: await getThread(senderId, recipientId) };
  } catch (error) {
    console.error("❌ Failed to send message:", error);
    return { success: false as const, error: "Could not send the message. Try again." };
  }
}

/**
 * Instructor-only fan-out. Omit `recipientIds` to reach every student enrolled
 * in the sender's courses; pass a subset for a bulk send.
 */
export async function broadcastMessageAction(rawBody: string, recipientIds?: string[]) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Authentication required." };
  }

  const role = session.user.role as Role;
  if (role !== "SUPER_ADMIN") {
    return { success: false as const, error: "Only instructors can send bulk messages." };
  }

  const body = normalizeBody(rawBody);
  if (!body) {
    return {
      success: false as const,
      error: `Message must be between 1 and ${MAX_BODY_LENGTH} characters.`,
    };
  }

  const senderId = session.user.id;
  const allowed = await allowedRecipientIds(senderId, role);
  const targets =
    recipientIds && recipientIds.length > 0
      ? allowed.filter((id) => recipientIds.includes(id))
      : allowed;

  if (targets.length === 0) {
    return {
      success: false as const,
      error: "No eligible students found. Students must be enrolled in one of your courses.",
    };
  }

  try {
    const broadcastId = randomUUID();
    const createdAt = new Date();

    await prisma.message.createMany({
      data: targets.map((recipientId) => ({
        senderId,
        recipientId,
        body,
        broadcastId,
        createdAt,
      })),
    });

    publishToMany(targets, {
      type: "message:new",
      messageId: broadcastId,
      senderId,
      senderName: session.user.name || "Your instructor",
      preview: body.slice(0, 140),
      broadcast: true,
      createdAt: createdAt.toISOString(),
    });

    revalidatePath("/student/messages");
    revalidatePath("/instructor/messages");

    return { success: true as const, count: targets.length };
  } catch (error) {
    console.error("❌ Failed to broadcast message:", error);
    return { success: false as const, error: "Could not send the message. Try again." };
  }
}

export async function markThreadReadAction(otherUserId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Authentication required." };
  }

  const userId = session.user.id;

  try {
    const { count } = await prisma.message.updateMany({
      where: { recipientId: userId, senderId: otherUserId, readAt: null },
      data: { readAt: new Date() },
    });

    if (count > 0) {
      // Refreshes the sender's own unread/badge view of this thread.
      publish(userId, { type: "message:read", byUserId: userId });
      revalidatePath("/student/messages");
      revalidatePath("/instructor/messages");
    }

    return { success: true as const, count };
  } catch (error) {
    console.error("❌ Failed to mark thread read:", error);
    return { success: false as const, error: "Could not update the conversation." };
  }
}

export async function getThreadAction(otherUserId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Authentication required." };
  }

  const userId = session.user.id;
  const role = session.user.role as Role;

  if (!(await canMessage(userId, role, otherUserId))) {
    return { success: false as const, error: "You cannot view this conversation." };
  }

  return { success: true as const, data: await getThread(userId, otherUserId) };
}
