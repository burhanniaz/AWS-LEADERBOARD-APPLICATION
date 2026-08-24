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
  joinedAt: Date
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
type StudentWithRole = Pick<Student, 'id' | 'fullName' | 'email' | 'department' | 'joinedAt'> & {
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
    SELECT s.id, s."fullName", s.email, s.department, s."joinedAt",
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
      joinedAt: student.joinedAt,
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
  const [[roster], [{ count: evaluationCount }], [{ rawSum, maxSum }]] = await Promise.all([
    sql<{ activeCount: number; alumniCount: number }[]>`
      SELECT COUNT(*) FILTER (WHERE status = 'ACTIVE')::int as "activeCount",
             COUNT(*) FILTER (WHERE status = 'ALUMNI')::int as "alumniCount"
      FROM "Student"
    `,
    sql<{ count: number }[]>`SELECT COUNT(*)::int as count FROM "Evaluation" WHERE "cycleId" = ${cycleId}`,
    sql<{ rawSum: number; maxSum: number }[]>`
      SELECT COALESCE(SUM(score), 0)::float as "rawSum", COALESCE(SUM("maxScore"), 0)::float as "maxSum"
      FROM "Evaluation" WHERE "cycleId" = ${cycleId}
    `,
  ])

  const studentCount = roster.activeCount + roster.alumniCount

  return {
    studentCount,
    activeCount: roster.activeCount,
    alumniCount: roster.alumniCount,
    evaluationCount,
    // Per-builder throughput is the headline number's "so what" — 189 means
    // little until you know it's spread across the whole roster.
    perBuilder: studentCount ? Math.round((evaluationCount / studentCount) * 10) / 10 : 0,
    averageQuality: maxSum ? Math.round((rawSum / maxSum) * 1000) / 10 : 0,
  }
}

export const getCycleStats = unstable_cache(fetchCycleStats, ['cycle-stats'], {
  tags: [CACHE_TAG],
})

export type RecentEvaluation = {
  id: string
  title: string
  score: number
  maxScore: number
  occurredAt: Date
  studentId: string
  fullName: string
  categoryName: string
  categoryColor: string
}

async function fetchRecentEvaluations(cycleId: string, limit = 5) {
  return sql<RecentEvaluation[]>`
    SELECT e.id, e.title, e.score, e."maxScore", e."occurredAt",
           s.id as "studentId", s."fullName",
           c.name as "categoryName", c.color as "categoryColor"
    FROM "Evaluation" e
    JOIN "Student" s ON s.id = e."studentId"
    JOIN "Category" c ON c.id = e."categoryId"
    WHERE e."cycleId" = ${cycleId}
    ORDER BY e."occurredAt" DESC, e."createdAt" DESC
    LIMIT ${limit}
  `
}

export const getRecentEvaluations = unstable_cache(fetchRecentEvaluations, ['recent-evaluations'], {
  tags: [CACHE_TAG],
})

export type MomentumPoint = {
  date: string
  points: number
  evaluations: number
  quality: number
  /** Synthetic cycle-start zero, not a real evaluation day. */
  baseline?: boolean
}

export type MomentumSeries = {
  studentId: string
  fullName: string
  points: MomentumPoint[]
}

/**
 * Cumulative running totals per builder, used by the momentum chart. Points and
 * evaluation counts accumulate over the cycle; quality is a running average of
 * everything scored so far rather than a per-day figure, so the line reads as
 * "how good has this builder been overall" instead of spiking on a single day.
 */
async function fetchMomentum(cycleId: string, studentIds: string[]): Promise<MomentumSeries[]> {
  if (studentIds.length === 0) return []

  const [cycle] = await sql<{ startDate: Date }[]>`
    SELECT "startDate" FROM "Cycle" WHERE id = ${cycleId}
  `

  const daily = await sql<
    {
      studentId: string
      fullName: string
      day: string
      points: number
      evaluations: number
      rawSum: number
      maxSum: number
    }[]
  >`
    SELECT e."studentId", s."fullName",
           to_char(e."occurredAt", 'YYYY-MM-DD') as day,
           COALESCE(SUM(e.score * c.weight), 0)::float as points,
           COUNT(*)::int as evaluations,
           COALESCE(SUM(e.score), 0)::float as "rawSum",
           COALESCE(SUM(e."maxScore"), 0)::float as "maxSum"
    FROM "Evaluation" e
    JOIN "Category" c ON c.id = e."categoryId"
    JOIN "Student" s ON s.id = e."studentId"
    WHERE e."cycleId" = ${cycleId} AND e."studentId" = ANY(${studentIds})
    GROUP BY e."studentId", s."fullName", day
    ORDER BY day ASC
  `

  // Every series is anchored to a zero point at the cycle's start. Without it a
  // cohort whose evaluations all landed on one day yields a single coordinate,
  // and a one-point SVG path draws nothing at all. Dates are ISO strings, so
  // lexicographic comparison is chronological.
  const days = [...new Set(daily.map((row) => row.day))].sort()
  const earliest = days[0]
  const cycleStart = cycle ? cycle.startDate.toISOString().slice(0, 10) : earliest
  const start = earliest && earliest < cycleStart ? earliest : cycleStart

  // If the cycle began on the same day as its only evaluations, the start date
  // is no help — fall back to the day before so there are still two points.
  const anchor = start && start < earliest ? start : shiftDay(earliest, -1)

  // Preserve the caller's ordering (rank #1 first) so the chart's series colours
  // stay stable regardless of who happened to be evaluated earliest.
  return studentIds.flatMap((studentId) => {
    const rows = daily.filter((row) => row.studentId === studentId)
    if (rows.length === 0) return []

    let points = 0
    let evaluations = 0
    let rawSum = 0
    let maxSum = 0

    const baseline: MomentumPoint[] =
      anchor && anchor < rows[0].day
        ? [{ date: anchor, points: 0, evaluations: 0, quality: 0, baseline: true }]
        : []

    return [
      {
        studentId,
        fullName: rows[0].fullName,
        points: baseline.concat(
          rows.map((row) => {
            points += row.points
            evaluations += row.evaluations
            rawSum += row.rawSum
            maxSum += row.maxSum
            return {
              date: row.day,
              points: Math.round(points * 10) / 10,
              evaluations,
              quality: maxSum ? Math.round((rawSum / maxSum) * 1000) / 10 : 0,
            }
          }),
        ),
      },
    ]
  })
}

/** Shift an ISO `YYYY-MM-DD` string by whole days, staying in UTC. */
function shiftDay(date: string, days: number) {
  if (!date) return date
  return new Date(new Date(`${date}T00:00:00Z`).getTime() + days * 86_400_000)
    .toISOString()
    .slice(0, 10)
}

export const getMomentum = unstable_cache(fetchMomentum, ['momentum'], { tags: [CACHE_TAG] })
