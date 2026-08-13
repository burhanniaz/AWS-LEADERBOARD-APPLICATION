import Link from 'next/link'
import { StatCard } from '@/components/StatCard'
import { SetupNotice } from '@/components/SetupNotice'
import { prisma } from '@/lib/prisma'
import { getActiveCycle } from '@/lib/leaderboard'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin overview' }

async function Overview() {
  const cycle = await getActiveCycle()
  const [students, evaluations, unscored, activity] = await Promise.all([
    prisma.student.count({ where: { status: 'ACTIVE' } }),
    cycle ? prisma.evaluation.count({ where: { cycleId: cycle.id } }) : 0,
    cycle
      ? prisma.student.count({
          where: { status: 'ACTIVE', evaluations: { none: { cycleId: cycle.id } } },
        })
      : 0,
    prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take: 12 }),
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

      <section className="card card-pad mt-6">
        <h2 className="text-lg font-bold text-squid">Recent activity</h2>
        {activity.length === 0 ? (
          <p className="mt-3 text-sm text-squid/50">Nothing recorded yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-surface-border text-sm">
            {activity.map((entry) => (
              <li key={entry.id} className="flex justify-between gap-4 py-2">
                <span className="text-squid/80">{entry.summary}</span>
                <span className="shrink-0 text-xs text-squid/40">
                  {formatDate(entry.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
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
