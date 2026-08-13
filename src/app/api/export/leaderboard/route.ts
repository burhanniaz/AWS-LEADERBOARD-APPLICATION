import { csvResponse, toCsv } from '@/lib/csv'
import { getActiveCycle, getLeaderboard } from '@/lib/leaderboard'
import { departmentLabel } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cycleId = searchParams.get('cycleId') ?? (await getActiveCycle())?.id
  if (!cycleId) return new Response('No cycle found', { status: 404 })

  const rows = await getLeaderboard({ cycleId })

  const csv = toCsv(
    ['Rank', 'Name', 'Email', 'Department', 'Role', 'Points', 'Quality %', 'Evaluations'],
    rows.map((row) => [
      row.rank,
      row.fullName,
      row.email,
      departmentLabel(row.department),
      row.roleName,
      row.totalPoints,
      row.quality,
      row.evaluationCount,
    ]),
  )

  return csvResponse(`leaderboard-${cycleId}.csv`, csv)
}
