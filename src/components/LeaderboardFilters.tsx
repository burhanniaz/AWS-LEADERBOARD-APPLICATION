'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { CalendarRange, Loader2, Search, SlidersHorizontal, Tags } from 'lucide-react'
import { useEffect, useRef, useTransition } from 'react'

type Option = { value: string; label: string }

export function LeaderboardFilters({
  cycles,
  roles,
  categories,
}: {
  cycles: Option[]
  roles: Option[]
  categories: Option[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(debounceRef.current), [])

  function navigate(params: URLSearchParams) {
    startTransition(() => router.replace(`${pathname}?${params.toString()}`, { scroll: false }))
  }

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    navigate(params)
  }

  // Debounced so a full RSC round-trip (route re-render + cached data-layer
  // lookup) doesn't fire on every keystroke — only once typing pauses.
  function updateSearch(value: string) {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => update('q', value), 300)
  }

  return (
    <div className="card card-pad relative" data-pending={isPending || undefined}>
      {isPending ? (
        <span className="absolute right-4 top-4 flex items-center gap-1.5 text-xs font-medium text-smile">
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          Updating…
        </span>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="label" htmlFor="filter-search">
            Search
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-squid/40" aria-hidden />
            <input
              id="filter-search"
              className="input pl-9"
              placeholder="Name, email or roll number"
              defaultValue={searchParams.get('q') ?? ''}
              onChange={(event) => updateSearch(event.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="filter-cycle">
            Cycle
          </label>
          <div className="relative">
            <CalendarRange className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-squid/40" aria-hidden />
            <select
              id="filter-cycle"
              className="input pl-9"
              defaultValue={searchParams.get('cycle') ?? ''}
              onChange={(event) => update('cycle', event.target.value)}
            >
              <option value="">Active cycle</option>
              {cycles.map((cycle) => (
                <option key={cycle.value} value={cycle.value}>
                  {cycle.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="filter-role">
            Role
          </label>
          <div className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-squid/40" aria-hidden />
            <select
              id="filter-role"
              className="input pl-9"
              defaultValue={searchParams.get('role') ?? ''}
              onChange={(event) => update('role', event.target.value)}
            >
              <option value="">All roles</option>
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="filter-category">
            Metric
          </label>
          <div className="relative">
            <Tags className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-squid/40" aria-hidden />
            <select
              id="filter-category"
              className="input pl-9"
              defaultValue={searchParams.get('category') ?? ''}
              onChange={(event) => update('category', event.target.value)}
            >
              <option value="">All metrics</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
