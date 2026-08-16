import Link from 'next/link'
import { Download } from 'lucide-react'
import { PageHeading } from '@/components/PageHeading'
import { SetupNotice } from '@/components/SetupNotice'
import { StatCard } from '@/components/StatCard'
import { getActiveCycle, getCategories, getCycles, getLeaderboard } from '@/lib/leaderboard'
import { formatNumber } from '@/lib/utils'

export const metadata = { title: 'Insights' }

async function Insights({ cycleId }: { cycleId?: string }) {
  const [cycles, categories, fallbackActiveCycle] = await Promise.all([
    getCycles(),
    getCategories(),
    cycleId ? Promise.resolve(null) : getActiveCycle(),
  ])
  const cycle = cycleId ? cycles.find((item) => item.id === cycleId) : fallbackActiveCycle
  if (!cycle) {
    return (
      <div className="card card-pad text-sm text-squid/60">
        Create a cycle in the admin panel to see insights.
      </div>
    )
  }

  const overall = await getLeaderboard({ cycleId: cycle.id })
  const scoredOverall = overall.filter((row) => row.evaluationCount > 0)
  const perCategory = categories.map((category) => ({
    category,
    rows: scoredOverall
      .flatMap((row) => {
        const entry = row.breakdown.find((bucket) => bucket.categoryId === category.id)
        return entry ? [{ studentId: row.studentId, fullName: row.fullName, totalPoints: entry.points }] : []
      })
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 5),
  }))

  const participation = overall.length
    ? Math.round((scoredOverall.length / overall.length) * 100)
    : 0
  const median = scoredOverall.length
    ? scoredOverall[Math.floor(scoredOverall.length / 2)].totalPoints
    : 0

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon="calendar" label="Cycle" value={cycle.name} />
        <StatCard icon="users" label="Builders scored" value={`${scoredOverall.length}/${overall.length}`} />
        <StatCard
          icon="percent"
          label="Participation"
          value={`${participation}%`}
          hint="Have at least one evaluation"
        />
        <StatCard icon="chart" label="Median points" value={formatNumber(median)} />
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {perCategory.map(({ category, rows }, index) => (
          <article
            key={category.id}
            className="card card-pad animate-fade-up transition-shadow hover:shadow-raised"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: category.color }}
                aria-hidden
              />
              <h2 className="font-bold text-squid">{category.name}</h2>
              <span className="ml-auto text-xs text-squid/50">weight ×{category.weight}</span>
            </div>
            {category.description ? (
              <p className="mt-1 text-xs text-squid/50">{category.description}</p>
            ) : null}

            {rows.length === 0 ? (
              <p className="mt-4 text-sm text-squid/50">No scores in this metric yet.</p>
            ) : (
              <ol className="mt-4 space-y-2 text-sm">
                {rows.map((row, index) => (
                  <li key={row.studentId} className="flex items-center gap-3">
                    <span className="w-4 text-xs font-bold tabular-nums text-squid/40">
                      {index + 1}
                    </span>
                    <Link
                      href={`/students/${row.studentId}`}
                      className="min-w-0 flex-1 truncate font-medium text-squid hover:underline"
                    >
                      {row.fullName}
                    </Link>
                    <span className="tabular-nums font-semibold text-squid">
                      {formatNumber(row.totalPoints)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </article>
        ))}
      </section>

      <section className="card card-pad mt-6">
        <h2 className="text-lg font-bold text-squid">Export this cycle</h2>
        <p className="mt-1 max-w-2xl text-sm text-squid/70">
          Download the public leaderboard standings for this cycle.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a className="btn-secondary" href={`/api/export/leaderboard?cycleId=${cycle.id}`}>
            <Download className="h-4 w-4" aria-hidden />
            Leaderboard CSV
          </a>
        </div>
      </section>
    </>
  )
}

export default async function InsightsPage(
  props: {
    searchParams: Promise<{ cycle?: string }>
  }
) {
  const searchParams = await props.searchParams;
  let content: React.ReactNode
  try {
    content = await Insights({ cycleId: searchParams.cycle })
  } catch (error) {
    content = <SetupNotice detail={error instanceof Error ? error.message : undefined} />
  }

  return (
    <div className="container-page py-8 sm:py-10">
      <PageHeading
        eyebrow="AWS UET Taxila"
        title="Insights"
        description="Where the club is strong, where it is thin, and who leads each metric."
      />
      <div className="mt-6">{content}</div>
    </div>
  )
}
