import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { STUDENT_NAV } from "@/types";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    console.warn("⚠️ Student layout - No session found, redirecting to login");
    redirect("/login");
  }

  if (session.user.role !== "STUDENT") {
    console.warn(`⚠️ Student layout - Invalid role: ${session.user.role}, redirecting to login`);
    redirect("/login");
  }

  console.log(`✅ Student layout - Access granted for: ${session.user.email}`);

  return (
    <DashboardShell
      navItems={STUDENT_NAV}
      user={{
        name: session.user.name || "",
        email: session.user.email || "",
        role: session.user.role,
      }}
      basePath="/student"
    >
      {children}
    </DashboardShell>
  );
}
