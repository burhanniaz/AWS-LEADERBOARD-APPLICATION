'use client'

import {
  CalendarDays,
  CalendarRange,
  Link2,
  MessageSquareText,
  Tag,
  User,
} from 'lucide-react'
import { useActionState, useEffect, useMemo, useRef, useState } from 'react'
import { saveEvaluationAction, type ActionState } from '@/lib/actions'
import { FieldError } from '@/components/FieldError'
import { SubmitButton } from '@/components/SubmitButton'
import { useToast } from '@/components/Toast'
import { cn } from '@/lib/utils'

type Student = { id: string; fullName: string }
type Category = { id: string; name: string; maxScore: number; weight: number }
type Cycle = { id: string; name: string; isActive: boolean }

const initialState: ActionState = {}

function FieldLabel({
  icon: Icon,
  htmlFor,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <label className="label flex items-center gap-1.5" htmlFor={htmlFor}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {children}
    </label>
  )
}

function SectionHeading({ step, title }: { step: number; title: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-smile/10 text-xs font-bold text-smile">
        {step}
      </span>
      <h2 className="text-sm font-bold uppercase tracking-wide text-squid/70">{title}</h2>
    </div>
  )
}

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
  const [score, setScore] = useState(categories[0]?.maxScore ?? 10)
  const [reasonLength, setReasonLength] = useState(0)
  const toast = useToast()

  useEffect(() => {
    if (!state.success) return
    formRef.current?.reset()
    toast.push(state.success, 'success')
    const frame = requestAnimationFrame(() => {
      setMaxScore(categories[0]?.maxScore ?? 10)
      setScore(categories[0]?.maxScore ?? 10)
      setReasonLength(0)
    })
    return () => cancelAnimationFrame(frame)
  }, [state.success, toast, categories])

  useEffect(() => {
    if (state.error) toast.push(state.error, 'error')
  }, [state.error, toast])

  const fieldErrors = state.fieldErrors ?? {}
  const activeCycle = cycles.find((cycle) => cycle.isActive) ?? cycles[0]

  const quality = useMemo(
    () => (maxScore > 0 ? Math.round((score / maxScore) * 100) : 0),
    [score, maxScore],
  )
  const qualityTone =
    quality >= 80
      ? 'bg-aws-green/10 text-aws-green'
      : quality >= 50
        ? 'bg-smile/10 text-smile-dark'
        : 'bg-aws-red/10 text-aws-red'

  return (
    <form ref={formRef} action={formAction} className="card space-y-8 p-6 sm:p-8">
      <div className="space-y-4">
        <SectionHeading step={1} title="Who & what" />
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel icon={User} htmlFor="studentId">
              Builder *
            </FieldLabel>
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
            <FieldLabel icon={Tag} htmlFor="categoryId">
              Metric *
            </FieldLabel>
            <select
              id="categoryId"
              name="categoryId"
              required
              className="input py-3 text-base"
              defaultValue={categories[0]?.id ?? ''}
              onChange={(event) => {
                const category = categories.find((item) => item.id === event.target.value)
                if (category) {
                  setMaxScore(category.maxScore)
                  setScore(category.maxScore)
                }
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
            <FieldLabel icon={CalendarRange} htmlFor="cycleId">
              Session *
            </FieldLabel>
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
            <FieldLabel icon={CalendarDays} htmlFor="occurredAt">
              Date
            </FieldLabel>
            <input id="occurredAt" name="occurredAt" type="date" className="input py-3 text-base" />
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-surface-border pt-6">
        <div className="flex items-center justify-between">
          <SectionHeading step={2} title="Score" />
          <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold tabular-nums', qualityTone)}>
            {quality}% quality
          </span>
        </div>
        <div className="grid grid-cols-2 gap-5">
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
              className="input py-3 text-center text-lg font-bold"
              value={maxScore}
              onChange={(event) => {
                const next = Number(event.target.value)
                setMaxScore(next)
                if (score > next) setScore(next)
              }}
            />
          </div>
          <div>
            <label className="label" htmlFor="score">
              Score achieved *
            </label>
            <input
              id="score"
              name="score"
              type="number"
              step="0.5"
              min={0}
              max={maxScore}
              required
              aria-invalid={fieldErrors.score ? true : undefined}
              className={cn(
                'input py-3 text-center text-lg font-bold',
                fieldErrors.score && 'border-aws-red focus:border-aws-red',
              )}
              value={score}
              onChange={(event) => setScore(Number(event.target.value))}
            />
            <FieldError message={fieldErrors.score} />
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-surface-border pt-6">
        <SectionHeading step={3} title="Justification" />
        <div>
          <div className="flex items-center justify-between">
            <FieldLabel icon={MessageSquareText} htmlFor="reason">
              Reason for this score *
            </FieldLabel>
            <span
              className={cn(
                'mb-1.5 text-xs tabular-nums',
                reasonLength > 0 && reasonLength < 10 ? 'text-aws-red' : 'text-squid/40',
              )}
            >
              {reasonLength}/10 min
            </span>
          </div>
          <textarea
            id="reason"
            name="reason"
            rows={3}
            required
            minLength={10}
            aria-invalid={fieldErrors.reason ? true : undefined}
            className={cn(
              'input py-3 text-base',
              (fieldErrors.reason || (reasonLength > 0 && reasonLength < 10)) &&
                'border-aws-red focus:border-aws-red',
            )}
            placeholder="What did they do, and why does it deserve this score?"
            onChange={(event) => setReasonLength(event.target.value.trim().length)}
          />
          <FieldError message={fieldErrors.reason} />
        </div>

        <div>
          <FieldLabel icon={Link2} htmlFor="evidenceUrl">
            Evidence link
          </FieldLabel>
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
