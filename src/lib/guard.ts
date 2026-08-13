import { redirect } from 'next/navigation'
import { readSession, type SessionPayload } from '@/lib/auth'

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await readSession()
  if (!session) redirect('/login')
  return session
}

export async function requireOwner(): Promise<SessionPayload> {
  const session = await requireAdmin()
  if (session.role !== 'OWNER') redirect('/admin')
  return session
}
