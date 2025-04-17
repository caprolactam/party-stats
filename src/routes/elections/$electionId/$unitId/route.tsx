import {
  createFileRoute,
  Outlet,
  redirect,
  Link,
  type NavigateOptions,
  useChildMatches,
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

type UnitInfo = {
  estimatedUnit: Unit
  unitId: string
} | null

function estimateUnitId(unitIdParam: string): UnitInfo {
  const unitId = unitIdParam.toLowerCase()
  const regionRegex = /^[0-9]$/
  const prefectureRegex = /^[0-9]{6}$/
  const cityRegex = /^[0-9]{5}$/

  if (unitId === 'national') {
    return { estimatedUnit: 'national', unitId }
  } else if (regionRegex.test(unitId)) {
    return { estimatedUnit: 'region', unitId }
  } else if (prefectureRegex.test(unitId)) {
    return { estimatedUnit: 'prefecture', unitId }
  } else if (cityRegex.test(unitId)) {
    return { estimatedUnit: 'city', unitId }
  }

  return null
}

async function getUnitInfo({
  estimatedUnit,
  unitId: unitIdParam,
}: NonNullable<UnitInfo>) {
  try {
    switch (estimatedUnit) {
      case 'national':
        return {
          unit: estimatedUnit,
        }
      case 'region': {
        const response = await fetch(`/api/regions/${unitIdParam}`)
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
        const response = await fetch(`/api/prefectures/${unitIdParam}`)
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
        const response = await fetch(`/api/cities/${unitIdParam}`)
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
        throw new Error(`Invalid unitId: ${_}`)
      }
    }
  } catch (error) {
    console.error('Error fetching unit info:', error)
    throw error
  }
}

export const Route = createFileRoute('/elections/$electionId/$unitId')({
  beforeLoad: (ctx) => {
    const unitInfo = estimateUnitId(ctx.params.unitId)
    if (!unitInfo) {
      // TODO: handle error
      throw new Error('Invalid unitId')
    }

    // Exposing implementaion details...😅
    if (unitInfo.estimatedUnit === 'region' && unitInfo.unitId === '1') {
      throw redirect({
        to: `/elections/$electionId/$unitId/overview`,
        params: {
          ...ctx.params,
          unitId: '010006',
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
            regionCode: context.unitId,
          }),
        )
        break
      case 'prefecture':
        void context.queryClient.prefetchQuery(
          citiesInPrefectureQueryOptions({
            prefectureCode: context.unitId,
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
      unitId: context.unitId,
    })

    if (unitInfo.city?.archived) {
      throw redirect({
        to: `/elections/$electionId/$unitId/overview`,
        params: {
          ...params,
          unitId: unitInfo.city.redirectTo,
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
  const params = Route.useParams()
  const rankingSearch = useChildMatches({
    select: (matches) =>
      matches.find(
        (match) => match.routeId === '/elections/$electionId/$unitId/ranking',
      )?.search,
    structuralSharing: true,
  })
  const isRanking = !!rankingSearch

  return (
    <nav className={className}>
      <span className='sr-only'>得票データの対象地域</span>
      <ol className='flex min-w-0 list-none flex-wrap items-center'>
        <BreadCrumbItem
          to={
            isRanking
              ? '/elections/$electionId/$unitId/ranking'
              : '/elections/$electionId/$unitId/overview'
          }
          params={{
            ...params,
            unitId: 'national',
          }}
          search={{
            ...rankingSearch,
            page: undefined,
          }}
        >
          全国
        </BreadCrumbItem>
        {region && region.code !== '1' && (
          <BreadCrumbItem
            to={
              isRanking
                ? '/elections/$electionId/$unitId/ranking'
                : '/elections/$electionId/$unitId/overview'
            }
            params={{
              ...params,
              unitId: region.code,
            }}
            search={{
              ...rankingSearch,
              page: undefined,
            }}
          >
            {region.name}
          </BreadCrumbItem>
        )}
        {prefecture && (
          <BreadCrumbItem
            to={
              isRanking
                ? '/elections/$electionId/$unitId/ranking'
                : '/elections/$electionId/$unitId/overview'
            }
            params={{
              ...params,
              unitId: prefecture.code,
            }}
            search={{
              ...rankingSearch,
              page: undefined,
            }}
          >
            {prefecture.name}
          </BreadCrumbItem>
        )}
        {city && (
          <BreadCrumbItem
            to={
              isRanking
                ? '/elections/$electionId/$unitId/ranking'
                : '/elections/$electionId/$unitId/overview'
            }
            params={{
              ...params,
              unitId: city.code,
            }}
            search={{
              ...rankingSearch,
              page: undefined,
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
