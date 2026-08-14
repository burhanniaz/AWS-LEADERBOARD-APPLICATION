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
  icon,
}: {
  label: string
  value: string | number
  hint?: string
  icon?: keyof typeof ICONS
}) {
  const Icon = icon ? ICONS[icon] : null

  return (
    <div className="card card-pad transition-shadow hover:shadow-raised">
      <div className="flex items-center gap-2">
        {Icon ? (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-smile/10 text-smile">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        ) : null}
        <p className="truncate text-xs font-semibold uppercase tracking-wide text-squid/60">{label}</p>
      </div>
      <p className="mt-2 truncate text-3xl font-bold tabular-nums text-squid">
        {typeof value === 'number' ? <CountUp value={value} /> : value}
      </p>
      {hint ? <p className="mt-1 truncate text-xs text-squid/60">{hint}</p> : null}
    </div>
  )
}
