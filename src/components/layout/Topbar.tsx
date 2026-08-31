"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

interface TopbarProps {
  user: { name: string; email: string; role: string };
  profileHref: string;
}

const roleLabel: Record<string, string> = {
  STUDENT: "Student",
  INSTRUCTOR: "Instructor",
  SUPER_ADMIN: "Administrator",
};

export function Topbar({ user, profileHref }: TopbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="flex items-center justify-end gap-2">
      {/* Expanding search */}
      <div className="flex items-center">
        {mounted && (
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-out",
              searchOpen ? "w-40 opacity-100 sm:w-56" : "w-0 opacity-0"
            )}
          >
            <input
              type="search"
              placeholder="Search..."
              className="h-9 w-full rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
        )}
        <button
          onClick={() => setSearchOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--muted)] transition-all duration-200 hover:bg-[var(--surface)] hover:text-[var(--accent)] active:scale-90"
          aria-label="Toggle search"
        >
          <Icon name={searchOpen ? "close" : "search"} className="h-5 w-5" />
        </button>
      </div>

      {/* Notifications */}
      <div ref={notifRef} className="relative">
        <button
          onClick={() => setNotifOpen((v) => !v)}
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-[var(--muted)] transition-all duration-200 hover:bg-[var(--surface)] hover:text-[var(--accent)] active:scale-90"
          aria-label="Notifications"
          aria-expanded={notifOpen}
        >
          <Icon name="bell" className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[var(--accent)] ring-2 ring-[var(--white)]" />
        </button>

        {notifOpen && (
          <div
            className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--white)] shadow-lg"
            style={{ animation: "fadeSlideIn 180ms ease-out" }}
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <p className="text-sm font-semibold text-[var(--foreground)]">Notifications</p>
              <span className="rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[11px] font-medium text-[var(--accent)]">3 new</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              <NotifItem
                title="New course material"
                desc="Weekly Topic 5 has been posted to your course"
                time="2h ago"
              />
              <NotifItem
                title="Assessment due soon"
                desc="You have an assessment due in 2 days"
                time="5h ago"
              />
              <NotifItem
                title="New enrollment"
                desc="A new student enrolled in your course"
                time="1d ago"
              />
            </div>
            <button
              onClick={() => setNotifOpen(false)}
              className="w-full border-t border-[var(--border)] px-4 py-2.5 text-center text-sm font-medium text-[var(--accent)] transition-colors hover:bg-[var(--surface)]"
            >
              Mark all as read
            </button>
          </div>
        )}
      </div>

      {/* Avatar menu */}
      <div ref={menuRef} className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-[var(--surface)]"
          aria-expanded={menuOpen}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-semibold text-white">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <Icon
            name="chevron-down"
            className={cn(
              "h-4 w-4 text-[var(--muted)] transition-transform duration-200",
              menuOpen && "rotate-180"
            )}
          />
        </button>

        {menuOpen && (
          <div
            className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--white)] shadow-lg"
            style={{ animation: "fadeSlideIn 180ms ease-out" }}
          >
            <div className="border-b border-[var(--border)] px-4 py-3">
              <p className="truncate text-sm font-medium text-[var(--foreground)]">{user.name}</p>
              <p className="truncate text-xs text-[var(--muted)]">{user.email}</p>
              <span className="mt-2 inline-flex rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[11px] font-medium text-[var(--accent)]">
                {roleLabel[user.role] ?? "Member"}
              </span>
            </div>
            <Link
              href={profileHref}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--surface)]"
            >
              <Icon name="user" className="h-4 w-4 text-[var(--muted)]" />
              My profile
            </Link>
            <button
              onClick={() => {
                setMenuOpen(false);
                setConfirmOpen(true);
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--danger)] transition-colors hover:bg-[var(--danger)]/5"
            >
              <Icon name="logout" className="h-4 w-4" />
              Sign out
            </button>
          </div>
        )}
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
    </div>
  );
}

function NotifItem({ title, desc, time }: { title: string; desc: string; time: string }) {
  return (
    <div className="flex gap-3 border-b border-[var(--border)] px-4 py-3 transition-colors hover:bg-[var(--surface)] cursor-pointer">
      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--foreground)]">{title}</p>
        <p className="mt-0.5 text-xs text-[var(--muted)]">{desc}</p>
        <p className="mt-1 text-[11px] text-[var(--muted)]">{time}</p>
      </div>
    </div>
  );
}
