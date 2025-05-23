import { cachified } from '@epic-web/cachified'
import { and, eq, sql, inArray } from 'drizzle-orm'
import { array, string } from 'valibot'
import * as v from 'valibot'
import { connectCache } from '../cache.ts'
import { connectDb, getCtx } from '../databases.ts'
import {
  regions,
  prefectures,
  cities,
  citiesHistories,
  votesOnCities,
  votesOnPrefectures,
  votesOnRegions,
  totalCountsOnCities,
  totalCountsOnPrefectures,
  totalCountsOnRegions,
} from '../schema.ts'
import { type AreaInfo } from './area.ts'
import { floorDecimal, DB_ERROR, DEFAULT_PAGE_LIMIT } from './utils.ts'

const PAGE_LIMIT = DEFAULT_PAGE_LIMIT
const mapDecimal = (value: number) => floorDecimal(value, 4)

export const rankingSortSchema = v.optional(
  v.picklist(['desc-popularity', 'asc-popularity']),
  'desc-popularity',
)
type RankingSort = v.InferOutput<typeof rankingSortSchema>

export const rankingUnitSchema = v.optional(
  v.picklist(['region', 'prefecture', 'city']),
)
type RankingUnit = v.InferOutput<typeof rankingUnitSchema>

export async function getPartyRanking({
  electionCode,
  partyId,
  areaInfo,
  sort,
  unit,
  page,
}: {
  electionCode: string
  partyId: string
  areaInfo: AreaInfo
  sort: RankingSort
  unit: RankingUnit
  page: number
}) {
  try {
    switch (areaInfo.unit) {
      case 'national': {
        if (unit == null) unit = 'region'
        return await getPartyRankingInNational({
          electionCode,
          partyId,
          sort,
          unit,
          page,
        })
      }
      case 'region': {
        const DEFAULT_UNIT = 'prefecture'
        if (unit == null || unit === 'region') {
          unit = DEFAULT_UNIT
        }
        return await getPartyRankingInRegion({
          electionCode,
          partyId,
          regionCode: areaInfo.regionCode,
          sort,
          unit,
          page,
        })
      }
      case 'prefecture': {
        return await getPartyRankingInPrefecture({
          electionCode,
          partyId,
          prefectureCode: areaInfo.prefectureCode,
          sort,
          page,
        })
      }
      case 'city': {
        // cityが所属するprefectureのランキングを取得する
        return await getPartyRankingInPrefecture({
          electionCode,
          partyId,
          prefectureCode: areaInfo.prefectureCode,
          sort,
          page,
        })
      }
      default: {
        const _exhaustiveCheck: never = areaInfo
        throw new Error(`Unexpected unit: ${_exhaustiveCheck}`)
      }
    }
  } catch (error) {
    console.error(error)
    throw new Error(DB_ERROR)
  }
}

async function getPartyRankingInNational({
  electionCode,
  partyId,
  sort,
  unit,
  page,
}: {
  electionCode: string
  partyId: string
  sort: RankingSort
  unit: 'region' | 'prefecture' | 'city'
  page: number
}) {
  const offset = PAGE_LIMIT * (page - 1)

  switch (unit) {
    case 'region': {
      const db = connectDb()
      const ranking = await db
        .select({
          code: regions.code,
          name: regions.name,
          rate: sql<number>`(${votesOnRegions.count} / ${totalCountsOnRegions.count})`
            .mapWith(mapDecimal)
            .as('rate'),
        })
        .from(votesOnRegions)
        .innerJoin(
          totalCountsOnRegions,
          and(
            eq(totalCountsOnRegions.regionCode, votesOnRegions.regionCode),
            eq(totalCountsOnRegions.electionCode, votesOnRegions.electionCode),
          ),
        )
        .innerJoin(regions, eq(regions.code, votesOnRegions.regionCode))
        .where(
          and(
            eq(votesOnRegions.electionCode, electionCode),
            eq(votesOnRegions.partyId, partyId),
          ),
        )
        .orderBy(sort === 'desc-popularity' ? sql`rate DESC` : sql`rate ASC`)

      const totalItems = ranking.length
      const totalPages = Math.ceil(totalItems / PAGE_LIMIT)
      const data = ranking.slice(offset, offset + PAGE_LIMIT)

      return {
        data,
        meta: {
          unit,
          sort,
          currentPage: page,
          pageSize: PAGE_LIMIT,
          totalItems,
          totalPages,
        },
      }
    }
    case 'prefecture': {
      const allKeys = await listRankingPrefectureKeys({
        electionCode,
        partyId,
        sort,
      })

      const totalItems = allKeys.length
      const totalPages = Math.ceil(totalItems / PAGE_LIMIT)
      const keys = allKeys.slice(offset, offset + PAGE_LIMIT)

      if (!keys.length) {
        return {
          data: [],
          meta: {
            sort,
            unit,
            currentPage: page,
            pageSize: PAGE_LIMIT,
            totalItems,
            totalPages,
          },
        }
      }

      const data = await fetchRankingByPrefectureKeys({
        electionCode,
        partyId,
        prefectureKeys: keys,
        sort,
      })

      return {
        data,
        meta: {
          sort,
          unit,
          currentPage: page,
          pageSize: PAGE_LIMIT,
          totalItems,
          totalPages,
        },
      }
    }
    case 'city': {
      const allKeys = await listRankingCityKeys({
        electionCode,
        partyId,
        sort,
      })
      const totalItems = allKeys.length
      const totalPages = Math.ceil(totalItems / PAGE_LIMIT)
      const keys = allKeys.slice(offset, offset + PAGE_LIMIT)

      if (!keys.length) {
        return {
          data: [],
          meta: {
            sort,
            unit,
            currentPage: page,
            pageSize: PAGE_LIMIT,
            totalItems,
            totalPages,
          },
        }
      }

      const data = await fetchRankingByCityKeys({
        electionCode,
        partyId,
        cityKeys: keys,
        sort,
      })

      return {
        data,
        meta: {
          sort,
          unit,
          currentPage: page,
          pageSize: PAGE_LIMIT,
          totalItems,
          totalPages,
        },
      }
    }
    default: {
      const _exhaustiveCheck: never = unit
      throw new Error(`Unexpected unit: ${_exhaustiveCheck}`)
    }
  }
}

