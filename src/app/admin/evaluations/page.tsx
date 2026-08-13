import { EvaluationForm } from '@/components/EvaluationForm'
import { sql } from '@/lib/db'
import { getCategories, getCycles } from '@/lib/leaderboard'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Evaluations' }

export default async function AdminEvaluationsPage({
  searchParams,
}: {
  searchParams: { student?: string }
}) {
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
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold text-squid text-center">Evaluations</h1>

      <div className="mt-6 mx-auto max-w-3xl">
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
