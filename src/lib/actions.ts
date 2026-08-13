'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
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

export type ActionState = { error?: string; success?: string }

function firstError(error: unknown) {
  if (error && typeof error === 'object' && 'issues' in error) {
    const issues = (error as { issues: { message: string }[] }).issues
    return issues[0]?.message ?? 'Invalid input.'
  }
  return error instanceof Error ? error.message : 'Something went wrong.'
}

function optional(value: FormDataEntryValue | null) {
  const text = typeof value === 'string' ? value.trim() : ''
  return text === '' ? null : text
}

async function log(actorId: string | null, action: string, entity: string, entityId: string | null, summary: string) {
  await prisma.activityLog.create({ data: { actorId, action, entity, entityId, summary } })
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let target = '/admin'
  try {
    const parsed = loginSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    })

    const user = await prisma.adminUser.findUnique({ where: { email: parsed.email } })
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
    return { error: firstError(error) }
  }
  redirect(target)
}

export async function logoutAction() {
  clearSessionCookie()
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

    const data = {
      fullName: parsed.fullName,
      email: parsed.email,
      whatsappNumber: optional(formData.get('whatsappNumber')),
      rollNumber: optional(formData.get('rollNumber')),
      department: parsed.department ? parsed.department : null,
      bio: optional(formData.get('bio')),
      linkedinUrl: optional(formData.get('linkedinUrl')),
      status: parsed.status,
    }

    const student = id
      ? await prisma.student.update({ where: { id }, data })
      : await prisma.student.create({ data })

    if (parsed.roleId && parsed.cycleId) {
      await prisma.roleAssignment.upsert({
        where: {
          studentId_roleId_cycleId: {
            studentId: student.id,
            roleId: parsed.roleId,
            cycleId: parsed.cycleId,
          },
        },
        update: {},
        create: { studentId: student.id, roleId: parsed.roleId, cycleId: parsed.cycleId },
      })
    }

    await log(
      session.sub,
      id ? 'UPDATE' : 'CREATE',
      'Student',
      student.id,
      `${session.name} ${id ? 'updated' : 'added'} ${student.fullName}`,
    )
  } catch (error) {
    return { error: firstError(error) }
  }

  revalidatePath('/admin/students')
  revalidatePath('/')
  redirect('/admin/students')
}

export async function deleteStudentAction(formData: FormData) {
  const session = await requireAdmin()
  const id = String(formData.get('id'))
  const student = await prisma.student.delete({ where: { id } })
  await log(session.sub, 'DELETE', 'Student', id, `${session.name} removed ${student.fullName}`)
  revalidatePath('/admin/students')
  revalidatePath('/')
}

export async function saveEvaluationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireAdmin()
    const parsed = evaluationSchema.parse(Object.fromEntries(formData))

    if (parsed.score > parsed.maxScore) {
      return { error: 'Score cannot be higher than the maximum score.' }
    }

    const category = await prisma.category.findUniqueOrThrow({ where: { id: parsed.categoryId } })

    const evaluation = await prisma.evaluation.create({
      data: {
        studentId: parsed.studentId,
        categoryId: parsed.categoryId,
        cycleId: parsed.cycleId,
        evaluatorId: session.sub,
        title: `${category.name} evaluation`,
        score: parsed.score,
        maxScore: parsed.maxScore,
        reason: parsed.reason,
        evidenceUrl: optional(formData.get('evidenceUrl')),
        occurredAt: parsed.occurredAt ? new Date(parsed.occurredAt) : new Date(),
      },
      include: { student: true },
    })

    await log(
      session.sub,
      'CREATE',
      'Evaluation',
      evaluation.id,
      `${session.name} scored ${evaluation.student.fullName}: ${evaluation.title} (${evaluation.score}/${evaluation.maxScore})`,
    )
  } catch (error) {
    return { error: firstError(error) }
  }

  revalidatePath('/admin/evaluations')
  revalidatePath('/')
  return { success: 'Evaluation recorded.' }
}

export async function deleteEvaluationAction(formData: FormData) {
  const session = await requireAdmin()
  const id = String(formData.get('id'))
  const evaluation = await prisma.evaluation.delete({ where: { id } })
  await log(session.sub, 'DELETE', 'Evaluation', id, `${session.name} deleted "${evaluation.title}"`)
  revalidatePath('/admin/evaluations')
  revalidatePath('/')
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

    const data = {
      name: parsed.name,
      slug: slugify(parsed.name),
      description: optional(formData.get('description')),
      weight: parsed.weight,
      maxScore: parsed.maxScore,
      color: parsed.color,
      order: parsed.order,
      isActive: parsed.isActive,
    }

    const category = id
      ? await prisma.category.update({ where: { id }, data })
      : await prisma.category.create({ data })

    await log(session.sub, id ? 'UPDATE' : 'CREATE', 'Category', category.id, `${session.name} saved metric ${category.name}`)
  } catch (error) {
    return { error: firstError(error) }
  }

  revalidatePath('/admin/settings')
  revalidatePath('/')
  return { success: 'Metric saved.' }
}

export async function saveRoleAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const session = await requireAdmin()
    const id = optional(formData.get('id'))
    const parsed = roleSchema.parse(Object.fromEntries(formData))

    const data = {
      name: parsed.name,
      slug: slugify(parsed.name),
      description: optional(formData.get('description')),
      color: parsed.color,
      rank: parsed.rank,
    }

    const role = id
      ? await prisma.role.update({ where: { id }, data })
      : await prisma.role.create({ data })

    await log(session.sub, id ? 'UPDATE' : 'CREATE', 'Role', role.id, `${session.name} saved role ${role.name}`)
  } catch (error) {
    return { error: firstError(error) }
  }

  revalidatePath('/admin/settings')
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

    const data = {
      name: parsed.name,
      slug: slugify(parsed.name),
      startDate: new Date(parsed.startDate),
      endDate: parsed.endDate ? new Date(parsed.endDate) : null,
      notes: optional(formData.get('notes')),
      isActive: parsed.isActive,
    }

    const cycle = id
      ? await prisma.cycle.update({ where: { id }, data })
      : await prisma.cycle.create({ data })

    // Only one cycle can be active at a time, so the board always has one default view.
    if (cycle.isActive) {
      await prisma.cycle.updateMany({
        where: { id: { not: cycle.id } },
        data: { isActive: false },
      })
    }

    await log(session.sub, id ? 'UPDATE' : 'CREATE', 'Cycle', cycle.id, `${session.name} saved cycle ${cycle.name}`)
  } catch (error) {
    return { error: firstError(error) }
  }

  revalidatePath('/admin/settings')
  revalidatePath('/')
  return { success: 'Cycle saved.' }
}
