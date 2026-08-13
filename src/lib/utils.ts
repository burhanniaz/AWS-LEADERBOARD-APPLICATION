import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatNumber(value: number, digits = 1) {
  return Number.isInteger(value) ? String(value) : value.toFixed(digits)
}

const DEPARTMENT_LABELS: Record<string, string> = {
  COMPUTER_SCIENCE: 'Computer Science',
  SOFTWARE_ENGINEERING: 'Software Engineering',
  COMPUTER_ENGINEERING: 'Computer Engineering',
  TELECOM_ENGINEERING: 'Telecom Engineering',
}

export function departmentLabel(value: string | null | undefined) {
  if (!value) return null
  return DEPARTMENT_LABELS[value] ?? value
}
