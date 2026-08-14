import Link from 'next/link'
import { Pencil, UserPlus, Users } from 'lucide-react'
import { Avatar } from '@/components/Avatar'
import { DeleteStudentButton } from '@/components/DeleteStudentButton'
import { PageHeading } from '@/components/PageHeading'
import { sql } from '@/lib/db'
import type { Student } from '@/lib/db-types'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Manage builders' }

type StudentRow = Student & {
  roleName: string | null
  evaluationCount: number
}

export default async function AdminStudentsPage(
  props: {
    searchParams: Promise<{ q?: string }>
  }
) {
  const searchParams = await props.searchParams;
  const like = searchParams.q ? `%${searchParams.q}%` : null

  const students = await sql<StudentRow[]>`
    SELECT s.*, ranked.role_name as "roleName", COALESCE(ev.count, 0)::int as "evaluationCount"
    FROM "Student" s
    LEFT JOIN LATERAL (
      SELECT r.name as role_name
      FROM "RoleAssignment" ra
      JOIN "Role" r ON r.id = ra."roleId"
      WHERE ra."studentId" = s.id
      ORDER BY ra."startedAt" DESC
      LIMIT 1
    ) ranked ON true
    LEFT JOIN (
      SELECT "studentId", COUNT(*) as count FROM "Evaluation" GROUP BY "studentId"
    ) ev ON ev."studentId" = s.id
    ${like ? sql`WHERE (s."fullName" ILIKE ${like} OR s.email ILIKE ${like})` : sql``}
    ORDER BY s."createdAt" DESC
  `

  return (
    <div className="container-page py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeading title="Builders" />
        <Link href="/admin/students/new" className="btn-primary">
          <UserPlus className="h-4 w-4" aria-hidden />
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
          <div className="flex flex-col items-center gap-2 p-10 text-center">
            <Users className="h-8 w-8 text-squid/30" aria-hidden />
            <p className="text-sm text-squid/60">No builders yet.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="table-wrap hidden md:block">
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
                  {students.map((student, index) => (
                    <tr
                      key={student.id}
                      className="animate-fade-up border-b border-surface-border/70 transition-colors last:border-0 hover:bg-surface-muted/60"
                      style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
                    >
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
                        {student.roleName ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-squid/70">{student.status}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-squid/70">
                        {student.evaluationCount}
                      </td>
                      <td className="px-4 py-3 text-squid/60">{formatDate(student.joinedAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/students/${student.id}`} className="btn-secondary py-1">
                            <Pencil className="h-3.5 w-3.5" aria-hidden />
                            Edit
                          </Link>
                          <DeleteStudentButton id={student.id} fullName={student.fullName} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="divide-y divide-surface-border md:hidden">
              {students.map((student, index) => (
                <li
                  key={student.id}
                  className="animate-fade-up p-4"
                  style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={student.fullName} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-squid">{student.fullName}</p>
                      <p className="truncate text-xs text-squid/50">{student.email}</p>
                    </div>
                    <span className="badge bg-surface-muted text-squid/70">{student.status}</span>
                  </div>
                  <p className="mt-2 text-xs text-squid/60">
                    {student.roleName ?? 'No role'} · {student.evaluationCount} evals · Joined{' '}
                    {formatDate(student.joinedAt)}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Link href={`/admin/students/${student.id}`} className="btn-secondary flex-1 py-1.5">
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                      Edit
                    </Link>
                    <DeleteStudentButton id={student.id} fullName={student.fullName} />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
