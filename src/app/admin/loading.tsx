// Same idea as (public)/loading.tsx: keeps the admin header/nav painted
// while only the page body shows this skeleton during navigation.
export default function AdminLoading() {
  return (
    <div className="container-page animate-pulse py-8">
      <div className="mb-6 h-7 w-48 rounded-md bg-surface-border/70" />
      <div className="card h-96" />
    </div>
  )
}
