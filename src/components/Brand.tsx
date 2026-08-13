import Image from 'next/image'
import Link from 'next/link'

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
      <span className="hidden text-sm font-semibold leading-tight sm:block">
        AWS UET Taxila
        <span className="block text-xs font-normal text-white/60">Builder Leaderboard</span>
      </span>
    </Link>
  )
}
