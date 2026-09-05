export default function StudentLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-[var(--surface)] rounded"></div>
        <div className="h-4 w-96 bg-[var(--surface)] rounded"></div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-xl border border-[var(--border)] bg-white p-4 space-y-2">
            <div className="h-4 w-24 bg-[var(--surface)] rounded"></div>
            <div className="h-8 w-16 bg-[var(--surface)] rounded"></div>
          </div>
        ))}
      </div>

      {/* Courses skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-32 bg-[var(--surface)] rounded"></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, i) => (
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
    </div>
  );
}
