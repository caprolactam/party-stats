import { createRequestHandler } from 'react-router'
import { drizzle } from 'drizzle-orm/d1'
import type { DrizzleD1Database } from 'drizzle-orm/d1'

declare module 'react-router' {
  export interface AppLoadContext {
    cloudflare: {
      env: Env
      ctx: ExecutionContext
    }
    db: DrizzleD1Database
  }
}

const requestHandler = createRequestHandler(
  () => import('virtual:react-router/server-build'),
  import.meta.env.MODE,
)

export default {
  async fetch(request, env, ctx) {
    const db = drizzle(env.DB)

    return requestHandler(request, {
      cloudflare: { env, ctx },
      db,
    })
  },
} satisfies ExportedHandler<Env>
