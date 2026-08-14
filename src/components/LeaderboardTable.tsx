import Link from 'next/link'
import { SearchX } from 'lucide-react'
import { Avatar } from '@/components/Avatar'
import { ColorBadge } from '@/components/ColorBadge'
import { RankBadge } from '@/components/RankBadge'
import type { LeaderboardRow } from '@/lib/leaderboard'
import { departmentLabel, formatNumber, pluralize } from '@/lib/utils'

export function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="card card-pad flex flex-col items-center gap-2 py-10 text-center animate-fade-in">
        <SearchX className="h-8 w-8 text-squid/30" aria-hidden />
        <p className="text-sm font-semibold text-squid">No builders match these filters yet.</p>
        <p className="text-sm text-squid/60">
          Add builders and record evaluations from the admin panel to populate the board.
        </p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      {/* Desktop table */}
      <div className="table-wrap hidden md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-surface-muted text-left">
              <th scope="col" className="w-20 px-4 py-3 font-semibold text-squid/70">
                Rank
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-squid/70">
                Builder
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-squid/70">
                Role
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-squid/70">
                Breakdown
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold text-squid/70">
                Quality
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold text-squid/70">
                Points
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.studentId}
                className="animate-fade-up border-b border-surface-border/70 last:border-0 transition-colors hover:bg-surface-muted/60"
                style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
              >
                <td className="px-4 py-3">
                  <RankBadge rank={row.rank} />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/students/${row.studentId}`}
                    className="flex items-center gap-3 hover:underline"
                  >
                    <Avatar name={row.fullName} size="sm" />
                    <span>
                      <span className="block font-semibold text-squid">{row.fullName}</span>
                      <span className="block text-xs text-squid/50">
                        {departmentLabel(row.department) ?? row.email}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {row.roleName ? (
                    <ColorBadge color={row.roleColor}>{row.roleName}</ColorBadge>
                  ) : (
                    <span className="text-xs text-squid/60">Unassigned</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div
                    className="flex h-2 w-40 overflow-hidden rounded-full bg-surface-muted"
                    role="img"
                    aria-label={row.breakdown
                      .map((bucket) => `${bucket.name}: ${formatNumber(bucket.points)} points`)
                      .join(', ')}
                  >
                    {row.breakdown.map((bucket) => (
                      <span
                        key={bucket.categoryId}
                        title={`${bucket.name}: ${formatNumber(bucket.points)} pts`}
                        className="transition-all duration-500"
                        style={{
                          backgroundColor: bucket.color,
                          width: `${row.totalPoints ? (bucket.points / row.totalPoints) * 100 : 0}%`,
                        }}
                      />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-squid/70">{row.quality}%</td>
                <td className="px-4 py-3 text-right text-base font-bold tabular-nums text-squid">
                  {formatNumber(row.totalPoints)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="divide-y divide-surface-border md:hidden">
        {rows.map((row, index) => (
          <li key={row.studentId} className="animate-fade-up" style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}>
            <Link
              href={`/students/${row.studentId}`}
              className="flex items-center gap-3 p-4 transition-colors active:bg-surface-muted"
            >
              <RankBadge rank={row.rank} />
              <Avatar name={row.fullName} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-squid">{row.fullName}</p>
                <p className="truncate text-xs text-squid/50">
                  {row.roleName ?? 'Unassigned'} · {pluralize(row.evaluationCount, 'evaluation')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold tabular-nums text-squid">
                  {formatNumber(row.totalPoints)}
                </p>
                <p className="text-xs text-squid/50">{row.quality}%</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
