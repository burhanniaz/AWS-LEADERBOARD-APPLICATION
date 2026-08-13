'use client'

import { useFormState } from 'react-dom'
import { loginAction, type ActionState } from '@/lib/actions'
import { SubmitButton } from '@/components/SubmitButton'

const initialState: ActionState = {}

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useFormState(loginAction, initialState)

  return (
    <form action={formAction} className="space-y-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <div>
        <label className="label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="input"
          placeholder="you@club.org"
        />
      </div>

      <div>
        <label className="label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          className="input"
          placeholder="••••••••"
        />
      </div>

      {state.error ? (
        <p role="alert" className="rounded-md bg-aws-red/10 px-3 py-2 text-sm text-aws-red">
          {state.error}
        </p>
      ) : null}

      <SubmitButton className="btn-primary w-full" pendingLabel="Signing in…">
        Sign in
      </SubmitButton>
    </form>
  )
}
