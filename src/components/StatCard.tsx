'use client'

import {
  Award,
  BarChart3,
  CalendarRange,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Crown,
  Percent,
  Trophy,
  UserX,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

// Icons are looked up by key rather than accepted as a rendered element/component
// prop: Server Components passing a lucide (forwardRef) component reference across
// the RSC boundary into this Client Component fails serialization, so the mapping
// stays entirely inside the client module instead.
const ICONS = {
  users: Users,
  clipboardCheck: ClipboardCheck,
  checkCircle: CheckCircle2,
  crown: Crown,
  calendar: CalendarRange,
  percent: Percent,
  chart: BarChart3,
  trophy: Trophy,
  award: Award,
  clipboardList: ClipboardList,
  userX: UserX,
} satisfies Record<string, LucideIcon>

function CountUp({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const duration = 600
    const start = performance.now()
    let frame: number

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(value * eased)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value])

  const rounded = Number.isInteger(value) ? Math.round(display) : Math.round(display * 10) / 10

  return <span ref={ref}>{rounded}</span>
}

export function StatCard({
  label,
  value,
  hint,
  stats,
  icon,
}: {
  label: string
  value: string | number
  hint?: string
  /** Up to two supporting figures shown in the card's divided footer. */
  stats?: { label: string; value: string }[]
  icon?: keyof typeof ICONS
}) {
  const Icon = icon ? ICONS[icon] : null
  // Figures, ratios and percentages ("42", "42/48", "87%") read as data;
  // anything with letters is a label and keeps the sans treatment.
  const numeric = typeof value === 'number' || /^[\d.,%/\s+-]+$/.test(value)

  return (
    <div className="card card-pad flex flex-col transition-shadow hover:shadow-raised">
      <div className="flex items-start justify-between gap-3">
        <p className="truncate text-sm font-medium text-squid/60">{label}</p>
        {Icon ? (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-smile/10 text-smile">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        ) : null}
      </div>
      <p
        className={cn(
          // `mb-5` is the minimum gap; the footer's `mt-auto` then absorbs any
          // extra height so footers line up across cards of unequal content.
          'mb-5 mt-3 truncate font-bold text-squid',
          // Figures get the ledger treatment; a name ("Current #1") would look
          // absurd at 28px mono, so text values stay sans and a size down.
          numeric
            ? 'font-mono text-[28px] leading-none tabular-nums'
            : 'text-xl leading-snug',
        )}
      >
        {typeof value === 'number' ? <CountUp value={value} /> : value}
      </p>
      {stats?.length ? (
        <dl className="mt-auto grid grid-cols-2 gap-3 border-t border-surface-border pt-3">
          {stats.map((stat) => (
            <div key={stat.label} className="min-w-0">
              <dt className="truncate text-[11px] text-squid/45">{stat.label}</dt>
              <dd className="truncate font-mono text-sm font-semibold tabular-nums text-squid/80">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : hint ? (
        <p className="mt-4 truncate border-t border-surface-border pt-3 text-xs text-squid/55">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
