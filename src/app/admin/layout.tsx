import Link from 'next/link'
import { BrandLock } from '@/components/Brand'
import { logoutAction } from '@/lib/actions'
import { requireAdmin } from '@/lib/guard'

const NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/students', label: 'Builders' },
  { href: '/admin/evaluations', label: 'Evaluations' },
  { href: '/admin/settings', label: 'Settings' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 bg-squid text-white">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <BrandLock href="/admin" />
          <div className="flex items-center gap-3">
            <Link href="/" className="hidden text-sm text-white/70 hover:text-white sm:block">
              View public board
            </Link>
            <span className="hidden text-sm text-white/50 md:block">{session.name}</span>
            <form action={logoutAction}>
              <button className="rounded-md border border-white/20 px-3 py-1.5 text-sm font-medium text-white/80 hover:bg-white/10">
                Sign out
              </button>
            </form>
          </div>
        </div>
        <nav className="border-t border-white/10">
          <div className="container-page flex gap-1 overflow-x-auto py-1 text-sm">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-md px-3 py-2 font-medium text-white/70 hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <main className="flex-1 pb-16">{children}</main>
    </div>
  )
}
