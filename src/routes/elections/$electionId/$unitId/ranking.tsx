import {
  createFileRoute,
  redirect,
  Link,
  useLoaderData,
  notFound,
} from '@tanstack/react-router'
import { RadioGroup } from 'radix-ui'
import React from 'react'
import * as v from 'valibot'
import {
  type GetLeaderParty,
  type GetJapanRanking,
  type GetRegionRanking,
  type GetPrefectureRanking,
} from '#api/schema.ts'
import { buttonVariants } from '#src/components/parts/button.tsx'
import { Icon } from '#src/components/parts/icon.tsx'
import { selectStyles } from '#src/components/parts/native-select.tsx'
import {
  NotFoundComponent,
  ErrorBoundary,
} from '#src/components/templates/misc.tsx'
import { strictEntries, rateFormatter } from '#src/utils/misc.ts'
import { createPageNumber } from '#src/utils/pagination.tsx'

const partySchema = v.pipe(v.unknown(), v.transform(String))
const sortSchema = v.picklist(['desc-popularity', 'asc-popularity'])
const pageSchema = v.pipe(
  v.number(),
  v.safeInteger(),
  v.minValue(1),
  v.maxValue(1000),
)
const unitSchema = v.picklist(['region', 'prefecture', 'city'])
const searchParamsSchema = v.object({
  sort: v.fallback(v.optional(sortSchema), undefined),
  page: v.fallback(v.optional(pageSchema), undefined),
  unit: v.fallback(v.optional(unitSchema), undefined),
  party: v.fallback(v.optional(partySchema), undefined),
})

type RankingUnit = v.InferOutput<typeof unitSchema>
const rankingUnitLabels = {
  region: '地方',
  prefecture: '都道府県',
  city: '市区町村',
} satisfies Record<RankingUnit, string>
type SortType = v.InferOutput<typeof sortSchema>
const sortLabels = {
  'desc-popularity': '得票率の高い順',
  'asc-popularity': '得票率の低い順',
} satisfies Record<SortType, string>

const DEFAULT_SORT = 'desc-popularity' satisfies SortType
const DEFAULT_PAGE = 1

interface BaseRankingProps {
  electionCode: string
  partyCode: string
  page?: number
  sort?: SortType
}

async function getLeaderParty(electionId: string) {
  try {
    const response = await fetch(`/api/elections/${electionId}/leader`)

    if (response.status === 404) {
      throw notFound()
    }

    if (!response.ok) {
      throw new Error(
        `Error fetching leader party data: ${response.statusText}`,
      )
    }
    const data = (await response.json()) as GetLeaderParty
    return data
  } catch (error) {
    throw error
  }
}

async function getNationalRanking({
  electionCode,
  partyCode,
  page = DEFAULT_PAGE,
  sort = DEFAULT_SORT,
  rankingUnit,
}: BaseRankingProps & {
  rankingUnit: 'region' | 'prefecture' | 'city'
}) {
  try {
    const searchParams = new URLSearchParams()
    searchParams.set('sort', sort)
    searchParams.set('page', String(page))
    searchParams.set('unit', rankingUnit)

    const response = await fetch(
      `/api/elections/${electionCode}/ranking/parties/${partyCode}/national?${searchParams.toString()}`,
    )
    if (response.status === 404) {
      const errorMessage = await response.json()
      throw notFound({ data: errorMessage })
    }
    if (!response.ok) {
      throw new Error('Failed to fetch national ranking')
    }
    const data = (await response.json()) as GetJapanRanking
    return data
  } catch (error) {
    throw error
  }
}

async function getRegionRanking({
  electionCode,
  partyCode,
  page = DEFAULT_PAGE,
  sort = DEFAULT_SORT,
  rankingUnit,
  regionCode,
}: BaseRankingProps & {
  regionCode: string
  rankingUnit: 'prefecture' | 'city'
}) {
  try {
    const searchParams = new URLSearchParams()
    searchParams.set('sort', sort)
    searchParams.set('page', String(page))
    searchParams.set('unit', rankingUnit)

    const response = await fetch(
      `/api/elections/${electionCode}/ranking/parties/${partyCode}/regions/${regionCode}?${searchParams.toString()}`,
    )
    if (response.status === 404) {
      const errorMessage = await response.json()
      throw notFound({ data: errorMessage })
    }
    if (!response.ok) {
      throw new Error('Failed to fetch region ranking')
    }
    const data = (await response.json()) as GetRegionRanking
    return data
  } catch (error) {
    throw error
  }
}

