import { drizzle } from 'drizzle-orm/d1'

export type Database = ReturnType<typeof database>

export function database(d1: D1Database) {
  return drizzle(d1)
}
