import Link from 'next/link'
import { notFound } from 'next/navigation'
import { StudentForm } from '@/components/StudentForm'
import { prisma } from '@/lib/prisma'
import { getCycles, getRoles } from '@/lib/leaderboard'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Edit builder' }

export default async function EditStudentPage({ params }: { params: { id: string } }) {
  const [student, roles, cycles] = await Promise.all([
    prisma.student.findUnique({
      where: { id: params.id },
      include: { roleAssignments: { orderBy: { startedAt: 'desc' }, take: 1 } },
    }),
    getRoles(),
    getCycles(),
  ])

  if (!student) notFound()

  const assignment = student.roleAssignments[0]

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
            rollNumber: student.rollNumber,
            institution: student.institution,
            avatarUrl: student.avatarUrl,
            bio: student.bio,
            githubUrl: student.githubUrl,
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
