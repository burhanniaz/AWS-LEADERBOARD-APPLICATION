import Link from 'next/link'
import { Download } from 'lucide-react'
import { ParticipationRing } from '@/components/ParticipationRing'
import { StatCard } from '@/components/StatCard'
import { getCategories, getLeaderboard } from '@/lib/leaderboard'
import type { Cycle } from '@/lib/db-types'
import { formatNumber } from '@/lib/utils'

/**
 * The Insights block: participation gauge, cycle stats, per-category leaders and
 * the export card. Shared verbatim between the Insights page and the foot of the
 * leaderboard. It fetches its own data from the (cached) data layer keyed by
 * cycle, so callers only pass the cycle — no prop-drilling of rows/categories.
 */
export async function InsightsSection({ cycle }: { cycle: Cycle }) {
  const [categories, overall] = await Promise.all([
    getCategories(),
    getLeaderboard({ cycleId: cycle.id }),
  ])

  const scoredOverall = overall.filter((row) => row.evaluationCount > 0)
  const participation = overall.length
    ? Math.round((scoredOverall.length / overall.length) * 100)
    : 0
  const median = scoredOverall.length
    ? scoredOverall[Math.floor(scoredOverall.length / 2)].totalPoints
    : 0

  const perCategory = categories.map((category) => ({
    category,
    rows: scoredOverall
      .flatMap((row) => {
        const entry = row.breakdown.find((bucket) => bucket.categoryId === category.id)
        return entry
          ? [{ studentId: row.studentId, fullName: row.fullName, totalPoints: entry.points }]
          : []
      })
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 5),
  }))

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ParticipationRing percent={participation} scored={scoredOverall.length} pool={overall.length} />
        <StatCard icon="calendar" label="Cycle" value={cycle.name} />
        <StatCard
          icon="users"
          label="Builders scored"
          value={`${scoredOverall.length}/${overall.length}`}
        />
        <StatCard icon="chart" label="Median points" value={formatNumber(median)} />
      </section>

      <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {perCategory.map(({ category, rows }, index) => (
          <article
            key={category.id}
            className="card card-pad animate-fade-up transition-shadow hover:shadow-raised"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                // The category colour is only ever a tint behind a theme-safe
                // glyph — an admin-picked hex can't be trusted as a text colour.
                style={{ backgroundColor: `${category.color}1F`, color: category.color }}
                aria-hidden
              >
                <span className="h-2.5 w-2.5 rounded-sm bg-current" />
              </span>
              <h3 className="font-bold text-squid">{category.name}</h3>
              <span className="ml-auto font-mono text-xs text-squid/40">×{category.weight}</span>
            </div>
            {category.description ? (
              <p className="mt-2 text-xs leading-relaxed text-squid/50">{category.description}</p>
            ) : null}

            {rows.length === 0 ? (
              <p className="mt-4 text-sm text-squid/50">No scores in this metric yet.</p>
            ) : (
              <ol className="mt-4 space-y-2.5 text-sm">
                {rows.map((row, rank) => (
                  <li key={row.studentId} className="flex items-center gap-3">
                    <span className="w-4 font-mono text-xs tabular-nums text-squid/35">
                      {rank + 1}
                    </span>
                    <Link
                      href={`/students/${row.studentId}`}
                      className="min-w-0 flex-1 truncate text-squid hover:underline"
                    >
                      {row.fullName}
                    </Link>
                    <span className="font-mono font-semibold tabular-nums text-squid">
                      {formatNumber(row.totalPoints)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </article>
        ))}

        <section className="card card-pad flex flex-col justify-center">
          <h3 className="text-lg font-bold text-squid">Export this cycle</h3>
          <p className="mt-1 text-sm text-squid/70">
            Download the public leaderboard standings for {cycle.name}.
          </p>
          <div className="mt-4">
            <a className="btn-primary" href={`/api/export/leaderboard?cycleId=${cycle.id}`}>
              <Download className="h-4 w-4" aria-hidden />
              Leaderboard CSV
            </a>
          </div>
        </section>
      </section>
    </>
  )
}
