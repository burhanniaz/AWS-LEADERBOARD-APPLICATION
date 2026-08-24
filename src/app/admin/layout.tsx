import Link from 'next/link'
import { ExternalLink, LogOut } from 'lucide-react'
import { AdminMobileNav, AdminNavLinks } from '@/components/AdminNavLinks'
import { AppRail } from '@/components/AppRail'
import { TopBar } from '@/components/TopBar'
import { PageTransition } from '@/components/PageTransition'
import { logoutAction } from '@/lib/actions'
import { requireAdmin } from '@/lib/guard'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin()

  return (
    <div className="flex min-h-screen">
      <AppRail isAuthed userName={session.name} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          title="Admin"
          pill={session.name}
          isAuthed
          userName={session.name}
          mobileNav={<AdminMobileNav />}
          actions={
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="hidden items-center gap-1.5 text-sm text-squid/60 transition-colors hover:text-squid sm:flex"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                View public board
              </Link>
              <form action={logoutAction}>
                <button
                  className="flex h-9 items-center gap-1.5 rounded-md border border-surface-border px-2.5 text-sm font-medium text-squid/70 transition-colors hover:bg-squid/10 hover:text-squid sm:px-3"
                  aria-label="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </form>
            </div>
          }
          below={
            <nav
              aria-label="Admin sections"
              className="container-page hidden gap-1 py-1 text-sm md:flex"
            >
              <AdminNavLinks />
            </nav>
          }
        />

        <main className="flex-1 pb-16">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  )
}
