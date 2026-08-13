import { prisma } from '@/lib/prisma'

export type CategoryBreakdown = {
  categoryId: string
  name: string
  slug: string
  color: string
  points: number
  rawScore: number
  maxScore: number
  quality: number
  count: number
}

export type LeaderboardRow = {
  rank: number
  studentId: string
  fullName: string
  email: string
  avatarUrl: string | null
  institution: string | null
  roleName: string | null
  roleColor: string | null
  totalPoints: number
  quality: number
  evaluationCount: number
  lastEvaluatedAt: Date | null
  breakdown: CategoryBreakdown[]
}

export type LeaderboardFilters = {
  cycleId?: string
  roleSlug?: string
  categorySlug?: string
  search?: string
}

export async function getCycles() {
  return prisma.cycle.findMany({ orderBy: [{ startDate: 'desc' }] })
}

export async function getActiveCycle() {
  return (
    (await prisma.cycle.findFirst({ where: { isActive: true } })) ??
    (await prisma.cycle.findFirst({ orderBy: { startDate: 'desc' } }))
  )
}

export async function getRoles() {
  return prisma.role.findMany({ orderBy: [{ rank: 'asc' }, { name: 'asc' }] })
}

export async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
  })
}

/// Points reward both volume and quality: a student who does more good work
/// out-scores one who did a single perfect thing, which is the behaviour the
/// programme wants to encourage.
function pointsFor(score: number, weight: number) {
  return score * weight
}

export async function getLeaderboard(filters: LeaderboardFilters): Promise<LeaderboardRow[]> {
  const cycle = filters.cycleId
    ? await prisma.cycle.findUnique({ where: { id: filters.cycleId } })
    : await getActiveCycle()

  if (!cycle) return []

  const students = await prisma.student.findMany({
    where: {
      status: { not: 'INACTIVE' },
      ...(filters.search
        ? {
            OR: [
              { fullName: { contains: filters.search, mode: 'insensitive' as const } },
              { email: { contains: filters.search, mode: 'insensitive' as const } },
              { institution: { contains: filters.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(filters.roleSlug
        ? { roleAssignments: { some: { cycleId: cycle.id, role: { slug: filters.roleSlug } } } }
        : {}),
    },
    include: {
      roleAssignments: {
        where: { cycleId: cycle.id },
        include: { role: true },
        orderBy: { role: { rank: 'asc' } },
        take: 1,
      },
      evaluations: {
        where: {
          cycleId: cycle.id,
          ...(filters.categorySlug ? { category: { slug: filters.categorySlug } } : {}),
        },
        include: { category: true },
      },
    },
  })

  const rows = students.map((student) => {
    const buckets = new Map<string, CategoryBreakdown>()
    let totalPoints = 0
    let rawSum = 0
    let maxSum = 0
    let lastEvaluatedAt: Date | null = null

    for (const evaluation of student.evaluations) {
      const category = evaluation.category
      const points = pointsFor(evaluation.score, category.weight)
      totalPoints += points
      rawSum += evaluation.score
      maxSum += evaluation.maxScore

      if (!lastEvaluatedAt || evaluation.occurredAt > lastEvaluatedAt) {
        lastEvaluatedAt = evaluation.occurredAt
      }

      const existing = buckets.get(category.id)
      if (existing) {
        existing.points += points
        existing.rawScore += evaluation.score
        existing.maxScore += evaluation.maxScore
        existing.count += 1
        existing.quality = existing.maxScore ? (existing.rawScore / existing.maxScore) * 100 : 0
      } else {
        buckets.set(category.id, {
          categoryId: category.id,
          name: category.name,
          slug: category.slug,
          color: category.color,
          points,
          rawScore: evaluation.score,
          maxScore: evaluation.maxScore,
          quality: evaluation.maxScore ? (evaluation.score / evaluation.maxScore) * 100 : 0,
          count: 1,
        })
      }
    }

    const assignment = student.roleAssignments[0]

    return {
      rank: 0,
      studentId: student.id,
      fullName: student.fullName,
      email: student.email,
      avatarUrl: student.avatarUrl,
      institution: student.institution,
      roleName: assignment?.role.name ?? null,
      roleColor: assignment?.role.color ?? null,
      totalPoints: Math.round(totalPoints * 10) / 10,
      quality: maxSum ? Math.round((rawSum / maxSum) * 1000) / 10 : 0,
      evaluationCount: student.evaluations.length,
      lastEvaluatedAt,
      breakdown: [...buckets.values()].sort((a, b) => b.points - a.points),
    }
  })

  rows.sort(
    (a, b) =>
      b.totalPoints - a.totalPoints ||
      b.quality - a.quality ||
      a.fullName.localeCompare(b.fullName),
  )

  // Equal totals share a rank, and the next rank skips accordingly (1,2,2,4).
  let lastPoints: number | null = null
  let lastRank = 0
  rows.forEach((row, index) => {
    if (lastPoints !== null && row.totalPoints === lastPoints) {
      row.rank = lastRank
    } else {
      row.rank = index + 1
      lastRank = row.rank
      lastPoints = row.totalPoints
    }
  })

  return rows
}

export async function getCycleStats(cycleId: string) {
  const [studentCount, evaluationCount, aggregate] = await Promise.all([
    prisma.student.count({ where: { status: { not: 'INACTIVE' } } }),
    prisma.evaluation.count({ where: { cycleId } }),
    prisma.evaluation.aggregate({
      where: { cycleId },
      _sum: { score: true, maxScore: true },
    }),
  ])

  const rawSum = aggregate._sum.score ?? 0
  const maxSum = aggregate._sum.maxScore ?? 0

  return {
    studentCount,
    evaluationCount,
    averageQuality: maxSum ? Math.round((rawSum / maxSum) * 1000) / 10 : 0,
  }
}
