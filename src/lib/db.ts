import { randomUUID } from 'crypto'
import postgres from 'postgres'

const globalForDb = globalThis as unknown as { sql?: postgres.Sql }

// On Vercel each concurrent serverless invocation can spin up its own
// instance of this module, each holding its own connection pool. A high
// `max` here multiplies fast under load and can exhaust the database's
// connection limit; keeping it low bounds that per-instance cost. Point
// DATABASE_URL at a pooler (Neon/Supabase pooled connection string, or
// PgBouncer) for real production traffic.
export const sql =
  globalForDb.sql ??
  postgres(process.env.DATABASE_URL as string, {
    prepare: false,
    max: process.env.VERCEL ? 1 : 10,
  })

if (process.env.NODE_ENV !== 'production') globalForDb.sql = sql

export function newId() {
  return randomUUID()
}
