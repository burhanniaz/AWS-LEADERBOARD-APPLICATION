import { EvaluationForm } from '@/components/EvaluationForm'
import { deleteEvaluationAction } from '@/lib/actions'
import { prisma } from '@/lib/prisma'
import { getCategories, getCycles } from '@/lib/leaderboard'
import { formatDate, formatNumber } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Evaluations' }

export default async function AdminEvaluationsPage({
  searchParams,
}: {
  searchParams: { student?: string }
}) {
  const [students, categories, cycles, recent] = await Promise.all([
    prisma.student.findMany({
      where: { status: { not: 'INACTIVE' } },
      select: { id: true, fullName: true },
      orderBy: { fullName: 'asc' },
    }),
    getCategories(),
    getCycles(),
    prisma.evaluation.findMany({
      take: 40,
      orderBy: { createdAt: 'desc' },
      include: {
        student: { select: { fullName: true } },
        category: { select: { name: true, color: true } },
        evaluator: { select: { name: true } },
      },
    }),
  ])

  if (categories.length === 0 || cycles.length === 0) {
    return (
      <div className="container-page py-8">
        <div className="card card-pad">
          <h1 className="text-lg font-bold text-squid">Set up metrics and a cycle first</h1>
          <p className="mt-2 text-sm text-squid/70">
            Evaluations need at least one metric and one cycle. Create them under Settings.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold text-squid">Evaluations</h1>
      <p className="mt-2 max-w-2xl text-squid/70">
        Each evaluation is a dated, justified score attributed to you. Scores accumulate — record
        them as work happens rather than editing a running total.
      </p>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,520px)_minmax(0,1fr)]">
        <EvaluationForm
          students={students}
          categories={categories}
          cycles={cycles}
          defaultStudentId={searchParams.student}
        />

        <section className="card overflow-hidden">
          <h2 className="border-b border-surface-border px-4 py-3 font-bold text-squid sm:px-6">
            Recent evaluations
          </h2>
          {recent.length === 0 ? (
            <p className="p-6 text-sm text-squid/60">Nothing recorded yet.</p>
          ) : (
            <ul className="divide-y divide-surface-border">
              {recent.map((evaluation) => (
                <li key={evaluation.id} className="flex items-start gap-3 p-4 sm:px-6">
                  <span
                    className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: evaluation.category.color }}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-squid">
                      {evaluation.student.fullName}
                      <span className="ml-2 font-normal text-squid/50">{evaluation.title}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-squid/50">
                      {evaluation.category.name} · {formatDate(evaluation.occurredAt)}
                      {evaluation.evaluator ? ` · ${evaluation.evaluator.name}` : ''}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-squid/70">{evaluation.reason}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="tabular-nums font-bold text-squid">
                      {formatNumber(evaluation.score)}/{formatNumber(evaluation.maxScore)}
                    </span>
                    <form action={deleteEvaluationAction}>
                      <input type="hidden" name="id" value={evaluation.id} />
                      <button className="text-xs text-aws-red hover:underline" type="submit">
                        Delete
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
