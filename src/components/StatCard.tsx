export function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string | number
  hint?: string
}) {
  return (
    <div className="card card-pad">
      <p className="text-xs font-semibold uppercase tracking-wide text-squid/50">{label}</p>
      <p className="mt-2 text-3xl font-bold tabular-nums text-squid">{value}</p>
      {hint ? <p className="mt-1 text-xs text-squid/50">{hint}</p> : null}
    </div>
  )
}
