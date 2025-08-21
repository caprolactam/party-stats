import { unstable_createContext } from 'react-router'
import { database } from '~/db/index.ts'
import { getContext } from './context-storage.ts'

export const CloudflareContext = unstable_createContext<{
  env: Cloudflare.Env
  ctx: ExecutionContext
}>()

export function getBindings() {
  const { env, ctx } = getContext().get(CloudflareContext)

  return {
    db: env.DB,
    waitUntil: ctx.waitUntil.bind(ctx),
  }
}

export function getDB() {
  return database(getBindings().db)
}
