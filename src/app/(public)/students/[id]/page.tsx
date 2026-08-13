import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Avatar } from '@/components/Avatar'
import { ScoreBar } from '@/components/ScoreBar'
import { StatCard } from '@/components/StatCard'
import { getStudentProfile, summariseProfile } from '@/lib/students'
import { departmentLabel, formatDate, formatNumber } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function StudentPage({ params }: { params: { id: string } }) {
  const profile = await getStudentProfile(params.id)
  if (!profile) notFound()

  const summary = summariseProfile(profile)
  const currentRole = profile.roleAssignments[0]
  const topPoints = summary.categories[0]?.points ?? 0

  return (
    <div className="container-page py-8 sm:py-10">
      <Link href="/" className="text-sm font-medium text-aws-blue hover:underline">
        ← Back to leaderboard
      </Link>

      <header className="card card-pad mt-4 flex flex-col gap-5 sm:flex-row sm:items-center">
        <Avatar name={profile.fullName} size="xl" />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-squid sm:text-3xl">{profile.fullName}</h1>
          <p className="mt-1 text-sm text-squid/60">
            {departmentLabel(profile.department) ?? profile.email}
            {profile.rollNumber ? ` · ${profile.rollNumber}` : ''}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {currentRole ? (
              <span
                className="badge"
                style={{
                  backgroundColor: `${currentRole.role.color}1A`,
                  color: currentRole.role.color,
                }}
              >
                {currentRole.role.name} · {currentRole.cycle.name}
              </span>
            ) : null}
            <span className="badge bg-surface-muted text-squid/70">{profile.status}</span>
            <span className="badge bg-surface-muted text-squid/70">
              Joined {formatDate(profile.joinedAt)}
            </span>
          </div>
          {profile.bio ? <p className="mt-3 text-sm text-squid/70">{profile.bio}</p> : null}
          <div className="mt-3 flex gap-3 text-sm">
            {profile.whatsappNumber ? (
              <a
                href={`https://wa.me/${profile.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer noopener"
                className="text-aws-blue hover:underline"
              >
                WhatsApp
              </a>
            ) : null}
            {profile.linkedinUrl ? (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="text-aws-blue hover:underline"
              >
                LinkedIn
              </a>
            ) : null}
          </div>
        </div>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total points" value={formatNumber(summary.totalPoints)} />
        <StatCard label="Quality" value={`${summary.quality}%`} hint="Score achieved vs available" />
        <StatCard label="Evaluations" value={summary.evaluations.length} />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="card card-pad">
          <h2 className="text-lg font-bold text-squid">Evaluation history</h2>
          <p className="mt-1 text-sm text-squid/60">
            Every entry keeps its reason, evaluator and date on the record.
          </p>

          {summary.evaluations.length === 0 ? (
            <p className="mt-6 text-sm text-squid/50">No evaluations recorded yet.</p>
          ) : (
            <ol className="mt-5 space-y-4">
              {summary.evaluations.map((evaluation) => (
                <li
                  key={evaluation.id}
                  className="relative rounded-lg border border-surface-border p-4 pl-5"
                >
                  <span
                    className="absolute inset-y-0 left-0 w-1 rounded-l-lg"
                    style={{ backgroundColor: evaluation.category.color }}
                  />
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-semibold text-squid">{evaluation.title}</h3>
                    <span className="tabular-nums text-sm font-bold text-squid">
                      {formatNumber(evaluation.score)} / {formatNumber(evaluation.maxScore)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-squid/50">
                    {evaluation.category.name} · {evaluation.cycle.name} ·{' '}
                    {formatDate(evaluation.occurredAt)}
                    {evaluation.evaluator ? ` · by ${evaluation.evaluator.name}` : ''}
                  </p>
                  <p className="mt-2 text-sm text-squid/80">{evaluation.reason}</p>
                  {evaluation.evidenceUrl ? (
                    <a
                      href={evaluation.evidenceUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-2 inline-block text-sm text-aws-blue hover:underline"
                    >
                      View evidence
                    </a>
                  ) : null}
                </li>
              ))}
            </ol>
          )}
        </section>

        <aside className="space-y-6">
          <section className="card card-pad">
            <h2 className="text-lg font-bold text-squid">Metric breakdown</h2>
            {summary.categories.length === 0 ? (
              <p className="mt-4 text-sm text-squid/50">Nothing scored yet.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {summary.categories.map((category) => (
                  <ScoreBar
                    key={category.name}
                    label={category.name}
                    value={category.points}
                    max={topPoints}
                    color={category.color}
                    caption={`${formatNumber(category.points)} pts · ${category.count}`}
                  />
                ))}
              </div>
            )}
          </section>

          {profile.skills.length > 0 ? (
            <section className="card card-pad">
              <h2 className="text-lg font-bold text-squid">Skills</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {profile.skills.map((entry) => (
                  <li key={entry.skillId} className="badge bg-surface-muted text-squid/80">
                    {entry.skill.name}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {profile.roleAssignments.length > 0 ? (
            <section className="card card-pad">
              <h2 className="text-lg font-bold text-squid">Role history</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {profile.roleAssignments.map((assignment) => (
                  <li key={assignment.id} className="flex justify-between gap-3">
                    <span className="font-medium text-squid">{assignment.role.name}</span>
                    <span className="text-squid/50">{assignment.cycle.name}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  )
}