async function getPartyRankingInRegion({
  electionCode,
  partyId,
  regionCode,
  sort,
  unit,
  page,
}: {
  electionCode: string
  partyId: string
  regionCode: string
  sort: RankingSort
  unit: 'prefecture' | 'city'
  page: number
}) {
  const offset = PAGE_LIMIT * (page - 1)

  switch (unit) {
    case 'prefecture': {
      const allKeys = await listRankingPrefectureKeys({
        electionCode,
        partyId,
        sort,
        regionCode,
      })

      const totalItems = allKeys.length
      const totalPages = Math.ceil(totalItems / PAGE_LIMIT)
      const keys = allKeys.slice(offset, offset + PAGE_LIMIT)

      if (!keys.length) {
        return {
          data: [],
          meta: {
            sort,
            unit,
            currentPage: page,
            pageSize: PAGE_LIMIT,
            totalItems,
            totalPages,
          },
        }
      }

      const data = await fetchRankingByPrefectureKeys({
        electionCode,
        partyId,
        prefectureKeys: keys,
        sort,
      })

      return {
        data,
        meta: {
          sort,
          unit,
          currentPage: page,
          pageSize: PAGE_LIMIT,
          totalItems,
          totalPages,
        },
      }
    }
    case 'city': {
      const allKeys = await listRankingCityKeys({
        electionCode,
        partyId,
        regionCode,
        sort,
      })
      const totalItems = allKeys.length
      const totalPages = Math.ceil(totalItems / PAGE_LIMIT)
      const keys = allKeys.slice(offset, offset + PAGE_LIMIT)

      if (!keys.length) {
        return {
          data: [],
          meta: {
            sort,
            unit,
            currentPage: page,
            pageSize: PAGE_LIMIT,
            totalItems,
            totalPages,
          },
        }
      }

      const data = await fetchRankingByCityKeys({
        electionCode,
        partyId,
        cityKeys: keys,
        sort,
      })

      return {
        data,
        meta: {
          sort,
          unit,
          currentPage: page,
          pageSize: PAGE_LIMIT,
          totalItems,
          totalPages,
        },
      }
    }
    default: {
      const _exhaustiveCheck: never = unit
      throw new Error(`Unexpected unit: ${_exhaustiveCheck}`)
    }
  }
}

async function getPartyRankingInPrefecture({
  electionCode,
  partyId,
  prefectureCode,
  sort,
  page,
}: {
  electionCode: string
  partyId: string
  prefectureCode: string
  sort: RankingSort
  page: number
}) {
  const offset = PAGE_LIMIT * (page - 1)

  const allKeys = await listRankingCityKeys({
    electionCode,
    partyId,
    prefectureCode,
    sort,
  })
  const totalItems = allKeys.length
  const totalPages = Math.ceil(totalItems / PAGE_LIMIT)
  const keys = allKeys.slice(offset, offset + PAGE_LIMIT)

  if (!keys.length) {
    return {
      data: [],
      meta: {
        sort,
        unit: 'city',
        currentPage: page,
        pageSize: PAGE_LIMIT,
        totalItems,
        totalPages,
      },
    }
  }

  const data = await fetchRankingByCityKeys({
    electionCode,
    partyId,
    cityKeys: keys,
    sort,
  })

  return {
    data,
    meta: {
      sort,
      unit: 'city',
      currentPage: page,
      pageSize: PAGE_LIMIT,
      totalItems,
      totalPages,
    },
  }
}

