import { cn } from '@/lib/utils'

const MEDALS: Record<number, string> = {
  1: 'bg-smile text-white ring-smile/40',
  2: 'bg-[#C0C6CE] text-squid ring-[#C0C6CE]/40',
  3: 'bg-[#CD8B62] text-white ring-[#CD8B62]/40',
}

export function RankBadge({ rank }: { rank: number }) {
  const medal = MEDALS[rank]

  return (
    <span
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums',
        medal ? `${medal} ring-4` : 'bg-surface-muted text-squid/60',
      )}
    >
      {rank}
    </span>
  )
}
