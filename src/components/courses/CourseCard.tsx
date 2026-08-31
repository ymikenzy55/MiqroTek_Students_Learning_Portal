import { Badge } from "@/components/ui/Badge";

interface CourseCardProps {
  title: string;
  description?: string | null;
  instructorName: string;
  price: number;
  currency: string;
  duration?: string | null;
  topicCount?: number;
  enrolled?: boolean;
  action?: React.ReactNode;
}

export function CourseCard({
  title,
  description,
  instructorName,
  price,
  currency,
  duration,
  topicCount,
  enrolled = false,
  action,
}: CourseCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5">
      <span className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-[var(--accent)] transition-transform duration-300 group-hover:scale-x-100" />
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="font-semibold leading-snug text-[var(--foreground)]">{title}</h3>
        {enrolled && <Badge variant="success">Enrolled</Badge>}
      </div>

      {description && (
        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">
          {description}
        </p>
      )}

      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)]/10 text-xs font-medium text-[var(--accent)]">
          {instructorName.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[var(--foreground)]">{instructorName}</p>
          <p className="text-xs text-[var(--muted)]">Instructor</p>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[var(--border)] pt-4 text-xs text-[var(--muted)]">
        <span className="font-medium text-[var(--foreground)]">
          {price > 0 ? `${currency} ${price.toFixed(2)}` : "Free"}
        </span>
        {duration && <span>{duration}</span>}
        {topicCount !== undefined && (
          <span>
            {topicCount} {topicCount === 1 ? "topic" : "topics"}
          </span>
        )}
      </div>

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
