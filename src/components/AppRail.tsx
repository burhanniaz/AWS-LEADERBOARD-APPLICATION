'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HelpCircle, LogIn } from 'lucide-react'
import { BrandTile } from '@/components/Brand'
import { Avatar } from '@/components/Avatar'
import { ADMIN_ITEM, NAV, isActive } from '@/components/nav-items'
import { cn } from '@/lib/utils'

/**
 * Fixed icon rail — the primary navigation on md and up. Below that breakpoint
 * it hides entirely and `MobileNav` (inside `TopBar`) takes over, so the two
 * are never on screen at once.
 *
 * The rail sits on the ink band in both themes, which is why its contents are
 * styled white-on-ink rather than with the theme-flipping `squid` token.
 */
export function AppRail({ isAuthed, userName }: { isAuthed: boolean; userName?: string }) {
  const pathname = usePathname()
  const items = isAuthed ? [...NAV, ADMIN_ITEM] : NAV

  return (
    <aside className="sticky top-0 z-40 hidden h-screen w-[60px] shrink-0 flex-col items-center border-r border-white/10 bg-gradient-to-b from-[#4a3d30] to-[#291f17] py-4 text-white supports-[backdrop-filter]:from-[#4a3d30]/85 supports-[backdrop-filter]:to-[#291f17]/85 supports-[backdrop-filter]:backdrop-blur-xl supports-[backdrop-filter]:backdrop-saturate-150 md:flex">
      <Link
        href="/"
        aria-label="AWS UET Taxila — Builder Leaderboard"
        className="transition-transform hover:scale-105"
      >
        <BrandTile className="h-10 w-10" />
      </Link>

      <span className="my-4 h-px w-7 bg-white/10" aria-hidden />

      <nav aria-label="Primary" className="flex flex-1 flex-col items-center gap-1.5">
        {items.map((item) => {
          const active = isActive(pathname, item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
                active
                  ? 'bg-gradient-to-br from-smile to-smile-dark text-white shadow-glow'
                  : 'text-white/45 hover:bg-white/10 hover:text-white',
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </Link>
          )
        })}
      </nav>

      <div className="flex flex-col items-center gap-3">
        <a
          href="mailto:burhanniaz72@gmail.com?subject=AWS%20Builder%20Leaderboard"
          title="Help"
          aria-label="Help"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white/45 transition-colors hover:bg-white/10 hover:text-white"
        >
          <HelpCircle className="h-5 w-5" aria-hidden />
        </a>
        {isAuthed && userName ? (
          <Link href="/admin" title={userName} aria-label={`Signed in as ${userName}`}>
            <Avatar name={userName} size="sm" square className="ring-2 ring-white/15" />
          </Link>
        ) : (
          <Link
            href="/login"
            title="Sign in"
            aria-label="Sign in"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/45 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogIn className="h-5 w-5" aria-hidden />
          </Link>
        )}
      </div>
    </aside>
  )
}
