'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  CalendarRange,
  ChevronDown,
  Loader2,
  Search,
  SlidersHorizontal,
  Tags,
  type LucideIcon,
} from 'lucide-react'
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
    <div
      className="relative flex flex-col gap-3 md:flex-row md:items-center"
      data-pending={isPending || undefined}
    >
      <div className="relative min-w-0 flex-1">
        <label className="sr-only" htmlFor="filter-search">
          Search
        </label>
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-squid/40"
          aria-hidden
        />
        <input
          id="filter-search"
          className="filter-pill"
          placeholder="Name, email or roll number"
          defaultValue={searchParams.get('q') ?? ''}
          onChange={(event) => updateSearch(event.target.value)}
        />
        {isPending ? (
          <Loader2
            className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-smile"
            aria-hidden
          />
        ) : null}
        <span className="sr-only" role="status">
          {isPending ? 'Updating results' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:w-auto md:shrink-0">
        <FilterSelect
          id="filter-cycle"
          label="Cycle"
          icon={CalendarRange}
          placeholder="Active cycle"
          options={cycles}
          value={searchParams.get('cycle') ?? ''}
          onChange={(value) => update('cycle', value)}
        />
        <FilterSelect
          id="filter-role"
          label="Role"
          icon={SlidersHorizontal}
          placeholder="All roles"
          options={roles}
          value={searchParams.get('role') ?? ''}
          onChange={(value) => update('role', value)}
        />
        <FilterSelect
          id="filter-category"
          label="Metric"
          icon={Tags}
          placeholder="All metrics"
          options={categories}
          value={searchParams.get('category') ?? ''}
          onChange={(value) => update('category', value)}
        />
      </div>
    </div>
  )
}

function FilterSelect({
  id,
  label,
  icon: Icon,
  placeholder,
  options,
  value,
  onChange,
}: {
  id: string
  label: string
  icon: LucideIcon
  placeholder: string
  options: Option[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="relative">
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <Icon
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-squid/40"
        aria-hidden
      />
      <select
        id={id}
        className="filter-pill appearance-none pr-8"
        defaultValue={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-squid/40"
        aria-hidden
      />
    </div>
  )
}