async function getPrefectureRanking({
  electionCode,
  partyCode,
  page = DEFAULT_PAGE,
  sort = DEFAULT_SORT,
  prefectureCode,
}: BaseRankingProps & {
  prefectureCode: string
}) {
  try {
    const searchParams = new URLSearchParams()
    searchParams.set('sort', sort)
    searchParams.set('page', String(page))

    const response = await fetch(
      `/api/elections/${electionCode}/ranking/parties/${partyCode}/prefectures/${prefectureCode}?${searchParams.toString()}`,
    )
    if (response.status === 404) {
      const errorMessage = await response.json()
      throw notFound({ data: errorMessage })
    }
    if (!response.ok) {
      throw new Error('Failed to fetch prefecture ranking')
    }
    const data = (await response.json()) as GetPrefectureRanking
    return data
  } catch (error) {
    throw error
  }
}

async function getPrefectureByCityCodeRanking({
  electionCode,
  partyCode,
  page = DEFAULT_PAGE,
  sort = DEFAULT_SORT,
  cityCode,
}: BaseRankingProps & {
  cityCode: string
}) {
  try {
    const searchParams = new URLSearchParams()
    searchParams.set('sort', sort)
    searchParams.set('page', String(page))

    const response = await fetch(
      `/api/elections/${electionCode}/ranking/parties/${partyCode}/cities/${cityCode}?${searchParams.toString()}`,
    )
    if (response.status === 404) {
      const errorMessage = await response.json()
      throw notFound({ data: errorMessage })
    }
    if (!response.ok) {
      throw new Error('Failed to fetch prefecture ranking')
    }
    const data = (await response.json()) as GetPrefectureRanking
    return data
  } catch (error) {
    throw error
  }
}

export const Route = createFileRoute('/elections/$electionId/$unitId/ranking')({
  validateSearch: searchParamsSchema,
  loaderDeps: ({ search: { party, sort, page, unit } }) => ({
    party,
    sort,
    page,
    unit,
  }),
  loader: async ({
    params,
    deps: { page, sort, unit, party: partyCode },
    context: { estimatedUnit, unitId },
  }) => {
    if (!partyCode) {
      const { electionId } = params

      const leader = await getLeaderParty(electionId)
      const searchParams = new URLSearchParams()
      searchParams.set('party', leader.code)

      throw redirect({
        to: '/elections/$electionId/$unitId/ranking',
        params,
        search: {
          party: leader.code,
        },
      })
    }

    switch (estimatedUnit) {
      case 'national': {
        const ranking = await getNationalRanking({
          electionCode: params.electionId,
          partyCode,
          page,
          sort,
          rankingUnit: unit ?? 'region',
        })
        return { ...ranking, partyCode }
      }
      case 'region': {
        const rankingUnit = !unit || unit === 'region' ? 'prefecture' : unit
        const ranking = await getRegionRanking({
          electionCode: params.electionId,
          partyCode,
          page,
          sort,
          regionCode: unitId,
          rankingUnit,
        })
        return { ...ranking, partyCode }
      }
      case 'prefecture': {
        const ranking = await getPrefectureRanking({
          electionCode: params.electionId,
          partyCode,
          page,
          sort,
          prefectureCode: unitId,
        })
        return { ...ranking, partyCode }
      }
      case 'city': {
        const ranking = await getPrefectureByCityCodeRanking({
          electionCode: params.electionId,
          partyCode,
          page,
          sort,
          cityCode: unitId,
        })
        return { ...ranking, partyCode }
      }
      default:
        const _exhaustiveCheck: never = estimatedUnit
        throw new Error(`Unsupported unit: ${_exhaustiveCheck}`)
    }
  },
  component: RouteComponent,
  notFoundComponent: ({ data }) => <NotFoundComponent data={data} />,
  errorComponent: ErrorBoundary,
  gcTime: 0,
})

