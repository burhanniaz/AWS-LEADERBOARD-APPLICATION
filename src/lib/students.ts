import { unstable_cache } from 'next/cache'
import { sql } from '@/lib/db'
import type { Evaluation, RoleAssignment, Student } from '@/lib/db-types'

const CACHE_TAG = 'board-data'

type SkillEntry = {
  skillId: string
  skill: { id: string; name: string; slug: string }
}

type RoleAssignmentEntry = RoleAssignment & {
  role: { id: string; name: string; slug: string; color: string; rank: number }
  cycle: { id: string; name: string; slug: string }
}

type EvaluationEntry = Evaluation & {
  category: { id: string; name: string; slug: string; color: string; weight: number }
  cycle: { id: string; name: string }
  evaluator: { name: string } | null
}

type StudentProfileRow = Student & {
  skills: SkillEntry[]
  roleAssignments: RoleAssignmentEntry[]
  evaluations: EvaluationEntry[]
}

async function fetchStudentProfile(id: string): Promise<StudentProfileRow | null> {
  const [student] = await sql<Student[]>`SELECT * FROM "Student" WHERE id = ${id}`
  if (!student) return null

  const [skillRows, roleAssignmentRows, evaluationRows] = await Promise.all([
    sql<{ skillId: string; id: string; name: string; slug: string }[]>`
      SELECT ss."skillId", sk.id, sk.name, sk.slug
      FROM "StudentSkill" ss
      JOIN "Skill" sk ON sk.id = ss."skillId"
      WHERE ss."studentId" = ${id}
    `,
    sql<
      (RoleAssignment & {
        roleName: string
        roleSlug: string
        roleColor: string
        roleRank: number
        cycleName: string
        cycleSlug: string
      })[]
    >`
      SELECT ra.*, r.name as "roleName", r.slug as "roleSlug", r.color as "roleColor", r.rank as "roleRank",
             c.name as "cycleName", c.slug as "cycleSlug"
      FROM "RoleAssignment" ra
      JOIN "Role" r ON r.id = ra."roleId"
      JOIN "Cycle" c ON c.id = ra."cycleId"
      WHERE ra."studentId" = ${id}
      ORDER BY ra."startedAt" DESC
    `,
    sql<
      (Evaluation & {
        categoryName: string
        categorySlug: string
        categoryColor: string
        categoryWeight: number
        cycleName: string
        evaluatorName: string | null
      })[]
    >`
      SELECT e.*, cat.name as "categoryName", cat.slug as "categorySlug", cat.color as "categoryColor", cat.weight as "categoryWeight",
             cyc.name as "cycleName", au.name as "evaluatorName"
      FROM "Evaluation" e
      JOIN "Category" cat ON cat.id = e."categoryId"
      JOIN "Cycle" cyc ON cyc.id = e."cycleId"
      LEFT JOIN "AdminUser" au ON au.id = e."evaluatorId"
      WHERE e."studentId" = ${id}
      ORDER BY e."occurredAt" DESC
    `,
  ])

  return {
    ...student,
    skills: skillRows.map((row) => ({
      skillId: row.skillId,
      skill: { id: row.id, name: row.name, slug: row.slug },
    })),
    roleAssignments: roleAssignmentRows.map((row) => ({
      id: row.id,
      studentId: row.studentId,
      roleId: row.roleId,
      cycleId: row.cycleId,
      startedAt: row.startedAt,
      endedAt: row.endedAt,
      note: row.note,
      createdAt: row.createdAt,
      role: { id: row.roleId, name: row.roleName, slug: row.roleSlug, color: row.roleColor, rank: row.roleRank },
      cycle: { id: row.cycleId, name: row.cycleName, slug: row.cycleSlug },
    })),
    evaluations: evaluationRows.map((row) => ({
      id: row.id,
      studentId: row.studentId,
      categoryId: row.categoryId,
      cycleId: row.cycleId,
      evaluatorId: row.evaluatorId,
      title: row.title,
      score: row.score,
      maxScore: row.maxScore,
      reason: row.reason,
      evidenceUrl: row.evidenceUrl,
      occurredAt: row.occurredAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      category: {
        id: row.categoryId,
        name: row.categoryName,
        slug: row.categorySlug,
        color: row.categoryColor,
        weight: row.categoryWeight,
      },
      cycle: { id: row.cycleId, name: row.cycleName },
      evaluator: row.evaluatorName ? { name: row.evaluatorName } : null,
    })),
  }
}

export const getStudentProfile = unstable_cache(fetchStudentProfile, ['student-profile'], {
  tags: [CACHE_TAG],
})

type DirectoryStudent = Student & {
  roleAssignments: { role: { id: string; name: string; slug: string; color: string } }[]
  _count: { evaluations: number }
}

async function fetchStudentDirectory(query?: string): Promise<DirectoryStudent[]> {
  const like = query ? `%${query}%` : null

  const students = await sql<Student[]>`
    SELECT * FROM "Student"
    ${like ? sql`WHERE ("fullName" ILIKE ${like} OR email ILIKE ${like} OR "rollNumber" ILIKE ${like})` : sql``}
    ORDER BY "fullName" ASC
  `

  if (students.length === 0) return []

  const ids = students.map((student) => student.id)

  const [roleRows, countRows] = await Promise.all([
    sql<{ studentId: string; roleId: string; roleName: string; roleSlug: string; roleColor: string }[]>`
      SELECT DISTINCT ON (ra."studentId") ra."studentId", r.id as "roleId", r.name as "roleName", r.slug as "roleSlug", r.color as "roleColor"
      FROM "RoleAssignment" ra
      JOIN "Role" r ON r.id = ra."roleId"
      WHERE ra."studentId" IN ${sql(ids)}
      ORDER BY ra."studentId", ra."startedAt" DESC
    `,
    sql<{ studentId: string; count: number }[]>`
      SELECT "studentId", COUNT(*)::int as count FROM "Evaluation" WHERE "studentId" IN ${sql(ids)} GROUP BY "studentId"
    `,
  ])

  const roleByStudent = new Map(roleRows.map((row) => [row.studentId, row]))
  const countByStudent = new Map(countRows.map((row) => [row.studentId, row.count]))

  return students.map((student) => {
    const role = roleByStudent.get(student.id)
    return {
      ...student,
      roleAssignments: role
        ? [{ role: { id: role.roleId, name: role.roleName, slug: role.roleSlug, color: role.roleColor } }]
        : [],
      _count: { evaluations: countByStudent.get(student.id) ?? 0 },
    }
  })
}

export const getStudentDirectory = unstable_cache(fetchStudentDirectory, ['student-directory'], {
  tags: [CACHE_TAG],
})

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
