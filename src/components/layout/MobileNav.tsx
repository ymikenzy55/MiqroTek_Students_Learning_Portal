"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import type { NavItem } from "@/types";
import { signOut } from "next-auth/react";
import { Modal } from "@/components/ui/Modal";
import { SidebarNav } from "@/components/layout/SidebarNav";

interface MobileNavProps {
  navItems: NavItem[];
  user: { name: string; email: string; role: string };
}

export function MobileNav({ navItems, user }: MobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const mainItems = navItems.slice(0, 4);

  return (
    <>
      {/* Bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-[var(--border)] bg-[var(--white)] pb-[env(safe-area-inset-bottom)] lg:hidden">
        {mainItems.map((item) => {
          const isActive =
            pathname === item.href ||
            pathname.startsWith(item.href + "/") ||
            item.children?.some((c) => pathname.startsWith(c.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "group flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                isActive ? "text-[var(--accent)]" : "text-[var(--muted)]"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300",
                  isActive ? "bg-[var(--accent)]/10" : "group-active:scale-90"
                )}
              >
                <Icon name={item.icon} className="h-5 w-5" />
              </span>
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setOpen(true)}
          className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-[var(--muted)]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full">
            <Icon name="menu" className="h-5 w-5" />
          </span>
          More
        </button>
      </nav>

      {/* Slide-in drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!open}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setOpen(false)}
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 flex w-72 flex-col bg-[var(--primary)] transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 font-bold text-white">
                M
              </div>
              <span className="font-semibold text-white">Miqrotek</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close menu"
            >
              <Icon name="close" className="h-5 w-5" />
            </button>
          </div>

          <SidebarNav navItems={navItems} onNavigate={() => setOpen(false)} />

          <div className="px-6 pb-6 pt-4">
            <div className="mb-4 flex items-center gap-3 rounded-xl bg-white/10 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-semibold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{user.name}</p>
                <p className="truncate text-[11px] text-white/60">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => setConfirmOpen(true)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              <Icon name="logout" className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Sign out?"
        description="You will be returned to the login page and will need to sign in again to access your dashboard."
        confirmLabel="Sign out"
        destructive
        loading={signingOut}
        onConfirm={() => {
          setSigningOut(true);
          signOut({ callbackUrl: "/login" });
        }}
      />
    </>
  );
}
