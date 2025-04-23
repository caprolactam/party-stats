import { and, eq, sql } from 'drizzle-orm'
import { connectDb } from '../databases.ts'
import {
  elections,
  parties,
  votesOnCities,
  votesOnPrefectures,
  votesOnRegions,
  votesOnAll,
  totalCountsOnCities,
  totalCountsOnPrefectures,
  totalCountsOnRegions,
  totalCountsOnAll,
  citiesHistories,
} from '../schema.ts'
import {
  listRankingPrefectureKeys,
  listRankingCityKeys,
} from './party-ranking.ts'
import { floorDecimal, DB_ERROR, type UnitInfo } from './utils.ts'

const mapDecimal = (value: number) => floorDecimal(value, 4)

export async function getPartyDetails({
  partyId,
  electionCode,
  unitInfo,
}: {
  partyId: string
  electionCode: string
  unitInfo: UnitInfo
}) {
  try {
    switch (unitInfo.unit) {
      case 'national': {
        const changes = await fetchNationalPartyDetails({
          partyId,
        })
        return {
          changes,
        }
      }

      case 'region': {
        const changes = await fetchRegionPartyDetails({
          partyId,
          regionCode: unitInfo.regionCode,
        })
        return {
          changes,
        }
      }
      case 'prefecture': {
        const changesPromise = fetchPrefecturePartyDetails({
          partyId,
          prefectureCode: unitInfo.prefectureCode,
        })
        const rankingPromise = listRankingPrefectureKeys({
          electionCode,
          partyId,
          sort: 'desc-popularity',
        })

        const [changes, ranking] = await Promise.all([
          changesPromise,
          rankingPromise,
        ])

        const rank = ranking.indexOf(unitInfo.prefectureCode)
        let rankInNational:
          | {
              rank: number
              totalRank: number
            }
          | undefined

        if (ranking.length && rank !== -1) {
          rankInNational = {
            rank: rank + 1,
            totalRank: ranking.length,
          }
        }

        return {
          rankInNational,
          changes,
        }
      }
      case 'city': {
        const { cityCode } = unitInfo

        const changesPromise = fetchCityPartyDetails({
          partyId,
          cityCode,
        })

        const rankingPromise = listRankingCityKeys({
          electionCode,
          partyId,
          sort: 'desc-popularity',
        })

        const [changes, ranking] = await Promise.all([
          changesPromise,
          rankingPromise,
        ])

        // 先頭2桁が都道府県コード
        const prefectureCode = cityCode.slice(0, 2)
        const rankingInPrefecture = ranking.filter((code) =>
          code.startsWith(prefectureCode),
        )

        const rank = ranking.indexOf(cityCode)
        const rankP = rankingInPrefecture.indexOf(cityCode)
        let rankInNational:
          | {
              rank: number
              totalRank: number
            }
          | undefined
        let rankInPrefecture:
          | {
              rank: number
              totalRank: number
            }
          | undefined
        if (ranking.length && rank !== -1) {
          rankInNational = {
            rank: rank + 1,
            totalRank: ranking.length,
          }
        }
        if (rankingInPrefecture.length && rankP !== -1) {
          rankInPrefecture = {
            rank: rankP + 1,
            totalRank: rankingInPrefecture.length,
          }
        }

        return {
          rankInNational,
          rankInPrefecture,
          changes,
        }
      }
      default:
        throw new Error('Invalid unit type')
    }
  } catch (error) {
    console.error(error)
    throw new Error(DB_ERROR)
  }
}

async function fetchNationalPartyDetails({ partyId }: { partyId: string }) {
  const db = connectDb()

  return db
    .select({
      election: {
        code: elections.code,
        name: elections.name,
        date: elections.date,
        electionType: elections.electionType,
      },
      count: votesOnAll.count,
      totalCount: totalCountsOnAll.count,
      rate: sql`${votesOnAll.count} / ${totalCountsOnAll.count}`.mapWith(
        mapDecimal,
      ),
    })
    .from(votesOnAll)
    .innerJoin(
      totalCountsOnAll,
      eq(votesOnAll.electionCode, totalCountsOnAll.electionCode),
    )
    .innerJoin(elections, eq(elections.code, votesOnAll.electionCode))
    .innerJoin(parties, eq(parties.id, votesOnAll.partyId))
    .where(eq(votesOnAll.partyId, partyId))
    .then((data) =>
      data.sort(
        (a, b) => a.election.date.getTime() - b.election.date.getTime(),
      ),
    )
}

