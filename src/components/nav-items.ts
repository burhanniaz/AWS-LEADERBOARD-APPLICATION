import { LayoutDashboard, ShieldCheck, Trophy, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type NavItem = {
  href: string
  label: string
  icon: LucideIcon
}

export const NAV: NavItem[] = [
  { href: '/', label: 'Leaderboard', icon: Trophy },
  { href: '/students', label: 'Builders', icon: Users },
  { href: '/insights', label: 'Insights', icon: LayoutDashboard },
]

export const ADMIN_ITEM: NavItem = { href: '/admin', label: 'Admin', icon: ShieldCheck }

/**
 * Exact match for the root route, prefix match for everything else — otherwise
 * `/` would light up on every page. Shared by the rail and the mobile menu so
 * the two can't drift apart.
 */
export function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}
