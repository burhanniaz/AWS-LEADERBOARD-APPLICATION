import { cn } from '@/lib/utils'

/**
 * Ledger-style rank: a zero-padded mono numeral rather than a medal disc.
 * Only the leader is accented — in a long table, three coloured discs competed
 * with the points column for attention.
 */
export function RankBadge({ rank }: { rank: number }) {
  return (
    <span
      className={cn(
        'inline-block font-mono text-sm font-bold tabular-nums',
        rank === 1 ? 'text-smile-dark dark:text-smile' : 'text-squid/40',
      )}
    >
      {String(rank).padStart(2, '0')}
    </span>
  )
}
