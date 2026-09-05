export default function AdminCoursesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-[var(--surface)] rounded"></div>
          <div className="h-4 w-64 bg-[var(--surface)] rounded"></div>
        </div>
        <div className="h-10 w-32 bg-[var(--surface)] rounded-lg"></div>
      </div>

      {/* Courses grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="rounded-xl border border-[var(--border)] bg-white p-6 space-y-4">
            <div className="h-6 w-3/4 bg-[var(--surface)] rounded"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-[var(--surface)] rounded"></div>
              <div className="h-4 w-5/6 bg-[var(--surface)] rounded"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-[var(--surface)] rounded-full"></div>
              <div className="h-6 w-20 bg-[var(--surface)] rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
