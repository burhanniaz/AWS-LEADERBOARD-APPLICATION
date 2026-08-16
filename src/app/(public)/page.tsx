import { Suspense } from 'react'
import { LeaderboardFilters } from '@/components/LeaderboardFilters'
import { LeaderboardTable } from '@/components/LeaderboardTable'
import { Podium } from '@/components/Podium'
import { SetupNotice } from '@/components/SetupNotice'
import { BoardSkeleton } from '@/components/skeletons'
import { StatCard } from '@/components/StatCard'
import {
  getActiveCycle,
  getCategories,
  getCycleStats,
  getCycles,
  getLeaderboard,
  getRoles,
} from '@/lib/leaderboard'

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
      : Promise.resolve({ studentCount: 0, evaluationCount: 0, averageQuality: 0 }),
  ])

  const top = rows[0]

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon="users" label="Active builders" value={stats.studentCount} />
        <StatCard
          icon="clipboardCheck"
          label="Evaluations recorded"
          value={stats.evaluationCount}
          hint={activeCycle?.name}
        />
        <StatCard icon="checkCircle" label="Average quality" value={`${stats.averageQuality}%`} />
        <StatCard
          icon="crown"
          label="Current #1"
          value={top?.fullName ?? '—'}
          hint={top ? `${top.totalPoints} pts` : undefined}
        />
      </section>

      <Podium rows={rows} />

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
        <p className="text-sm font-semibold uppercase tracking-widest text-smile-dark">
          AWS UET Taxila
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-squid sm:text-4xl">
          Builder Leaderboard
        </h1>
   
      </div>

      <Suspense fallback={<BoardSkeleton />}>{content}</Suspense>
    </div>
  )
}
