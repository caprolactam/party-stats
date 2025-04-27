import { and, eq, not, asc } from 'drizzle-orm'
import { connectDb } from '../databases.ts'
import { regions, prefectures, cities, citiesHistories } from '../schema.ts'
import { DB_ERROR, DEFAULT_PAGE_LIMIT, getFirstItem } from './utils.ts'
const PAGE_LIMIT = DEFAULT_PAGE_LIMIT

function estimateUnit(areaCodeParam: string) {
  const areaCode = areaCodeParam.toLowerCase()
  const regionRegex = /^[0-9]$/
  const prefectureRegex = /^[0-9]{6}$/
  const cityRegex = /^[0-9]{5}$/

  if (areaCode === 'national') {
    return { unit: 'national' } as const
  } else if (regionRegex.test(areaCode)) {
    return { unit: 'region', regionCode: areaCode } as const
  } else if (prefectureRegex.test(areaCode)) {
    return { unit: 'prefecture', prefectureCode: areaCode } as const
  } else if (cityRegex.test(areaCode)) {
    return { unit: 'city', cityCode: areaCode } as const
  }

  return null
}
export type AreaInfo =
  | {
      unit: 'national'
    }
  | {
      unit: 'region'
      regionCode: string
    }
  | {
      unit: 'prefecture'
      prefectureCode: string
      regionCode: string
    }
  | {
      unit: 'city'
      cityCode: string
      prefectureCode: string
    }
export async function checkArea(
  areaCodeParam: string,
): Promise<AreaInfo | null> {
  const unitInfo = estimateUnit(areaCodeParam)
  if (!unitInfo) return null

  try {
    switch (unitInfo.unit) {
      case 'national':
        return {
          unit: 'national',
        }
      case 'region': {
        const region = await checkRegion(unitInfo.regionCode)
        if (!region) return null

        return {
          unit: 'region',
          regionCode: region.code,
        }
      }
      case 'prefecture': {
        const prefecture = await checkPrefecture(unitInfo.prefectureCode)
        if (!prefecture) return null

        return {
          unit: 'prefecture',
          prefectureCode: prefecture.code,
          regionCode: prefecture.regionCode,
        }
      }
      case 'city': {
        const city = await checkCity(unitInfo.cityCode)
        if (!city) return null

        return {
          unit: 'city',
          cityCode: city.code,
          prefectureCode: city.prefectureCode,
        }
      }
      default: {
        const _: never = unitInfo
        throw new Error(`Invalid unit: ${_}`)
      }
    }
  } catch (error) {
    console.error(error)
    throw new Error(DB_ERROR)
  }
}

export async function getArea(areaCode: string) {
  const unitInfo = estimateUnit(areaCode)
  if (!unitInfo) return null

  switch (unitInfo.unit) {
    case 'national':
      return {
        unit: 'national',
      }
    case 'region': {
      const region = await getRegion(unitInfo.regionCode)
      if (!region) return null

      return {
        unit: 'region',
        ...region,
      }
    }
    case 'prefecture': {
      const prefecture = await getPrefecture(unitInfo.prefectureCode)
      if (!prefecture) return null

      return {
        unit: 'prefecture',
        ...prefecture,
      }
    }
    case 'city': {
      const city = await getCity(unitInfo.cityCode)
      if (!city) return null

      return {
        unit: 'city',
        ...city,
      }
    }
  }
}

export async function listAreaOptions({
  areaInfo,
  page,
}: {
  areaInfo: AreaInfo
  page: number
}) {
  const offset = PAGE_LIMIT * (page - 1)

  switch (areaInfo.unit) {
    case 'national': {
      const regions = await listRegions()
      const totalItems = regions.length
      const totalPages = Math.ceil(totalItems / PAGE_LIMIT)
      const data = regions.slice(offset, offset + PAGE_LIMIT)

      return {
        meta: {
          cacheKey: 'national',
          currentPage: page,
          pageSize: PAGE_LIMIT,
          totalItems,
          totalPages,
        },
        data,
      }
    }
    case 'region': {
      const prefectures = await listPrefecturesInRegion(areaInfo.regionCode)
      const totalItems = prefectures.length
      const totalPages = Math.ceil(totalItems / PAGE_LIMIT)
      const data = prefectures.slice(offset, offset + PAGE_LIMIT)
      return {
        meta: {
          cacheKey: areaInfo.regionCode,
          currentPage: page,
          pageSize: PAGE_LIMIT,
          totalItems,
          totalPages,
        },
        data,
      }
    }
    case 'prefecture':
    // cityが属するprefectureのcitiesを取得
    case 'city': {
      const { meta, data } = await listCitiesInPrefecture(
        areaInfo.prefectureCode,
        page,
      )

      return {
        meta: {
          ...meta,
          // クライアントでキャッシュするためのkeyで、cityの場合もprefectureCodeを使用
          cacheKey: areaInfo.prefectureCode,
        },
        data,
      }
    }
    default: {
      const _: never = areaInfo
      throw new Error(`Invalid unit: ${_}`)
    }
  }
}

