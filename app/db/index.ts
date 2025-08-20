import { env } from 'cloudflare:workers'
import { drizzle } from 'drizzle-orm/d1'

export function database() {
  return drizzle(env.DB)
}
