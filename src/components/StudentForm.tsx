'use client'

import { useFormState } from 'react-dom'
import { saveStudentAction, type ActionState } from '@/lib/actions'
import { SubmitButton } from '@/components/SubmitButton'

type Option = { id: string; name: string }

export type StudentFormValues = {
  id?: string
  fullName?: string
  email?: string
  rollNumber?: string | null
  institution?: string | null
  avatarUrl?: string | null
  bio?: string | null
  githubUrl?: string | null
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
          <label className="label" htmlFor="institution">
            Institution
          </label>
          <input
            id="institution"
            name="institution"
            className="input"
            defaultValue={values.institution ?? ''}
          />
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
          <label className="label" htmlFor="cycleId">
            Cycle for that role
          </label>
          <select id="cycleId" name="cycleId" className="input" defaultValue={values.cycleId ?? ''}>
            <option value="">Select cycle</option>
            {cycles.map((cycle) => (
              <option key={cycle.id} value={cycle.id}>
                {cycle.name}
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
        <div>
          <label className="label" htmlFor="avatarUrl">
            Avatar URL
          </label>
          <input
            id="avatarUrl"
            name="avatarUrl"
            type="url"
            className="input"
            defaultValue={values.avatarUrl ?? ''}
          />
        </div>
        <div>
          <label className="label" htmlFor="githubUrl">
            GitHub URL
          </label>
          <input
            id="githubUrl"
            name="githubUrl"
            type="url"
            className="input"
            defaultValue={values.githubUrl ?? ''}
          />
        </div>
        <div>
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
