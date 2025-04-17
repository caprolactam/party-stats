import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/elections/$electionId/$unitId/')({
  loader: ({ params }) => {
    throw redirect({
      to: '/elections/$electionId/$unitId/overview',
      params,
    })
  },
  head: () => ({
    meta: [
      {
        title: '政党スタッツ',
      },
      {
        name: 'description',
        content: '国政選挙における政党の得票データのまとめ',
      },
    ],
  }),
})
