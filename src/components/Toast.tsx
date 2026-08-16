'use client'

import { AlertCircle, CheckCircle2, X } from 'lucide-react'
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

type Toast = { id: number; message: string; type: 'success' | 'error' }
type ToastContextValue = { push: (message: string, type?: Toast['type']) => void }

const ToastContext = createContext<ToastContextValue | null>(null)
const TOAST_DURATION = 4000

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const idRef = useRef(0)
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const dismiss = useCallback((id: number) => {
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const schedule = useCallback(
    (id: number) => {
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), TOAST_DURATION),
      )
    },
    [dismiss],
  )

  const push = useCallback(
    (message: string, type: Toast['type'] = 'success') => {
      const id = idRef.current++
      setToasts((current) => [...current, { id, message, type }])
      schedule(id)
    },
    [schedule],
  )

  const value = useMemo(() => ({ push }), [push])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:right-4 sm:left-auto">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.type === 'error' ? 'alert' : 'status'}
            onMouseEnter={() => clearTimeout(timers.current.get(toast.id))}
            onMouseLeave={() => schedule(toast.id)}
            onFocus={() => clearTimeout(timers.current.get(toast.id))}
            onBlur={() => schedule(toast.id)}
            tabIndex={-1}
            className={`pointer-events-auto flex w-full max-w-sm animate-slide-down items-start gap-2 rounded-lg border p-3 pr-2 text-sm shadow-raised backdrop-blur-sm ${
              toast.type === 'error'
                ? 'border-aws-red/30 bg-aws-red/10 text-aws-red'
                : 'border-aws-green/30 bg-aws-green/10 text-aws-green'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            ) : (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            )}
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss"
              className="rounded p-0.5 opacity-60 hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
