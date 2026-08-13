'use client'

import { useEffect, useRef, useState } from 'react'
import { useFormState } from 'react-dom'
import { saveEvaluationAction, type ActionState } from '@/lib/actions'
import { SubmitButton } from '@/components/SubmitButton'

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
  const [state, formAction] = useFormState(saveEvaluationAction, initialState)
  const formRef = useRef<HTMLFormElement>(null)
  const [maxScore, setMaxScore] = useState(categories[0]?.maxScore ?? 10)

  useEffect(() => {
    if (state.success) formRef.current?.reset()
  }, [state.success])

  const activeCycle = cycles.find((cycle) => cycle.isActive) ?? cycles[0]

  return (
    <form ref={formRef} action={formAction} className="card card-pad space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="studentId">
            Builder *
          </label>
          <select
            id="studentId"
            name="studentId"
            required
            className="input"
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
          <label className="label" htmlFor="categoryId">
            Metric *
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            className="input"
            defaultValue={categories[0]?.id ?? ''}
            onChange={(event) => {
              const category = categories.find((item) => item.id === event.target.value)
              if (category) setMaxScore(category.maxScore)
            }}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} (×{category.weight})
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="label" htmlFor="title">
            What is being scored? *
          </label>
          <input
            id="title"
            name="title"
            required
            className="input"
            placeholder="e.g. Delivered the Lambda hands-on workshop"
          />
        </div>

        <div>
          <label className="label" htmlFor="score">
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
            className="input"
            defaultValue={maxScore}
          />
        </div>

        <div>
          <label className="label" htmlFor="maxScore">
            Out of *
          </label>
          <input
            id="maxScore"
            name="maxScore"
            type="number"
            step="1"
            min={1}
            required
            className="input"
            value={maxScore}
            onChange={(event) => setMaxScore(Number(event.target.value))}
          />
        </div>

        <div>
          <label className="label" htmlFor="cycleId">
            Cycle *
          </label>
          <select
            id="cycleId"
            name="cycleId"
            required
            className="input"
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
          <label className="label" htmlFor="occurredAt">
            Date
          </label>
          <input id="occurredAt" name="occurredAt" type="date" className="input" />
        </div>

        <div className="sm:col-span-2">
          <label className="label" htmlFor="reason">
            Reason for this score *
          </label>
          <textarea
            id="reason"
            name="reason"
            rows={3}
            required
            minLength={10}
            className="input"
            placeholder="Why this score? This is what makes the decision defensible later."
          />
        </div>

        <div className="sm:col-span-2">
          <label className="label" htmlFor="evidenceUrl">
            Evidence link
          </label>
          <input
            id="evidenceUrl"
            name="evidenceUrl"
            type="url"
            className="input"
            placeholder="PR, repo, certificate or attendance sheet"
          />
        </div>
      </div>

      {state.error ? (
        <p role="alert" className="rounded-md bg-aws-red/10 px-3 py-2 text-sm text-aws-red">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p role="status" className="rounded-md bg-aws-green/10 px-3 py-2 text-sm text-aws-green">
          {state.success}
        </p>
      ) : null}

      <SubmitButton pendingLabel="Recording…">Record evaluation</SubmitButton>
    </form>
  )
}
