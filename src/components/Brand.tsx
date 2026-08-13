import Link from 'next/link'

export function AwsMark({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 42" className={className} role="img" aria-label="AWS">
      <text
        x="0"
        y="24"
        fill="currentColor"
        fontFamily="var(--font-sans)"
        fontSize="26"
        fontWeight="700"
        letterSpacing="-1"
      >
        aws
      </text>
      <path
        d="M4 32c14 8 44 10 62 1"
        fill="none"
        stroke="#FF9900"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path d="M60 30l6 3-6 3z" fill="#FF9900" />
    </svg>
  )
}

export function BrandLock({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 text-white">
      <AwsMark />
      <span className="hidden h-8 w-px bg-white/25 sm:block" />
      <span className="hidden text-sm font-semibold leading-tight sm:block">
        Cloud Club
        <span className="block text-xs font-normal text-white/60">Builder Leaderboard</span>
      </span>
    </Link>
  )
}
