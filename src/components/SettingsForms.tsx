'use client'

import { useFormState } from 'react-dom'
import {
  saveCategoryAction,
  saveCycleAction,
  saveRoleAction,
  type ActionState,
} from '@/lib/actions'
import { SubmitButton } from '@/components/SubmitButton'

const initialState: ActionState = {}

function Feedback({ state }: { state: ActionState }) {
  if (state.error) {
    return (
      <p role="alert" className="rounded-md bg-aws-red/10 px-3 py-2 text-sm text-aws-red">
        {state.error}
      </p>
    )
  }
  if (state.success) {
    return (
      <p role="status" className="rounded-md bg-aws-green/10 px-3 py-2 text-sm text-aws-green">
        {state.success}
      </p>
    )
  }
  return null
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
  const [state, formAction] = useFormState(saveCategoryAction, initialState)

  return (
    <form action={formAction} className="space-y-3">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Name</label>
          <input name="name" required className="input" defaultValue={values.name ?? ''} />
        </div>
        <div>
          <label className="label">Weight</label>
          <input
            name="weight"
            type="number"
            step="0.1"
            min={0.1}
            required
            className="input"
            defaultValue={values.weight ?? 1}
          />
        </div>
        <div>
          <label className="label">Default max score</label>
          <input
            name="maxScore"
            type="number"
            min={1}
            required
            className="input"
            defaultValue={values.maxScore ?? 10}
          />
        </div>
        <div>
          <label className="label">Colour</label>
          <input
            name="color"
            type="color"
            required
            className="input h-10 p-1"
            defaultValue={values.color ?? '#0972D3'}
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
      <Feedback state={state} />
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
  const [state, formAction] = useFormState(saveRoleAction, initialState)

  return (
    <form action={formAction} className="space-y-3">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Name</label>
          <input name="name" required className="input" defaultValue={values.name ?? ''} />
        </div>
        <div>
          <label className="label">Colour</label>
          <input
            name="color"
            type="color"
            required
            className="input h-10 p-1"
            defaultValue={values.color ?? '#FF9900'}
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
      <Feedback state={state} />
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
  const [state, formAction] = useFormState(saveCycleAction, initialState)

  return (
    <form action={formAction} className="space-y-3">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Name</label>
          <input
            name="name"
            required
            className="input"
            placeholder="Cohort 2027"
            defaultValue={values.name ?? ''}
          />
        </div>
        <div>
          <label className="label">Start date</label>
          <input
            name="startDate"
            type="date"
            required
            className="input"
            defaultValue={values.startDate ?? ''}
          />
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
        Make this the active cycle
      </label>
      <Feedback state={state} />
      <SubmitButton className="btn-secondary">{values.id ? 'Save' : 'Add cycle'}</SubmitButton>
    </form>
  )
}
