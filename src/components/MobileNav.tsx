'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { ADMIN_ITEM, NAV, isActive } from '@/components/nav-items'
import { cn } from '@/lib/utils'

/**
 * The sub-md counterpart to `AppRail` — a hamburger that drops an ink panel
 * below the top bar. Gated `md:hidden` so it and the rail never both show.
 */
export function MobileNav({ isAuthed }: { isAuthed: boolean }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const items = isAuthed ? [...NAV, ADMIN_ITEM] : NAV

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-md text-squid/70 transition-colors hover:bg-squid/10 hover:text-squid"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-16 z-40 animate-slide-down border-b border-white/10 bg-header shadow-raised supports-[backdrop-filter]:bg-header/55 supports-[backdrop-filter]:backdrop-blur-xl supports-[backdrop-filter]:backdrop-saturate-150">
          <nav aria-label="Primary" className="container-page flex flex-col gap-1 py-3 text-sm">
            {items.map((item) => {
              const active = isActive(pathname, item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-3 py-2.5 font-medium transition-colors',
                    active
                      ? 'bg-white/15 text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white',
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {item.label}
                </Link>
              )
            })}
            {!isAuthed ? (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="mt-1 flex items-center gap-2.5 rounded-md bg-smile px-3 py-2.5 font-semibold text-white transition-colors hover:bg-smile-light"
              >
                <ADMIN_ITEM.icon className="h-4 w-4" aria-hidden />
                Sign in
              </Link>
            ) : null}
          </nav>
        </div>
      ) : null}
    </div>
  )
}