async function fetchRegionPartyDetails({
  partyId,
  regionCode,
}: {
  partyId: string
  regionCode: string
}) {
  const db = connectDb()

  return db
    .select({
      election: {
        code: elections.code,
        name: elections.name,
        date: elections.date,
        electionType: elections.electionType,
      },
      count: votesOnRegions.count,
      totalCount: totalCountsOnRegions.count,
      rate: sql`${votesOnRegions.count} / ${totalCountsOnRegions.count}`.mapWith(
        mapDecimal,
      ),
    })
    .from(votesOnRegions)
    .innerJoin(
      totalCountsOnRegions,
      and(
        eq(votesOnRegions.electionCode, totalCountsOnRegions.electionCode),
        eq(votesOnRegions.regionCode, totalCountsOnRegions.regionCode),
      ),
    )
    .innerJoin(elections, eq(elections.code, votesOnRegions.electionCode))
    .innerJoin(parties, eq(parties.id, votesOnRegions.partyId))
    .where(
      and(
        eq(votesOnRegions.partyId, partyId),
        eq(votesOnRegions.regionCode, regionCode),
      ),
    )
    .then((data) =>
      data.sort(
        (a, b) => a.election.date.getTime() - b.election.date.getTime(),
      ),
    )
}

async function fetchPrefecturePartyDetails({
  partyId,
  prefectureCode,
}: {
  partyId: string
  prefectureCode: string
}) {
  const db = connectDb()

  return db
    .select({
      election: {
        code: elections.code,
        name: elections.name,
        date: elections.date,
        electionType: elections.electionType,
      },
      count: votesOnPrefectures.count,
      totalCount: totalCountsOnPrefectures.count,
      rate: sql`${votesOnPrefectures.count} / ${totalCountsOnPrefectures.count}`.mapWith(
        mapDecimal,
      ),
    })
    .from(votesOnPrefectures)
    .innerJoin(
      totalCountsOnPrefectures,
      and(
        eq(
          votesOnPrefectures.electionCode,
          totalCountsOnPrefectures.electionCode,
        ),
        eq(
          votesOnPrefectures.prefectureCode,
          totalCountsOnPrefectures.prefectureCode,
        ),
      ),
    )
    .innerJoin(elections, eq(elections.code, votesOnPrefectures.electionCode))
    .innerJoin(parties, eq(parties.id, votesOnPrefectures.partyId))
    .where(
      and(
        eq(votesOnPrefectures.partyId, partyId),
        eq(votesOnPrefectures.prefectureCode, prefectureCode),
      ),
    )
    .then((data) =>
      data.sort(
        (a, b) => a.election.date.getTime() - b.election.date.getTime(),
      ),
    )
}

async function fetchCityPartyDetails({
  partyId,
  cityCode,
}: {
  partyId: string
  cityCode: string
}) {
  const db = connectDb()

  return db
    .select({
      election: {
        code: elections.code,
        name: elections.name,
        date: elections.date,
        electionType: elections.electionType,
      },
      count: sql<number>`SUM(${votesOnCities.count})`,
      totalCount: sql<number>`SUM(${totalCountsOnCities.count})`,
      rate: sql`SUM(${votesOnCities.count}) / SUM(${totalCountsOnCities.count})`.mapWith(
        mapDecimal,
      ),
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
    .innerJoin(elections, eq(elections.code, votesOnCities.electionCode))
    .innerJoin(parties, eq(parties.id, votesOnCities.partyId))
    .where(
      and(
        eq(citiesHistories.ancestor, cityCode),
        eq(votesOnCities.partyId, partyId),
      ),
    )
    .groupBy(elections.code)
}
