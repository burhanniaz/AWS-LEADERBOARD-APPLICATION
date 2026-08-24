// Custom role/category colors come straight from the database and can be
// anything an admin picks, so we never use them as text color — a dark
// custom color would be unreadable on a dark-mode card. The color is only
// ever a decorative dot plus a faint background tint; the label itself
// always renders in the theme's own (contrast-safe) ink color.
export function ColorBadge({
  color,
  children,
  plain = false,
  className = 'bg-surface-muted text-squid/80',
}: {
  color?: string | null
  children: React.ReactNode
  /** Dot + label with no pill fill — used in dense table rows. */
  plain?: boolean
  className?: string
}) {
  if (!color) {
    return plain ? (
      <span className="text-sm text-squid/70">{children}</span>
    ) : (
      <span className={`badge ${className}`}>{children}</span>
    )
  }

  const dot = (
    <span
      className="h-1.5 w-1.5 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden
    />
  )

  if (plain) {
    return (
      <span className="inline-flex items-center gap-2 text-sm text-squid/75">
        {dot}
        {children}
      </span>
    )
  }

  return (
    <span className="badge bg-surface-muted text-squid" style={{ backgroundColor: `${color}1A` }}>
      {dot}
      {children}
    </span>
  )
}
