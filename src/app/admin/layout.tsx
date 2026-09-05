import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ADMIN_NAV } from "@/types";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    console.warn("⚠️ Admin layout - No session found, redirecting to login");
    redirect("/login");
  }

  if (session.user.role !== "SUPER_ADMIN") {
    console.warn(`⚠️ Admin layout - Invalid role: ${session.user.role}, redirecting to login`);
    redirect("/login");
  }

  console.log(`✅ Admin layout - Access granted for: ${session.user.email}`);

  return (
    <DashboardShell
      navItems={ADMIN_NAV}
      user={{
        name: session.user.name || "",
        email: session.user.email || "",
        role: session.user.role,
      }}
      basePath="/admin"
    >
      {children}
    </DashboardShell>
  );
}