export async function listRegions() {
  try {
    const db = connectDb()

    const data = await db
      .select({
        code: regions.code,
        name: regions.name,
      })
      .from(regions)
      .orderBy(asc(regions.code))

    return data
  } catch (error) {
    console.error(error)
    throw new Error(DB_ERROR)
  }
}

export async function getRegion(regionCode: string) {
  try {
    const db = connectDb()

    const data = await db
      .select({
        code: regions.code,
        name: regions.name,
      })
      .from(regions)
      .where(eq(regions.code, regionCode))
      .then(getFirstItem)

    return data
  } catch (error) {
    console.error(error)
    throw new Error(DB_ERROR)
  }
}

export const checkRegion = getRegion

export async function listPrefecturesInRegion(regionCode: string) {
  try {
    const db = connectDb()

    const data = await db
      .select({
        code: prefectures.code,
        name: prefectures.name,
      })
      .from(prefectures)
      .where(eq(prefectures.regionCode, regionCode))
      .orderBy(asc(prefectures.code))

    return data
  } catch (error) {
    console.error(error)
    throw new Error(DB_ERROR)
  }
}

export async function getPrefecture(prefectureCode: string) {
  try {
    const db = connectDb()

    const data = await db
      .select({
        code: prefectures.code,
        name: prefectures.name,
        region: {
          code: regions.code,
          name: regions.name,
        },
      })
      .from(prefectures)
      .innerJoin(regions, eq(regions.code, prefectures.regionCode))
      .where(eq(prefectures.code, prefectureCode))
      .then(getFirstItem)

    return data
  } catch (error) {
    console.error(error)
    throw new Error(DB_ERROR)
  }
}

export async function checkPrefecture(prefectureCode: string) {
  try {
    const db = connectDb()

    const data = await db
      .select()
      .from(prefectures)
      .where(eq(prefectures.code, prefectureCode))
      .then(getFirstItem)

    return data
  } catch (error) {
    console.error(error)
    throw new Error(DB_ERROR)
  }
}

export async function listCitiesInPrefecture(
  prefectureCode: string,
  page: number,
) {
  try {
    const db = connectDb()
    const offset = PAGE_LIMIT * (page - 1)

    const citiesInPrefecture = await db
      .select({
        code: cities.code,
        name: cities.name,
      })
      .from(cities)
      .where(
        and(
          eq(cities.archived, false),
          eq(cities.prefectureCode, prefectureCode),
        ),
      )
      .orderBy(asc(cities.code))

    const totalItems = citiesInPrefecture.length
    const totalPages = Math.ceil(totalItems / PAGE_LIMIT)
    const data = citiesInPrefecture.slice(offset, offset + PAGE_LIMIT)

    return {
      meta: {
        currentPage: page,
        pageSize: PAGE_LIMIT,
        totalItems,
        totalPages,
      },
      data,
    }
  } catch (error) {
    console.error(error)
    throw new Error(DB_ERROR)
  }
}

export async function getCity(cityCode: string) {
  try {
    const db = connectDb()

    const city = await db
      .select({
        code: cities.code,
        name: cities.name,
        archived: cities.archived,
        prefecture: {
          code: prefectures.code,
          name: prefectures.name,
        },
        region: {
          code: regions.code,
          name: regions.name,
        },
      })
      .from(cities)
      .innerJoin(prefectures, eq(prefectures.code, cities.prefectureCode))
      .innerJoin(regions, eq(regions.code, prefectures.regionCode))
      .where(eq(cities.code, cityCode))
      .then(getFirstItem)

    if (!city) {
      return null
    }
    if (!city.archived) {
      return {
        ...city,
        archived: false,
      } as const
    }

    const redirectCity = await db
      .select({
        code: cities.code,
      })
      .from(cities)
      .innerJoin(citiesHistories, eq(citiesHistories.ancestor, cities.code))
      .where(
        and(
          not(eq(citiesHistories.ancestor, city.code)),
          eq(citiesHistories.descendant, city.code),
          eq(cities.archived, false),
        ),
      )
      .then(getFirstItem)

    if (redirectCity) {
      return {
        ...city,
        archived: true,
        redirectTo: redirectCity.code,
      } as const
    } else {
      return null
    }
  } catch (error) {
    console.error(error)
    throw new Error(DB_ERROR)
  }
}

export async function checkCity(cityCode: string) {
  try {
    const db = connectDb()

    const data = await db
      .select()
      .from(cities)
      .where(eq(cities.code, cityCode))
      .then(getFirstItem)

    return data
  } catch (error) {
    console.error(error)
    throw new Error(DB_ERROR)
  }
}
