import { InsightsSection } from '@/components/InsightsSection'
import { SetupNotice } from '@/components/SetupNotice'
import { getActiveCycle, getCycles } from '@/lib/leaderboard'

export const metadata = { title: 'Insights' }

async function Insights({ cycleId }: { cycleId?: string }) {
  const [cycles, fallbackActiveCycle] = await Promise.all([
    getCycles(),
    cycleId ? Promise.resolve(null) : getActiveCycle(),
  ])
  const cycle = cycleId ? cycles.find((item) => item.id === cycleId) : fallbackActiveCycle
  if (!cycle) {
    return (
      <div className="card card-pad text-sm text-squid/60">
        Create a cycle in the admin panel to see insights.
      </div>
    )
  }

  return <InsightsSection cycle={cycle} />
}

export default async function InsightsPage(props: {
  searchParams: Promise<{ cycle?: string }>
}) {
  const searchParams = await props.searchParams
  let content: React.ReactNode
  try {
    content = await Insights({ cycleId: searchParams.cycle })
  } catch (error) {
    content = <SetupNotice detail={error instanceof Error ? error.message : undefined} />
  }

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-squid">Insights</h1>
        <p className="text-sm text-squid/55">
          Where the club is strong, where it is thin, and who leads each metric.
        </p>
      </div>
      <div>{content}</div>
    </div>
  )
}
