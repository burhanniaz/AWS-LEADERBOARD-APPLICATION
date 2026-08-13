import { Suspense } from 'react'
import { LeaderboardFilters } from '@/components/LeaderboardFilters'
import { LeaderboardTable } from '@/components/LeaderboardTable'
import { SetupNotice } from '@/components/SetupNotice'
import { StatCard } from '@/components/StatCard'
import {
  getActiveCycle,
  getCategories,
  getCycleStats,
  getCycles,
  getLeaderboard,
  getRoles,
} from '@/lib/leaderboard'

export const dynamic = 'force-dynamic'

type SearchParams = { cycle?: string; role?: string; category?: string; q?: string }

async function Board({ searchParams }: { searchParams: SearchParams }) {
  const [cycles, roles, categories] = await Promise.all([getCycles(), getRoles(), getCategories()])
  const activeCycle = searchParams.cycle
    ? cycles.find((cycle) => cycle.id === searchParams.cycle)
    : await getActiveCycle()

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
        <StatCard label="Active builders" value={stats.studentCount} />
        <StatCard
          label="Evaluations recorded"
          value={stats.evaluationCount}
          hint={activeCycle?.name}
        />
        <StatCard label="Average quality" value={`${stats.averageQuality}%`} />
        <StatCard label="Current #1" value={top?.fullName ?? '—'} hint={top ? `${top.totalPoints} pts` : undefined} />
      </section>

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

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
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
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-squid sm:text-4xl">
          Builder Leaderboard
        </h1>
   
      </div>

      <Suspense fallback={<div className="card card-pad">Loading board…</div>}>{content}</Suspense>
    </div>
  )
}
