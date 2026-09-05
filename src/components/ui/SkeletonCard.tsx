export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-6 space-y-4 animate-pulse">
      <div className="h-6 w-3/4 bg-[var(--surface)] rounded"></div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-[var(--surface)] rounded"></div>
        <div className="h-4 w-5/6 bg-[var(--surface)] rounded"></div>
        <div className="h-4 w-4/6 bg-[var(--surface)] rounded"></div>
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-6 w-20 bg-[var(--surface)] rounded-full"></div>
        <div className="h-6 w-20 bg-[var(--surface)] rounded-full"></div>
      </div>
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-4 space-y-2 animate-pulse">
      <div className="h-4 w-24 bg-[var(--surface)] rounded"></div>
      <div className="h-8 w-16 bg-[var(--surface)] rounded"></div>
    </div>
  );
}

export function SkeletonHeader() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-8 w-64 bg-[var(--surface)] rounded"></div>
      <div className="h-4 w-96 max-w-full bg-[var(--surface)] rounded"></div>
    </div>
  );
}
