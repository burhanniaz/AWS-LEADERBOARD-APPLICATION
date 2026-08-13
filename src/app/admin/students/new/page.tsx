import Link from 'next/link'
import { StudentForm } from '@/components/StudentForm'
import { getCycles, getRoles } from '@/lib/leaderboard'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Add builder' }

export default async function NewStudentPage() {
  const [roles, cycles] = await Promise.all([getRoles(), getCycles()])
  const activeCycle = cycles.find((cycle) => cycle.isActive)

  return (
    <div className="container-page max-w-4xl py-8">
      <Link href="/admin/students" className="text-sm text-aws-blue hover:underline">
        ← Back to builders
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-squid">Add builder</h1>
      <div className="mt-6">
        <StudentForm roles={roles} cycles={cycles} values={{ cycleId: activeCycle?.id }} />
      </div>
    </div>
  )
}
