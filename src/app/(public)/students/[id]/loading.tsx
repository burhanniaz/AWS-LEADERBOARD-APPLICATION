import { ProfileSkeleton } from '@/components/skeletons'

export default function StudentProfileLoading() {
  return (
    <div className="container-page py-8 sm:py-10">
      <div className="h-5 w-40 animate-pulse rounded-md bg-surface-border/70" />
      <div className="mt-4">
        <ProfileSkeleton />
      </div>
    </div>
  )
}
