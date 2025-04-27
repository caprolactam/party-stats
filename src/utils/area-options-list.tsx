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
import { type ListAreaOptions } from '#api/schema'
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

export const QUERY_KEY = 'area-options'

function listAreaOptionsQueryOptions({
  areaCode,
  page,
}: {
  areaCode: string
  page: number
}) {
  return queryOptions({
    queryKey: [QUERY_KEY, areaCode, page],
    queryFn: async () => {
      const data = (await fetch(
        `/api/areas/${areaCode}/options?page=${page}`,
      ).then((res) => res.json())) as ListAreaOptions

      return data
    },
    experimental_prefetchInRender: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
    // https://tanstack.com/query/latest/docs/framework/react/guides/paginated-queries
    placeholderData: (prevData) => prevData,
  })
}

export function AreaOptionsList() {
  const { region, prefecture } = useLoaderData({
    from: '/elections/$electionCode/$areaCode',
  })

  let key = prefecture?.code ?? region?.code ?? 'national'

  return (
    <AreaOptionsContainer
      // page状態ををareaごとにリセットしたいのでkeyでレンダリングを管理
      key={key}
      areaCode={key}
    />
  )
}

function AreaOptionsContainer({ areaCode }: { areaCode: string }) {
  const [page, setPage] = React.useState(1)
  const query = useQuery(listAreaOptionsQueryOptions({ areaCode, page }))

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
        <AreaOptionsListSkeleton
          count={11}
          showPaginationBar
        />
      }
    >
      <AreaOptionsListImpl
        optionsQuery={query}
        handlePage={handlePage}
      />
    </React.Suspense>
  )
}

function AreaOptionHigherUnit() {
  const { unit, region, prefecture } = useLoaderData({
    from: '/elections/$electionCode/$areaCode',
  })
  const linkProps = useCurrentLink()

  switch (unit) {
    case 'region': {
      return (
        <AreaOptionsListItem
          {...linkProps}
          params={{
            ...linkProps.params,
            areaCode: 'national',
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
        </AreaOptionsListItem>
      )
    }
    case 'prefecture': {
      return region.code === '1' ? (
        <AreaOptionsListItem
          {...linkProps}
          params={{
            ...linkProps.params,
            areaCode: 'national',
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
        </AreaOptionsListItem>
      ) : (
        <AreaOptionsListItem
          {...linkProps}
          params={{
            ...linkProps.params,
            areaCode: region.code,
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
        </AreaOptionsListItem>
      )
    }
    case 'city': {
      return (
        <AreaOptionsListItem
          {...linkProps}
          params={{
            ...linkProps.params,
            areaCode: prefecture.code,
          }}
          resetScroll={false}
        >
          <div className='flex items-center gap-2'>
            <Icon
              name='arrow-top-right'
              size={18}
              className='-rotate-90'
            />
            {prefecture.name}
          </div>
        </AreaOptionsListItem>
      )
    }
    case 'national':
    default: {
      return null
    }
  }
}

function AreaOptionsListItem({
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

function AreaOptionsListImpl({
  optionsQuery,
  handlePage,
}: {
  optionsQuery: UseQueryResult<ListAreaOptions>
  handlePage?: (newPage: number) => void
}) {
  const { region, prefecture, city } = useLoaderData({
    from: '/elections/$electionCode/$areaCode',
  })
  const linkProps = useCurrentLink()

  const {
    data: options,
    meta: { totalItems, currentPage, totalPages },
  } = React.use(optionsQuery.promise)

  const showPaginationBar = totalPages > 1

  return (
    <Card className='card-container'>
      <CardHeader className='flex flex-row items-start justify-between'>
        <div>
          <CardTitle className='text-lg'>
            {city?.name ?? prefecture?.name ?? region?.name ?? '全国'}
          </CardTitle>
          <CardDescription className='mt-1'>{`${totalItems}件の地域`}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className='px-0'>
        <AreaOptionHigherUnit />
        {options.map((option) => (
          <AreaOptionsListItem
            key={option.code}
            {...linkProps}
            params={{
              ...linkProps.params,
              // Exposing implementaion details...😅
              areaCode: option.code === '1' ? '010006' : option.code,
            }}
            resetScroll={false}
          >
            {city?.code === option.code ? (
              <div className='flex items-center gap-2'>
                <Icon
                  name='check'
                  size={18}
                />
                {option.name}
              </div>
            ) : (
              option.name
            )}
          </AreaOptionsListItem>
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

function AreaOptionsListSkeleton({
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
