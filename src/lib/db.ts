import { randomUUID } from 'crypto'
import postgres from 'postgres'

const globalForDb = globalThis as unknown as { sql?: postgres.Sql }

// On Vercel each concurrent serverless invocation can spin up its own
// instance of this module, each holding its own connection pool. A high
// `max` here multiplies fast under load and can exhaust the database's
// connection limit; keeping it low bounds that per-instance cost. Point
// DATABASE_URL at a pooler (Neon/Supabase pooled connection string, or
// PgBouncer) for real production traffic.
//
// `max: 1` used to be a hard bottleneck: every page here fires several
// independent queries via Promise.all (leaderboard rows + stats, directory +
// counts, etc), but postgres.js can only run `max` of them at once per
// instance — with 1, "parallel" queries were actually queued and run one at
// a time, serializing the whole page behind N round trips instead of 1. A
// small pool lets those Promise.all groups actually run concurrently while
// still keeping the per-instance connection footprint bounded. If you're on
// Supabase, pointing DATABASE_URL at the transaction pooler (port 6543
// instead of 5432) is the more scalable fix for serverless.
export const sql =
  globalForDb.sql ??
  postgres(process.env.DATABASE_URL as string, {
    prepare: false,
    max: process.env.VERCEL ? 4 : 10,
  })

if (process.env.NODE_ENV !== 'production') globalForDb.sql = sql

export function newId() {
  return randomUUID()
}
