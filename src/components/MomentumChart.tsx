'use client'

import { useId, useMemo, useState } from 'react'
import type { MomentumSeries } from '@/lib/leaderboard'
import { cn, formatNumber } from '@/lib/utils'

const METRICS = [
  { key: 'points', label: 'Points' },
  { key: 'evaluations', label: 'Evaluations' },
  { key: 'quality', label: 'Quality' },
] as const

type MetricKey = (typeof METRICS)[number]['key']

const RANGES = [
  { key: 'M', label: 'Last month', days: 31 },
  { key: 'Q', label: 'Last quarter', days: 92 },
  { key: 'Y', label: 'Full cycle', days: Number.POSITIVE_INFINITY },
] as const

type RangeKey = (typeof RANGES)[number]['key']

const VIEW_W = 640
const VIEW_H = 200
const PAD_X = 8
const PAD_Y = 12

/**
 * Up to five ranked builders. Rank #1 keeps the brand accent and the area fill;
 * the rest take distinct hues. Dash patterns vary alongside colour so the series
 * stay separable without relying on colour vision alone — four of the five hues
 * are theme-aware tokens, and the purple is a mid-tone that holds up on both the
 * cream and ink backgrounds.
 */
const SERIES = [
  { color: 'rgb(var(--color-smile))', dash: undefined },
  { color: 'rgb(var(--color-aws-blue))', dash: '6 4' },
  { color: 'rgb(var(--color-aws-green))', dash: '2 4' },
  { color: '#7C5FC4', dash: '10 4 2 4' },
  { color: 'rgb(var(--color-aws-red))', dash: '1 5' },
] as const

const seriesStyle = (index: number) => SERIES[index % SERIES.length]

/**
 * Cumulative momentum for the top two builders, drawn as inline SVG rather than
 * pulling in a charting library — the shape is two monotonic series, which is
 * far less code than a dependency and keeps the page free of client-side chart
 * runtime. Series are pre-accumulated server-side; this only projects them.
 */
