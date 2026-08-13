import { CategoryForm, CycleForm, RoleForm } from '@/components/SettingsForms'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Settings' }

function isoDate(value: Date | null) {
  return value ? new Date(value).toISOString().slice(0, 10) : ''
}

export default async function AdminSettingsPage() {
  const [categories, roles, cycles] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: 'asc' } }),
    prisma.role.findMany({ orderBy: { rank: 'asc' } }),
    prisma.cycle.findMany({ orderBy: { startDate: 'desc' } }),
  ])

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold text-squid">Settings</h1>
      <p className="mt-2 max-w-2xl text-squid/70">
        Metrics, roles and cycles are data — change them here rather than in code. Weight controls
        how much a metric moves the leaderboard.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="card card-pad">
          <h2 className="text-lg font-bold text-squid">Scoring metrics</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex items-center gap-2 rounded-md bg-surface-muted px-3 py-2"
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                  aria-hidden
                />
                <span className="flex-1 font-medium text-squid">{category.name}</span>
                <span className="text-xs text-squid/50">
                  ×{category.weight} · /{category.maxScore}
                  {category.isActive ? '' : ' · off'}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-5 border-t border-surface-border pt-5">
            <CategoryForm />
          </div>
        </section>

        <section className="card card-pad">
          <h2 className="text-lg font-bold text-squid">Roles</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {roles.map((role) => (
              <li
                key={role.id}
                className="flex items-center gap-2 rounded-md bg-surface-muted px-3 py-2"
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: role.color }}
                  aria-hidden
                />
                <span className="flex-1 font-medium text-squid">{role.name}</span>
                <span className="text-xs text-squid/50">rank {role.rank}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 border-t border-surface-border pt-5">
            <RoleForm />
          </div>
        </section>

        <section className="card card-pad">
          <h2 className="text-lg font-bold text-squid">Cycles</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {cycles.map((cycle) => (
              <li key={cycle.id} className="rounded-md bg-surface-muted px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="flex-1 font-medium text-squid">{cycle.name}</span>
                  {cycle.isActive ? (
                    <span className="badge bg-aws-green/10 text-aws-green">Active</span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-xs text-squid/50">
                  {formatDate(cycle.startDate)}
                  {cycle.endDate ? ` – ${formatDate(cycle.endDate)}` : ' – ongoing'}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-5 border-t border-surface-border pt-5">
            <CycleForm values={{ startDate: isoDate(new Date()) }} />
          </div>
        </section>
      </div>
    </div>
  )
}
