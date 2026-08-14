import { InsightsSkeleton } from '@/components/skeletons'

export default function InsightsLoading() {
  return (
    <div className="container-page py-8 sm:py-10">
      <div className="h-8 w-32 animate-pulse rounded-md bg-surface-border/70" />
      <div className="mt-3 h-4 w-96 animate-pulse rounded-md bg-surface-border/50" />
      <InsightsSkeleton />
    </div>
  )
}
