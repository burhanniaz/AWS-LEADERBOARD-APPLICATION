'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { newId, sql } from '@/lib/db'
import type { AdminUser, Category, Cycle, Evaluation, Role, Student } from '@/lib/db-types'
import {
  clearSessionCookie,
  createSessionToken,
  setSessionCookie,
} from '@/lib/auth'
import { requireAdmin } from '@/lib/guard'
import { slugify } from '@/lib/utils'
import {
  categorySchema,
  cycleSchema,
  evaluationSchema,
  loginSchema,
  roleSchema,
  studentSchema,
} from '@/lib/validation'

export type ActionState = { error?: string; success?: string; fieldErrors?: Record<string, string> }

function parseError(error: unknown): { error: string; fieldErrors?: Record<string, string> } {
  if (error && typeof error === 'object' && 'issues' in error) {
    const issues = (error as { issues: { message: string; path: (string | number)[] }[] }).issues
    const fieldErrors: Record<string, string> = {}
    for (const issue of issues) {
      const key = issue.path[0]
      if (typeof key === 'string' && !fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return { error: issues[0]?.message ?? 'Invalid input.', fieldErrors }
  }
  return { error: error instanceof Error ? error.message : 'Something went wrong.' }
}

function optional(value: FormDataEntryValue | null) {
  const text = typeof value === 'string' ? value.trim() : ''
  return text === '' ? null : text
}

async function log(actorId: string | null, action: string, entity: string, entityId: string | null, summary: string) {
  await sql`
    INSERT INTO "ActivityLog" (id, "actorId", action, entity, "entityId", summary, "createdAt")
    VALUES (${newId()}, ${actorId}, ${action}, ${entity}, ${entityId}, ${summary}, now())
  `
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let target = '/admin'
  try {
    const parsed = loginSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    })

    const [user] = await sql<AdminUser[]>`SELECT * FROM "AdminUser" WHERE email = ${parsed.email}`
    if (!user || !user.isActive || !(await bcrypt.compare(parsed.password, user.passwordHash))) {
      return { error: 'Incorrect email or password.' }
    }

    const token = await createSessionToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })
    await setSessionCookie(token)
    await log(user.id, 'LOGIN', 'AdminUser', user.id, `${user.name} signed in`)

    const next = formData.get('next')
    if (typeof next === 'string' && next.startsWith('/admin')) target = next
  } catch (error) {
    return parseError(error)
  }
  redirect(target)
}

export async function logoutAction() {
  await clearSessionCookie()
  redirect('/login')
}

export async function saveStudentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireAdmin()
    const id = optional(formData.get('id'))
    const parsed = studentSchema.parse(Object.fromEntries(formData))

    const whatsappNumber = optional(formData.get('whatsappNumber'))
    const rollNumber = optional(formData.get('rollNumber'))
    const department = parsed.department ? parsed.department : null
    const bio = optional(formData.get('bio'))
    const linkedinUrl = optional(formData.get('linkedinUrl'))

    const [student] = id
      ? await sql<Student[]>`
          UPDATE "Student" SET
            "fullName" = ${parsed.fullName},
            email = ${parsed.email},
            "whatsappNumber" = ${whatsappNumber},
            "rollNumber" = ${rollNumber},
            department = ${department},
            bio = ${bio},
            "linkedinUrl" = ${linkedinUrl},
            status = ${parsed.status},
            "updatedAt" = now()
          WHERE id = ${id}
          RETURNING *
        `
      : await sql<Student[]>`
          INSERT INTO "Student"
            (id, "fullName", email, "whatsappNumber", "rollNumber", department, bio, "linkedinUrl", status, "joinedAt", "createdAt", "updatedAt")
          VALUES
            (${newId()}, ${parsed.fullName}, ${parsed.email}, ${whatsappNumber}, ${rollNumber}, ${department}, ${bio}, ${linkedinUrl}, ${parsed.status}, now(), now(), now())
          RETURNING *
        `

    if (parsed.roleId && parsed.cycleId) {
      await sql`
        INSERT INTO "RoleAssignment" (id, "studentId", "roleId", "cycleId", "startedAt", "createdAt")
        VALUES (${newId()}, ${student.id}, ${parsed.roleId}, ${parsed.cycleId}, now(), now())
        ON CONFLICT ("studentId", "roleId", "cycleId") DO NOTHING
      `
    }

    await log(
      session.sub,
      id ? 'UPDATE' : 'CREATE',
      'Student',
      student.id,
      `${session.name} ${id ? 'updated' : 'added'} ${student.fullName}`,
    )
  } catch (error) {
    return parseError(error)
  }

  revalidatePath('/admin/students')
  revalidatePath('/')
  updateTag('board-data')
  redirect('/admin/students')
}

