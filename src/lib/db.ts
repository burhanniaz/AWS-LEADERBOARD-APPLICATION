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
// still keeping the per-instance connection footprint bounded.
//
// The pool is deliberately small AND self-releasing. A Supabase *session-mode*
// pooler (the :5432 pooled string) holds one server connection per client for
// the whole session and caps total clients (pool_size, often 15); left open,
// our idle connections plus any other dev server / DB GUI / seed run pile up
// and the next query dies with `EMAXCONNSESSION max clients reached`. So we
// keep `max` low and set `idle_timeout` to hand idle connections back between
// requests rather than hoarding them. For serverless the more scalable answer
// is the *transaction-mode* pooler (:6543) — `prepare: false` already makes us
// compatible with it — which is why DATABASE_URL should point there in prod.
export const sql =
  globalForDb.sql ??
  postgres(process.env.DATABASE_URL as string, {
    prepare: false,
    // Bounded per instance so we never approach the pooler's client cap.
    max: process.env.VERCEL ? 3 : 5,
    // Seconds an unused connection lingers before being closed and returned to
    // the pooler. Without this, session-mode slots are held until the process
    // exits and accumulate across reloads.
    idle_timeout: 20,
    // Recycle long-lived connections so a stuck/half-dead one can't wedge a slot.
    max_lifetime: 60 * 30,
    connect_timeout: 15,
  })

if (process.env.NODE_ENV !== 'production') globalForDb.sql = sql

export function newId() {
  return randomUUID()
}
