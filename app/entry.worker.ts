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

    const response = await requestHandler(request, context)

    if (response.headers.get('Cache-Control') && import.meta.env.DEV) {
      // In development, disable cache headers to ensure fresh data
      response.headers.delete('Cache-Control')
    }

    return response
  },
} satisfies ExportedHandler<Env>
