import Link from 'next/link'
import { Avatar } from '@/components/Avatar'
import { SetupNotice } from '@/components/SetupNotice'
import { prisma } from '@/lib/prisma'
import { departmentLabel, formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Builders' }

async function Directory({ query }: { query?: string }) {
  const students = await prisma.student.findMany({
    where: query
      ? {
          OR: [
            { fullName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { rollNumber: { contains: query, mode: 'insensitive' } },
          ],
        }
      : undefined,
    include: {
      roleAssignments: { include: { role: true }, orderBy: { startedAt: 'desc' }, take: 1 },
      _count: { select: { evaluations: true } },
    },
    orderBy: { fullName: 'asc' },
  })

  if (students.length === 0) {
    return (
      <div className="card card-pad text-center text-sm text-squid/60">
        No builders registered yet.
      </div>
    )
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {students.map((student) => {
        const role = student.roleAssignments[0]?.role
        return (
          <li key={student.id}>
            <Link
              href={`/students/${student.id}`}
              className="card card-pad flex h-full items-start gap-4 transition-shadow hover:shadow-raised"
            >
              <Avatar name={student.fullName} size="lg" />
              <div className="min-w-0">
                <p className="truncate font-semibold text-squid">{student.fullName}</p>
                <p className="truncate text-xs text-squid/50">
                  {departmentLabel(student.department) ?? student.email}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {role ? (
                    <span
                      className="badge"
                      style={{ backgroundColor: `${role.color}1A`, color: role.color }}
                    >
                      {role.name}
                    </span>
                  ) : null}
                  <span className="badge bg-surface-muted text-squid/60">
                    {student._count.evaluations} evaluations
                  </span>
                </div>
                <p className="mt-2 text-xs text-squid/40">
                  Joined {formatDate(student.joinedAt)}
                </p>
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  let content: React.ReactNode
  try {
    content = await Directory({ query: searchParams.q })
  } catch (error) {
    content = <SetupNotice detail={error instanceof Error ? error.message : undefined} />
  }

  return (
    <div className="container-page py-8 sm:py-10">
      <h1 className="text-3xl font-bold tracking-tight text-squid">Builders</h1>
      <p className="mt-2 max-w-2xl text-squid/70">
        Everyone on record in the club, with their current role and evaluation count.
      </p>

      <form className="mt-6 flex max-w-md gap-2" action="/students">
        <input
          name="q"
          className="input"
          placeholder="Search builders"
          defaultValue={searchParams.q ?? ''}
          aria-label="Search builders"
        />
        <button className="btn-primary" type="submit">
          Search
        </button>
      </form>

      <div className="mt-6">{content}</div>
    </div>
  )
}
