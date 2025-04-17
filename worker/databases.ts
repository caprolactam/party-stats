import { drizzle } from 'drizzle-orm/d1'
import { getContext } from 'hono/context-storage'
import { type HonoEnv } from './index'

export function connectDb() {
  const context = getContext<HonoEnv>()
  return drizzle(context.env.DB)
}

export function connectKv() {
  const context = getContext<HonoEnv>()
  return context.env.KV
}

export function getCtx() {
  const context = getContext<HonoEnv>()
  return context.var.ctx
}
