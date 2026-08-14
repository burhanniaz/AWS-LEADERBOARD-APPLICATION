'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { saveEvaluationAction, type ActionState } from '@/lib/actions'
import { SubmitButton } from '@/components/SubmitButton'
import { useToast } from '@/components/Toast'

type Student = { id: string; fullName: string }
type Category = { id: string; name: string; maxScore: number; weight: number }
type Cycle = { id: string; name: string; isActive: boolean }

const initialState: ActionState = {}

export function EvaluationForm({
  students,
  categories,
  cycles,
  defaultStudentId,
}: {
  students: Student[]
  categories: Category[]
  cycles: Cycle[]
  defaultStudentId?: string
}) {
  const [state, formAction] = useActionState(saveEvaluationAction, initialState)
  const formRef = useRef<HTMLFormElement>(null)
  const [maxScore, setMaxScore] = useState(categories[0]?.maxScore ?? 10)
  const toast = useToast()

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
      toast.push(state.success, 'success')
    }
  }, [state.success, toast])

  useEffect(() => {
    if (state.error) toast.push(state.error, 'error')
  }, [state.error, toast])

  const activeCycle = cycles.find((cycle) => cycle.isActive) ?? cycles[0]

  return (
    <form ref={formRef} action={formAction} className="card space-y-6 p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label text-sm" htmlFor="studentId">
            Builder *
          </label>
          <select
            id="studentId"
            name="studentId"
            required
            className="input py-3 text-base"
            defaultValue={defaultStudentId ?? ''}
          >
            <option value="">Select a builder</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.fullName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label text-sm" htmlFor="categoryId">
            Metric *
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            className="input py-3 text-base"
            defaultValue={categories[0]?.id ?? ''}
            onChange={(event) => {
              const category = categories.find((item) => item.id === event.target.value)
              if (category) setMaxScore(category.maxScore)
            }}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label text-sm" htmlFor="score">
            Score *
          </label>
          <input
            id="score"
            name="score"
            type="number"
            step="0.5"
            min={0}
            max={maxScore}
            required
            className="input py-3 text-base"
            defaultValue={maxScore}
          />
        </div>

        <div>
          <label className="label text-sm" htmlFor="maxScore">
            Out of *
          </label>
          <input
            id="maxScore"
            name="maxScore"
            type="number"
            step="1"
            min={1}
            required
            className="input py-3 text-base"
            value={maxScore}
            onChange={(event) => setMaxScore(Number(event.target.value))}
          />
        </div>

        <div>
          <label className="label text-sm" htmlFor="cycleId">
            Session *
          </label>
          <select
            id="cycleId"
            name="cycleId"
            required
            className="input py-3 text-base"
            defaultValue={activeCycle?.id ?? ''}
          >
            {cycles.map((cycle) => (
              <option key={cycle.id} value={cycle.id}>
                {cycle.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label text-sm" htmlFor="occurredAt">
            Date
          </label>
          <input id="occurredAt" name="occurredAt" type="date" className="input py-3 text-base" />
        </div>

        <div className="sm:col-span-2">
          <label className="label text-sm" htmlFor="reason">
            Reason for this score *
          </label>
          <textarea
            id="reason"
            name="reason"
            rows={3}
            required
            minLength={10}
            className="input py-3 text-base"
            placeholder=""
          />
        </div>

        <div className="sm:col-span-2">
          <label className="label text-sm" htmlFor="evidenceUrl">
            Evidence link
          </label>
          <input
            id="evidenceUrl"
            name="evidenceUrl"
            type="url"
            className="input py-3 text-base"
            placeholder="PR, repo, certificate or attendance sheet"
          />
        </div>
      </div>

      <SubmitButton className="btn-primary w-full py-3 text-base" pendingLabel="Recording…">
        Record evaluation
      </SubmitButton>
    </form>
  )
}
