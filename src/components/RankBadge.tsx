import { cn, RANK_COLORS } from '@/lib/utils'

const MEDAL_TEXT: Record<number, string> = {
  1: 'bg-smile text-white ring-smile/40',
  2: 'text-squid',
  3: 'text-white',
}

export function RankBadge({ rank }: { rank: number }) {
  const medal = MEDAL_TEXT[rank]
  const color = rank === 2 || rank === 3 ? RANK_COLORS[rank] : undefined

  return (
    <span
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums',
        rank === 1 ? `${medal} ring-4` : medal ? medal : 'bg-surface-muted text-squid/60',
      )}
      style={color ? { backgroundColor: color, boxShadow: `0 0 0 4px ${color}66` } : undefined}
    >
      {rank}
    </span>
  )
}
