import { csvResponse, toCsv } from '@/lib/csv'
import { getActiveCycle } from '@/lib/leaderboard'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cycleId = searchParams.get('cycleId') ?? (await getActiveCycle())?.id
  if (!cycleId) return new Response('No cycle found', { status: 404 })

  const evaluations = await prisma.evaluation.findMany({
    where: { cycleId },
    orderBy: { occurredAt: 'desc' },
    include: {
      student: { select: { fullName: true, email: true } },
      category: { select: { name: true, weight: true } },
      evaluator: { select: { name: true } },
    },
  })

  const csv = toCsv(
    ['Date', 'Builder', 'Email', 'Metric', 'Weight', 'Title', 'Score', 'Max', 'Reason', 'Evidence', 'Evaluator'],
    evaluations.map((item) => [
      item.occurredAt.toISOString().slice(0, 10),
      item.student.fullName,
      item.student.email,
      item.category.name,
      item.category.weight,
      item.title,
      item.score,
      item.maxScore,
      item.reason,
      item.evidenceUrl,
      item.evaluator?.name,
    ]),
  )

  return csvResponse(`evaluations-${cycleId}.csv`, csv)
}
