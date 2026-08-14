import { BrandLock } from '@/components/Brand'
import { HeaderNav } from '@/components/HeaderNav'
import { readSession } from '@/lib/auth'

export async function SiteHeader() {
  const session = await readSession()

  return (
    <header className="glow-field sticky top-0 z-40 border-b border-white/10 bg-ink/95 text-white backdrop-blur-md shadow-raised">
      <div className="container-page relative flex h-16 items-center justify-between gap-4">
        <BrandLock />
        <HeaderNav isAuthed={!!session} />
      </div>
    </header>
  )
}