function RouteComponent() {
  const params = Route.useParams()
  const navigate = Route.useNavigate()
  const {
    meta: { sort, unit: rankingUnit, currentPage, pageSize, totalPages },
    data: ranking,
    partyCode,
  } = Route.useLoaderData()
  const { parties, name: electionName } = useLoaderData({
    from: '/elections/$electionId',
  })
  const { unit, region, prefecture } = useLoaderData({
    from: '/elections/$electionId/$unitId',
  })

  const { pageNumbers, canPageBackwards, canPageForwards } = createPageNumber({
    currentPage,
    totalPages,
  })

  const title = `${prefecture ? prefecture.name : region ? region.name : '全国'}の政党別得票率ランキング`

  return (
    <>
      <title>{`${title} | 政党スタッツ`}</title>
      <meta
        name='description'
        content={`${electionName}における${title}`}
      />
      <div className='mt-(--space-base) grid gap-(--space-base)'>
        <h2 className='text-xl font-bold'>{title}</h2>
        <SelectParties
          parties={parties}
          selectedParty={partyCode}
          handleSelect={(party) => {
            void navigate({
              to: '/elections/$electionId/$unitId/ranking',
              params,
              search: (prev) => ({
                ...prev,
                party,
                page: undefined,
              }),
              replace: true,
              resetScroll: false,
            })
          }}
        />
        <PickRankingUnit
          pageUnit={unit}
          rankingUnit={rankingUnit}
          handleRankingUnit={(unitType) => {
            void navigate({
              to: '/elections/$electionId/$unitId/ranking',
              params,
              search: (prev) => ({
                ...prev,
                unit: unitType,
                page: undefined,
              }),
              replace: true,
              resetScroll: false,
            })
          }}
        />
        <PickSort
          sort={sort}
          handleSort={(sortType) => {
            void navigate({
              to: '/elections/$electionId/$unitId/ranking',
              params,
              search: (prev) => ({
                ...prev,
                sort: sortType,
                page: undefined,
              }),
              replace: true,
              resetScroll: false,
            })
          }}
        />
        {ranking.length ? (
          <>
            <ol className='divide-brand-7 divide-y'>
              {ranking.map((city, i) => (
                <RankingItem
                  key={city.code}
                  cityCode={city.code}
                  cityName={city.name}
                  supportText={city.supportText}
                  rank={pageSize * (currentPage - 1) + i + 1}
                  rate={city.rate}
                />
              ))}
            </ol>
            <ol className='flex items-center justify-center gap-2'>
              <li>
                <Link
                  className={buttonVariants({
                    variant: 'outline',
                    size: 'md',
                    className: 'size-9 p-0',
                  })}
                  to='/elections/$electionId/$unitId/ranking'
                  params={params}
                  search={(prev) => ({
                    ...prev,
                    page: canPageBackwards ? currentPage - 1 : undefined,
                  })}
                  resetScroll={false}
                  data-disabled={canPageBackwards ? undefined : true}
                  aria-disabled={canPageBackwards ? undefined : true}
                  tabIndex={canPageBackwards ? undefined : -1}
                  title='前のページ'
                >
                  <Icon
                    name='chevron-right'
                    className='rotate-180'
                    size={20}
                  />
                  <span className='sr-only'>前のページ</span>
                </Link>
              </li>
              {pageNumbers.map((pageNumber) => (
                <li key={pageNumber}>
                  <Link
                    className={buttonVariants({
                      variant:
                        pageNumber === currentPage ? 'accent' : 'outline',
                      size: 'md',
                      className: 'size-9 p-0',
                    })}
                    to='/elections/$electionId/$unitId/ranking'
                    params={params}
                    resetScroll={false}
                    search={(prev) => ({
                      ...prev,
                      page: pageNumber,
                    })}
                  >
                    {pageNumber}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  className={buttonVariants({
                    variant: 'outline',
                    size: 'md',
                    className: 'size-9 p-0',
                  })}
                  to='/elections/$electionId/$unitId/ranking'
                  params={params}
                  search={(prev) => ({
                    ...prev,
                    page: canPageForwards ? currentPage + 1 : totalPages,
                  })}
                  resetScroll={false}
                  data-disabled={canPageForwards ? undefined : true}
                  aria-disabled={canPageForwards ? undefined : true}
                  tabIndex={canPageForwards ? undefined : -1}
                  title='次のページ'
                >
                  <Icon
                    name='chevron-right'
                    size={20}
                  />
                  <span className='sr-only'>次のページ</span>
                </Link>
              </li>
            </ol>
          </>
        ) : (
          <div className='text-brand-11 flex h-32 items-center justify-center text-lg font-semibold'>
            データが見つかりませんでした
          </div>
        )}
      </div>
    </>
  )
}

function RankingItem({
  cityCode,
  cityName,
  supportText,
  rank,
  rate,
}: {
  cityCode: string
  cityName: string
  supportText?: string
  rank: number
  rate: number
}) {
  const { electionId } = Route.useParams()

  return (
    <li className='card-container'>
      <Link
        to='/elections/$electionId/$unitId/overview'
        className='group flex h-14 items-center gap-4'
        params={{
          electionId,
          unitId: cityCode,
        }}
      >
        <div className='w-6 text-end text-sm'>{rank}</div>
        <div className='flex flex-1 items-center gap-4'>
          <span className='min-w-[9ch] font-semibold underline-offset-2 group-hover:underline'>
            {cityName}
          </span>
          {supportText && (
            <span className='text-brand-11 text-sm font-medium'>
              {supportText}
            </span>
          )}
        </div>
        <div className='grid shrink-0 justify-items-end gap-1 font-mono font-medium'>
          {rateFormatter.format(rate)}
        </div>
      </Link>
    </li>
  )
}

function SelectParties({
  parties,
  selectedParty,
  handleSelect,
}: {
  parties: Array<{ code: string; name: string }>
  selectedParty: string
  handleSelect: (party: string) => void
}) {
  const id = React.useId()
  const selectLabel = `party-select-${id}`
  const existParty = parties.some((party) => party.code === selectedParty)

  return (
    <div className='grid justify-items-start gap-4'>
      <label
        className='text-base font-semibold'
        htmlFor={selectLabel}
      >
        政党
      </label>
      <select
        id={selectLabel}
        className={selectStyles('h-10 max-w-96 font-semibold')}
        value={existParty ? selectedParty : undefined}
        onChange={(e) => {
          if (parties.some((party) => party.code === e.target.value)) {
            handleSelect(e.target.value)
          }
        }}
      >
        <option value=''>政党を選択してください</option>
        <hr />
        {parties.map((party) => (
          <option
            className='text-brand-12'
            value={party.code}
            key={party.code}
          >
            {party.name}
          </option>
        ))}
      </select>
    </div>
  )
}

function PickRankingUnit({
  pageUnit,
  rankingUnit,
  handleRankingUnit,
}: {
  pageUnit: 'national' | 'region' | 'prefecture' | 'city'
  rankingUnit: 'region' | 'prefecture' | 'city'
  handleRankingUnit: (unit: 'region' | 'prefecture' | 'city') => void
}) {
  const id = React.useId()
  const unitLabel = `ranking-unit-${id}`

  return (
    <RadioGroup.Root
      value={rankingUnit}
      onValueChange={(value) => {
        const unitTypeSubmission = v.safeParse(unitSchema, value)
        if (unitTypeSubmission.success) {
          handleRankingUnit(unitTypeSubmission.output)
        }
      }}
      className='grid gap-4'
      aria-labelledby={unitLabel}
    >
      <div
        className='font-semibold'
        id={unitLabel}
      >
        ランキングの単位
      </div>
      <div className='flex min-w-0 flex-wrap items-center gap-2'>
        {strictEntries(rankingUnitLabels).map(([key, label]) => {
          const showItem =
            (key === 'region' && pageUnit === 'national') ||
            (key === 'prefecture' &&
              (pageUnit === 'national' || pageUnit === 'region')) ||
            key === 'city'

          return showItem ? (
            <RadioGroup.Item
              key={key}
              type='button'
              value={key}
              className={buttonVariants({
                withIcon: rankingUnit === key ? 'leading' : false,
                variant: rankingUnit === key ? 'default' : 'outline',
                size: 'md',
              })}
            >
              <RadioGroup.Indicator asChild>
                <Icon
                  name='check'
                  size={18}
                ></Icon>
              </RadioGroup.Indicator>
              {label}
            </RadioGroup.Item>
          ) : null
        })}
      </div>
    </RadioGroup.Root>
  )
}

function PickSort({
  sort,
  handleSort,
}: {
  sort: SortType
  handleSort: (sort: SortType | undefined) => void
}) {
  const id = React.useId()
  const sortLabel = `sort-${id}`

  return (
    <RadioGroup.Root
      value={sort}
      onValueChange={(value) => {
        const sortTypeSubmission = v.safeParse(sortSchema, value)
        if (sortTypeSubmission.success) {
          handleSort(sortTypeSubmission.output)
        }
      }}
      className='grid gap-4'
      aria-labelledby={sortLabel}
    >
      <div
        className='font-semibold'
        id={sortLabel}
      >
        並び替え
      </div>
      <div className='flex items-center gap-2'>
        {strictEntries(sortLabels).map(([key, label]) => (
          <RadioGroup.Item
            key={key}
            type='button'
            value={key}
            className={buttonVariants({
              withIcon: sort === key ? 'leading' : false,
              variant: sort === key ? 'default' : 'outline',
              size: 'md',
            })}
          >
            <RadioGroup.Indicator asChild>
              <Icon
                name='check'
                size={18}
              ></Icon>
            </RadioGroup.Indicator>
            {label}
          </RadioGroup.Item>
        ))}
      </div>
    </RadioGroup.Root>
  )
}
