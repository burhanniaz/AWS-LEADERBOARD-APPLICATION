import { FormCardSkeleton } from '@/components/skeletons'

export default function EvaluationsLoading() {
  return (
    <div className="container-page max-w-3xl animate-pulse py-8">
      <div className="flex items-center gap-2.5">
        <div className="h-9 w-9 shrink-0 rounded-md bg-surface-border/70" />
        <div className="h-6 w-56 rounded-md bg-surface-border/70" />
      </div>
      <div className="mt-3 h-4 w-full max-w-xl rounded-md bg-surface-border/50" />

      <div className="mt-6">
        <FormCardSkeleton fields={4} />
      </div>
    </div>
  )
}
