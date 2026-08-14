import { DirectorySkeleton } from '@/components/skeletons'

export default function StudentsLoading() {
  return (
    <div className="container-page py-8 sm:py-10">
      <div className="h-8 w-40 animate-pulse rounded-md bg-surface-border/70" />
      <div className="mt-3 h-4 w-80 animate-pulse rounded-md bg-surface-border/50" />
      <div className="mt-6 h-10 w-full max-w-md animate-pulse rounded-lg bg-surface-border/50" />
      <DirectorySkeleton />
    </div>
  )
}
