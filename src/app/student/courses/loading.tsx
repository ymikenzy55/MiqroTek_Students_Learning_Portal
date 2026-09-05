export default function CoursesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-[var(--surface)] rounded"></div>
        <div className="h-4 w-72 bg-[var(--surface)] rounded"></div>
      </div>

      {/* Courses grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl border border-[var(--border)] bg-white p-6 space-y-4">
            <div className="h-6 w-3/4 bg-[var(--surface)] rounded"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-[var(--surface)] rounded"></div>
              <div className="h-4 w-5/6 bg-[var(--surface)] rounded"></div>
              <div className="h-4 w-4/6 bg-[var(--surface)] rounded"></div>
            </div>
            <div className="flex justify-between items-center pt-2">
              <div className="h-6 w-24 bg-[var(--surface)] rounded"></div>
              <div className="h-10 w-28 bg-[var(--surface)] rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
