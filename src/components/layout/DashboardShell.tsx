import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Topbar } from "@/components/layout/Topbar";
import type { NavItem } from "@/types";

interface DashboardShellProps {
  navItems: NavItem[];
  user: { name: string; email: string; role: string };
  basePath: string;
  children: React.ReactNode;
}

export function DashboardShell({ navItems, user, basePath, children }: DashboardShellProps) {
  const profileHref = `${basePath}/profile`;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar navItems={navItems} user={user} basePath={basePath} />
      <MobileNav navItems={navItems} user={user} />

      <div className="lg:pl-64">
        {/* Desktop top bar */}
        <header className="sticky top-0 z-30 hidden items-center justify-between border-b border-[var(--border)] bg-[var(--white)]/80 px-6 py-3 backdrop-blur-md lg:flex">
          <div />
          <Topbar user={user} profileHref={profileHref} />
        </header>

        <main className="min-h-screen pb-24 lg:pb-0">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
