"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import type { NavItem } from "@/types";

function isItemActive(pathname: string, item: NavItem) {
  if (item.children?.length) {
    return item.children.some(
      (c) => pathname === c.href || pathname.startsWith(c.href + "/")
    );
  }
  return pathname === item.href || pathname.startsWith(item.href + "/");
}

interface SidebarNavProps {
  navItems: NavItem[];
  onNavigate?: () => void;
}

export function SidebarNav({ navItems, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<string[]>(() =>
    navItems.filter((i) => isItemActive(pathname, i) && i.children).map((i) => i.label)
  );

  function toggleGroup(label: string) {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  }

  return (
    <nav className="flex-1 space-y-1.5 overflow-y-auto py-4 pl-4">
      {navItems.map((item) => {
        const active = isItemActive(pathname, item);
        const hasChildren = !!item.children?.length;
        const expanded = openGroups.includes(item.label);

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
                  onClick={() => toggleGroup(item.label)}
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
                  <span>{item.label}</span>
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
                      const childActive =
                        pathname === child.href || pathname.startsWith(child.href + "/");
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
