'use client'

import { usePathname } from 'next/navigation'

/**
 * Wraps route content and replays a calm reveal on every navigation.
 *
 * The `key={pathname}` remounts the inner element whenever the route changes,
 * which restarts the `page-in` animation (soft fade + gentle rise + clearing
 * blur). Purely presentational — no layout shift, and it collapses to an
 * instant swap under `prefers-reduced-motion` (see globals.css).
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div key={pathname} className="animate-page-in">
      {children}
    </div>
  )
}
