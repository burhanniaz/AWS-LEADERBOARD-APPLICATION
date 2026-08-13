import Link from 'next/link'
import { notFound } from 'next/navigation'
import { StudentForm } from '@/components/StudentForm'
import { sql } from '@/lib/db'
import type { Student } from '@/lib/db-types'
import { getCycles, getRoles } from '@/lib/leaderboard'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Edit builder' }

export default async function EditStudentPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const [[student], roles, cycles] = await Promise.all([
    sql<Student[]>`SELECT * FROM "Student" WHERE id = ${params.id}`,
    getRoles(),
    getCycles(),
  ])

  if (!student) notFound()

  const [assignment] = await sql<{ roleId: string; cycleId: string }[]>`
    SELECT "roleId", "cycleId" FROM "RoleAssignment"
    WHERE "studentId" = ${student.id}
    ORDER BY "startedAt" DESC
    LIMIT 1
  `

  return (
    <div className="container-page max-w-4xl py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/students" className="text-sm text-aws-blue hover:underline">
          ← Back to builders
        </Link>
        <Link href={`/students/${student.id}`} className="text-sm text-aws-blue hover:underline">
          View public profile
        </Link>
      </div>
      <h1 className="mt-3 text-2xl font-bold text-squid">{student.fullName}</h1>
      <div className="mt-6">
        <StudentForm
          roles={roles}
          cycles={cycles}
          values={{
            id: student.id,
            fullName: student.fullName,
            email: student.email,
            whatsappNumber: student.whatsappNumber,
            rollNumber: student.rollNumber,
            department: student.department,
            bio: student.bio,
            linkedinUrl: student.linkedinUrl,
            status: student.status,
            roleId: assignment?.roleId,
            cycleId: assignment?.cycleId ?? cycles.find((cycle) => cycle.isActive)?.id,
          }}
        />
      </div>
    </div>
  )
}
