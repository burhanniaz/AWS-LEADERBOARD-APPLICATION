import { prisma } from '@/lib/prisma'

export async function getStudentProfile(id: string) {
  return prisma.student.findUnique({
    where: { id },
    include: {
      skills: { include: { skill: true } },
      roleAssignments: {
        include: { role: true, cycle: true },
        orderBy: { startedAt: 'desc' },
      },
      evaluations: {
        include: { category: true, cycle: true, evaluator: { select: { name: true } } },
        orderBy: { occurredAt: 'desc' },
      },
    },
  })
}

export type StudentProfile = NonNullable<Awaited<ReturnType<typeof getStudentProfile>>>

export function summariseProfile(profile: StudentProfile, cycleId?: string) {
  const evaluations = cycleId
    ? profile.evaluations.filter((item) => item.cycleId === cycleId)
    : profile.evaluations

  const byCategory = new Map<
    string,
    { name: string; color: string; points: number; raw: number; max: number; count: number }
  >()

  let totalPoints = 0
  let raw = 0
  let max = 0

  for (const evaluation of evaluations) {
    const points = evaluation.score * evaluation.category.weight
    totalPoints += points
    raw += evaluation.score
    max += evaluation.maxScore

    const bucket = byCategory.get(evaluation.categoryId)
    if (bucket) {
      bucket.points += points
      bucket.raw += evaluation.score
      bucket.max += evaluation.maxScore
      bucket.count += 1
    } else {
      byCategory.set(evaluation.categoryId, {
        name: evaluation.category.name,
        color: evaluation.category.color,
        points,
        raw: evaluation.score,
        max: evaluation.maxScore,
        count: 1,
      })
    }
  }

  return {
    evaluations,
    totalPoints: Math.round(totalPoints * 10) / 10,
    quality: max ? Math.round((raw / max) * 1000) / 10 : 0,
    categories: [...byCategory.values()].sort((a, b) => b.points - a.points),
  }
}
