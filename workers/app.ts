import { createRequestHandler } from 'react-router'

declare module 'react-router' {
  export interface AppLoadContext {}
}

const requestHandler = createRequestHandler(
  () => import('virtual:react-router/server-build'),
  import.meta.env.MODE,
)

export default {
  async fetch(request, _env, _ctx) {
    return requestHandler(request)
  },
} satisfies ExportedHandler<Env>
