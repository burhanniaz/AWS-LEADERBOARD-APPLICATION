import { FormCardSkeleton } from '@/components/skeletons'

export default function EditStudentLoading() {
  return (
    <div className="container-page max-w-4xl animate-pulse py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="h-4 w-32 rounded-md bg-surface-border/50" />
        <div className="h-4 w-36 rounded-md bg-surface-border/50" />
      </div>
      <div className="mt-3 h-7 w-56 rounded-md bg-surface-border/70" />
      <div className="mt-6">
        <FormCardSkeleton fields={8} />
      </div>
    </div>
  )
}
