import { unstable_cache } from 'next/cache'
import { sql } from '@/lib/db'
import type { Category, Cycle, Evaluation, Role, Student } from '@/lib/db-types'

const CACHE_TAG = 'board-data'

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
  department: string | null
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

export const getCycles = unstable_cache(
  async () => sql<Cycle[]>`SELECT * FROM "Cycle" ORDER BY "startDate" DESC`,
  ['cycles'],
  { tags: [CACHE_TAG] },
)

export const getActiveCycle = unstable_cache(
  async () => {
    const [active] = await sql<Cycle[]>`SELECT * FROM "Cycle" WHERE "isActive" = true LIMIT 1`
    if (active) return active
    const [latest] = await sql<Cycle[]>`SELECT * FROM "Cycle" ORDER BY "startDate" DESC LIMIT 1`
    return latest ?? null
  },
  ['active-cycle'],
  { tags: [CACHE_TAG] },
)

export const getRoles = unstable_cache(
  async () => sql<Role[]>`SELECT * FROM "Role" ORDER BY rank ASC, name ASC`,
  ['roles'],
  { tags: [CACHE_TAG] },
)

export const getCategories = unstable_cache(
  async () =>
    sql<Category[]>`SELECT * FROM "Category" WHERE "isActive" = true ORDER BY "order" ASC, name ASC`,
  ['categories'],
  { tags: [CACHE_TAG] },
)

/// Points reward both volume and quality: a student who does more good work
/// out-scores one who did a single perfect thing, which is the behaviour the
/// programme wants to encourage.
function pointsFor(score: number, weight: number) {
  return score * weight
}

// Narrower than `Student` on purpose: this powers the leaderboard row list,
// which never renders bio/whatsapp/rollNumber/etc, so there's no reason to
// pull that (potentially long) text off the wire for every row on every
// board view.
type StudentWithRole = Pick<Student, 'id' | 'fullName' | 'email' | 'department'> & {
  roleId: string | null
  roleName: string | null
  roleColor: string | null
}

type EvaluationWithCategory = Evaluation & {
  categoryName: string
  categorySlug: string
  categoryColor: string
  categoryWeight: number
}

async function fetchLeaderboard(filters: LeaderboardFilters): Promise<LeaderboardRow[]> {
  const cycle = filters.cycleId
    ? (await sql<Cycle[]>`SELECT * FROM "Cycle" WHERE id = ${filters.cycleId}`)[0] ?? null
    : await getActiveCycle()

  if (!cycle) return []

  const like = filters.search ? `%${filters.search}%` : null

  // Independent of each other — run concurrently instead of round-tripping twice.
  const [students, evaluations] = await Promise.all([
    sql<StudentWithRole[]>`
    SELECT s.id, s."fullName", s.email, s.department,
           ranked.role_id as "roleId", ranked.role_name as "roleName", ranked.role_color as "roleColor"
    FROM "Student" s
    LEFT JOIN LATERAL (
      SELECT r.id as role_id, r.name as role_name, r.color as role_color
      FROM "RoleAssignment" ra
      JOIN "Role" r ON r.id = ra."roleId"
      WHERE ra."studentId" = s.id AND ra."cycleId" = ${cycle.id}
      ORDER BY r.rank ASC
      LIMIT 1
    ) ranked ON true
    WHERE s.status != 'INACTIVE'
      ${like ? sql`AND (s."fullName" ILIKE ${like} OR s.email ILIKE ${like} OR s."rollNumber" ILIKE ${like})` : sql``}
      ${
        filters.roleSlug
          ? sql`AND EXISTS (
              SELECT 1 FROM "RoleAssignment" ra2
              JOIN "Role" role2 ON role2.id = ra2."roleId"
              WHERE ra2."studentId" = s.id AND ra2."cycleId" = ${cycle.id} AND role2.slug = ${filters.roleSlug}
            )`
          : sql``
      }
    `,
    sql<EvaluationWithCategory[]>`
    SELECT e.*, c.name as "categoryName", c.slug as "categorySlug", c.color as "categoryColor", c.weight as "categoryWeight"
    FROM "Evaluation" e
    JOIN "Category" c ON c.id = e."categoryId"
    WHERE e."cycleId" = ${cycle.id}
    ${filters.categorySlug ? sql`AND c.slug = ${filters.categorySlug}` : sql``}
    `,
  ])

  const evaluationsByStudent = new Map<string, EvaluationWithCategory[]>()
  for (const evaluation of evaluations) {
    const list = evaluationsByStudent.get(evaluation.studentId) ?? []
    list.push(evaluation)
    evaluationsByStudent.set(evaluation.studentId, list)
  }

  const rows = students.map((student) => {
    const studentEvaluations = evaluationsByStudent.get(student.id) ?? []
    const buckets = new Map<string, CategoryBreakdown>()
    let totalPoints = 0
    let rawSum = 0
    let maxSum = 0
    let lastEvaluatedAt: Date | null = null

    for (const evaluation of studentEvaluations) {
      const points = pointsFor(evaluation.score, evaluation.categoryWeight)
      totalPoints += points
      rawSum += evaluation.score
      maxSum += evaluation.maxScore

      if (!lastEvaluatedAt || evaluation.occurredAt > lastEvaluatedAt) {
        lastEvaluatedAt = evaluation.occurredAt
      }

      const existing = buckets.get(evaluation.categoryId)
      if (existing) {
        existing.points += points
        existing.rawScore += evaluation.score
        existing.maxScore += evaluation.maxScore
        existing.count += 1
        existing.quality = existing.maxScore ? (existing.rawScore / existing.maxScore) * 100 : 0
      } else {
        buckets.set(evaluation.categoryId, {
          categoryId: evaluation.categoryId,
          name: evaluation.categoryName,
          slug: evaluation.categorySlug,
          color: evaluation.categoryColor,
          points,
          rawScore: evaluation.score,
          maxScore: evaluation.maxScore,
          quality: evaluation.maxScore ? (evaluation.score / evaluation.maxScore) * 100 : 0,
          count: 1,
        })
      }
    }

    return {
      rank: 0,
      studentId: student.id,
      fullName: student.fullName,
      email: student.email,
      department: student.department,
      roleName: student.roleName,
      roleColor: student.roleColor,
      totalPoints: Math.round(totalPoints * 10) / 10,
      quality: maxSum ? Math.round((rawSum / maxSum) * 1000) / 10 : 0,
      evaluationCount: studentEvaluations.length,
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

export const getLeaderboard = unstable_cache(fetchLeaderboard, ['leaderboard'], {
  tags: [CACHE_TAG],
})

async function fetchCycleStats(cycleId: string) {
  const [[{ count: studentCount }], [{ count: evaluationCount }], [{ rawSum, maxSum }]] = await Promise.all([
    sql<{ count: number }[]>`SELECT COUNT(*)::int as count FROM "Student" WHERE status != 'INACTIVE'`,
    sql<{ count: number }[]>`SELECT COUNT(*)::int as count FROM "Evaluation" WHERE "cycleId" = ${cycleId}`,
    sql<{ rawSum: number; maxSum: number }[]>`
      SELECT COALESCE(SUM(score), 0)::float as "rawSum", COALESCE(SUM("maxScore"), 0)::float as "maxSum"
      FROM "Evaluation" WHERE "cycleId" = ${cycleId}
    `,
  ])

  return {
    studentCount,
    evaluationCount,
    averageQuality: maxSum ? Math.round((rawSum / maxSum) * 1000) / 10 : 0,
  }
}

export const getCycleStats = unstable_cache(fetchCycleStats, ['cycle-stats'], {
  tags: [CACHE_TAG],
})
