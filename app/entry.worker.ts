import { createRequestHandler, unstable_RouterContextProvider } from 'react-router'
import { CloudflareContext } from './middleware/bindings'

const requestHandler = createRequestHandler(
  () => import('virtual:react-router/server-build'),
  import.meta.env.MODE,
)

export default {
  async fetch(request, env, ctx) {
    const context = new unstable_RouterContextProvider()
    context.set(CloudflareContext, {
      env,
      ctx,
    })

    return await requestHandler(request, context)
  },
} satisfies ExportedHandler<Env>
