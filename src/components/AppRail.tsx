'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogIn } from 'lucide-react'
import { AwsMark } from '@/components/Brand'
import { Avatar } from '@/components/Avatar'
import { ThemeToggle } from '@/components/ThemeToggle'
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
    <aside className="sticky top-0 z-40 hidden h-screen w-[76px] shrink-0 flex-col items-center gap-6 border-r border-white/10 bg-header py-5 text-white md:flex">
      <Link
        href="/"
        aria-label="AWS UET Taxila — Builder Leaderboard"
        className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform hover:scale-105"
      >
        <AwsMark className="h-9 w-9" />
      </Link>

      <nav aria-label="Primary" className="flex flex-1 flex-col items-center gap-2">
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
                'flex h-11 w-11 items-center justify-center rounded-xl transition-colors',
                active
                  ? 'bg-gradient-to-br from-smile-light to-smile-dark text-white shadow-glow'
                  : 'text-white/60 hover:bg-white/10 hover:text-white',
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </Link>
          )
        })}
      </nav>

      <div className="flex flex-col items-center gap-2">
        <ThemeToggle />
        {isAuthed && userName ? (
          <Link href="/admin" title={userName} aria-label={`Signed in as ${userName}`}>
            <Avatar name={userName} size="sm" className="ring-2 ring-white/15" />
          </Link>
        ) : (
          <Link
            href="/login"
            title="Sign in"
            aria-label="Sign in"
            className="flex h-9 w-9 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogIn className="h-4 w-4" aria-hidden />
          </Link>
        )}
      </div>
    </aside>
  )
}
