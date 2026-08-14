'use client'

import { Lock, Mail } from 'lucide-react'
import { useActionState, useEffect } from 'react'
import { loginAction, type ActionState } from '@/lib/actions'
import { FieldError } from '@/components/FieldError'
import { SubmitButton } from '@/components/SubmitButton'
import { useToast } from '@/components/Toast'
import { cn } from '@/lib/utils'

const initialState: ActionState = {}

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(loginAction, initialState)
  const toast = useToast()
  const fieldErrors = state.fieldErrors ?? {}

  useEffect(() => {
    if (state.error) toast.push(state.error, 'error')
  }, [state.error, toast])

  return (
    <form action={formAction} className="space-y-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <div>
        <label className="label" htmlFor="email">
          Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-squid/40" aria-hidden />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={fieldErrors.email ? true : undefined}
            className={cn('input pl-9', fieldErrors.email && 'border-aws-red focus:border-aws-red')}
            placeholder="you@club.org"
          />
        </div>
        <FieldError message={fieldErrors.email} />
      </div>

      <div>
        <label className="label" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-squid/40" aria-hidden />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
            aria-invalid={fieldErrors.password ? true : undefined}
            className={cn('input pl-9', fieldErrors.password && 'border-aws-red focus:border-aws-red')}
            placeholder="••••••••"
          />
        </div>
        <FieldError message={fieldErrors.password} />
      </div>

      <SubmitButton className="btn-primary w-full" pendingLabel="Signing in…">
        Sign in
      </SubmitButton>
    </form>
  )
}
