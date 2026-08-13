// Next wraps the route in a Suspense boundary using this file automatically,
// so the (public) layout (header/footer) paints immediately on navigation
// and this skeleton fills the content area instead of a blank screen while
// the new page's data loads — no manual Suspense wiring needed.
export default function PublicLoading() {
  return (
    <div className="container-page animate-pulse py-8 sm:py-10">
      <div className="mb-8 h-8 w-64 rounded-md bg-surface-border/70" />

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
