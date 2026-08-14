'use client'

import { useActionState, useEffect } from 'react'
import {
  saveCategoryAction,
  saveCycleAction,
  saveRoleAction,
  type ActionState,
} from '@/lib/actions'
import { FieldError } from '@/components/FieldError'
import { SubmitButton } from '@/components/SubmitButton'
import { useToast } from '@/components/Toast'
import { cn } from '@/lib/utils'

const initialState: ActionState = {}

function useActionToast(state: ActionState) {
  const toast = useToast()
  useEffect(() => {
    if (state.success) toast.push(state.success, 'success')
  }, [state.success, toast])
  useEffect(() => {
    if (state.error) toast.push(state.error, 'error')
  }, [state.error, toast])
}

export type CategoryValues = {
  id?: string
  name?: string
  description?: string | null
  weight?: number
  maxScore?: number
  color?: string
  order?: number
  isActive?: boolean
}

export function CategoryForm({ values = {} }: { values?: CategoryValues }) {
  const [state, formAction] = useActionState(saveCategoryAction, initialState)
  useActionToast(state)
  const fieldErrors = state.fieldErrors ?? {}

  return (
    <form action={formAction} className="space-y-3">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Name</label>
          <input
            name="name"
            required
            aria-invalid={fieldErrors.name ? true : undefined}
            className={cn('input', fieldErrors.name && 'border-aws-red focus:border-aws-red')}
            defaultValue={values.name ?? ''}
          />
          <FieldError message={fieldErrors.name} />
        </div>
        <div>
          <label className="label">Weight</label>
          <input
            name="weight"
            type="number"
            step="0.1"
            min={0.1}
            required
            aria-invalid={fieldErrors.weight ? true : undefined}
            className={cn('input', fieldErrors.weight && 'border-aws-red focus:border-aws-red')}
            defaultValue={values.weight ?? 1}
          />
          <FieldError message={fieldErrors.weight} />
        </div>
        <div>
          <label className="label">Default max score</label>
          <input
            name="maxScore"
            type="number"
            min={1}
            required
            aria-invalid={fieldErrors.maxScore ? true : undefined}
            className={cn('input', fieldErrors.maxScore && 'border-aws-red focus:border-aws-red')}
            defaultValue={values.maxScore ?? 10}
          />
          <FieldError message={fieldErrors.maxScore} />
        </div>
        <div>
          <label className="label">Colour</label>
          <input
            name="color"
            type="color"
            required
            className="input h-10 p-1"
            defaultValue={values.color ?? '#7B5EA7'}
          />
        </div>
        <div>
          <label className="label">Order</label>
          <input
            name="order"
            type="number"
            min={0}
            required
            className="input"
            defaultValue={values.order ?? 100}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Description</label>
          <input name="description" className="input" defaultValue={values.description ?? ''} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-squid/80">
        <input type="checkbox" name="isActive" defaultChecked={values.isActive ?? true} />
        Active
      </label>
      <SubmitButton className="btn-secondary">{values.id ? 'Save' : 'Add metric'}</SubmitButton>
    </form>
  )
}

export type RoleValues = {
  id?: string
  name?: string
  description?: string | null
  color?: string
  rank?: number
}

export function RoleForm({ values = {} }: { values?: RoleValues }) {
  const [state, formAction] = useActionState(saveRoleAction, initialState)
  useActionToast(state)
  const fieldErrors = state.fieldErrors ?? {}

  return (
    <form action={formAction} className="space-y-3">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Name</label>
          <input
            name="name"
            required
            aria-invalid={fieldErrors.name ? true : undefined}
            className={cn('input', fieldErrors.name && 'border-aws-red focus:border-aws-red')}
            defaultValue={values.name ?? ''}
          />
          <FieldError message={fieldErrors.name} />
        </div>
        <div>
          <label className="label">Colour</label>
          <input
            name="color"
            type="color"
            required
            className="input h-10 p-1"
            defaultValue={values.color ?? '#8B5CF6'}
          />
        </div>
        <div>
          <label className="label">Seniority rank</label>
          <input
            name="rank"
            type="number"
            min={0}
            required
            className="input"
            defaultValue={values.rank ?? 100}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Description</label>
          <input name="description" className="input" defaultValue={values.description ?? ''} />
        </div>
      </div>
      <SubmitButton className="btn-secondary">{values.id ? 'Save' : 'Add role'}</SubmitButton>
    </form>
  )
}

export type CycleValues = {
  id?: string
  name?: string
  startDate?: string
  endDate?: string | null
  notes?: string | null
  isActive?: boolean
}

export function CycleForm({ values = {} }: { values?: CycleValues }) {
  const [state, formAction] = useActionState(saveCycleAction, initialState)
  useActionToast(state)
  const fieldErrors = state.fieldErrors ?? {}

  return (
    <form action={formAction} className="space-y-3">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Session name</label>
          <input
            name="name"
            required
            aria-invalid={fieldErrors.name ? true : undefined}
            className={cn('input', fieldErrors.name && 'border-aws-red focus:border-aws-red')}
            placeholder="Session 2027"
            defaultValue={values.name ?? ''}
          />
          <FieldError message={fieldErrors.name} />
        </div>
        <div>
          <label className="label">Start date</label>
          <input
            name="startDate"
            type="date"
            required
            aria-invalid={fieldErrors.startDate ? true : undefined}
            className={cn('input', fieldErrors.startDate && 'border-aws-red focus:border-aws-red')}
            defaultValue={values.startDate ?? ''}
          />
          <FieldError message={fieldErrors.startDate} />
        </div>
        <div>
          <label className="label">End date</label>
          <input
            name="endDate"
            type="date"
            className="input"
            defaultValue={values.endDate ?? ''}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Notes</label>
          <input name="notes" className="input" defaultValue={values.notes ?? ''} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-squid/80">
        <input type="checkbox" name="isActive" defaultChecked={values.isActive ?? false} />
        Make this the active session
      </label>
      <SubmitButton className="btn-secondary">{values.id ? 'Save' : 'Add session'}</SubmitButton>
    </form>
  )
}
