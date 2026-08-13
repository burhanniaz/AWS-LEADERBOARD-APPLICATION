import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const DEPARTMENTS = [
  { value: 'COMPUTER_SCIENCE', label: 'Computer Science' },
  { value: 'SOFTWARE_ENGINEERING', label: 'Software Engineering' },
  { value: 'COMPUTER_ENGINEERING', label: 'Computer Engineering' },
  { value: 'TELECOM_ENGINEERING', label: 'Telecom Engineering' },
] as const

export const studentSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  whatsappNumber: z.string().max(30).optional().or(z.literal('')),
  rollNumber: z.string().max(60).optional().or(z.literal('')),
  department: z
    .enum(['COMPUTER_SCIENCE', 'SOFTWARE_ENGINEERING', 'COMPUTER_ENGINEERING', 'TELECOM_ENGINEERING'])
    .optional()
    .or(z.literal('')),
  bio: z.string().max(1000).optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ALUMNI']).default('ACTIVE'),
  roleId: z.string().min(1).optional().or(z.literal('')),
  cycleId: z.string().min(1).optional().or(z.literal('')),
})

export const evaluationSchema = z.object({
  studentId: z.string().min(1),
  categoryId: z.string().min(1),
  cycleId: z.string().min(1),
  title: z.string().min(3).max(160),
  score: z.coerce.number().min(0).max(1000),
  maxScore: z.coerce.number().min(1).max(1000),
  reason: z.string().min(10, 'Explain why this score was given (min 10 characters).').max(2000),
  evidenceUrl: z.string().url().optional().or(z.literal('')),
  occurredAt: z.string().optional().or(z.literal('')),
})

export const categorySchema = z.object({
  name: z.string().min(2).max(60),
  description: z.string().max(400).optional().or(z.literal('')),
  weight: z.coerce.number().min(0.1).max(10),
  maxScore: z.coerce.number().min(1).max(1000),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  order: z.coerce.number().min(0).max(999),
  isActive: z.coerce.boolean().default(true),
})

export const roleSchema = z.object({
  name: z.string().min(2).max(60),
  description: z.string().max(400).optional().or(z.literal('')),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  rank: z.coerce.number().min(0).max(999),
})

export const cycleSchema = z.object({
  name: z.string().min(2).max(80),
  startDate: z.string().min(4),
  endDate: z.string().optional().or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
  isActive: z.coerce.boolean().default(false),
})

export function emptyToNull<T extends Record<string, unknown>>(input: T) {
  const output: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(input)) {
    output[key] = value === '' ? null : value
  }
  return output as { [K in keyof T]: T[K] extends string ? string | null : T[K] }
}
