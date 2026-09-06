import { Badge } from "@/components/ui/Badge";

interface CourseCardProps {
  id?: string;
  title: string;
  description?: string | null;
  instructorName: string;
  price: number;
  currency: string;
  duration?: string | null;
  image?: string | null;
  topicCount?: number;
  enrolled?: boolean;
  action?: React.ReactNode;
}

export function CourseCard({
  id,
  title,
  description,
  instructorName,
  price,
  currency,
  duration,
  image,
  topicCount,
  enrolled = false,
  action,
}: CourseCardProps) {
  const defaultImg = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--white)] shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-1">
      {/* Course Image Header */}
      <div className="relative aspect-video w-full overflow-hidden bg-[var(--surface)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image || defaultImg}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        {enrolled && (
          <div className="absolute top-3 right-3">
            <Badge variant="success">Enrolled</Badge>
          </div>
        )}
        {duration && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-xs px-2.5 py-1 text-xs font-medium text-white">
            <span>⏱️ {duration}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-semibold text-lg leading-snug text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
          {title}
        </h3>

        {description && (
          <p className="mt-2 mb-4 line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">
            {description}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)]/10 text-xs font-bold text-[var(--accent)]">
              {instructorName.charAt(0).toUpperCase()}
            </span>
            <span className="truncate text-xs font-medium text-[var(--muted)]">{instructorName}</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-[var(--accent)]">
              {price > 0 ? `${currency} ${price.toFixed(2)}` : "Free"}
            </span>
          </div>
        </div>

        {topicCount !== undefined && (
          <div className="mt-2 text-xs text-[var(--muted)]">
            📚 {topicCount} {topicCount === 1 ? "Weekly Topic" : "Weekly Topics"}
          </div>
        )}

        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}
