export function SetupNotice({ detail }: { detail?: string }) {
  return (
    <div className="card card-pad border-smile/40 bg-smile/5">
      <h2 className="text-lg font-bold text-squid">Database not connected yet</h2>
      <p className="mt-2 max-w-2xl text-sm text-squid/70">
        The app is running, but it cannot reach a Postgres database. Copy{' '}
        <code className="rounded bg-white px-1 py-0.5 text-xs">.env.example</code> to{' '}
        <code className="rounded bg-white px-1 py-0.5 text-xs">.env</code>, set{' '}
        <code className="rounded bg-white px-1 py-0.5 text-xs">DATABASE_URL</code> and{' '}
        <code className="rounded bg-white px-1 py-0.5 text-xs">AUTH_SECRET</code>, then run the
        commands below.
      </p>
      <pre className="mt-4 overflow-x-auto rounded-lg bg-squid p-4 text-xs leading-relaxed text-white">
        {`psql "$DATABASE_URL" -f db/schema.sql\nnpm run seed`}
      </pre>
      {detail ? (
        <p className="mt-3 break-words text-xs text-squid/50">Details: {detail}</p>
      ) : null}
    </div>
  )
}
