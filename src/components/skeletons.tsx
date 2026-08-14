// Route-shaped loading skeletons. Each mirrors the layout of the page it stands
// in for, so navigation never flashes a generic blank box before the real content
// (or a mismatched skeleton from a different route) paints in.

export function BoardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card card-pad h-24" />
        ))}
      </div>
      <div className="mt-6 space-y-4">
        <div className="card card-pad h-24" />
        <div className="card h-64" />
      </div>
    </div>
  )
}

export function DirectorySkeleton() {
  return (
    <div className="mt-6 grid animate-pulse gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card card-pad h-28" />
      ))}
    </div>
  )
}

export function InsightsSkeleton() {
  return (
    <div className="mt-6 animate-pulse">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card card-pad h-24" />
        ))}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card card-pad h-48" />
        ))}
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="card card-pad flex h-32 flex-col gap-5 sm:h-28 sm:flex-row sm:items-center" />
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card card-pad h-24" />
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="card h-96" />
        <div className="card h-64" />
      </div>
    </div>
  )
}
