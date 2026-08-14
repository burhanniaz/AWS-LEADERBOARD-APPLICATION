// Next wraps the route in a Suspense boundary using this file automatically,
// so the (public) layout (header/footer) paints immediately on navigation
// and this skeleton fills the content area instead of a blank screen while
// the new page's data loads — no manual Suspense wiring needed.
import { BoardSkeleton } from '@/components/skeletons'

export default function PublicLoading() {
  return (
    <div className="container-page py-8 sm:py-10">
      <div className="mb-8 h-8 w-64 animate-pulse rounded-md bg-surface-border/70" />
      <BoardSkeleton />
    </div>
  )
}
