import { FormCardSkeleton } from '@/components/skeletons'

export default function NewStudentLoading() {
  return (
    <div className="container-page max-w-4xl animate-pulse py-8">
      <div className="h-4 w-32 rounded-md bg-surface-border/50" />
      <div className="mt-3 h-7 w-40 rounded-md bg-surface-border/70" />
      <div className="mt-6">
        <FormCardSkeleton fields={8} />
      </div>
    </div>
  )
}
