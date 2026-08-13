import { randomUUID } from 'crypto'
import postgres from 'postgres'

const globalForDb = globalThis as unknown as { sql?: postgres.Sql }

export const sql =
  globalForDb.sql ??
  postgres(process.env.DATABASE_URL as string, {
    prepare: false,
    max: 10,
  })

if (process.env.NODE_ENV !== 'production') globalForDb.sql = sql

export function newId() {
  return randomUUID()
}
