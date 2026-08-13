export type AdminRole = 'OWNER' | 'EVALUATOR'
export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'ALUMNI'
export type Department =
  | 'COMPUTER_SCIENCE'
  | 'SOFTWARE_ENGINEERING'
  | 'COMPUTER_ENGINEERING'
  | 'TELECOM_ENGINEERING'

export type AdminUser = {
  id: string
  email: string
  name: string
  passwordHash: string
  role: AdminRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type Cycle = {
  id: string
  name: string
  slug: string
  startDate: Date
  endDate: Date | null
  isActive: boolean
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export type Role = {
  id: string
  name: string
  slug: string
  description: string | null
  color: string
  rank: number
  createdAt: Date
  updatedAt: Date
}

export type Student = {
  id: string
  fullName: string
  email: string
  whatsappNumber: string | null
  rollNumber: string | null
  department: Department | null
  bio: string | null
  linkedinUrl: string | null
  status: StudentStatus
  joinedAt: Date
  createdAt: Date
  updatedAt: Date
}

export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  weight: number
  maxScore: number
  color: string
  icon: string
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type Evaluation = {
  id: string
  studentId: string
  categoryId: string
  cycleId: string
  evaluatorId: string | null
  title: string
  score: number
  maxScore: number
  reason: string
  evidenceUrl: string | null
  occurredAt: Date
  createdAt: Date
  updatedAt: Date
}

export type Skill = {
  id: string
  name: string
  slug: string
  createdAt: Date
}

export type RoleAssignment = {
  id: string
  studentId: string
  roleId: string
  cycleId: string
  startedAt: Date
  endedAt: Date | null
  note: string | null
  createdAt: Date
}