export async function listRankingPrefectureKeys({
  regionCode,
  electionCode,
  partyId,
  sort,
}: {
  regionCode?: string
  electionCode: string
  partyId: string
  sort: RankingSort
}) {
  const sortType =
    sort === 'desc-popularity' || sort === 'asc-popularity'
      ? 'popularity'
      : null
  if (!sortType) {
    throw new Error('Invalid sort type')
  }

  const db = connectDb()
  const ctx = getCtx()
  const cache = connectCache('json')

  const prefectureCodesPromise = regionCode
    ? db
        .select({
          code: prefectures.code,
        })
        .from(prefectures)
        .where(eq(prefectures.regionCode, regionCode))
        .then((data) => data.map((d) => d.code))
    : undefined

  const rankingPromise = cachified({
    key: `ranking-prefectures:${electionCode}:${partyId}:${sortType}`,
    cache,
    checkValue: array(string()),
    async getFreshValue() {
      const data = await db
        .select({
          code: votesOnPrefectures.prefectureCode,
          rate: sql`(${votesOnPrefectures.count} / ${totalCountsOnPrefectures.count})`.as(
            'rate',
          ),
        })
        .from(votesOnPrefectures)
        .innerJoin(
          totalCountsOnPrefectures,
          and(
            eq(
              totalCountsOnPrefectures.prefectureCode,
              votesOnPrefectures.prefectureCode,
            ),
            eq(
              totalCountsOnPrefectures.electionCode,
              votesOnPrefectures.electionCode,
            ),
          ),
        )
        .where(
          and(
            eq(votesOnPrefectures.electionCode, electionCode),
            eq(votesOnPrefectures.partyId, partyId),
          ),
        )
        .orderBy(sql`rate DESC`)
        .then((data) => data.map((d) => d.code))

      return data
    },
    forceFresh: false,
    ttl: 1000 * 60 * 60 * 24 * 30, // 30 days
    waitUntil: ctx.waitUntil.bind(ctx),
  })
  const [ranking, prefectureCodes] = await Promise.all([
    rankingPromise,
    prefectureCodesPromise,
  ])

  const filteredRanking = prefectureCodes
    ? ranking.filter((code) => prefectureCodes.includes(code))
    : ranking

  if (sort === 'asc-popularity') {
    return filteredRanking.reverse()
  }

  return filteredRanking
}

async function fetchRankingByPrefectureKeys({
  electionCode,
  partyId,
  prefectureKeys,
  sort,
}: {
  electionCode: string
  partyId: string
  prefectureKeys: Array<string>
  sort: RankingSort
}) {
  const db = connectDb()

  return db
    .select({
      code: prefectures.code,
      name: prefectures.name,
      rate: sql<number>`(${votesOnPrefectures.count} / ${totalCountsOnPrefectures.count})`
        .mapWith(mapDecimal)
        .as('rate'),
    })
    .from(votesOnPrefectures)
    .innerJoin(
      totalCountsOnPrefectures,
      and(
        eq(
          totalCountsOnPrefectures.prefectureCode,
          votesOnPrefectures.prefectureCode,
        ),
        eq(
          totalCountsOnPrefectures.electionCode,
          votesOnPrefectures.electionCode,
        ),
      ),
    )
    .innerJoin(
      prefectures,
      eq(prefectures.code, votesOnPrefectures.prefectureCode),
    )
    .where(
      and(
        eq(votesOnPrefectures.electionCode, electionCode),
        inArray(votesOnPrefectures.prefectureCode, prefectureKeys),
        eq(votesOnPrefectures.partyId, partyId),
      ),
    )
    .orderBy(sort === 'desc-popularity' ? sql`rate DESC` : sql`rate ASC`)
}

