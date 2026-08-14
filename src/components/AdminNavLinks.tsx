'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ClipboardList, LayoutDashboard, Menu, Settings, Users, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/students', label: 'Builders', icon: Users, exact: false },
  { href: '/admin/evaluations', label: 'Evaluations', icon: ClipboardList, exact: false },
  { href: '/admin/settings', label: 'Settings', icon: Settings, exact: false },
]

function useActiveNav() {
  const pathname = usePathname()
  return (href: string, exact: boolean) => (exact ? pathname === href : pathname.startsWith(href))
}

export function AdminNavLinks() {
  const isActive = useActiveNav()

  return (
    <>
      {NAV.map((item) => {
        const active = isActive(item.href, item.exact)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 font-medium transition-colors',
              active ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white',
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {item.label}
          </Link>
        )
      })}
    </>
  )
}

export function AdminMobileNav() {
  const isActive = useActiveNav()
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/10 hover:text-white"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-16 z-40 animate-slide-down border-b border-white/10 bg-header shadow-raised">
          <nav className="container-page flex flex-col gap-1 py-3 text-sm">
            {NAV.map((item) => {
              const active = isActive(item.href, item.exact)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-3 py-2.5 font-medium transition-colors',
                    active ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white',
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      ) : null}
    </div>
  )
}
