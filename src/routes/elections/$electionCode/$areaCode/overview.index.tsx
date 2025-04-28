import {
  createFileRoute,
  useLoaderData,
  notFound,
} from '@tanstack/react-router'
import { useSessionStorage } from 'usehooks-ts'
import { type GetElectionOverview } from '#api/schema.ts'
import { Icon, type IconName } from '#src/components/parts/icon.tsx'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '#src/components/parts/toggle-group.tsx'
import {
  NotFoundComponent,
  ErrorBoundary,
} from '#src/components/templates/misc.tsx'
import { strictEntries, countFormatter, useAreaInfo } from '#src/utils/misc.ts'
import { VoteResult } from '#src/utils/vote-result.tsx'

async function getElectionOverview({
  electionCode,
  areaCode,
}: {
  electionCode: string
  areaCode: string
}) {
  try {
    const response = await fetch(
      `/api/elections/${electionCode}/overview/area/${areaCode}`,
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
  '/elections/$electionCode/$areaCode/overview/',
)({
  component: RouteComponent,
  loader: ({ params }) =>
    getElectionOverview({
      electionCode: params.electionCode,
      areaCode: params.areaCode,
    }),
  notFoundComponent: ({ data }) => <NotFoundComponent data={data} />,
  errorComponent: ErrorBoundary,
  gcTime: 0,
})

const viewOptions = {
  card: {
    label: 'カード',
    icon: 'grid-view',
  },
  list: {
    label: 'リスト',
    icon: 'view-list',
  },
} satisfies Record<string, { label: string; icon: IconName }>
type ViewOption = keyof typeof viewOptions

function RouteComponent() {
  const { parties, totalCount } = Route.useLoaderData()
  const {
    currentElection: { name: electionName },
  } = useLoaderData({
    from: '/elections/$electionCode',
  })
  const areaInfo = useAreaInfo()
  const { electionCode, areaCode } = Route.useParams()
  const title = `${areaInfo.label}の選挙結果`
  const description = `${electionName}における${title}`

  const [view, setView] = useSessionStorage<ViewOption>('overview-view', 'card')

  return (
    <>
      <title>{`${title} | 政党スタッツ`}</title>
      <meta
        name='description'
        content={description}
      />
      <div className='mt-(--space-base) grid gap-(--space-base)'>
        <div>
          <h2 className='text-xl font-bold'>{title}</h2>
          <div className='mt-(--space-xs) flex justify-between'>
            <div>{`総得票数 : ${countFormatter.format(totalCount)}`}</div>
            <div>【単位 : 票】</div>
          </div>
        </div>
        <div>
          <ToggleGroup
            className='w-full sm:w-fit'
            type='single'
            value={view}
            onValueChange={(value) => {
              if (value === 'card' || value === 'list') {
                setView(value)
              }
            }}
          >
            {strictEntries(viewOptions).map(([key, { label, icon }]) => (
              <ToggleGroupItem
                key={key}
                value={key}
              >
                <Icon
                  name={view === key ? 'check' : icon}
                  size={18}
                />
                {label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <VoteResult
          areaCode={areaCode}
          electionCode={electionCode}
          className={
            view === 'card'
              ? 'grid grid-cols-[repeat(auto-fit,_minmax(18rem,_1fr))] items-start gap-4'
              : 'grid'
          }
        >
          {parties.map((party) => {
            const key = `${electionCode}-${areaCode}-${party.code}`
            const increaseCount = party.prevCount
              ? party.count - party.prevCount
              : null
            const increaseRate = party.prevRate
              ? party.rate - party.prevRate
              : null

            return view === 'card' ? (
              <VoteResult.Card
                key={`${key}-card`}
                partyName={party.name}
                partyCode={party.code}
                partyColor={party.color}
                count={party.count}
                rate={party.rate}
                increaseCount={increaseCount}
                increaseRate={increaseRate}
              />
            ) : (
              <VoteResult.ListItem
                key={`${key}-list-item`}
                partyName={party.name}
                partyCode={party.code}
                partyColor={party.color}
                count={party.count}
                rate={party.rate}
              />
            )
          })}
        </VoteResult>
      </div>
    </>
  )
}
