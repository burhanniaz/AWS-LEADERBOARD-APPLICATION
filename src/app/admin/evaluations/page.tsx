import { ClipboardList } from 'lucide-react'
import { EvaluationForm } from '@/components/EvaluationForm'
import { sql } from '@/lib/db'
import { getCategories, getCycles } from '@/lib/leaderboard'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Evaluations' }

export default async function AdminEvaluationsPage(
  props: {
    searchParams: Promise<{ student?: string }>
  }
) {
  const searchParams = await props.searchParams;
  const [students, categories, cycles] = await Promise.all([
    sql<{ id: string; fullName: string }[]>`
      SELECT id, "fullName" FROM "Student" WHERE status != 'INACTIVE' ORDER BY "fullName" ASC
    `,
    getCategories(),
    getCycles(),
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
    <div className="container-page max-w-3xl py-8">
      <h1 className="flex items-center gap-2.5 text-2xl font-bold text-squid">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-smile/10 text-smile">
          <ClipboardList className="h-5 w-5" aria-hidden />
        </span>
        Record an evaluation
      </h1>
      <p className="mt-2 text-sm text-squid/60">
        Score a builder against a metric with a written justification. Every entry is logged with
        your name and the date.
      </p>

      <div className="mt-6">
        <EvaluationForm
          students={students}
          categories={categories}
          cycles={cycles}
          defaultStudentId={searchParams.student}
        />
      </div>
    </div>
  )
}
