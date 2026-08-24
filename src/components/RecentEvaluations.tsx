import Link from 'next/link'
import { Avatar } from '@/components/Avatar'
import type { RecentEvaluation } from '@/lib/leaderboard'
import { formatNumber } from '@/lib/utils'

export function RecentEvaluations({ rows }: { rows: RecentEvaluation[] }) {
  return (
    <section className="card card-pad">
      <h2 className="font-bold text-squid">Recent evaluations</h2>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-squid/50">
          Nothing recorded yet. Scores added from the admin panel appear here.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((row) => (
            <li key={row.id} className="flex items-center gap-3">
              <Avatar name={row.fullName} size="sm" />
              <Link href={`/students/${row.studentId}`} className="min-w-0 flex-1 group">
                <span className="block truncate text-sm font-semibold text-squid group-hover:underline">
                  {row.fullName}
                </span>
                <span className="flex min-w-0 items-center gap-1.5 text-xs text-squid/50">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: row.categoryColor }}
                    aria-hidden
                  />
                  <span className="truncate">
                    {row.categoryName} · {row.title}
                  </span>
                </span>
              </Link>
              <span
                className="badge shrink-0 bg-aws-green/10 font-mono text-aws-green"
                title={`Scored ${row.score} out of ${row.maxScore}`}
              >
                +{formatNumber(row.score)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
