import Link from 'next/link'
import { StatCard } from '@/components/StatCard'
import { SetupNotice } from '@/components/SetupNotice'
import { sql } from '@/lib/db'
import { getActiveCycle } from '@/lib/leaderboard'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin overview' }

async function Overview() {
  const cycle = await getActiveCycle()
  const [[{ count: students }], [{ count: evaluations }], [{ count: unscored }]] = await Promise.all([
    sql<{ count: number }[]>`SELECT COUNT(*)::int as count FROM "Student" WHERE status = 'ACTIVE'`,
    cycle
      ? sql<{ count: number }[]>`SELECT COUNT(*)::int as count FROM "Evaluation" WHERE "cycleId" = ${cycle.id}`
      : Promise.resolve([{ count: 0 }]),
    cycle
      ? sql<{ count: number }[]>`
          SELECT COUNT(*)::int as count FROM "Student" s
          WHERE s.status = 'ACTIVE'
            AND NOT EXISTS (SELECT 1 FROM "Evaluation" e WHERE e."studentId" = s.id AND e."cycleId" = ${cycle.id})
        `
      : Promise.resolve([{ count: 0 }]),
  ])

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active builders" value={students} />
        <StatCard label="Evaluations this cycle" value={evaluations} hint={cycle?.name} />
        <StatCard label="Not yet scored" value={unscored} hint="Builders with zero evaluations" />
        <StatCard label="Active cycle" value={cycle?.name ?? 'None'} />
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link href="/admin/students/new" className="card card-pad hover:shadow-raised">
          <p className="font-bold text-squid">Add a builder</p>
          <p className="mt-1 text-sm text-squid/60">Register someone and assign their role.</p>
        </Link>
        <Link href="/admin/evaluations" className="card card-pad hover:shadow-raised">
          <p className="font-bold text-squid">Record an evaluation</p>
          <p className="mt-1 text-sm text-squid/60">Score work with a written justification.</p>
        </Link>
        <Link href="/admin/settings" className="card card-pad hover:shadow-raised">
          <p className="font-bold text-squid">Metrics &amp; cycles</p>
          <p className="mt-1 text-sm text-squid/60">Tune weights, roles and the active session.</p>
        </Link>
      </section>
    </>
  )
}

export default async function AdminHome() {
  let content: React.ReactNode
  try {
    content = await Overview()
  } catch (error) {
    content = <SetupNotice detail={error instanceof Error ? error.message : undefined} />
  }

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold text-squid">Overview</h1>
      <div className="mt-6">{content}</div>
    </div>
  )
}
