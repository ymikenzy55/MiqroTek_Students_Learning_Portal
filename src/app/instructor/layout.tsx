import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { INSTRUCTOR_NAV } from "@/types";

export default async function InstructorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "INSTRUCTOR" && session.user.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  return (
    <DashboardShell
      navItems={INSTRUCTOR_NAV}
      user={{
        name: session.user.name || "",
        email: session.user.email || "",
        role: session.user.role,
      }}
      basePath="/instructor"
    >
      {children}
    </DashboardShell>
  );
}
