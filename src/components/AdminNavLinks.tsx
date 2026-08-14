'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ClipboardList, LayoutDashboard, Settings, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/students', label: 'Builders', icon: Users, exact: false },
  { href: '/admin/evaluations', label: 'Evaluations', icon: ClipboardList, exact: false },
  { href: '/admin/settings', label: 'Settings', icon: Settings, exact: false },
]

export function AdminNavLinks() {
  const pathname = usePathname()

  return (
    <>
      {NAV.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
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
