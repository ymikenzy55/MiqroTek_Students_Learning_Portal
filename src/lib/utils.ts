import type { NavItem } from "@/types";

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

function hrefMatchesPathname(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

/**
 * Returns the single nav href that best describes the current pathname. Only the
 * longest matching href wins, so a section root (e.g. "/student") is not treated
 * as active while a nested route (e.g. "/student/courses") is open.
 */
export function resolveActiveHref(pathname: string, navItems: NavItem[]) {
  const hrefs = navItems.flatMap((item) => [
    item.href,
    ...(item.children?.map((child) => child.href) ?? []),
  ]);

  return hrefs
    .filter((href) => hrefMatchesPathname(pathname, href))
    .sort((a, b) => b.length - a.length)[0];
}

export function isNavItemActive(activeHref: string | undefined, item: NavItem) {
  if (!activeHref) return false;
  return (
    item.href === activeHref || !!item.children?.some((child) => child.href === activeHref)
  );
}
