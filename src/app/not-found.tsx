import Link from 'next/link'
import { Compass, Trophy } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen animate-fade-in flex-col items-center justify-center px-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-smile/10 text-smile">
        <Compass className="h-7 w-7" aria-hidden />
      </span>
      <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-smile-dark">404</p>
      <h1 className="mt-2 text-3xl font-bold text-squid">Page not found</h1>
      <p className="mt-2 max-w-md text-squid/60">
        That page does not exist, or the record has been removed.
      </p>
      <Link href="/" className="btn-primary mt-6">
        <Trophy className="h-4 w-4" aria-hidden />
        Back to leaderboard
      </Link>
    </div>
  )
}
