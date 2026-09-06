import { prisma } from "@/lib/prisma";
import type { Role } from "@/types";

export interface Contact {
  id: string;
  name: string;
  email: string;
  /** Courses that link this contact to the viewer, for context in the UI. */
  courseTitles: string[];
  lastMessageAt: Date | null;
  lastMessagePreview: string | null;
  unreadCount: number;
}

export interface ThreadMessage {
  id: string;
  body: string;
  outgoing: boolean;
  broadcast: boolean;
  createdAt: string;
}

/**
 * Ids a student is allowed to message: the instructors of the courses they are
 * enrolled in. Enrollment is the gate — no enrollment, no conversation.
 */
async function instructorIdsForStudent(studentId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: studentId },
    select: { course: { select: { instructorId: true } } },
  });
  return [...new Set(enrollments.map((e) => e.course.instructorId))];
}

/** Ids an instructor is allowed to message: students enrolled in their courses. */
export async function studentIdsForInstructor(instructorId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { course: { instructorId } },
    select: { userId: true },
  });
  return [...new Set(enrollments.map((e) => e.userId))];
}

export async function allowedRecipientIds(userId: string, role: Role) {
  return role === "STUDENT"
    ? instructorIdsForStudent(userId)
    : studentIdsForInstructor(userId);
}

export async function canMessage(userId: string, role: Role, recipientId: string) {
  if (recipientId === userId) return false;
  const allowed = await allowedRecipientIds(userId, role);
  return allowed.includes(recipientId);
}

export async function getUnreadCount(userId: string) {
  return prisma.message.count({ where: { recipientId: userId, readAt: null } });
}

/**
 * Everyone the viewer may talk to, annotated with the last message and unread
 * count so the list can be rendered in one pass.
 */
export async function getContacts(userId: string, role: Role): Promise<Contact[]> {
  const contactIds = await allowedRecipientIds(userId, role);
  if (contactIds.length === 0) return [];

  const courseLinkWhere =
    role === "STUDENT"
      ? { userId, course: { instructorId: { in: contactIds } } }
      : { userId: { in: contactIds }, course: { instructorId: userId } };

  const [people, messages, unread, links] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: contactIds } },
      select: { id: true, name: true, email: true },
    }),
    // Newest first; the first row seen per counterpart is that thread's latest.
    prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, recipientId: { in: contactIds } },
          { recipientId: userId, senderId: { in: contactIds } },
        ],
      },
      select: { senderId: true, recipientId: true, body: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.message.groupBy({
      by: ["senderId"],
      where: { recipientId: userId, readAt: null, senderId: { in: contactIds } },
      _count: { id: true },
    }),
    prisma.enrollment.findMany({
      where: courseLinkWhere,
      select: {
        userId: true,
        course: { select: { title: true, instructorId: true } },
      },
    }),
  ]);

  const latest = new Map<string, { body: string; createdAt: Date }>();
  for (const m of messages) {
    const other = m.senderId === userId ? m.recipientId : m.senderId;
    if (!latest.has(other)) latest.set(other, { body: m.body, createdAt: m.createdAt });
  }

  const unreadBySender = new Map(unread.map((u) => [u.senderId, u._count.id]));

  const coursesByContact = new Map<string, string[]>();
  for (const link of links) {
    const contactId = role === "STUDENT" ? link.course.instructorId : link.userId;
    const list = coursesByContact.get(contactId) ?? [];
    list.push(link.course.title);
    coursesByContact.set(contactId, list);
  }

  return people
    .map((person) => {
      const last = latest.get(person.id);
      return {
        id: person.id,
        name: person.name,
        email: person.email,
        courseTitles: [...new Set(coursesByContact.get(person.id) ?? [])],
        lastMessageAt: last?.createdAt ?? null,
        lastMessagePreview: last?.body ?? null,
        unreadCount: unreadBySender.get(person.id) ?? 0,
      };
    })
    .sort((a, b) => {
      if (a.unreadCount !== b.unreadCount) return b.unreadCount - a.unreadCount;
      const at = a.lastMessageAt?.getTime() ?? 0;
      const bt = b.lastMessageAt?.getTime() ?? 0;
      if (at !== bt) return bt - at;
      return a.name.localeCompare(b.name);
    });
}

export async function getThread(
  userId: string,
  otherUserId: string
): Promise<ThreadMessage[]> {
  const rows = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: userId },
      ],
    },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  return rows.map((m) => ({
    id: m.id,
    body: m.body,
    outgoing: m.senderId === userId,
    broadcast: !!m.broadcastId,
    createdAt: m.createdAt.toISOString(),
  }));
}
