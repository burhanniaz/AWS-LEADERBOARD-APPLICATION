import Link from 'next/link'
import { Download, Mail, UserRound } from 'lucide-react'
import { Avatar } from '@/components/Avatar'
import type { LeaderboardRow } from '@/lib/leaderboard'
import { departmentLabel, formatNumber, pluralize } from '@/lib/utils'

/**
 * Leader card: the current rank #1 plus a membership tile. The reference shows
 * four round actions (Profile / Compare / Export / History); only three of those
 * map to something this app can actually do, and a button that does nothing is
 * worse than an absent one — so Compare and History are left out until the
 * features exist.
 */
export function BuilderSpotlight({ row, cycleName }: { row: LeaderboardRow; cycleName: string }) {
  return (
    <section className="card card-pad">
      <div className="flex items-start justify-between gap-3">
        <span className="pill-mono">Rank {String(row.rank).padStart(2, '0')}</span>
        <span className="font-mono text-xs text-squid/40">
          {pluralize(row.evaluationCount, 'evaluation')}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Avatar name={row.fullName} size="lg" className="ring-4 ring-smile/30" />
        <div className="min-w-0">
          <p className="truncate font-bold text-squid">{row.fullName}</p>
          <p className="truncate text-xs text-squid/50">
            {[row.roleName, departmentLabel(row.department)].filter(Boolean).join(' · ') ||
              'Unassigned'}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <SpotlightAction href={`/students/${row.studentId}`} label="Profile">
          <UserRound className="h-4 w-4" aria-hidden />
        </SpotlightAction>
        <SpotlightAction href={`mailto:${row.email}`} label="Email">
          <Mail className="h-4 w-4" aria-hidden />
        </SpotlightAction>
        <SpotlightAction href="/api/export/leaderboard" label="Export">
          <Download className="h-4 w-4" aria-hidden />
        </SpotlightAction>
      </div>

      <div className="glow-field mt-5 rounded-2xl bg-header p-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/45">
            AWS UET Taxila
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">ID</span>
        </div>
        <p className="mt-6 truncate text-lg font-bold">{row.fullName}</p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <span className="min-w-0">
            <span className="block font-mono text-[10px] uppercase tracking-widest text-white/45">
              Cycle
            </span>
            <span className="block truncate text-sm font-semibold">{cycleName}</span>
          </span>
          <span className="min-w-0 text-right">
            <span className="block font-mono text-[10px] uppercase tracking-widest text-white/45">
              Builder since
            </span>
            <span className="block truncate font-mono text-sm font-semibold">
              {new Date(row.joinedAt).toLocaleDateString(undefined, {
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </span>
        </div>
      </div>

      <p className="mt-4 text-center">
        <span className="font-mono text-2xl font-bold tabular-nums text-smile-dark dark:text-smile">
          {formatNumber(row.totalPoints)}
        </span>
        <span className="ml-1.5 font-mono text-[10px] uppercase tracking-widest text-squid/40">
          pts · {row.quality}% quality
        </span>
      </p>
    </section>
  )
}

function SpotlightAction({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  const className =
    'flex flex-col items-center gap-1.5 rounded-xl border border-surface-border bg-surface/50 py-2.5 text-[11px] font-medium text-squid/60 transition-colors hover:bg-surface hover:text-squid'

  if (href.startsWith('mailto:') || href.startsWith('/api/')) {
    return (
      <a href={href} className={className}>
        {children}
        {label}
      </a>
    )
  }

  return (
    <Link href={href} className={className}>
      {children}
      {label}
    </Link>
  )
}
