import Link from 'next/link'
import { ExternalLink, LogOut } from 'lucide-react'
import { AdminNavLinks } from '@/components/AdminNavLinks'
import { BrandLock } from '@/components/Brand'
import { ThemeToggle } from '@/components/ThemeToggle'
import { logoutAction } from '@/lib/actions'
import { requireAdmin } from '@/lib/guard'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="glow-field sticky top-0 z-40 bg-ink/95 text-white backdrop-blur-md shadow-raised">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <BrandLock href="/admin" />
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white sm:flex"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              View public board
            </Link>
            <span className="hidden text-sm text-white/50 md:block">{session.name}</span>
            <ThemeToggle />
            <form action={logoutAction}>
              <button className="flex items-center gap-1.5 rounded-md border border-white/20 px-3 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10">
                <LogOut className="h-3.5 w-3.5" aria-hidden />
                Sign out
              </button>
            </form>
          </div>
        </div>
        <nav className="border-t border-white/10">
          <div className="container-page flex gap-1 overflow-x-auto py-1 text-sm">
            <AdminNavLinks />
          </div>
        </nav>
      </header>

      <main className="flex-1 pb-16">{children}</main>
    </div>
  )
}
