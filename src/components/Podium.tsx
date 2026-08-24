import Link from 'next/link'
import { Crown, Medal } from 'lucide-react'
import { Avatar } from '@/components/Avatar'
import type { LeaderboardRow } from '@/lib/leaderboard'
import { cn, formatNumber } from '@/lib/utils'

const PODIUM_STYLE: Record<number, { order: string; lift: string; ring: string; surface: string }> = {
  1: {
    order: 'sm:order-2',
    lift: 'sm:-translate-y-4',
    ring: 'ring-4 ring-smile/40',
    // The leader's card carries a warm wash and an accent border instead of a
    // medal, so the winner reads at a glance without a third colour system.
    surface: 'border-smile/40 bg-gradient-to-b from-smile/15 to-smile/[0.03]',
  },
  2: { order: 'sm:order-1', lift: '', ring: 'ring-2 ring-surface-border', surface: '' },
  3: { order: 'sm:order-3', lift: '', ring: 'ring-2 ring-surface-border', surface: '' },
}

export function Podium({ rows }: { rows: LeaderboardRow[] }) {
  const top = rows.filter((row) => row.evaluationCount > 0).slice(0, 3)
  if (top.length < 3) return null

  return (
    <section className="mb-6 grid gap-4 sm:grid-cols-3 sm:items-end">
      {top.map((row, index) => {
        const rank = index + 1
        const style = PODIUM_STYLE[rank]
        return (
          <Link
            key={row.studentId}
            href={`/students/${row.studentId}`}
            // The podium winners are the most-clicked profiles on the board, so
            // prefetch their full profile (data included). The rest of the
            // table stays on the default shell-only prefetch to avoid firing a
            // profile fetch for every visible row.
            prefetch
            className={cn(
              'card card-pad group flex animate-scale-in flex-col items-center text-center transition-shadow hover:shadow-raised',
              style.order,
              style.lift,
              style.surface,
            )}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <span className="pill-mono mb-3">
              {rank === 1 ? (
                <Crown className="h-3 w-3" aria-hidden />
              ) : (
                <Medal className="h-3 w-3" aria-hidden />
              )}
              {String(rank).padStart(2, '0')}
            </span>
            <Avatar
              name={row.fullName}
              size={rank === 1 ? 'xl' : 'lg'}
              className={cn(style.ring, rank === 1 && 'bg-smile text-white')}
            />
            <p className="mt-3 truncate font-semibold text-squid">{row.fullName}</p>
            <p className="truncate text-xs text-squid/50">{row.roleName ?? 'Unassigned'}</p>
            <p
              className={cn(
                'mt-2 font-mono text-2xl font-bold tabular-nums',
                rank === 1 ? 'text-smile-dark dark:text-smile' : 'text-squid',
              )}
            >
              {formatNumber(row.totalPoints)}
              <span className="ml-1 font-sans text-[10px] font-semibold uppercase tracking-widest text-squid/40">
                pts
              </span>
            </p>
          </Link>
        )
      })}
    </section>
  )
}