export function MomentumChart({
  series,
  cycleName,
}: {
  series: MomentumSeries[]
  cycleName: string
}) {
  const gradientId = useId()
  const [metric, setMetric] = useState<MetricKey>('points')
  const [range, setRange] = useState<RangeKey>('Y')

  const view = useMemo(() => {
    const days = RANGES.find((item) => item.key === range)!.days
    // The cutoff is measured from the latest datapoint, not today: a cycle that
    // finished last term would otherwise filter down to nothing.
    const allDates = series.flatMap((s) => s.points.map((p) => p.date)).sort()
    const latest = allDates.at(-1)
    const cutoff =
      latest && Number.isFinite(days)
        ? new Date(new Date(latest).getTime() - days * 86_400_000).toISOString().slice(0, 10)
        : null

    const windowed = series.map((s) => ({
      ...s,
      points: cutoff ? s.points.filter((p) => p.date >= cutoff) : s.points,
    }))
    const windowedDates = [...new Set(windowed.flatMap((s) => s.points.map((p) => p.date)))].sort()

    // A window narrow enough to leave one coordinate can't be drawn (a
    // single-point path renders nothing), so fall back to the full cycle
    // rather than showing an empty plot.
    const trimmed = windowedDates.length >= 2 ? windowed : series
    const dates =
      windowedDates.length >= 2
        ? windowedDates
        : [...new Set(series.flatMap((s) => s.points.map((p) => p.date)))].sort()

    const max = Math.max(
      ...trimmed.flatMap((s) => s.points.map((p) => p[metric])),
      metric === 'quality' ? 100 : 1,
    )

    return { trimmed, dates, max }
  }, [series, metric, range])

  const { trimmed, dates, max } = view

  if (dates.length === 0) {
    return (
      <ChartShell cycleName={cycleName} metric={metric} setMetric={setMetric} range={range} setRange={setRange} legend={[]}>
        <div className="flex h-[200px] items-center justify-center text-sm text-squid/45">
          No evaluations recorded in this cycle yet.
        </div>
      </ChartShell>
    )
  }

  const x = (date: string) =>
    dates.length === 1
      ? VIEW_W / 2
      : PAD_X + (dates.indexOf(date) / (dates.length - 1)) * (VIEW_W - PAD_X * 2)
  const y = (value: number) => VIEW_H - PAD_Y - (value / max) * (VIEW_H - PAD_Y * 2)

  return (
    <ChartShell
      cycleName={cycleName}
      metric={metric}
      setMetric={setMetric}
      range={range}
      setRange={setRange}
      legend={trimmed.map((s, i) => ({ name: s.fullName, color: seriesStyle(i).color }))}
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="h-[200px] w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label={`${METRICS.find((m) => m.key === metric)!.label} over ${cycleName} for ${new Intl.ListFormat(
          undefined,
          { style: 'long', type: 'conjunction' },
        ).format(trimmed.map((s) => s.fullName))}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(var(--color-smile))" stopOpacity="0.35" />
            <stop offset="100%" stopColor="rgb(var(--color-smile))" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75, 1].map((step) => (
          <line
            key={step}
            x1={0}
            x2={VIEW_W}
            y1={y(max * step)}
            y2={y(max * step)}
            stroke="rgb(var(--color-squid))"
            strokeOpacity={0.07}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {trimmed.map((s, index) => {
          // Carry the last known value forward on days a builder wasn't scored,
          // so a cumulative line never dips just because the other one moved.
          //
          // Quality is an average rather than a running total, so the synthetic
          // cycle-start zero would draw a climb from 0% that never happened —
          // it starts flat at the first real reading instead.
          const firstReal = s.points.find((point) => !point.baseline)
          let carried = metric === 'quality' ? firstReal?.quality ?? 0 : 0
          const path = dates
            .map((date) => {
              const point = s.points.find((p) => p.date === date)
              if (point && !(metric === 'quality' && point.baseline)) carried = point[metric]
              return `${x(date)},${y(carried)}`
            })
            .join(' L ')
          const lead = index === 0
          const style = seriesStyle(index)

          return (
            <g key={s.studentId}>
              {lead ? (
                <path
                  d={`M ${path} L ${x(dates.at(-1)!)},${VIEW_H} L ${x(dates[0])},${VIEW_H} Z`}
                  fill={`url(#${gradientId})`}
                />
              ) : null}
              <path
                d={`M ${path}`}
                fill="none"
                stroke={style.color}
                strokeOpacity={lead ? 1 : 0.8}
                strokeWidth={lead ? 2.5 : 1.75}
                strokeDasharray={style.dash}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          )
        })}
      </svg>

      <div className="mt-2 flex justify-between font-mono text-[10px] text-squid/35">
        <span>{formatDay(dates[0])}</span>
        {dates.length > 2 ? <span>{formatDay(dates[Math.floor(dates.length / 2)])}</span> : null}
        {dates.length > 1 ? <span>{formatDay(dates.at(-1)!)}</span> : null}
      </div>

      <p className="sr-only">
        {trimmed.map((s) => {
          const last = s.points.at(-1)
          return `${s.fullName}: ${last ? formatNumber(last[metric]) : 0}. `
        })}
      </p>
    </ChartShell>
  )
}

function ChartShell({
  cycleName,
  metric,
  setMetric,
  range,
  setRange,
  legend,
  children,
}: {
  cycleName: string
  metric: MetricKey
  setMetric: (value: MetricKey) => void
  range: RangeKey
  setRange: (value: RangeKey) => void
  legend: { name: string; color: string }[]
  children: React.ReactNode
}) {
  return (
    <section className="card card-pad">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-squid">Cohort momentum</h2>
          <p className="mt-0.5 text-xs text-squid/50">
            Cumulative totals,{' '}
            {legend.length > 1 ? `top ${legend.length} builders` : 'rank #1'} — {cycleName}
          </p>
        </div>
        <div className="flex rounded-full border border-surface-border p-0.5" role="group" aria-label="Time range">
          {RANGES.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setRange(item.key)}
              aria-pressed={range === item.key}
              title={item.label}
              className={cn(
                'h-7 w-7 rounded-full font-mono text-[11px] font-semibold transition-colors',
                range === item.key
                  ? 'bg-smile text-white'
                  : 'text-squid/45 hover:bg-squid/5 hover:text-squid',
              )}
            >
              {item.key}
            </button>
          ))}
        </div>
      </div>

      {legend.length ? (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
          {legend.map((item) => (
            <span
              key={item.name}
              className="flex min-w-0 items-center gap-1.5 text-xs text-squid/55"
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
                aria-hidden
              />
              <span className="truncate">{item.name}</span>
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex gap-1 rounded-full bg-squid/5 p-1" role="group" aria-label="Metric">
        {METRICS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setMetric(item.key)}
            aria-pressed={metric === item.key}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
              metric === item.key
                ? 'bg-smile text-white shadow-sm'
                : 'text-squid/55 hover:text-squid',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4">{children}</div>
    </section>
  )
}

function formatDay(date: string) {
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
