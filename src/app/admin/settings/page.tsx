import Link from 'next/link'
import { CategoryForm, CycleForm, RoleForm } from '@/components/SettingsForms'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Settings' }

function isoDate(value: Date | null) {
  return value ? new Date(value).toISOString().slice(0, 10) : ''
}

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: { editCategory?: string; editRole?: string; editCycle?: string }
}) {
  const [categories, roles, cycles] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: 'asc' } }),
    prisma.role.findMany({ orderBy: { rank: 'asc' } }),
    prisma.cycle.findMany({ orderBy: { startDate: 'desc' } }),
  ])

  const editingCategory = categories.find((item) => item.id === searchParams.editCategory)
  const editingRole = roles.find((item) => item.id === searchParams.editRole)
  const editingCycle = cycles.find((item) => item.id === searchParams.editCycle)

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold text-squid">Settings</h1>

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
                {category.isActive ? null : (
                  <span className="text-xs text-squid/50">off</span>
                )}
                <Link
                  href={`/admin/settings?editCategory=${category.id}#metrics-form`}
                  className="text-xs font-semibold text-aws-blue hover:underline"
                >
                  Edit
                </Link>
              </li>
            ))}
          </ul>
          <div id="metrics-form" className="mt-5 border-t border-surface-border pt-5">
            {editingCategory ? (
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-squid">Editing {editingCategory.name}</p>
                <Link href="/admin/settings" className="text-xs text-squid/50 hover:underline">
                  Cancel
                </Link>
              </div>
            ) : null}
            <CategoryForm
              values={
                editingCategory
                  ? {
                      id: editingCategory.id,
                      name: editingCategory.name,
                      description: editingCategory.description,
                      weight: editingCategory.weight,
                      maxScore: editingCategory.maxScore,
                      color: editingCategory.color,
                      order: editingCategory.order,
                      isActive: editingCategory.isActive,
                    }
                  : undefined
              }
            />
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
                <Link
                  href={`/admin/settings?editRole=${role.id}#roles-form`}
                  className="text-xs font-semibold text-aws-blue hover:underline"
                >
                  Edit
                </Link>
              </li>
            ))}
          </ul>
          <div id="roles-form" className="mt-5 border-t border-surface-border pt-5">
            {editingRole ? (
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-squid">Editing {editingRole.name}</p>
                <Link href="/admin/settings" className="text-xs text-squid/50 hover:underline">
                  Cancel
                </Link>
              </div>
            ) : null}
            <RoleForm
              values={
                editingRole
                  ? {
                      id: editingRole.id,
                      name: editingRole.name,
                      description: editingRole.description,
                      color: editingRole.color,
                      rank: editingRole.rank,
                    }
                  : undefined
              }
            />
          </div>
        </section>

        <section className="card card-pad">
          <h2 className="text-lg font-bold text-squid">Sessions</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {cycles.map((cycle) => (
              <li key={cycle.id} className="rounded-md bg-surface-muted px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="flex-1 font-medium text-squid">{cycle.name}</span>
                  {cycle.isActive ? (
                    <span className="badge bg-aws-green/10 text-aws-green">Active</span>
                  ) : null}
                  <Link
                    href={`/admin/settings?editCycle=${cycle.id}#sessions-form`}
                    className="text-xs font-semibold text-aws-blue hover:underline"
                  >
                    Edit
                  </Link>
                </div>
                <p className="mt-0.5 text-xs text-squid/50">
                  {formatDate(cycle.startDate)}
                  {cycle.endDate ? ` – ${formatDate(cycle.endDate)}` : ' – ongoing'}
                </p>
              </li>
            ))}
          </ul>
          <div id="sessions-form" className="mt-5 border-t border-surface-border pt-5">
            {editingCycle ? (
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-squid">Editing {editingCycle.name}</p>
                <Link href="/admin/settings" className="text-xs text-squid/50 hover:underline">
                  Cancel
                </Link>
              </div>
            ) : null}
            <CycleForm
              values={
                editingCycle
                  ? {
                      id: editingCycle.id,
                      name: editingCycle.name,
                      startDate: isoDate(editingCycle.startDate),
                      endDate: isoDate(editingCycle.endDate),
                      notes: editingCycle.notes,
                      isActive: editingCycle.isActive,
                    }
                  : { startDate: isoDate(new Date()) }
              }
            />
          </div>
        </section>
      </div>
    </div>
  )
}
