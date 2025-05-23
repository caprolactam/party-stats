import { createFileRoute, Outlet, notFound } from '@tanstack/react-router'
import React from 'react'
import { type GetElection } from '#api/schema.ts'
import {
  NotFoundComponent,
  ErrorBoundary,
} from '#src/components/templates/misc.tsx'
import { QUERY_KEY } from '#src/utils/area-options-list.tsx'
import { listElections, listParties } from '#src/utils/queries.ts'

async function getElection(electionCode: string) {
  try {
    const response = await fetch(`/api/elections/${electionCode}`)
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

export const Route = createFileRoute('/elections/$electionCode')({
  loader: async ({ params }) => {
    const [currentElection, elections, parties] = await Promise.all([
      getElection(params.electionCode),
      listElections(),
      listParties(params.electionCode),
    ])

    const currentElectionDate = new Date(currentElection.date)
    const prevElection = elections.find(
      (election) => currentElectionDate > new Date(election.date),
    )

    return {
      currentElection,
      prevElectionCode: prevElection?.code ?? null,
      elections,
      parties,
    }
  },
  component: RouteComponent,
  notFoundComponent: ({ data }) => <NotFoundComponent data={data} />,
  errorComponent: ErrorBoundary,
  gcTime: 0,
  shouldReload: false,
})

function RouteComponent() {
  const { queryClient } = Route.useRouteContext()

  React.useEffect(() => {
    return () => {
      // NOTE: React.StrictModeの影響で関連するクエリがrouteのローダーとコンポーネントで二回フェッチされる
      queryClient.removeQueries({ queryKey: [QUERY_KEY] })
    }
  }, [queryClient])

  return <Outlet />
}
