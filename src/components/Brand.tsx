import Image from 'next/image'
import Link from 'next/link'

/**
 * The chapter's chip mark, redrawn as vector so it inherits `currentColor`.
 * The raster logo is a fixed violet-on-slate PNG, which fights the warm console
 * palette and can't flip between themes — this keeps the same silhouette while
 * letting the mark take the brand accent.
 */
export function ChipMark({ className = 'h-6 w-6' }: { className?: string }) {
  const teeth = [26, 44.5, 63]

  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor" aria-hidden focusable="false">
      {teeth.map((offset) => (
        <g key={offset}>
          <rect x={offset} y={4} width={11} height={16} rx={1.5} />
          <rect x={offset} y={80} width={11} height={16} rx={1.5} />
          <rect x={4} y={offset} width={16} height={11} rx={1.5} />
          <rect x={80} y={offset} width={16} height={11} rx={1.5} />
        </g>
      ))}
      <path
        d="M18 18h64v64H18z"
        fill="none"
        stroke="currentColor"
        strokeWidth={13}
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Brand tile: the mark on the accent square used at the top of the rail. */
export function BrandTile({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <span
      className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-smile to-smile-dark text-white shadow-glow ${className}`}
    >
      <ChipMark className="h-[55%] w-[55%]" />
    </span>
  )
}

export function AwsMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="AWS UET Taxila"
      width={100}
      height={100}
      className={`${className} object-contain`}
      priority
    />
  )
}

export function BrandLock({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 text-white">
      <AwsMark />
      <span className="hidden h-8 w-px bg-white/25 sm:block" />
      <span className="hidden font-heading text-sm font-semibold leading-tight sm:block">
        AWS UET Taxila
        <span className="block text-xs font-normal text-white/60">Builder Leaderboard</span>
      </span>
    </Link>
  )
}
