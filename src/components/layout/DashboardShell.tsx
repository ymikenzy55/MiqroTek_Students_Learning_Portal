import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Topbar } from "@/components/layout/Topbar";
import { RealtimeProvider } from "@/components/providers/RealtimeProvider";
import type { NavItem } from "@/types";

interface DashboardShellProps {
  navItems: NavItem[];
  user: { name: string; email: string; role: string };
  basePath: string;
  /**
   * Initial unread message count from the database. When provided, the shell
   * mounts the realtime provider so the sidebar/mobile badge and SSE stream
   * are live. Omit for portals that do not use messaging (e.g. admin).
   */
  initialUnreadCount?: number;
  children: React.ReactNode;
}

export function DashboardShell({
  navItems,
  user,
  basePath,
  initialUnreadCount = 0,
  children,
}: DashboardShellProps) {
  const profileHref = `${basePath}/profile`;

  return (
    <RealtimeProvider initialUnreadCount={initialUnreadCount}>
      <div className="min-h-screen bg-[var(--background)]">
        <Sidebar navItems={navItems} user={user} basePath={basePath} />
        <MobileNav navItems={navItems} user={user} />

        <div className="lg:pl-64">
          {/* Desktop top bar */}
          <header className="sticky top-0 z-30 hidden items-center justify-between border-b border-[var(--border)] bg-[var(--white)]/80 px-6 py-3 backdrop-blur-md lg:flex">
            <div />
            <Topbar user={user} profileHref={profileHref} navItems={navItems} />
          </header>

          <main className="min-h-screen pb-24 lg:pb-0">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </RealtimeProvider>
  );
}
