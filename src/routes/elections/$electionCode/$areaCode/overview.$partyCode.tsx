import { queryOptions, useSuspenseQueries } from '@tanstack/react-query'
import { createFileRoute, useLoaderData, Link } from '@tanstack/react-router'
import { Tabs } from 'radix-ui'
import React from 'react'
import invariant from 'tiny-invariant'
import * as v from 'valibot'
import { type GetPartyDetails } from '#api/schema.ts'
import { Card } from '#src/components/parts/card.tsx'
import { selectStyles } from '#src/components/parts/native-select.tsx'
import {
  useAreaInfo,
  countFormatter,
  rateFormatter,
  rankFormatter,
} from '#src/utils/misc.ts'
import { comparePartySession, comparePartySchema } from '#src/utils/session.ts'
import { CountChanges, RateChanges } from '#src/utils/vote-charts.tsx'
import { RateIncrease } from '#src/utils/vote-result.tsx'

function getPartyDetails({
  electionCode,
  partyCode,
  areaCode,
  isCompareParty = false,
}: {
  electionCode: string
  partyCode: string | undefined
  areaCode: string
  isCompareParty?: boolean
}) {
  return queryOptions({
    queryKey: ['partyDetails', electionCode, areaCode, partyCode],
    queryFn: async () => {
      try {
        if (!partyCode) {
          return null
        }
        const res = await fetch(
          `/api/elections/${electionCode}/details/${partyCode}/area/${areaCode}`,
        )
        if (!res.ok) {
          throw new Error('Network response was not ok')
        }
        const data = (await res.json()) as GetPartyDetails

        return data
      } catch (error) {
        if (isCompareParty) {
          // comparePartyがエラーの場合はページをエラー状態にしたくない
          comparePartySession.remove()
          return null
        }
        throw error
      }
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

export const Route = createFileRoute(
  '/elections/$electionCode/$areaCode/overview/$partyCode',
)({
  validateSearch: v.object({
    compare: v.fallback(v.optional(comparePartySchema), undefined),
  }),
  loaderDeps: ({ search: { compare } }) => ({
    compareParty: compare,
  }),
  loader: async ({
    params,
    context: { queryClient },
    deps: { compareParty },
  }) => {
    let comparePartyCode: string | undefined = compareParty

    if (!compareParty) {
      const sessionCompareParty = comparePartySession.get()
      comparePartyCode = sessionCompareParty
    }
    if (comparePartyCode === params.partyCode) {
      comparePartyCode = undefined
    }

    await Promise.all([
      queryClient.ensureQueryData(
        getPartyDetails({
          electionCode: params.electionCode,
          partyCode: params.partyCode,
          areaCode: params.areaCode,
        }),
      ),
      queryClient.ensureQueryData(
        getPartyDetails({
          electionCode: params.electionCode,
          partyCode: comparePartyCode,
          areaCode: params.areaCode,
          isCompareParty: true,
        }),
      ),
    ])

    return {
      comparePartyCode,
    }
  },
  component: RouteComponent,
  gcTime: 0,
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const { comparePartyCode } = Route.useLoaderData()
  const { electionCode, areaCode, partyCode } = Route.useParams()
  const {
    currentElection: { name: electionName },
    prevElectionCode,
    elections,
    parties,
  } = useLoaderData({
    from: '/elections/$electionCode',
  })
  const { prefecture } = useLoaderData({
    from: '/elections/$electionCode/$areaCode',
  })
  const areaInfo = useAreaInfo()

  const [{ data: partyDetails }, { data: comparePartyDetails }] =
    useSuspenseQueries({
      queries: [
        getPartyDetails({
          electionCode,
          partyCode,
          areaCode,
        }),
        getPartyDetails({
          electionCode,
          partyCode: comparePartyCode,
          areaCode,
        }),
      ],
    })

  // Basically, partyDetails will not be null, error is handled by loader properly
  invariant(partyDetails, 'Party details not found')

  const currentPartyDetails = partyDetails.changes.find(
    (change) => change.election.code === electionCode,
  )

  if (!currentPartyDetails) {
    return (
      <div className='text-brand-11 flex h-32 items-center justify-center text-lg font-semibold'>
        データが見つかりませんでした
      </div>
    )
  }

  const partyName = partyDetails.party.name
  const prevPartyDetails = partyDetails.changes.find(
    (change) => change.election.code === prevElectionCode,
  )

  const isVisibleCompareParty =
    comparePartyCode &&
    // 基準年に記録が存在する場合のみ表示
    comparePartyDetails?.changes.some(
      (change) => change.election.code === electionCode,
    )

  const generateChangesData = (
    valueKey: 'count' | 'rate',
  ): Array<
    {
      electionName: string
      compactLabel: string
    } & {
      [key: string]: number
    }
  > =>
    elections
      .toSorted(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      )
      .map((election) => {
        const change = partyDetails.changes.find(
          (change) => change.election.code === election.code,
        )
        const electionDate = new Date(election.date)
        const electionName = `${election.name.slice(0, 4)}${
          election.electionType === 'shugiin' ? '衆院選' : '参院選'
        }(${electionDate.getFullYear()})`
        const compactLabel = `${
          election.electionType === 'shugiin' ? '衆' : '参'
        }${electionDate.getFullYear()}`

        let changesData = {
          electionName,
          compactLabel,
        }

        if (change) {
          changesData = {
            ...changesData,
            [partyDetails.party.code]: change[valueKey],
          }
        }
        if (comparePartyDetails && isVisibleCompareParty) {
          const compareChange = comparePartyDetails.changes.find(
            (change) => change.election.code === election.code,
          )
          if (compareChange) {
            changesData = {
              ...changesData,
              [comparePartyDetails.party.code]: compareChange[valueKey],
            }
          }
        }

        return changesData
      })
      .filter(Boolean)

  const countChangesData = generateChangesData('count')
  const rateChangesData = generateChangesData('rate')

  const changesConfig = {
    [partyDetails.party.code]: {
      label: partyDetails.party.name,
      color: partyDetails.party.color,
    },
    ...(comparePartyDetails && isVisibleCompareParty
      ? {
          [comparePartyDetails.party.code]: {
            label: comparePartyDetails.party.name,
            color: comparePartyDetails.party.color,
          },
        }
      : {}),
  }

  const title = `${areaInfo.label}の選挙結果`
  const description = `${electionName}における${title}/${partyName}`

  const comparePartyList = parties.filter((party) => party.code !== partyCode)
  const handleCompareParty = (selectedParty: string) => {
    const validParty = parties.some((party) => party.code === selectedParty)
    if (!validParty) {
      comparePartySession.remove()

      void navigate({
        search: {
          compare: undefined,
        },
        resetScroll: false,
        replace: true,
      })
      return
    }

    comparePartySession.set(selectedParty)

    void navigate({
      search: {
        compare: selectedParty,
      },
      resetScroll: false,
      replace: true,
    })
  }

  return (
    <>
      <title>{`${title}/${partyName} | 政党スタッツ`}</title>
      <meta
        name='description'
        content={description}
      />
      <div className='mt-(--space-base) grid gap-(--space-base)'>
        <h2 className='sr-only'>{`${title}/${partyName}`}</h2>
        <div className='flex flex-wrap gap-x-2 text-xl font-bold'>
          <Link
            to='/elections/$electionCode/$areaCode/overview'
            params={{
              electionCode,
              areaCode,
            }}
            activeOptions={{
              exact: true,
            }}
            className='text-link-base underline-offset-2 hover:underline'
          >
            {title}
          </Link>
          <span aria-hidden>/</span>
          <span>{partyName}</span>
        </div>
        <div>
          <div className='mb-2 flex justify-between text-base font-normal'>
            <div>{`総得票数 : ${countFormatter.format(currentPartyDetails.totalCount)}`}</div>
            <div>【単位 : 票】</div>
          </div>
          <Card
            className='grid grid-cols-[repeat(auto-fit,_minmax(8rem,_1fr))] gap-4 p-4'
            variant='outline'
          >
            <RateIncrease
              value={countFormatter.format(currentPartyDetails.count)}
              count={
                prevPartyDetails
                  ? currentPartyDetails.count - prevPartyDetails.count
                  : 0
              }
            >
              得票数
            </RateIncrease>
            <RateIncrease
              value={rateFormatter.format(currentPartyDetails.rate)}
              rate={
                prevPartyDetails
                  ? currentPartyDetails.rate - prevPartyDetails.rate
                  : 0
              }
            >
              得票率
            </RateIncrease>
            {partyDetails.rankInNational && (
              <Rank
                rank={partyDetails.rankInNational.rank}
                totalRank={partyDetails.rankInNational.totalRank}
              >
                得票率の全国順位
              </Rank>
            )}
            {partyDetails.rankInPrefecture && (
              <Rank
                rank={partyDetails.rankInPrefecture.rank}
                totalRank={partyDetails.rankInPrefecture.totalRank}
              >
                {`得票率の${prefecture?.name.slice(-1) ?? '県'}内順位`}
              </Rank>
            )}
          </Card>
        </div>
        <Tabs.Root
          defaultValue='count'
          className='grid gap-4'
        >
          <div className='flex h-12 items-center justify-between gap-4 border-b'>
            <div className='text-lg font-medium'>得票の推移</div>
            <Tabs.List className='flex h-full'>
              <Tabs.Trigger
                value='count'
                className='group text-brand-11 data-[state=active]:text-brand-12 hover:text-brand-12 active:text-brand-12 inline-flex h-full items-center justify-center text-sm font-medium whitespace-nowrap select-none'
              >
                <div className='group-data-[state=active]:bg-brand-5 inline-flex flex-1 items-center rounded-md bg-transparent px-4 py-1'>
                  <span>得票数</span>
                </div>
              </Tabs.Trigger>
              <Tabs.Trigger
                value='rate'
                className='group text-brand-11 data-[state=active]:text-brand-12 hover:text-brand-12 active:text-brand-12 inline-flex h-full items-center justify-center text-sm font-medium whitespace-nowrap select-none'
              >
                <div className='group-data-[state=active]:bg-brand-5 inline-flex flex-1 items-center rounded-md bg-transparent px-4 py-1'>
                  <span>得票率</span>
                </div>
              </Tabs.Trigger>
            </Tabs.List>
          </div>
          <Tabs.Content
            value='count'
            className='grid gap-4'
          >
            <SelectCompareParty
              parties={comparePartyList}
              comparePartyCode={isVisibleCompareParty ? comparePartyCode : ''}
              handleChange={handleCompareParty}
            />
            <CountChanges
              config={changesConfig}
              data={countChangesData}
            />
          </Tabs.Content>
          <Tabs.Content
            value='rate'
            className='grid gap-4'
          >
            <SelectCompareParty
              parties={comparePartyList}
              comparePartyCode={isVisibleCompareParty ? comparePartyCode : ''}
              handleChange={handleCompareParty}
            />
            <RateChanges
              config={changesConfig}
              data={rateChangesData}
            />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </>
  )
}

function SelectCompareParty({
  parties,
  comparePartyCode,
  handleChange,
}: {
  parties: Array<{ code: string; name: string }>
  comparePartyCode?: string
  handleChange: (partyCode: string) => void
}) {
  const uniqueId = React.useId()
  const compareLabelId = `${uniqueId}-compare-party`

  return (
    <div className='flex items-center gap-4'>
      <label
        className='text-sm'
        htmlFor={compareLabelId}
      >
        比較する政党
      </label>
      <select
        id={compareLabelId}
        value={comparePartyCode ?? ''}
        onChange={(e) => {
          const selectedPartyCode = e.target.value

          handleChange(selectedPartyCode)
        }}
        className={selectStyles('font-semibold')}
      >
        <option value=''>政党を選択</option>
        <hr />
        {parties.map((party) => (
          <option
            key={party.code}
            value={party.code}
          >
            {party.name}
          </option>
        ))}
      </select>
    </div>
  )
}

function Rank({
  children,
  rank,
  totalRank,
}: {
  children: React.ReactNode
  rank: number
  totalRank: number
}) {
  return (
    <div className='flex flex-col gap-2'>
      <div className='text-sm'>{children}</div>
      <div className='text-2xl leading-none font-bold'>
        {rankFormatter.format(rank)}
      </div>
      <div className='text-brand-11 inline-block text-sm font-medium'>
        {`全${rankFormatter.format(totalRank)}位`}
      </div>
    </div>
  )
}
