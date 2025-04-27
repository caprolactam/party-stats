import { useQueryClient } from '@tanstack/react-query'
import {
  createFileRoute,
  Outlet,
  redirect,
  Link,
  type NavigateOptions,
} from '@tanstack/react-router'
import React from 'react'
import {
  type GetRegion,
  type GetPrefecture,
  type GetCity,
} from '#api/schema.ts'
import { Icon } from '#src/components/parts/icon.tsx'
import {
  regionsQueryOptions,
  prefecturesInRegionQueryOptions,
  citiesInPrefectureQueryOptions,
} from '#src/utils/city-candidates-list.tsx'
import { type Unit } from '#src/utils/misc.ts'
import { LayoutWithSidebar } from '#src/utils/sidebar.tsx'
import { useCurrentLink } from '#src/utils/use-current-link.ts'

type UnitInfo = {
  estimatedUnit: Unit
  areaCode: string
} | null

function estimateUnitId(areaCodeParam: string): UnitInfo {
  const areaCode = areaCodeParam.toLowerCase()
  const regionRegex = /^[0-9]$/
  const prefectureRegex = /^[0-9]{6}$/
  const cityRegex = /^[0-9]{5}$/

  if (areaCode === 'national') {
    return { estimatedUnit: 'national', areaCode }
  } else if (regionRegex.test(areaCode)) {
    return { estimatedUnit: 'region', areaCode }
  } else if (prefectureRegex.test(areaCode)) {
    return { estimatedUnit: 'prefecture', areaCode }
  } else if (cityRegex.test(areaCode)) {
    return { estimatedUnit: 'city', areaCode }
  }

  return null
}

async function getUnitInfo({
  estimatedUnit,
  areaCode: areaCodeParam,
}: NonNullable<UnitInfo>) {
  try {
    switch (estimatedUnit) {
      case 'national':
        return {
          unit: estimatedUnit,
        }
      case 'region': {
        const response = await fetch(`/api/regions/${areaCodeParam}`)
        if (!response.ok) {
          throw new Error('Region not found')
        }
        const region: GetRegion = (await response.json()) as GetRegion

        return {
          unit: estimatedUnit,
          region,
        }
      }
      case 'prefecture': {
        const response = await fetch(`/api/prefectures/${areaCodeParam}`)
        if (!response.ok) {
          throw new Error('Prefecture not found')
        }
        const prefecture: GetPrefecture =
          (await response.json()) as GetPrefecture

        return {
          unit: estimatedUnit,
          region: prefecture.region,
          prefecture,
        }
      }
      case 'city': {
        const response = await fetch(`/api/cities/${areaCodeParam}`)
        if (!response.ok) {
          throw new Error('City not found')
        }
        const city: GetCity = (await response.json()) as GetCity

        return {
          unit: estimatedUnit,
          region: city.region,
          prefecture: city.prefecture,
          city,
        }
      }
      default: {
        const _: never = estimatedUnit
        throw new Error(`Invalid areaCode: ${_}`)
      }
    }
  } catch (error) {
    console.error('Error fetching unit info:', error)
    throw error
  }
}

export const Route = createFileRoute('/elections/$electionCode/$areaCode')({
  beforeLoad: (ctx) => {
    const unitInfo = estimateUnitId(ctx.params.areaCode)
    if (!unitInfo) {
      // TODO: handle error
      throw new Error('Invalid areaCode')
    }

    // Exposing implementaion details...😅
    if (unitInfo.estimatedUnit === 'region' && unitInfo.areaCode === '1') {
      throw redirect({
        to: `/elections/$electionCode/$areaCode/overview`,
        params: {
          ...ctx.params,
          areaCode: '010006',
        },
      })
    }

    return unitInfo
  },
  loader: async ({ context, params }) => {
    switch (context.estimatedUnit) {
      case 'national':
        void context.queryClient.prefetchQuery(regionsQueryOptions())
        break
      case 'region':
        void context.queryClient.prefetchQuery(
          prefecturesInRegionQueryOptions({
            regionCode: context.areaCode,
          }),
        )
        break
      case 'prefecture':
        void context.queryClient.prefetchQuery(
          citiesInPrefectureQueryOptions({
            prefectureCode: context.areaCode,
            page: 1,
          }),
        )
        break
      case 'city':
      default:
        break
    }

    const unitInfo = await getUnitInfo({
      estimatedUnit: context.estimatedUnit,
      areaCode: context.areaCode,
    })

    if (unitInfo.city?.archived) {
      throw redirect({
        to: `/elections/$electionCode/$areaCode/overview`,
        params: {
          ...params,
          areaCode: unitInfo.city.redirectTo,
        },
      })
    }

    return unitInfo
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
