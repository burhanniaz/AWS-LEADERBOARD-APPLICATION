'use client'

import { useFormState } from 'react-dom'
import { saveStudentAction, type ActionState } from '@/lib/actions'
import { SubmitButton } from '@/components/SubmitButton'
import { DEPARTMENTS } from '@/lib/validation'

type Option = { id: string; name: string }

export type StudentFormValues = {
  id?: string
  fullName?: string
  email?: string
  whatsappNumber?: string | null
  rollNumber?: string | null
  department?: string | null
  bio?: string | null
  linkedinUrl?: string | null
  status?: 'ACTIVE' | 'INACTIVE' | 'ALUMNI'
  roleId?: string
  cycleId?: string
}

const initialState: ActionState = {}

export function StudentForm({
  roles,
  cycles,
  values = {},
}: {
  roles: Option[]
  cycles: Option[]
  values?: StudentFormValues
}) {
  const [state, formAction] = useFormState(saveStudentAction, initialState)

  return (
    <form action={formAction} className="card card-pad space-y-5">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="fullName">
            Full name *
          </label>
          <input
            id="fullName"
            name="fullName"
            required
            className="input"
            defaultValue={values.fullName ?? ''}
          />
        </div>
        <div>
          <label className="label" htmlFor="rollNumber">
            Roll / student number
          </label>
          <input
            id="rollNumber"
            name="rollNumber"
            className="input"
            defaultValue={values.rollNumber ?? ''}
          />
        </div>

        <div>
          <label className="label" htmlFor="email">
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="input"
            defaultValue={values.email ?? ''}
          />
        </div>
        <div>
          <label className="label" htmlFor="whatsappNumber">
            WhatsApp number
          </label>
          <input
            id="whatsappNumber"
            name="whatsappNumber"
            type="tel"
            className="input"
            placeholder="+92 3xx xxxxxxx"
            defaultValue={values.whatsappNumber ?? ''}
          />
        </div>

        <div>
          <label className="label" htmlFor="cycleId">
            Session
          </label>
          <select id="cycleId" name="cycleId" className="input" defaultValue={values.cycleId ?? ''}>
            <option value="">Select session</option>
            {cycles.map((cycle) => (
              <option key={cycle.id} value={cycle.id}>
                {cycle.name}
              </option>
            ))}
          </select>
          {cycles.length === 0 ? (
            <p className="mt-1 text-xs text-squid/50">
              No sessions yet — add one under Settings.
            </p>
          ) : null}
        </div>
        <div>
          <label className="label" htmlFor="department">
            Department
          </label>
          <select
            id="department"
            name="department"
            className="input"
            defaultValue={values.department ?? ''}
          >
            <option value="">Select department</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept.value} value={dept.value}>
                {dept.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="roleId">
            Role
          </label>
          <select id="roleId" name="roleId" className="input" defaultValue={values.roleId ?? ''}>
            <option value="">No role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="status">
            Status
          </label>
          <select id="status" name="status" className="input" defaultValue={values.status ?? 'ACTIVE'}>
            <option value="ACTIVE">Active</option>
            <option value="ALUMNI">Alumni</option>
            <option value="INACTIVE">Inactive (hidden from board)</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="label" htmlFor="linkedinUrl">
            LinkedIn URL
          </label>
          <input
            id="linkedinUrl"
            name="linkedinUrl"
            type="url"
            className="input"
            defaultValue={values.linkedinUrl ?? ''}
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="bio">
          Short bio
        </label>
        <textarea id="bio" name="bio" rows={3} className="input" defaultValue={values.bio ?? ''} />
      </div>

      {state.error ? (
        <p role="alert" className="rounded-md bg-aws-red/10 px-3 py-2 text-sm text-aws-red">
          {state.error}
        </p>
      ) : null}

      <SubmitButton>{values.id ? 'Save changes' : 'Add builder'}</SubmitButton>
    </form>
  )
}
