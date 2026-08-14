'use client'

import { useEffect, useState } from 'react'

export function ScoreBar({
  label,
  value,
  max,
  color,
  caption,
}: {
  label: string
  value: number
  max: number
  color: string
  caption?: string
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setWidth(pct))
    return () => cancelAnimationFrame(frame)
  }, [pct])

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
        <span className="font-medium text-squid">{label}</span>
        <span className="tabular-nums text-squid/60">{caption ?? `${pct}%`}</span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
