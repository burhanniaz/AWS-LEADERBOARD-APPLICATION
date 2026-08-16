import { AdminTableSkeleton } from '@/components/skeletons'

export default function AdminStudentsLoading() {
  return (
    <div className="container-page py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="h-7 w-32 animate-pulse rounded-md bg-surface-border/70" />
        <div className="h-9 w-32 animate-pulse rounded-lg bg-surface-border/70" />
      </div>
      <div className="mt-6 h-10 w-full max-w-md animate-pulse rounded-lg bg-surface-border/50" />
      <AdminTableSkeleton />
    </div>
  )
}
