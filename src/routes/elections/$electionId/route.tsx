import { createFileRoute, Outlet, notFound } from '@tanstack/react-router'
import React from 'react'
import { type GetElection } from '#api/schema.ts'
import {
  NotFoundComponent,
  ErrorBoundary,
} from '#src/components/templates/misc.tsx'
import { listElectionsQueryOptions } from '#src/utils/queries.ts'

async function getElection(electionId: string) {
  try {
    const response = await fetch(`/api/elections/${electionId}`)
    if (response.status === 404) {
      const errorMessage = await response.json()
      throw notFound({ data: errorMessage })
    }
    if (!response.ok) {
      throw new Error(`Error fetching election data: ${response.statusText}`)
    }
    const data = (await response.json()) as GetElection
    return data
  } catch (error) {
    console.error('Error fetching election data:', error)
    throw error
  }
}

export const Route = createFileRoute('/elections/$electionId')({
  loader: async ({ params, context: { queryClient } }) => {
    const [election] = await Promise.all([
      getElection(params.electionId),
      queryClient.ensureQueryData(listElectionsQueryOptions),
    ])
    return election
  },
  component: RouteComponent,
  notFoundComponent: ({ data }) => <NotFoundComponent data={data} />,
  errorComponent: ErrorBoundary,
  shouldReload: false,
})

function RouteComponent() {
  const { queryClient } = Route.useRouteContext()

  React.useEffect(() => {
    return () => {
      // NOTE: React.StrictModeの影響で関連するクエリがrouteのローダーとコンポーネントで二回フェッチされる
      queryClient.removeQueries({ queryKey: ['city-candidates'] })
    }
  }, [queryClient])

  return <Outlet />
}
