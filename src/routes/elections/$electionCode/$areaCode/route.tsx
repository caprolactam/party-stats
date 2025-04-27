import { useQueryClient } from '@tanstack/react-query'
import {
  createFileRoute,
  Outlet,
  redirect,
  Link,
  type NavigateOptions,
  notFound,
} from '@tanstack/react-router'
import React from 'react'
import { type GetArea, type ListAreaOptions } from '#api/schema.ts'
import { Icon } from '#src/components/parts/icon.tsx'
import { QUERY_KEY } from '#src/utils/area-options-list.tsx'
import { LayoutWithSidebar } from '#src/utils/sidebar.tsx'
import { useCurrentLink } from '#src/utils/use-current-link.ts'

async function getArea(areaCode: string) {
  try {
    const response = await fetch(`/api/areas/${areaCode}`)

    if (response.status === 404) {
      const errorMessage = await response.json()
      throw notFound({ data: errorMessage })
    }

    if (!response.ok) {
      throw new Error(`Error fetching area data: ${response.statusText}`)
    }

    const data = (await response.json()) as GetArea

    return data
  } catch (error) {
    throw error
  }
}

async function listAreaOptions(areaCode: string) {
  // perfomance optimization
  // cityの場合はルートレベルではなくコンポーネントにFetch-on-renderさせる
  const isCity = /^[0-9]{5}$/.test(areaCode)
  if (isCity) {
    return null
  }
  try {
    const searchParams = new URLSearchParams()
    searchParams.set('page', '1')

    const response = await fetch(
      `/api/areas/${areaCode}/options?${searchParams.toString()}`,
    )

    if (response.status === 404) {
      const errorMessage = await response.json()
      throw notFound({ data: errorMessage })
    }

    if (!response.ok) {
      throw new Error(`Error fetching area options: ${response.statusText}`)
    }

    const data = (await response.json()) as ListAreaOptions

    return data
  } catch (error) {
    throw error
  }
}

export const Route = createFileRoute('/elections/$electionCode/$areaCode')({
  loader: async ({ params, context: { queryClient } }) => {
    const areaOptionsPromise = queryClient.getQueryData([
      QUERY_KEY,
      params.areaCode,
      1,
    ])
      ? null
      : listAreaOptions(params.areaCode)
    const [areaInfo, areaOptions] = await Promise.all([
      getArea(params.areaCode),
      areaOptionsPromise,
    ])

    // Exposing implementaion details...😅
    if (areaInfo.unit === 'region' && areaInfo.code === '1') {
      throw redirect({
        to: `/elections/$electionCode/$areaCode/overview`,
        params: {
          ...params,
          areaCode: '010006',
        },
      })
    }

    if (areaInfo.unit === 'city' && areaInfo.archived) {
      throw redirect({
        to: `/elections/$electionCode/$areaCode/overview`,
        params: {
          ...params,
          areaCode: areaInfo.redirectTo,
        },
      })
    }

    if (areaOptions) {
      // params.areaCodeではなくareaOptions.meta.cacheKeyを用いる
      queryClient.setQueryData(
        [QUERY_KEY, areaOptions.meta.cacheKey, areaOptions.meta.currentPage],
        areaOptions,
      )
    }

    switch (areaInfo.unit) {
      case 'national':
        return {
          unit: 'national',
        } as const
      case 'region': {
        const { unit, ...region } = areaInfo
        return {
          unit,
          region,
        } as const
      }
      case 'prefecture': {
        const { unit, region, ...prefecture } = areaInfo
        return {
          unit,
          region,
          prefecture,
        } as const
      }
      case 'city': {
        const { unit, region, prefecture, ...city } = areaInfo
        return {
          unit,
          region,
          prefecture,
          city,
        } as const
      }
      default: {
        const _: never = areaInfo
        throw new Error(`Invalid areaCode: ${_}`)
      }
    }
  },
  gcTime: 0,
  shouldReload: false,
  component: LayoutComponent,
})

function LayoutComponent() {
  const queryClient = useQueryClient()
  const { electionCode, areaCode } = Route.useParams()

  React.useEffect(() => {
    return () => {
      queryClient.removeQueries({
        queryKey: ['partyDetails', electionCode],
        exact: false,
      })
    }
  }, [queryClient, electionCode])

  React.useEffect(() => {
    return () => {
      queryClient.removeQueries({
        queryKey: ['partyDetails', electionCode, areaCode],
        exact: false,
      })
    }
  }, [queryClient, electionCode, areaCode])

  return (
    <>
      <BreadCrumbs className='flex h-12 items-center' />
      <LayoutWithSidebar>
        <Outlet />
      </LayoutWithSidebar>
    </>
  )
}

function BreadCrumbs({ className }: { className?: string }) {
  const { region, prefecture, city } = Route.useLoaderData()
  const linkProps = useCurrentLink()

  return (
    <nav className={className}>
      <span className='sr-only'>得票データの対象地域</span>
      <ol className='flex min-w-0 list-none flex-wrap items-center'>
        <BreadCrumbItem
          {...linkProps}
          params={{
            ...linkProps.params,
            areaCode: 'national',
          }}
        >
          全国
        </BreadCrumbItem>
        {region && region.code !== '1' && (
          <BreadCrumbItem
            {...linkProps}
            params={{
              ...linkProps.params,
              areaCode: region.code,
            }}
          >
            {region.name}
          </BreadCrumbItem>
        )}
        {prefecture && (
          <BreadCrumbItem
            {...linkProps}
            params={{
              ...linkProps.params,
              areaCode: prefecture.code,
            }}
          >
            {prefecture.name}
          </BreadCrumbItem>
        )}
        {city && (
          <BreadCrumbItem
            {...linkProps}
            params={{
              ...linkProps.params,
              areaCode: city.code,
            }}
          >
            {city.name}
          </BreadCrumbItem>
        )}
      </ol>
    </nav>
  )
}

function BreadCrumbItem({
  children,
  ...props
}: NavigateOptions & {
  children: React.ReactNode
}) {
  return (
    <li className='group inline-flex h-full items-center'>
      <Link
        {...props}
        className='relative text-sm underline-offset-2 before:absolute before:inset-x-0 before:inset-y-1/2 before:h-12 before:-translate-y-1/2 hover:underline'
      >
        {children}
      </Link>
      <Icon
        name='navigate-next-thin'
        className='text-brand-11 translate-x-px group-last-of-type:hidden'
        size={20}
      />
    </li>
  )
}
