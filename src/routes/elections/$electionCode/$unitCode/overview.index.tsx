import {
  createFileRoute,
  useLoaderData,
  notFound,
} from '@tanstack/react-router'
import { type GetElectionOverview } from '#api/schema.ts'
import {
  NotFoundComponent,
  ErrorBoundary,
} from '#src/components/templates/misc.tsx'
import { countFormatter, useUnitInfo } from '#src/utils/misc.ts'
import { VoteResult } from '#src/utils/vote-result.tsx'

async function getElectionOverview({
  electionCode,
  unitCode,
}: {
  electionCode: string
  unitCode: string
}) {
  try {
    const response = await fetch(
      `/api/elections/${electionCode}/overview/unit/${unitCode}`,
    )

    if (response.status === 404) {
      const errorMessage = await response.json()
      throw notFound({ data: errorMessage })
    }

    if (!response.ok) {
      throw new Error(`Error fetching election data: ${response.statusText}`)
    }

    const data = (await response.json()) as GetElectionOverview
    return data
  } catch (error) {
    throw error
  }
}

export const Route = createFileRoute(
  '/elections/$electionCode/$unitCode/overview/',
)({
  component: RouteComponent,
  loader: ({ params }) =>
    getElectionOverview({
      electionCode: params.electionCode,
      unitCode: params.unitCode,
    }),
  notFoundComponent: ({ data }) => <NotFoundComponent data={data} />,
  errorComponent: ErrorBoundary,
  gcTime: 0,
})

function RouteComponent() {
  const { parties, totalCount } = Route.useLoaderData()
  const {
    currentElection: { name: electionName },
  } = useLoaderData({
    from: '/elections/$electionCode',
  })
  const unitInfo = useUnitInfo()
  const electionCode = Route.useParams().electionCode
  const title = `${unitInfo.label}の選挙結果`
  const description = `${electionName}における${title}`

  return (
    <>
      <title>{`${title} | 政党スタッツ`}</title>
      <meta
        name='description'
        content={description}
      />
      <div className='mt-(--space-base) grid gap-(--space-base)'>
        <h2 className='text-xl font-bold'>{title}</h2>
        <div>
          <div className='mb-2 flex justify-between text-base font-normal'>
            <div>{`総得票数 : ${countFormatter.format(totalCount)}`}</div>
            <div>【単位 : 票】</div>
          </div>
          <VoteResult
            unitCode={unitInfo.unitCode}
            electionCode={electionCode}
            className='grid grid-cols-[repeat(auto-fit,_minmax(18rem,_1fr))] items-start gap-4'
          >
            {parties.map((party) => {
              const increaseCount = party.prevCount
                ? party.count - party.prevCount
                : null
              const increaseRate = party.prevRate
                ? party.rate - party.prevRate
                : null

              return (
                <VoteResult.Item
                  key={`${party.code}-${unitInfo.unitCode ?? 'national'}-${electionCode}`}
                  partyName={party.name}
                  partyCode={party.code}
                  partyColor={party.color}
                  count={party.count}
                  rate={party.rate}
                  increaseCount={increaseCount}
                  increaseRate={increaseRate}
                />
              )
            })}
          </VoteResult>
        </div>
      </div>
    </>
  )
}
