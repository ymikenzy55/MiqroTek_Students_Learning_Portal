"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn, isNavItemActive, resolveActiveHref } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { useRealtime } from "@/components/providers/RealtimeProvider";
import type { NavItem } from "@/types";

interface SidebarNavProps {
  navItems: NavItem[];
  onNavigate?: () => void;
}

export function SidebarNav({ navItems, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const { unreadCount } = useRealtime();
  const activeHref = resolveActiveHref(pathname, navItems);
  // Groups default to open while they contain the active route; an explicit
  // toggle by the user overrides that default until they toggle it again.
  const [toggledGroups, setToggledGroups] = useState<Record<string, boolean>>({});

  function toggleGroup(label: string, expanded: boolean) {
    setToggledGroups((prev) => ({ ...prev, [label]: !expanded }));
  }

  return (
    <nav className="flex-1 space-y-1.5 overflow-y-auto py-4 pl-4">
      {navItems.map((item) => {
        const active = isNavItemActive(activeHref, item);
        const hasChildren = !!item.children?.length;
        const expanded = toggledGroups[item.label] ?? active;

        return (
          <div key={item.label}>
            {/* Row: active state renders as a white pill notched into the content area */}
            <div className="relative">
              {active && (
                <>
                  {/* concave curve above the pill */}
                  <span className="pointer-events-none absolute -top-5 right-0 h-5 w-5 bg-[var(--white)]">
                    <span className="block h-full w-full rounded-br-[20px] bg-[var(--primary)]" />
                  </span>
                  {/* concave curve below the pill */}
                  <span className="pointer-events-none absolute -bottom-5 right-0 h-5 w-5 bg-[var(--white)]">
                    <span className="block h-full w-full rounded-tr-[20px] bg-[var(--primary)]" />
                  </span>
                </>
              )}

              {hasChildren ? (
                <button
                  onClick={() => toggleGroup(item.label, expanded)}
                  aria-expanded={expanded}
                  className={cn(
                    "relative flex w-full items-center gap-3 rounded-l-full py-3 pl-4 pr-3 text-sm font-medium transition-all duration-300",
                    active
                      ? "bg-[var(--white)] text-[var(--accent)]"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon name={item.icon} className="h-5 w-5 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <Icon
                    name="chevron-down"
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform duration-300",
                      expanded && "rotate-180"
                    )}
                  />
                </button>
              ) : (
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "relative flex items-center gap-3 rounded-l-full py-3 pl-4 pr-3 text-sm font-medium transition-all duration-300",
                    active
                      ? "bg-[var(--white)] text-[var(--accent)]"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon name={item.icon} className="h-5 w-5 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge === "unreadMessages" && unreadCount > 0 && (
                    <span
                      className="shrink-0 rounded-full bg-[var(--accent)] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white"
                      aria-label={`${unreadCount} unread messages`}
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
              )}
            </div>

            {/* Sub-items */}
            {hasChildren && (
              <div
                className={cn(
                  "grid transition-all duration-300 ease-out",
                  expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <div className="mt-1 space-y-0.5 pb-1 pl-7 pr-3">
                    {item.children!.map((child) => {
                      const childActive = activeHref === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onNavigate}
                          className={cn(
                            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors duration-200",
                            childActive
                              ? "bg-[var(--accent)]/20 font-medium text-[var(--accent)]"
                              : "text-white/60 hover:bg-white/10 hover:text-white"
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 shrink-0 rounded-full transition-colors",
                              childActive ? "bg-[var(--accent)]" : "bg-white/40"
                            )}
                          />
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
