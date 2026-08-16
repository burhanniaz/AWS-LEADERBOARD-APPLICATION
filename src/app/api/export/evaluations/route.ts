import { csvResponse, toCsv } from '@/lib/csv'
import { sql } from '@/lib/db'
import { getActiveCycle } from '@/lib/leaderboard'
import { readSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

type ExportRow = {
  occurredAt: Date
  studentFullName: string
  studentEmail: string
  categoryName: string
  categoryWeight: number
  title: string
  score: number
  maxScore: number
  reason: string
  evidenceUrl: string | null
  evaluatorName: string | null
}

export async function GET(request: Request) {
  const session = await readSession()
  if (!session) return new Response('Unauthorized', { status: 401 })

  const { searchParams } = new URL(request.url)
  const cycleId = searchParams.get('cycleId') ?? (await getActiveCycle())?.id
  if (!cycleId) return new Response('No cycle found', { status: 404 })

  const evaluations = await sql<ExportRow[]>`
    SELECT e."occurredAt", s."fullName" as "studentFullName", s.email as "studentEmail",
           c.name as "categoryName", c.weight as "categoryWeight",
           e.title, e.score, e."maxScore", e.reason, e."evidenceUrl", au.name as "evaluatorName"
    FROM "Evaluation" e
    JOIN "Student" s ON s.id = e."studentId"
    JOIN "Category" c ON c.id = e."categoryId"
    LEFT JOIN "AdminUser" au ON au.id = e."evaluatorId"
    WHERE e."cycleId" = ${cycleId}
    ORDER BY e."occurredAt" DESC
  `

  const csv = toCsv(
    ['Date', 'Builder', 'Email', 'Metric', 'Weight', 'Title', 'Score', 'Max', 'Reason', 'Evidence', 'Evaluator'],
    evaluations.map((item) => [
      item.occurredAt.toISOString().slice(0, 10),
      item.studentFullName,
      item.studentEmail,
      item.categoryName,
      item.categoryWeight,
      item.title,
      item.score,
      item.maxScore,
      item.reason,
      item.evidenceUrl,
      item.evaluatorName,
    ]),
  )

  return csvResponse(`evaluations-${cycleId}.csv`, csv)
}
