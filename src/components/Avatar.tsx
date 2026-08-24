import { cn, initials } from '@/lib/utils'

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl',
}

export function Avatar({
  name,
  size = 'md',
  square = false,
  className,
}: {
  name: string
  size?: keyof typeof SIZES
  /** Rounded-square treatment used for the account chip in the rail and top bar. */
  square?: boolean
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center bg-ink font-bold text-smile',
        square ? 'rounded-xl' : 'rounded-full',
        SIZES[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  )
}