export async function deleteStudentAction(formData: FormData) {
  const session = await requireAdmin()
  const id = String(formData.get('id'))
  const [student] = await sql<Student[]>`DELETE FROM "Student" WHERE id = ${id} RETURNING *`
  await log(session.sub, 'DELETE', 'Student', id, `${session.name} removed ${student.fullName}`)
  revalidatePath('/admin/students')
  revalidatePath('/')
  updateTag('board-data')
}

export async function saveEvaluationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireAdmin()
    const parsed = evaluationSchema.parse(Object.fromEntries(formData))

    if (parsed.score > parsed.maxScore) {
      return {
        error: 'Score cannot be higher than the maximum score.',
        fieldErrors: { score: 'Cannot be higher than the max score.' },
      }
    }

    const [category] = await sql<Category[]>`SELECT * FROM "Category" WHERE id = ${parsed.categoryId}`
    if (!category) throw new Error('Metric not found.')

    const title = `${category.name} evaluation`
    const evidenceUrl = optional(formData.get('evidenceUrl'))
    const occurredAt = parsed.occurredAt ? new Date(parsed.occurredAt) : new Date()

    const [evaluation] = await sql<Evaluation[]>`
      INSERT INTO "Evaluation"
        (id, "studentId", "categoryId", "cycleId", "evaluatorId", title, score, "maxScore", reason, "evidenceUrl", "occurredAt", "createdAt", "updatedAt")
      VALUES
        (${newId()}, ${parsed.studentId}, ${parsed.categoryId}, ${parsed.cycleId}, ${session.sub}, ${title}, ${parsed.score}, ${parsed.maxScore}, ${parsed.reason}, ${evidenceUrl}, ${occurredAt}, now(), now())
      RETURNING *
    `

    const [student] = await sql<Student[]>`SELECT "fullName" FROM "Student" WHERE id = ${parsed.studentId}`

    await log(
      session.sub,
      'CREATE',
      'Evaluation',
      evaluation.id,
      `${session.name} scored ${student.fullName}: ${evaluation.title} (${evaluation.score}/${evaluation.maxScore})`,
    )
  } catch (error) {
    return parseError(error)
  }

  revalidatePath('/admin/evaluations')
  revalidatePath('/')
  updateTag('board-data')
  return { success: 'Evaluation recorded.' }
}

export async function deleteEvaluationAction(formData: FormData) {
  const session = await requireAdmin()
  const id = String(formData.get('id'))
  const [evaluation] = await sql<Evaluation[]>`DELETE FROM "Evaluation" WHERE id = ${id} RETURNING *`
  await log(session.sub, 'DELETE', 'Evaluation', id, `${session.name} deleted "${evaluation.title}"`)
  revalidatePath('/admin/evaluations')
  revalidatePath('/')
  updateTag('board-data')
}

