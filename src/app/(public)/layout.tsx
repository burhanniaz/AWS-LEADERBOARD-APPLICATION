import { AppRail } from '@/components/AppRail'
import { TopBar } from '@/components/TopBar'
import { SiteFooter } from '@/components/SiteFooter'
import { PageTransition } from '@/components/PageTransition'
import { readSession } from '@/lib/auth'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await readSession()

  return (
    <div className="flex min-h-screen">
      <AppRail isAuthed={!!session} userName={session?.name} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar isAuthed={!!session} userName={session?.name} pill="Cohort 2026 · Live" />
        <main className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <SiteFooter />
      </div>
    </div>
  )
}
