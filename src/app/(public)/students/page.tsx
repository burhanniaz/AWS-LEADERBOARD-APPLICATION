import Link from 'next/link'
import { Search, Users } from 'lucide-react'
import { Avatar } from '@/components/Avatar'
import { ColorBadge } from '@/components/ColorBadge'
import { PageHeading } from '@/components/PageHeading'
import { SetupNotice } from '@/components/SetupNotice'
import { getStudentDirectory } from '@/lib/students'
import { departmentLabel, formatDate, pluralize } from '@/lib/utils'

export const metadata = { title: 'Builders' }

async function Directory({ query }: { query?: string }) {
  const students = await getStudentDirectory(query)

  if (students.length === 0) {
    return (
      <div className="card card-pad flex flex-col items-center gap-2 py-10 text-center animate-fade-in">
        <Users className="h-8 w-8 text-squid/30" aria-hidden />
        <p className="text-sm text-squid/60">No builders registered yet.</p>
      </div>
    )
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {students.map((student, index) => {
        const role = student.roleAssignments[0]?.role
        return (
          <li key={student.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}>
            <Link
              href={`/students/${student.id}`}
              className="card card-pad flex h-full items-start gap-4 transition-all hover:-translate-y-0.5 hover:shadow-raised"
            >
              <Avatar name={student.fullName} size="lg" />
              <div className="min-w-0">
                <p className="truncate font-semibold text-squid">{student.fullName}</p>
                <p className="truncate text-xs text-squid/50">
                  {departmentLabel(student.department) ?? student.email}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {role ? <ColorBadge color={role.color}>{role.name}</ColorBadge> : null}
                  <span className="badge bg-surface-muted text-squid/60">
                    {pluralize(student._count.evaluations, 'evaluation')}
                  </span>
                </div>
                <p className="mt-2 text-xs text-squid/60">
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

export default async function StudentsPage(
  props: {
    searchParams: Promise<{ q?: string }>
  }
) {
  const searchParams = await props.searchParams;
  let content: React.ReactNode
  try {
    content = await Directory({ query: searchParams.q })
  } catch (error) {
    content = <SetupNotice detail={error instanceof Error ? error.message : undefined} />
  }

  return (
    <div className="container-page py-8 sm:py-10">
      <PageHeading
        eyebrow="AWS UET Taxila"
        title="Builders"
        description="Everyone on record in the club, with their current role and evaluation count."
      />

      <form className="mt-6 flex max-w-md gap-2" action="/students">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-squid/40" aria-hidden />
          <input
            name="q"
            className="input pl-9"
            placeholder="Search builders"
            defaultValue={searchParams.q ?? ''}
            aria-label="Search builders"
          />
        </div>
        <button className="btn-primary" type="submit">
          Search
        </button>
      </form>

      <div className="mt-6">{content}</div>
    </div>
  )
}
