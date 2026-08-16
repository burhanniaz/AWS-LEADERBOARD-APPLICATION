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

export function AdminTableSkeleton() {
  return (
    <div className="card mt-6 animate-pulse overflow-hidden">
      <div className="hidden md:block">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-surface-border/70 px-4 py-3 last:border-0">
            <div className="h-8 w-8 shrink-0 rounded-full bg-surface-border/70" />
            <div className="h-3 w-40 rounded bg-surface-border/70" />
            <div className="ml-auto h-3 w-20 rounded bg-surface-border/50" />
            <div className="h-3 w-16 rounded bg-surface-border/50" />
          </div>
        ))}
      </div>
      <div className="divide-y divide-surface-border md:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4">
            <div className="h-9 w-9 shrink-0 rounded-full bg-surface-border/70" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 rounded bg-surface-border/70" />
              <div className="h-2.5 w-44 rounded bg-surface-border/50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Mirrors a single card-shaped form: a handful of labelled inputs followed by
// a submit button, used by any page whose whole body is one form (evaluation
// entry, add/edit builder).
export function FormCardSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <div className="card card-pad animate-pulse space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 w-24 rounded bg-surface-border/70" />
            <div className="h-10 w-full rounded-lg bg-surface-border/50" />
          </div>
        ))}
      </div>
      <div className="h-10 w-32 rounded-lg bg-surface-border/70" />
    </div>
  )
}

// Settings is three independent list+form cards side by side (metrics,
// roles, sessions) — one skeleton block reused three times.
export function SettingsSkeleton() {
  return (
    <div className="mt-6 grid animate-pulse gap-6 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, col) => (
        <div key={col} className="card card-pad space-y-4">
          <div className="h-4 w-32 rounded bg-surface-border/70" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-9 rounded-md bg-surface-border/50" />
            ))}
          </div>
          <div className="space-y-3 border-t border-surface-border pt-5">
            <div className="h-10 rounded-lg bg-surface-border/50" />
            <div className="h-10 rounded-lg bg-surface-border/50" />
            <div className="h-9 w-24 rounded-lg bg-surface-border/70" />
          </div>
        </div>
      ))}
    </div>
  )
}
