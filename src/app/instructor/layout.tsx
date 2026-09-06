import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { INSTRUCTOR_NAV } from "@/types";
import { getUnreadCount } from "@/lib/messages";
import { prisma } from "@/lib/prisma";

export default async function InstructorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    console.warn("⚠️ Instructor layout - No session found, redirecting to login");
    redirect("/login");
  }

  // Only SUPER_ADMIN can access instructor portal (all instructors are super admins)
  if (session.user.role !== "SUPER_ADMIN") {
    console.warn(`⚠️ Instructor layout - Invalid role: ${session.user.role}, redirecting to login`);
    redirect("/login");
  }

  console.log(`✅ Instructor layout - Access granted for: ${session.user.email} (${session.user.role})`);

  const [initialUnreadCount, initialUnreadNotifications] = await Promise.all([
    getUnreadCount(session.user.id).catch(() => 0),
    prisma.notification
      .count({ where: { userId: session.user.id, readAt: null } })
      .catch(() => 0),
  ]);

  return (
    <DashboardShell
      navItems={INSTRUCTOR_NAV}
      user={{
        name: session.user.name || "",
        email: session.user.email || "",
        role: session.user.role,
      }}
      basePath="/instructor"
      initialUnreadCount={initialUnreadCount}
      initialUnreadNotifications={initialUnreadNotifications}
    >
      {children}
    </DashboardShell>
  );
}
