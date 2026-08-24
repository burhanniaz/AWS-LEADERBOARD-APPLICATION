'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, HelpCircle, Search } from 'lucide-react'
import { Avatar } from '@/components/Avatar'
import { MobileNav } from '@/components/MobileNav'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ADMIN_ITEM, NAV, isActive } from '@/components/nav-items'

/**
 * Slim bar above the page body. The title is deliberately not an `<h1>` — each
 * page already renders one via `PageHeading`, and a second would compete with
 * it in the document outline.
 *
 * `title` is optional: the public layout is shared by three routes, so when it
 * is omitted the label is derived from the active nav item instead. Admin
 * pages pass an explicit one.
 *
 * The search / bell / help cluster is presentational for now; it matches the
 * reference's icon grouping without claiming behavior that doesn't exist yet.
 */
export function TopBar({
  title,
  pill,
  isAuthed = false,
  userName,
  mobileNav,
  actions,
  below,
}: {
  title?: string
  pill?: string
  isAuthed?: boolean
  userName?: string
  /** Overrides the default public menu — admin swaps in its own section nav. */
  mobileNav?: React.ReactNode
  /** Replaces the presentational search/bell/help cluster. */
  actions?: React.ReactNode
  /** Secondary row under the bar, e.g. the admin section nav. */
  below?: React.ReactNode
}) {
  const pathname = usePathname()
  const resolvedTitle =
    title ??
    [...NAV, ADMIN_ITEM].find((item) => isActive(pathname, item.href))?.label ??
    'Leaderboard'

  return (
    <header className="sticky top-0 z-30 border-b border-surface-border bg-surface/70 backdrop-blur-xl backdrop-saturate-150 dark:bg-header/85">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {mobileNav ?? <MobileNav isAuthed={isAuthed} />}
          <span className="truncate text-lg font-extrabold tracking-tight text-squid">
            {resolvedTitle}
          </span>
          {pill ? (
            <span className="badge hidden bg-smile/10 text-smile sm:inline-flex">{pill}</span>
          ) : null}
        </div>

        <div className="flex items-center gap-1">
          {actions ?? (
            <span className="hidden items-center gap-1 sm:flex">
              <IconButton label="Search">
                <Search className="h-4 w-4" aria-hidden />
              </IconButton>
              <IconButton label="Notifications">
                <Bell className="h-4 w-4" aria-hidden />
              </IconButton>
              <IconButton label="Help">
                <HelpCircle className="h-4 w-4" aria-hidden />
              </IconButton>
            </span>
          )}

          <ThemeToggle tone="surface" className="md:hidden" />

          {isAuthed && userName ? (
            <Avatar name={userName} size="sm" className="ml-1" />
          ) : (
            <Link
              href="/login"
              className="ml-1 rounded-md px-3 py-1.5 text-sm font-semibold text-squid/70 transition-colors hover:bg-squid/10 hover:text-squid"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
      {below ? <div className="border-t border-surface-border">{below}</div> : null}
    </header>
  )
}

function IconButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-md text-squid/60 transition-colors hover:bg-squid/10 hover:text-squid"
    >
      {children}
    </button>
  )
}
