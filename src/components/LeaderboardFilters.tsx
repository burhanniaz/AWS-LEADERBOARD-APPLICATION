'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
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
    <div className="card card-pad" data-pending={isPending || undefined}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="label" htmlFor="filter-search">
            Search
          </label>
          <input
            id="filter-search"
            className="input"
            placeholder="Name, email or roll number"
            defaultValue={searchParams.get('q') ?? ''}
            onChange={(event) => updateSearch(event.target.value)}
          />
        </div>

        <div>
          <label className="label" htmlFor="filter-cycle">
            Cycle
          </label>
          <select
            id="filter-cycle"
            className="input"
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

        <div>
          <label className="label" htmlFor="filter-role">
            Role
          </label>
          <select
            id="filter-role"
            className="input"
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

        <div>
          <label className="label" htmlFor="filter-category">
            Metric
          </label>
          <select
            id="filter-category"
            className="input"
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
  )
}
