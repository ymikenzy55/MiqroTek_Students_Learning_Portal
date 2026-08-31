import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

export function Card({ className, title, description, children, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6", className)}
      {...props}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-[var(--foreground)]">{title}</h3>}
          {description && <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  hint?: string;
}

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5">
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[var(--accent)]/5 transition-transform duration-500 group-hover:scale-150" />
      <div className="relative">
        <p className="text-sm font-medium text-[var(--muted)]">{label}</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-[var(--foreground)]">{value}</p>
        {hint && <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p>}
      </div>
    </div>
  );
}
