"use client";

import { Icon } from "@/components/ui/Icon";
import type { NavItem } from "@/types";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { SidebarNav } from "@/components/layout/SidebarNav";

interface SidebarProps {
  navItems: NavItem[];
  user: { name: string; email: string; role: string };
  basePath: string;
}

const roleLabel: Record<string, string> = {
  STUDENT: "Student",
  INSTRUCTOR: "Instructor",
  SUPER_ADMIN: "Administrator",
};

export function Sidebar({ navItems, user }: SidebarProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-[var(--primary)] lg:flex">
      {/* Brand */}
      <div className="flex h-20 items-center gap-2.5 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-base font-bold text-white backdrop-blur">
          M
        </div>
        <div className="leading-tight">
          <p className="text-lg font-semibold tracking-tight text-white">Miqrotek</p>
          <p className="text-[11px] text-white/60">{roleLabel[user.role] ?? "Portal"}</p>
        </div>
      </div>

      <SidebarNav navItems={navItems} />

      {/* Footer */}
      <div className="px-6 pb-6 pt-4">
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-white/10 p-3 backdrop-blur">
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
    </aside>
  );
}
