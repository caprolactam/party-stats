import { eq, desc, and, sql, inArray } from 'drizzle-orm'
import { connectDb } from '../databases.ts'
import {
  elections,
  parties,
  votesOnAll,
  citiesHistories,
  votesOnCities,
  votesOnPrefectures,
  votesOnRegions,
  totalCountsOnCities,
  totalCountsOnPrefectures,
  totalCountsOnRegions,
  totalCountsOnAll,
} from '../schema.ts'
import { type AreaInfo } from './area.ts'
import {
  DB_ERROR,
  getFirstItem,
  floorDecimal,
  findElectionAndPrevious,
} from './utils.ts'

export async function listElections() {
  try {
    const db = connectDb()

    const data = await db
      .select({
        code: elections.code,
        name: elections.name,
        date: elections.date,
        electionType: elections.electionType,
      })
      .from(elections)
      .orderBy(desc(elections.date))

    return data
  } catch (error) {
    console.error(error)
    throw new Error(DB_ERROR)
  }
}

export async function getElection(electionCode: string) {
  try {
    const db = connectDb()
    electionCode = electionCode.toLowerCase()

    const election = await db
      .select({
        code: elections.code,
        name: elections.name,
        date: elections.date,
        source: elections.source,
        electionType: elections.electionType,
      })
      .from(elections)
      .where(eq(elections.code, electionCode))
      .then(getFirstItem)

    return election
  } catch (error) {
    console.error(error)
    throw new Error(DB_ERROR)
  }
}

export async function checkElection(electionCode: string) {
  try {
    const db = connectDb()
    electionCode = electionCode.toLowerCase()

    const data = await db
      .select()
      .from(elections)
      .where(eq(elections.code, electionCode))
      .then(getFirstItem)

    return data
  } catch (error) {
    console.error(error)
    throw new Error(DB_ERROR)
  }
}

export async function checkParty(partyCode: string) {
  try {
    const db = connectDb()
    partyCode = partyCode.toLowerCase()

    const data = await db
      .select({
        id: parties.id,
        code: parties.code,
        name: parties.name,
        color: parties.color,
      })
      .from(parties)
      .where(eq(parties.code, partyCode))
      .then(getFirstItem)

    return data
  } catch (error) {
    console.error(error)
    throw new Error(DB_ERROR)
  }
}

export async function listParties(electionCode: string) {
  try {
    const db = connectDb()

    const data = await db
      .select({
        code: parties.code,
        name: parties.name,
      })
      .from(votesOnAll)
      .innerJoin(parties, eq(votesOnAll.partyId, parties.id))
      .where(eq(votesOnAll.electionCode, electionCode))
      .orderBy(desc(votesOnAll.count))

    return data
  } catch (error) {
    console.error(error)
    throw new Error(DB_ERROR)
  }
}

export async function getOverview({
  electionCode,
  areaInfo,
}: {
  electionCode: string
  areaInfo: AreaInfo
}) {
  try {
    switch (areaInfo.unit) {
      case 'national':
        return await getNationalOverview(electionCode)
      case 'region':
        return await getRegionOverview({
          electionCode,
          regionCode: areaInfo.regionCode,
        })
      case 'prefecture':
        return await getPrefectureOverview({
          electionCode,
          prefectureCode: areaInfo.prefectureCode,
        })
      case 'city':
        return await getCityOverview({
          electionCode,
          cityCode: areaInfo.cityCode,
        })
      default:
        throw new Error('Invalid unit type')
    }
  } catch (error) {
    console.error(error)
    throw new Error(DB_ERROR)
  }
}

async function getNationalOverview(electionCode: string) {
  const db = connectDb()

  return db
    .select({
      electionCode: votesOnAll.electionCode,
      code: parties.code,
      name: parties.name,
      color: parties.color,
      count: votesOnAll.count,
      rate: sql<number>`${votesOnAll.count} / ${totalCountsOnAll.count}`,
      totalCount: totalCountsOnAll.count,
    })
    .from(votesOnAll)
    .innerJoin(parties, eq(parties.id, votesOnAll.partyId))
    .innerJoin(
      totalCountsOnAll,
      eq(totalCountsOnAll.electionCode, votesOnAll.electionCode),
    )
    .where(
      inArray(votesOnAll.electionCode, findElectionAndPrevious(electionCode)),
    )
    .then((result) => convertOverviewList(result, electionCode))
}

