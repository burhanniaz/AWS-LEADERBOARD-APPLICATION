'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

/**
 * `ink` sits on the dark brand band (the rail), `surface` on a theme-flipping
 * background (the top bar on mobile, where the rail is hidden).
 */
const TONES = {
  ink: 'rounded-md text-white/80 hover:bg-white/10 hover:text-white',
  surface: 'rounded-md text-squid/70 hover:bg-squid/10 hover:text-squid',
  /** Matches the top bar's outlined utility cluster. */
  outlined:
    'rounded-xl border border-surface-border bg-surface/50 text-squid/55 hover:bg-surface hover:text-squid',
}

export function ThemeToggle({
  className = '',
  tone = 'ink',
}: {
  className?: string
  tone?: keyof typeof TONES
}) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  function toggle() {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`flex h-9 w-9 shrink-0 items-center justify-center transition-colors ${TONES[tone]} ${className}`}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  )
}
