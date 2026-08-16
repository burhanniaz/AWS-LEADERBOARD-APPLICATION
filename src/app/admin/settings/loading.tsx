import { SettingsSkeleton } from '@/components/skeletons'

export default function SettingsLoading() {
  return (
    <div className="container-page py-8">
      <div className="h-7 w-32 animate-pulse rounded-md bg-surface-border/70" />
      <div className="mt-2 h-4 w-72 animate-pulse rounded-md bg-surface-border/50" />
      <SettingsSkeleton />
    </div>
  )
}
