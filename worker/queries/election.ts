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

    const partyList = await db
      .select({
        election: elections,
        party: parties,
      })
      .from(parties)
      .innerJoin(votesOnAll, eq(votesOnAll.partyId, parties.id))
      .innerJoin(elections, eq(elections.code, votesOnAll.electionCode))
      .where(eq(elections.code, electionCode))
      .orderBy(desc(votesOnAll.count))

    const { election } = getFirstItem(partyList) ?? {}

    if (!partyList.length || !election) return null

    return {
      ...election,
      parties: partyList.map(({ party: { id, ...p } }) => p),
    }
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

export async function getLeadingParty(electionCode: string) {
  try {
    const db = connectDb()
    electionCode = electionCode.toLowerCase()

    const data = await db
      .select({
        code: parties.code,
        name: parties.name,
      })
      .from(parties)
      .innerJoin(votesOnAll, eq(votesOnAll.partyId, parties.id))
      .where(eq(votesOnAll.electionCode, electionCode))
      .orderBy(desc(votesOnAll.count))
      .limit(1)
      .then(getFirstItem)

    return data
  } catch (error) {
    console.error(error)
    throw new Error(DB_ERROR)
  }
}

export async function getNationalOverview(electionCode: string) {
  try {
    const db = connectDb()
    electionCode = electionCode.toLowerCase()

    const result = await db
      .select({
        electionCode: votesOnAll.electionCode,
        code: parties.code,
        name: parties.name,
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

    return convertOverviewList(result, electionCode)
  } catch (error) {
    console.error(error)
    throw new Error(DB_ERROR)
  }
}

export async function getRegionOverview({
  electionCode,
  regionCode,
}: {
  electionCode: string
  regionCode: string
}) {
  try {
    const db = connectDb()
    electionCode = electionCode.toLowerCase()

    const result = await db
      .select({
        electionCode: votesOnRegions.electionCode,
        code: parties.code,
        name: parties.name,
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

    return convertOverviewList(result, electionCode)
  } catch (error) {
    console.error(error)
    throw new Error(DB_ERROR)
  }
}

export async function getPrefectureOverview({
  electionCode,
  prefectureCode,
}: {
  electionCode: string
  prefectureCode: string
}) {
  try {
    const db = connectDb()
    electionCode = electionCode.toLowerCase()

    const result = await db
      .select({
        electionCode: votesOnPrefectures.electionCode,
        code: parties.code,
        name: parties.name,
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

    return convertOverviewList(result, electionCode)
  } catch (error) {
    console.error(error)
    throw new Error(DB_ERROR)
  }
}

export async function getCityOverview({
  electionCode,
  cityCode,
}: {
  electionCode: string
  cityCode: string
}) {
  try {
    const db = connectDb()
    electionCode = electionCode.toLowerCase()

    const results = await db
      .select({
        electionCode: votesOnCities.electionCode,
        code: parties.code,
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

    return convertOverviewList(results, electionCode)
  } catch (error) {
    console.error(error)
    throw new Error(DB_ERROR)
  }
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
