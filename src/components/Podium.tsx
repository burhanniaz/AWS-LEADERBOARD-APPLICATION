import Link from 'next/link'
import { Crown, Medal } from 'lucide-react'
import { Avatar } from '@/components/Avatar'
import type { LeaderboardRow } from '@/lib/leaderboard'
import { cn, formatNumber } from '@/lib/utils'

const PODIUM_STYLE: Record<number, { order: string; lift: string; ring: string; badge: string }> = {
  1: {
    order: 'sm:order-2',
    lift: 'sm:-translate-y-4',
    ring: 'ring-4 ring-smile/50',
    badge: 'bg-gradient-to-br from-smile to-smile-dark text-white',
  },
  2: {
    order: 'sm:order-1',
    lift: '',
    ring: 'ring-2 ring-surface-border',
    badge: 'bg-[#C0C6CE] text-squid',
  },
  3: {
    order: 'sm:order-3',
    lift: '',
    ring: 'ring-2 ring-surface-border',
    badge: 'bg-[#CD8B62] text-white',
  },
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
            className={cn(
              'card card-pad group relative flex animate-scale-in flex-col items-center text-center transition-shadow hover:shadow-raised',
              style.order,
              style.lift,
            )}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <span
              className={cn(
                'absolute -top-3 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shadow-raised',
                style.badge,
              )}
            >
              {rank}
            </span>
            {rank === 1 ? (
              <Crown className="mb-1 h-5 w-5 text-smile" aria-hidden />
            ) : (
              <Medal className="mb-1 h-5 w-5 text-squid/30" aria-hidden />
            )}
            <Avatar name={row.fullName} size={rank === 1 ? 'xl' : 'lg'} className={style.ring} />
            <p className="mt-3 truncate font-semibold text-squid">{row.fullName}</p>
            <p className="truncate text-xs text-squid/50">{row.roleName ?? 'Unassigned'}</p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-squid">
              {formatNumber(row.totalPoints)}
              <span className="ml-1 text-xs font-medium text-squid/40">pts</span>
            </p>
          </Link>
        )
      })}
    </section>
  )
}
