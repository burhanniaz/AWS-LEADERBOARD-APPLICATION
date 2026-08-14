import { ShieldCheck, Trophy } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-surface-border bg-surface-muted">
      <div className="container-page flex flex-col gap-2 py-8 text-sm text-squid/60 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-smile" aria-hidden />
          AWS UET Taxila — Builder performance record.
        </p>
        <p className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-smile" aria-hidden />
          Scores are recorded with a written justification and an audit trail.
        </p>
      </div>
    </footer>
  )
}
