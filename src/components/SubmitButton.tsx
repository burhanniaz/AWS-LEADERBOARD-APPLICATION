'use client'

import { Loader2 } from 'lucide-react'
import { useFormStatus } from 'react-dom'

export function SubmitButton({
  children,
  className = 'btn-primary',
  pendingLabel = 'Saving…',
}: {
  children: React.ReactNode
  className?: string
  pendingLabel?: string
}) {
  const { pending } = useFormStatus()

  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
      {pending ? pendingLabel : children}
    </button>
  )
}
