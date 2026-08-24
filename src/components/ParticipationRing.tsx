import { formatNumber } from '@/lib/utils'

/**
 * Participation gauge: an SVG donut showing what share of the roster has at
 * least one evaluation, with the scored/pool counts beside it. Stroke is drawn
 * with `pathLength=100` so `strokeDasharray={percent}` maps straight to the
 * percentage regardless of the circle's real circumference.
 */
export function ParticipationRing({
  percent,
  scored,
  pool,
}: {
  percent: number
  scored: number
  pool: number
}) {
  const clamped = Math.max(0, Math.min(100, percent))

  return (
    <div className="card card-pad flex items-center gap-4">
      <div className="relative h-20 w-20 shrink-0">
        <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90" aria-hidden>
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            stroke="rgb(var(--color-squid))"
            strokeOpacity={0.1}
            strokeWidth="4"
          />
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            stroke="rgb(var(--color-smile))"
            strokeWidth="4"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${clamped} 100`}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-mono text-lg font-bold tabular-nums text-squid">
          {clamped}%
        </span>
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium text-squid/60">Participation</p>
        <dl className="mt-2 flex gap-5">
          <div>
            <dt className="text-[11px] text-squid/45">Scored</dt>
            <dd className="font-mono text-sm font-semibold tabular-nums text-squid/80">
              {formatNumber(scored)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-squid/45">Pool</dt>
            <dd className="font-mono text-sm font-semibold tabular-nums text-squid/80">
              {formatNumber(pool)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
