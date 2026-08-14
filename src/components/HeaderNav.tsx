'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Menu, ShieldCheck, Trophy, Users, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ThemeToggle'

const NAV = [
  { href: '/', label: 'Leaderboard', icon: Trophy },
  { href: '/students', label: 'Builders', icon: Users },
  { href: '/insights', label: 'Insights', icon: LayoutDashboard },
]

export function HeaderNav({ isAuthed }: { isAuthed: boolean }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      <nav className="hidden items-center gap-1 text-sm md:flex">
        {NAV.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-2 font-medium transition-colors',
                active ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white',
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {item.label}
            </Link>
          )
        })}
        <ThemeToggle className="ml-1" />
        <Link
          href={isAuthed ? '/admin' : '/login'}
          className="ml-2 flex items-center gap-1.5 rounded-md bg-smile px-3 py-2 font-semibold text-white transition-colors hover:bg-smile-light"
        >
          <ShieldCheck className="h-4 w-4" aria-hidden />
          {isAuthed ? 'Admin' : 'Sign in'}
        </Link>
      </nav>

      <div className="flex items-center gap-1 md:hidden">
        <ThemeToggle />
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="absolute inset-x-0 top-16 z-40 animate-slide-down border-b border-white/10 bg-ink shadow-raised md:hidden">
          <nav className="container-page flex flex-col gap-1 py-3 text-sm">
            {NAV.map((item) => {
              const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
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
            <Link
              href={isAuthed ? '/admin' : '/login'}
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center gap-2.5 rounded-md bg-smile px-3 py-2.5 font-semibold text-white transition-colors hover:bg-smile-light"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden />
              {isAuthed ? 'Admin' : 'Sign in'}
            </Link>
          </nav>
        </div>
      ) : null}
    </>
  )
}
