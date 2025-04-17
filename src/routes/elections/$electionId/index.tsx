import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/elections/$electionId/')({
  loader: ({ params }) => {
    throw redirect({
      to: '/elections/$electionId/$unitId/overview',
      params: {
        electionId: params.electionId,
        unitId: 'national',
      },
    })
  },
})
