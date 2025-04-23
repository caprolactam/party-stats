import {
  queryOptions,
  useQuery,
  type UseQueryResult,
} from '@tanstack/react-query'
import {
  useLoaderData,
  Link,
  type NavigateOptions,
  type ActiveOptions,
} from '@tanstack/react-router'
import React from 'react'
import {
  type ListRegions,
  type ListPrefecturesInRegion,
  type ListCitiesInPrefecture,
} from '#api/schema'
import { Button } from '#src/components/parts/button.tsx'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '#src/components/parts/card.tsx'
import { Icon } from '#src/components/parts/icon.tsx'
import { Skeleton } from '#src/components/parts/skelton.tsx'
import { cn } from '#src/utils/misc.ts'
import { createPageNumber } from './pagination.tsx'
import { useCurrentLink } from './use-current-link.ts'

const QUERY_KEY = 'city-candidates'

export function regionsQueryOptions() {
  return queryOptions({
    queryKey: [QUERY_KEY, 'regions'],
    queryFn: async () => {
      const data = (await fetch('/api/regions').then((res) =>
        res.json(),
      )) as ListRegions
      return {
        candidates: data,
        currentPage: 1,
        pageSize: data.length,
        totalItems: data.length,
        totalPages: 1,
      }
    },
    experimental_prefetchInRender: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function prefecturesInRegionQueryOptions({
  regionCode,
}: {
  regionCode: string
}) {
  return queryOptions({
    queryKey: [QUERY_KEY, 'prefectures', regionCode],
    queryFn: async () => {
      const data = (await fetch(`/api/regions/${regionCode}/prefectures`).then(
        (res) => res.json(),
      )) as ListPrefecturesInRegion

      return {
        candidates: data,
        currentPage: 1,
        pageSize: data.length,
        totalItems: data.length,
        totalPages: 1,
      }
    },
    experimental_prefetchInRender: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function citiesInPrefectureQueryOptions({
  prefectureCode,
  page,
}: {
  prefectureCode: string
  page: number
}) {
  return queryOptions({
    queryKey: [QUERY_KEY, 'cities', prefectureCode, page],
    queryFn: async () => {
      const data = (await fetch(
        `/api/prefectures/${prefectureCode}/cities?page=${page}`,
      ).then((res) => res.json())) as ListCitiesInPrefecture

      const { cities, meta } = data

      return {
        ...meta,
        candidates: cities,
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    experimental_prefetchInRender: true,
    // https://tanstack.com/query/latest/docs/framework/react/guides/paginated-queries
    placeholderData: (prevData) => prevData,
  })
}

export function CityCandidatesList() {
  const { unit, region, prefecture, city } = useLoaderData({
    from: '/elections/$electionId/$unitId',
  })

  switch (unit) {
    case 'national':
      return <UnitNational />
    case 'region':
      return <UnitRegion regionCode={region.code} />
    case 'prefecture':
      return <UnitPrefecture prefectureCode={prefecture.code} />
    case 'city':
      return <UnitPrefecture prefectureCode={city.prefecture.code} />
    default: {
      const _: never = unit
      throw new Error(`Invalid unit type: ${_}`)
    }
  }
}

function UnitNational() {
  const query = useQuery(regionsQueryOptions())

  return (
    <React.Suspense fallback={<CandidatesListSkeleton />}>
      <CandidatesListImpl candidatesQuery={query} />
    </React.Suspense>
  )
}
function UnitRegion({ regionCode }: { regionCode: string }) {
  const query = useQuery(prefecturesInRegionQueryOptions({ regionCode }))

  return (
    <React.Suspense fallback={<CandidatesListSkeleton />}>
      <CandidatesListImpl candidatesQuery={query} />
    </React.Suspense>
  )
}
function UnitPrefecture({ prefectureCode }: { prefectureCode: string }) {
  const [page, setPage] = React.useState(1)
  const query = useQuery(
    citiesInPrefectureQueryOptions({ prefectureCode, page }),
  )

  function handlePage(newPage: number) {
    if (Number.isInteger(newPage) && newPage > 0) {
      setPage(newPage)
      return
    }
    setPage(1)
  }

  return (
    <React.Suspense
      fallback={
        <CandidatesListSkeleton
          count={11}
          showPaginationBar
        />
      }
    >
      <CandidatesListImpl
        candidatesQuery={query}
        handlePage={handlePage}
      />
    </React.Suspense>
  )
}

function CandidateHigherUnit() {
  const { unit, region } = useLoaderData({
    from: '/elections/$electionId/$unitId',
  })
  const linkProps = useCurrentLink()

  switch (unit) {
    case 'region': {
      return (
        <CandidatesListItem
          {...linkProps}
          params={{
            ...linkProps.params,
            unitId: 'national',
          }}
          resetScroll={false}
        >
          <div className='flex items-center gap-2'>
            <Icon
              name='arrow-top-right'
              size={18}
              className='-rotate-90'
            />
            <span className='text-brand-12'>全国</span>
          </div>
        </CandidatesListItem>
      )
    }
    case 'prefecture':
    case 'city': {
      return region.code === '1' ? (
        <CandidatesListItem
          {...linkProps}
          params={{
            ...linkProps.params,
            unitId: 'national',
          }}
          resetScroll={false}
        >
          <div className='flex items-center gap-2'>
            <Icon
              name='arrow-top-right'
              size={18}
              className='-rotate-90'
            />
            全国
          </div>
        </CandidatesListItem>
      ) : (
        <CandidatesListItem
          {...linkProps}
          params={{
            ...linkProps.params,
            unitId: region.code,
          }}
          resetScroll={false}
        >
          <div className='flex items-center gap-2'>
            <Icon
              name='arrow-top-right'
              size={18}
              className='-rotate-90'
            />
            {region.name}
          </div>
        </CandidatesListItem>
      )
    }
    case 'national':
    default: {
      return null
    }
  }
}

function CandidatesListItem({
  children,
  ...props
}: {
  children: React.ReactNode
} & NavigateOptions &
  ActiveOptions) {
  return (
    <Link
      className='text-brand-12 hover:bg-brand-4 focus-visible:bg-brand-5 active:bg-brand-5 flex h-11 items-center justify-between gap-4 px-4 select-none'
      {...props}
    >
      {children}
      <Icon
        className='shrink-0'
        name='chevron-right'
        size={20}
      />
    </Link>
  )
}

function CandidatesListImpl({
  candidatesQuery,
  handlePage,
}: {
  candidatesQuery: UseQueryResult<{
    candidates: Array<{ code: string; name: string }>
    currentPage: number
    pageSize: number
    totalItems: number
    totalPages: number
  }>
  handlePage?: (newPage: number) => void
}) {
  const { region, prefecture, city } = useLoaderData({
    from: '/elections/$electionId/$unitId',
  })
  const linkProps = useCurrentLink()

  const { candidates, totalItems, currentPage, totalPages } = React.use(
    candidatesQuery.promise,
  )

  const showPaginationBar = totalPages > 1

  return (
    <Card className='card-container'>
      <CardHeader className='flex flex-row items-start justify-between'>
        <div>
          <CardTitle className='text-lg'>
            {prefecture?.name ?? region?.name ?? '全国'}
          </CardTitle>
          <CardDescription className='mt-1'>{`${totalItems}件の地域`}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className='px-0'>
        <CandidateHigherUnit />
        {candidates.map((candidate) => (
          <CandidatesListItem
            key={candidate.code}
            {...linkProps}
            params={{
              ...linkProps.params,
              // Exposing implementaion details...😅
              unitId: candidate.code === '1' ? '010006' : candidate.code,
            }}
            resetScroll={false}
          >
            {city?.code === candidate.code ? (
              <div className='flex items-center gap-2'>
                <Icon
                  name='check'
                  size={18}
                />
                {candidate.name}
              </div>
            ) : (
              candidate.name
            )}
          </CandidatesListItem>
        ))}
      </CardContent>
      {showPaginationBar && (
        <CardFooter className='block w-full'>
          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            handlePage={handlePage}
          />
        </CardFooter>
      )}
    </Card>
  )
}

function CandidatesListSkeleton({
  count = 10,
  showPaginationBar = false,
}: {
  count?: number
  showPaginationBar?: boolean
}) {
  const arr = Array.from({ length: count }, (_, i) => i)
  return (
    <Card>
      <CardHeader>
        <div className='flex h-7 items-center'>
          <Skeleton className='h-4 w-10' />
        </div>
        <div className='flex h-5 items-center'>
          <Skeleton className='h-2.5 w-20' />
        </div>
      </CardHeader>
      <CardContent className='px-0'>
        <ul>
          {arr.map((i) => (
            <li key={i}>
              <div className='text-brand-12 hover:bg-brand-4 focus-visible:bg-brand-5 active:bg-brand-5 flex h-11 items-center gap-4 px-4'>
                <Skeleton className='h-3 w-20' />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
      {showPaginationBar && (
        <CardFooter className='block w-full'>
          <div className='flex w-full items-center justify-center gap-2'>
            {Array.from({ length: 5 }, (_, i) => i).map((i) => (
              <Skeleton
                className='size-8 rounded-sm'
                key={i}
              />
            ))}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

function PaginationBar({
  className,
  currentPage,
  totalPages,
  handlePage,
}: {
  className?: string
  currentPage: number
  totalPages: number
  handlePage?: (newPage: number) => void
}) {
  const { pageNumbers, canPageBackwards, canPageForwards } = createPageNumber({
    currentPage,
    totalPages,
  })

  return (
    <ol className={cn('flex items-center justify-center gap-2', className)}>
      <li>
        <Button
          variant='outline'
          size='md'
          type='button'
          className='size-8 p-0'
          onClick={() => handlePage?.(currentPage - 1)}
          disabled={!canPageBackwards}
          title='前のページ'
        >
          <Icon
            name='chevron-right'
            className='rotate-180'
            size={20}
          />
          <span className='sr-only'>前のページ</span>
        </Button>
      </li>
      {pageNumbers.map((page) => (
        <li key={page}>
          <Button
            size='md'
            type='button'
            className='size-8 p-0'
            variant={page === currentPage ? 'accent' : 'outline'}
            onClick={() => handlePage?.(page)}
          >
            {page}
          </Button>
        </li>
      ))}
      <li>
        <Button
          variant='outline'
          size='md'
          type='button'
          className='size-8 p-0'
          onClick={() => handlePage?.(currentPage + 1)}
          disabled={!canPageForwards}
          title='次のページ'
        >
          <Icon
            name='chevron-right'
            size={20}
          />
          <span className='sr-only'>次のページ</span>
        </Button>
      </li>
    </ol>
  )
}
