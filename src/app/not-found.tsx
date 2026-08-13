import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-smile-dark">404</p>
      <h1 className="mt-2 text-3xl font-bold text-squid">Page not found</h1>
      <p className="mt-2 max-w-md text-squid/60">
        That page does not exist, or the record has been removed.
      </p>
      <Link href="/" className="btn-primary mt-6">
        Back to leaderboard
      </Link>
    </div>
  )
}
