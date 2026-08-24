import { Suspense } from 'react'
import { BuilderSpotlight } from '@/components/BuilderSpotlight'
import { LeaderboardFilters } from '@/components/LeaderboardFilters'
import { LeaderboardTable } from '@/components/LeaderboardTable'
import { MomentumChart } from '@/components/MomentumChart'
import { Podium } from '@/components/Podium'
import { RecentEvaluations } from '@/components/RecentEvaluations'
import { SetupNotice } from '@/components/SetupNotice'
import { BoardSkeleton } from '@/components/skeletons'
import { StatCard } from '@/components/StatCard'
import {
  getActiveCycle,
  getCategories,
  getCycleStats,
  getCycles,
  getLeaderboard,
  getMomentum,
  getRecentEvaluations,
  getRoles,
} from '@/lib/leaderboard'
import { formatNumber } from '@/lib/utils'

type SearchParams = { cycle?: string; role?: string; category?: string; q?: string }

async function Board({ searchParams }: { searchParams: SearchParams }) {
  // getActiveCycle doesn't depend on cycles/roles/categories, so it joins the
  // same round trip instead of waiting behind it.
  const [cycles, roles, categories, fallbackActiveCycle] = await Promise.all([
    getCycles(),
    getRoles(),
    getCategories(),
    searchParams.cycle ? Promise.resolve(null) : getActiveCycle(),
  ])
  const activeCycle = searchParams.cycle
    ? cycles.find((cycle) => cycle.id === searchParams.cycle)
    : fallbackActiveCycle

  const [rows, stats] = await Promise.all([
    getLeaderboard({
      cycleId: activeCycle?.id,
      roleSlug: searchParams.role,
      categorySlug: searchParams.category,
      search: searchParams.q,
    }),
    activeCycle
      ? getCycleStats(activeCycle.id)
      : Promise.resolve({
          studentCount: 0,
          activeCount: 0,
          alumniCount: 0,
          evaluationCount: 0,
          perBuilder: 0,
          averageQuality: 0,
        }),
  ])

  const top = rows[0]
  const scored = rows.filter((row) => row.evaluationCount > 0)
  const qualities = scored.map((row) => row.quality)

  // The momentum chart and recent feed both depend on the ranking above, so they
  // can only be issued once it resolves — but they don't depend on each other.
  const [momentum, recent] = await Promise.all([
    activeCycle
      ? getMomentum(
          activeCycle.id,
          scored.slice(0, 2).map((row) => row.studentId),
        )
      : Promise.resolve([]),
    activeCycle ? getRecentEvaluations(activeCycle.id, 5) : Promise.resolve([]),
  ])

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon="users"
          label="Active builders"
          value={stats.studentCount}
          stats={[
            { label: 'Active', value: String(stats.activeCount) },
            { label: 'Alumni', value: String(stats.alumniCount) },
          ]}
        />
        <StatCard
          icon="clipboardCheck"
          label="Evaluations recorded"
          value={stats.evaluationCount}
          stats={[
            { label: 'This cycle', value: String(stats.evaluationCount) },
            { label: 'Per builder', value: String(stats.perBuilder) },
          ]}
        />
        <StatCard
          icon="checkCircle"
          label="Average quality"
          value={`${stats.averageQuality}%`}
          stats={[
            { label: 'Highest', value: qualities.length ? `${Math.max(...qualities)}%` : '—' },
            { label: 'Lowest', value: qualities.length ? `${Math.min(...qualities)}%` : '—' },
          ]}
        />
        <StatCard
          icon="crown"
          label="Current #1"
          value={top?.fullName ?? '—'}
          hint={top ? `${formatNumber(top.totalPoints)} pts · ${top.quality}% quality` : undefined}
        />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MomentumChart series={momentum} cycleName={activeCycle?.name ?? 'this cycle'} />
        </div>
        <div className="flex flex-col gap-4">
          {top ? <BuilderSpotlight row={top} cycleName={activeCycle?.name ?? '—'} /> : null}
          <RecentEvaluations rows={recent} />
        </div>
      </section>

      <div className="mt-6">
        <Podium rows={rows} />
      </div>

      <section className="mt-6 space-y-4">
        <LeaderboardFilters
          cycles={cycles.map((cycle) => ({ value: cycle.id, label: cycle.name }))}
          roles={roles.map((role) => ({ value: role.slug, label: role.name }))}
          categories={categories.map((category) => ({
            value: category.slug,
            label: category.name,
          }))}
        />
        <LeaderboardTable rows={rows} />
      </section>
    </>
  )
}

export default async function HomePage(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = await props.searchParams;
  let content: React.ReactNode
  try {
    content = await Board({ searchParams })
  } catch (error) {
    content = <SetupNotice detail={error instanceof Error ? error.message : undefined} />
  }

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-squid sm:text-4xl">
          Builder Leaderboard
        </h1>
        <p className="mt-3 text-squid/60">
          Performance, evaluation and recognition tracking for the AWS Student Builder community.
          <br className="hidden sm:block" />
          Every score carries a written justification and an audit trail.
        </p>
      </div>

      <Suspense fallback={<BoardSkeleton />}>{content}</Suspense>
    </div>
  )
}
