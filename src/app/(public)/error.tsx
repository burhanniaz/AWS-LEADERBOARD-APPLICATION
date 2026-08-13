'use client'

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="container-page py-8 sm:py-10">
      <div className="card card-pad border-aws-red/30">
        <h2 className="text-lg font-bold text-squid">Something went wrong</h2>
        <p className="mt-2 max-w-2xl text-sm text-squid/70">
          {error.message || 'The page failed to load. Try again in a moment.'}
        </p>
        <button className="btn-secondary mt-4" onClick={() => reset()}>
          Try again
        </button>
      </div>
    </div>
  )
}
