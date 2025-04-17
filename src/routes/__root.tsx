import { type QueryClient } from '@tanstack/react-query'
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
} from '@tanstack/react-router'
import React from 'react'
import {
  Header,
  Footer,
  NotFoundComponent,
  ErrorBoundary,
} from '#src/components/templates/misc.tsx'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorBoundary,
  },
)

const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null
  : React.lazy(() =>
      import('@tanstack/react-router-devtools').then((res) => ({
        default: res.TanStackRouterDevtools,
      })),
    )
const TanStackQueryDevtools = import.meta.env.PROD
  ? () => null
  : React.lazy(() =>
      import('@tanstack/react-query-devtools').then((res) => ({
        default: res.ReactQueryDevtools,
      })),
    )

function RootComponent() {
  return (
    <>
      <HeadContent />
      <Header />
      <main className='mx-auto flex w-full max-w-5xl flex-1 flex-col px-(--space-base)'>
        <Outlet />
      </main>
      <Footer />
      <React.Suspense>
        <TanStackQueryDevtools buttonPosition='top-right' />
        <TanStackRouterDevtools position='bottom-left' />
      </React.Suspense>
    </>
  )
}
