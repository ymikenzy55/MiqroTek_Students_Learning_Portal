import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

const badgeStyles: Record<BadgeVariant, string> = {
  default: "bg-[var(--surface)] text-[var(--muted)]",
  success: "bg-[var(--success)]/10 text-[var(--success)]",
  warning: "bg-amber-50 text-[var(--warning)]",
  danger: "bg-red-50 text-[var(--danger)]",
  info: "bg-[var(--accent)]/10 text-[var(--accent)]",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        badgeStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