async function getRegionOverview({
  electionCode,
  regionCode,
}: {
  electionCode: string
  regionCode: string
}) {
  const db = connectDb()

  return db
    .select({
      electionCode: votesOnRegions.electionCode,
      code: parties.code,
      name: parties.name,
      color: parties.color,
      count: votesOnRegions.count,
      rate: sql<number>`${votesOnRegions.count} / ${totalCountsOnRegions.count}`,
      totalCount: totalCountsOnRegions.count,
    })
    .from(votesOnRegions)
    .innerJoin(parties, eq(parties.id, votesOnRegions.partyId))
    .innerJoin(
      totalCountsOnRegions,
      and(
        eq(totalCountsOnRegions.electionCode, votesOnRegions.electionCode),
        eq(totalCountsOnRegions.regionCode, votesOnRegions.regionCode),
      ),
    )
    .where(
      and(
        eq(votesOnRegions.regionCode, regionCode),
        inArray(
          votesOnRegions.electionCode,
          findElectionAndPrevious(electionCode),
        ),
      ),
    )
    .then((result) => convertOverviewList(result, electionCode))
}

async function getPrefectureOverview({
  electionCode,
  prefectureCode,
}: {
  electionCode: string
  prefectureCode: string
}) {
  const db = connectDb()

  return db
    .select({
      electionCode: votesOnPrefectures.electionCode,
      code: parties.code,
      name: parties.name,
      color: parties.color,
      count: votesOnPrefectures.count,
      rate: sql<number>`${votesOnPrefectures.count} / ${totalCountsOnPrefectures.count}`,
      totalCount: totalCountsOnPrefectures.count,
    })
    .from(votesOnPrefectures)
    .innerJoin(parties, eq(parties.id, votesOnPrefectures.partyId))
    .innerJoin(
      totalCountsOnPrefectures,
      and(
        eq(
          totalCountsOnPrefectures.electionCode,
          votesOnPrefectures.electionCode,
        ),
        eq(
          totalCountsOnPrefectures.prefectureCode,
          votesOnPrefectures.prefectureCode,
        ),
      ),
    )
    .where(
      and(
        eq(votesOnPrefectures.prefectureCode, prefectureCode),
        inArray(
          votesOnPrefectures.electionCode,
          findElectionAndPrevious(electionCode),
        ),
      ),
    )
    .then((result) => convertOverviewList(result, electionCode))
}

async function getCityOverview({
  electionCode,
  cityCode,
}: {
  electionCode: string
  cityCode: string
}) {
  const db = connectDb()

  return db
    .select({
      electionCode: votesOnCities.electionCode,
      code: parties.code,
      color: sql<string>`MIN(${parties.color})`,
      name: sql<string>`MIN(${parties.name})`,
      count: sql<number>`SUM(${votesOnCities.count})`,
      rate: sql<number>`SUM(${votesOnCities.count}) / SUM(${totalCountsOnCities.count})`,
      totalCount: sql<number>`SUM(${totalCountsOnCities.count})`,
    })
    .from(citiesHistories)
    .innerJoin(
      votesOnCities,
      eq(votesOnCities.cityCode, citiesHistories.descendant),
    )
    .innerJoin(
      totalCountsOnCities,
      and(
        eq(totalCountsOnCities.electionCode, votesOnCities.electionCode),
        eq(totalCountsOnCities.cityCode, votesOnCities.cityCode),
      ),
    )
    .innerJoin(parties, eq(parties.id, votesOnCities.partyId))
    .where(
      and(
        eq(citiesHistories.ancestor, cityCode),
        inArray(
          votesOnCities.electionCode,
          findElectionAndPrevious(electionCode),
        ),
      ),
    )
    .groupBy(parties.code, votesOnCities.electionCode)
    .then((result) => convertOverviewList(result, electionCode))
}

function convertOverviewList(
  result: Array<{
    electionCode: string
    code: string
    name: string
    count: number
    rate: number
    totalCount: number
  }>,
  electionCode: string,
) {
  const parties = result
    .filter((r) => r.electionCode === electionCode)
    .map(({ electionCode, totalCount: _, ...props }) => {
      const prevResult = result.find(
        (r) => r.electionCode !== electionCode && r.code === props.code,
      )

      const prevCount = prevResult?.count ?? null
      const rate = floorDecimal(props.rate, 4)
      const prevRate = prevResult ? floorDecimal(prevResult.rate, 4) : null
      return {
        ...props,
        prevCount,
        rate,
        prevRate,
      }
    })
    .sort((a, b) => b.count - a.count)

  const totalCount =
    result.find((r) => r.electionCode === electionCode)?.totalCount ?? 0

  return {
    totalCount,
    parties,
  }
}