export async function listRankingCityKeys({
  regionCode,
  prefectureCode,
  electionCode,
  partyId,
  sort,
}: {
  electionCode: string
  partyId: string
  sort: RankingSort
} & (
  | {
      regionCode: string
      prefectureCode?: never
    }
  | {
      regionCode?: never
      prefectureCode: string
    }
  | {
      regionCode?: never
      prefectureCode?: never
    }
)) {
  const sortType =
    sort === 'desc-popularity' || sort === 'asc-popularity'
      ? 'popularity'
      : null
  if (!sortType) {
    throw new Error('Invalid sort type')
  }

  const db = connectDb()
  const ctx = getCtx()
  const cache = connectCache('json')

  const prefectureCodesPromise = regionCode
    ? db
        .select({
          code: prefectures.code,
        })
        .from(prefectures)
        .where(eq(prefectures.regionCode, regionCode))
        .then((data) => data.map((d) => d.code.slice(0, 2)))
    : prefectureCode
      ? [prefectureCode.slice(0, 2)]
      : undefined

  const rankingPromise = cachified({
    key: `ranking-cities:${electionCode}:${partyId}:${sortType}`,
    cache,
    checkValue: array(string()),
    async getFreshValue() {
      return db
        .select({
          code: cities.code,
          rate: sql`SUM(${votesOnCities.count}) / SUM(${totalCountsOnCities.count})`.as(
            'rate',
          ),
        })
        .from(cities)
        .innerJoin(citiesHistories, eq(citiesHistories.ancestor, cities.code))
        .innerJoin(
          votesOnCities,
          eq(votesOnCities.cityCode, citiesHistories.descendant),
        )
        .innerJoin(
          totalCountsOnCities,
          and(
            eq(totalCountsOnCities.cityCode, votesOnCities.cityCode),
            eq(totalCountsOnCities.electionCode, votesOnCities.electionCode),
          ),
        )
        .where(
          and(
            eq(cities.archived, false),
            eq(votesOnCities.electionCode, electionCode),
            eq(votesOnCities.partyId, partyId),
          ),
        )
        .groupBy(cities.code)
        .orderBy(sql`rate DESC`)
        .then((data) => data.map((d) => d.code))
    },
    forceFresh: false,
    ttl: 1000 * 60 * 60 * 24 * 30, // 30 days
    waitUntil: ctx.waitUntil.bind(ctx),
  })

  const [ranking, prefectureCodes] = await Promise.all([
    rankingPromise,
    prefectureCodesPromise,
  ])

  const filteredRanking = prefectureCodes
    ? ranking.filter((code) =>
        prefectureCodes.some((prefectureCode) =>
          code.startsWith(prefectureCode),
        ),
      )
    : ranking

  if (sort === 'asc-popularity') {
    return filteredRanking.reverse()
  }

  return filteredRanking
}

async function fetchRankingByCityKeys({
  electionCode,
  partyId,
  cityKeys,
  sort,
}: {
  electionCode: string
  partyId: string
  cityKeys: Array<string>
  sort: RankingSort
}) {
  const db = connectDb()

  // CTE 1: ancestor ごとの票数合計
  const votesAgg = db.$with('votesAgg').as(
    db
      .select({
        cityCode: citiesHistories.ancestor,
        sumCount: sql<number>`SUM(${votesOnCities.count})`.as('sumCount'),
      })
      .from(citiesHistories)
      .innerJoin(
        votesOnCities,
        and(
          eq(votesOnCities.cityCode, citiesHistories.descendant),
          eq(votesOnCities.electionCode, electionCode),
          eq(votesOnCities.partyId, partyId),
        ),
      )
      .where(inArray(citiesHistories.ancestor, cityKeys))
      .groupBy(citiesHistories.ancestor),
  )

  // CTE 2: ancestor ごとの総投票数
  const totalAgg = db.$with('totalAgg').as(
    db
      .select({
        cityCode: citiesHistories.ancestor,
        totalCount: sql<number>`SUM(${totalCountsOnCities.count})`.as(
          'totalCount',
        ),
      })
      .from(citiesHistories)
      .innerJoin(
        totalCountsOnCities,
        and(
          eq(totalCountsOnCities.cityCode, citiesHistories.descendant),
          eq(totalCountsOnCities.electionCode, electionCode),
        ),
      )
      .where(inArray(citiesHistories.ancestor, cityKeys))
      .groupBy(citiesHistories.ancestor),
  )

  return db
    .with(votesAgg, totalAgg)
    .select({
      code: cities.code,
      name: cities.name,
      supportText: prefectures.name,
      rate: sql<number>`votesAgg.sumCount / totalAgg.totalCount`
        .mapWith(mapDecimal)
        .as('rate'),
    })
    .from(votesAgg)
    .innerJoin(totalAgg, eq(votesAgg.cityCode, totalAgg.cityCode))
    .innerJoin(cities, eq(cities.code, votesAgg.cityCode))
    .innerJoin(prefectures, eq(prefectures.code, cities.prefectureCode))
    .orderBy(sort === 'desc-popularity' ? sql`rate DESC` : sql`rate ASC`)
}
