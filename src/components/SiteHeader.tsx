import Link from 'next/link'
import { BrandLock } from '@/components/Brand'
import { readSession } from '@/lib/auth'

const NAV = [
  { href: '/', label: 'Leaderboard' },
  { href: '/students', label: 'Builders' },
  { href: '/insights', label: 'Insights' },
]

export async function SiteHeader() {
  const session = await readSession()

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-squid text-white">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <BrandLock />

        <nav className="flex items-center gap-1 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={session ? '/admin' : '/login'}
            className="ml-2 rounded-md bg-smile px-3 py-2 font-semibold text-squid transition-colors hover:bg-smile-light"
          >
            {session ? 'Admin' : 'Sign in'}
          </Link>
        </nav>
      </div>
    </header>
  )
}