export async function saveCategoryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireAdmin()
    const id = optional(formData.get('id'))
    const parsed = categorySchema.parse({
      ...Object.fromEntries(formData),
      isActive: formData.get('isActive') === 'on',
    })

    const description = optional(formData.get('description'))
    const slug = slugify(parsed.name)

    const [category] = id
      ? await sql<Category[]>`
          UPDATE "Category" SET
            name = ${parsed.name},
            slug = ${slug},
            description = ${description},
            weight = ${parsed.weight},
            "maxScore" = ${parsed.maxScore},
            color = ${parsed.color},
            "order" = ${parsed.order},
            "isActive" = ${parsed.isActive},
            "updatedAt" = now()
          WHERE id = ${id}
          RETURNING *
        `
      : await sql<Category[]>`
          INSERT INTO "Category" (id, name, slug, description, weight, "maxScore", color, icon, "order", "isActive", "createdAt", "updatedAt")
          VALUES (${newId()}, ${parsed.name}, ${slug}, ${description}, ${parsed.weight}, ${parsed.maxScore}, ${parsed.color}, 'star', ${parsed.order}, ${parsed.isActive}, now(), now())
          RETURNING *
        `

    await log(session.sub, id ? 'UPDATE' : 'CREATE', 'Category', category.id, `${session.name} saved metric ${category.name}`)
  } catch (error) {
    return parseError(error)
  }

  revalidatePath('/admin/settings')
  revalidatePath('/')
  updateTag('board-data')
  return { success: 'Metric saved.' }
}

export async function saveRoleAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const session = await requireAdmin()
    const id = optional(formData.get('id'))
    const parsed = roleSchema.parse(Object.fromEntries(formData))

    const description = optional(formData.get('description'))
    const slug = slugify(parsed.name)

    const [role] = id
      ? await sql<Role[]>`
          UPDATE "Role" SET
            name = ${parsed.name},
            slug = ${slug},
            description = ${description},
            color = ${parsed.color},
            rank = ${parsed.rank},
            "updatedAt" = now()
          WHERE id = ${id}
          RETURNING *
        `
      : await sql<Role[]>`
          INSERT INTO "Role" (id, name, slug, description, color, rank, "createdAt", "updatedAt")
          VALUES (${newId()}, ${parsed.name}, ${slug}, ${description}, ${parsed.color}, ${parsed.rank}, now(), now())
          RETURNING *
        `

    await log(session.sub, id ? 'UPDATE' : 'CREATE', 'Role', role.id, `${session.name} saved role ${role.name}`)
  } catch (error) {
    return parseError(error)
  }

  revalidatePath('/admin/settings')
  updateTag('board-data')
  return { success: 'Role saved.' }
}

export async function saveCycleAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const session = await requireAdmin()
    const id = optional(formData.get('id'))
    const parsed = cycleSchema.parse({
      ...Object.fromEntries(formData),
      isActive: formData.get('isActive') === 'on',
    })

    const notes = optional(formData.get('notes'))
    const slug = slugify(parsed.name)
    const startDate = new Date(parsed.startDate)
    const endDate = parsed.endDate ? new Date(parsed.endDate) : null

    const [cycle] = id
      ? await sql<Cycle[]>`
          UPDATE "Cycle" SET
            name = ${parsed.name},
            slug = ${slug},
            "startDate" = ${startDate},
            "endDate" = ${endDate},
            notes = ${notes},
            "isActive" = ${parsed.isActive},
            "updatedAt" = now()
          WHERE id = ${id}
          RETURNING *
        `
      : await sql<Cycle[]>`
          INSERT INTO "Cycle" (id, name, slug, "startDate", "endDate", "isActive", notes, "createdAt", "updatedAt")
          VALUES (${newId()}, ${parsed.name}, ${slug}, ${startDate}, ${endDate}, ${parsed.isActive}, ${notes}, now(), now())
          RETURNING *
        `

    // Only one cycle can be active at a time, so the board always has one default view.
    if (cycle.isActive) {
      await sql`UPDATE "Cycle" SET "isActive" = false WHERE id != ${cycle.id}`
    }

    await log(session.sub, id ? 'UPDATE' : 'CREATE', 'Cycle', cycle.id, `${session.name} saved cycle ${cycle.name}`)
  } catch (error) {
    return parseError(error)
  }

  revalidatePath('/admin/settings')
  revalidatePath('/')
  updateTag('board-data')
  return { success: 'Cycle saved.' }
}
