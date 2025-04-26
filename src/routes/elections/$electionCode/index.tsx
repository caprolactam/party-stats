import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/elections/$electionCode/')({
  loader: ({ params }) => {
    throw redirect({
      to: '/elections/$electionCode/$unitCode/overview',
      params: {
        electionCode: params.electionCode,
        unitCode: 'national',
      },
    })
  },
})
