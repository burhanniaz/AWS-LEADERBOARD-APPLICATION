import Link from 'next/link'
import { Avatar } from '@/components/Avatar'
import { deleteStudentAction } from '@/lib/actions'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Manage builders' }

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const students = await prisma.student.findMany({
    where: searchParams.q
      ? {
          OR: [
            { fullName: { contains: searchParams.q, mode: 'insensitive' } },
            { email: { contains: searchParams.q, mode: 'insensitive' } },
          ],
        }
      : undefined,
    include: {
      roleAssignments: { include: { role: true }, orderBy: { startedAt: 'desc' }, take: 1 },
      _count: { select: { evaluations: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="container-page py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-squid">Builders</h1>
        <Link href="/admin/students/new" className="btn-primary">
          Add builder
        </Link>
      </div>

      <form className="mt-6 flex max-w-md gap-2" action="/admin/students">
        <input
          name="q"
          className="input"
          placeholder="Search by name or email"
          defaultValue={searchParams.q ?? ''}
          aria-label="Search builders"
        />
        <button className="btn-secondary" type="submit">
          Search
        </button>
      </form>

      <div className="card mt-6 overflow-hidden">
        {students.length === 0 ? (
          <p className="p-6 text-sm text-squid/60">No builders yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-surface-muted text-left">
                  <th scope="col" className="px-4 py-3 font-semibold text-squid/70">Builder</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-squid/70">Role</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-squid/70">Status</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold text-squid/70">Evals</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-squid/70">Joined</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold text-squid/70">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-surface-border/70 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={student.fullName} size="sm" />
                        <div className="min-w-0">
                          <p className="font-semibold text-squid">{student.fullName}</p>
                          <p className="truncate text-xs text-squid/50">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-squid/70">
                      {student.roleAssignments[0]?.role.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-squid/70">{student.status}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-squid/70">
                      {student._count.evaluations}
                    </td>
                    <td className="px-4 py-3 text-squid/60">{formatDate(student.joinedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/students/${student.id}`} className="btn-secondary py-1">
                          Edit
                        </Link>
                        <form action={deleteStudentAction}>
                          <input type="hidden" name="id" value={student.id} />
                          <button className="btn-danger py-1" type="submit">
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
