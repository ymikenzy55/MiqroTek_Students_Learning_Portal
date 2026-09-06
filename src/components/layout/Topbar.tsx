"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types";

interface TopbarProps {
  user: { name: string; email: string; role: string };
  profileHref: string;
  navItems?: NavItem[];
}

const roleLabel: Record<string, string> = {
  STUDENT: "Student",
  SUPER_ADMIN: "Instructor",
};

interface Suggestion {
  label: string;
  href: string;
  icon: string;
  group: string;
}

function flattenNav(navItems: NavItem[]): Suggestion[] {
  const out: Suggestion[] = [];
  for (const item of navItems) {
    out.push({ label: item.label, href: item.href, icon: item.icon, group: item.label });
    if (item.children) {
      for (const child of item.children) {
        out.push({ label: child.label, href: child.href, icon: item.icon, group: item.label });
      }
    }
  }
  return out;
}

export function Topbar({ user, profileHref, navItems = [] }: TopbarProps) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const allSuggestions = useMemo(() => flattenNav(navItems), [navItems]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allSuggestions.slice(0, 6);
    return allSuggestions
      .filter(
        (s) =>
          s.label.toLowerCase().includes(q) ||
          s.group.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [query, allSuggestions]);

  useEffect(() => {
    setMounted(true);
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        // Don't close the search bar itself, just the dropdown
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestion((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = suggestions[activeSuggestion];
      if (target) {
        router.push(target.href);
        setQuery("");
        setSearchOpen(false);
      }
    } else if (e.key === "Escape") {
      setQuery("");
      setSearchOpen(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {/* Expanding search with live suggestions */}
      <div ref={searchRef} className="relative flex items-center">
        {mounted && (
          <>
            <div
              className={cn(
                "overflow-hidden transition-all duration-300 ease-out",
                searchOpen ? "w-40 opacity-100 sm:w-64" : "w-0 opacity-0"
              )}
            >
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveSuggestion(0);
                }}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => setActiveSuggestion(0)}
                placeholder="Search pages..."
                className="h-9 w-full rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>

            {/* Suggestions dropdown */}
            {searchOpen && query.trim() && suggestions.length > 0 && (
              <div
                className="absolute right-10 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--white)] shadow-lg"
                style={{ animation: "fadeSlideIn 150ms ease-out" }}
              >
                <ul className="max-h-72 overflow-y-auto py-1">
                  {suggestions.map((s, idx) => (
                    <li key={`${s.href}-${idx}`}>
                      <Link
                        href={s.href}
                        onClick={() => {
                          setQuery("");
                          setSearchOpen(false);
                        }}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                          idx === activeSuggestion
                            ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                            : "text-[var(--foreground)] hover:bg-[var(--surface)]"
                        )}
                      >
                        <Icon name={s.icon} className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{s.label}</p>
                          {s.group !== s.label && (
                            <p className="truncate text-xs text-[var(--muted)]">{s.group}</p>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {searchOpen && query.trim() && suggestions.length === 0 && (
              <div
                className="absolute right-10 top-full z-50 mt-2 w-72 rounded-xl border border-[var(--border)] bg-[var(--white)] p-4 text-center text-sm text-[var(--muted)] shadow-lg"
                style={{ animation: "fadeSlideIn 150ms ease-out" }}
              >
                No pages match &quot;{query.trim()}&quot;
              </div>
            )}
          </>
        )}
        <button
          onClick={() => {
            setSearchOpen((v) => !v);
            if (!searchOpen) setQuery("");
          }}
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
        title="Sign out of Miqrotek?"
        description={`You are signed in as ${user.email}. You will be returned to the login page and will need to enter your password again to get back in.`}
        confirmLabel="Yes, sign me out"
        cancelLabel="Stay signed in"
        icon="logout"
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
