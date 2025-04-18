import { and, eq, desc, sql } from 'drizzle-orm'
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
import { floorDecimal, DB_ERROR } from './utils.ts'

const mapDecimal = (value: number) => floorDecimal(value, 4)

export async function getNationalPartyHistory({
  partyCode,
}: {
  partyCode: string
}) {
  try {
    const db = connectDb()
    partyCode = partyCode.toLowerCase()

    const history = await db
      .select({
        electionType: elections.electionType,
        date: elections.date,
        count: votesOnAll.count,
        rate: sql`(${votesOnAll.count} / ${totalCountsOnAll.count})`
          .mapWith(mapDecimal)
          .as('rate'),
      })
      .from(votesOnAll)
      .innerJoin(parties, eq(parties.id, votesOnAll.partyId))
      .innerJoin(elections, eq(elections.code, votesOnAll.electionCode))
      .innerJoin(
        totalCountsOnAll,
        eq(totalCountsOnAll.electionCode, votesOnAll.electionCode),
      )
      .where(eq(parties.code, partyCode))
      .orderBy(desc(elections.date))

    return history
  } catch (error) {
    console.error(error)
    throw new Error(DB_ERROR)
  }
}

export async function getRegionPartyHistory({
  partyCode,
  regionCode,
}: {
  partyCode: string
  regionCode: string
}) {
  try {
    const db = connectDb()
    partyCode = partyCode.toLowerCase()

    const history = await db
      .select({
        electionType: elections.electionType,
        date: elections.date,
        count: votesOnRegions.count,
        rate: sql`(${votesOnRegions.count} / ${totalCountsOnRegions.count})`
          .mapWith(mapDecimal)
          .as('rate'),
      })
      .from(votesOnRegions)
      .innerJoin(parties, eq(parties.id, votesOnRegions.partyId))
      .innerJoin(elections, eq(elections.code, votesOnRegions.electionCode))
      .innerJoin(
        totalCountsOnRegions,
        and(
          eq(totalCountsOnRegions.electionCode, votesOnRegions.electionCode),
          eq(totalCountsOnRegions.regionCode, votesOnRegions.regionCode),
        ),
      )
      .where(
        and(
          eq(parties.code, partyCode),
          eq(votesOnRegions.regionCode, regionCode),
        ),
      )
      .orderBy(desc(elections.date))

    return history
  } catch (error) {
    console.error(error)
    throw new Error(DB_ERROR)
  }
}

export async function getPrefecturePartyHistory({
  partyCode,
  prefectureCode,
}: {
  partyCode: string
  prefectureCode: string
}) {
  try {
    const db = connectDb()
    partyCode = partyCode.toLowerCase()

    const history = await db
      .select({
        electionType: elections.electionType,
        date: elections.date,
        count: votesOnPrefectures.count,
        rate: sql`(${votesOnPrefectures.count} / ${totalCountsOnPrefectures.count})`
          .mapWith(mapDecimal)
          .as('rate'),
      })
      .from(votesOnPrefectures)
      .innerJoin(parties, eq(parties.id, votesOnPrefectures.partyId))
      .innerJoin(elections, eq(elections.code, votesOnPrefectures.electionCode))
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
          eq(parties.code, partyCode),
          eq(votesOnPrefectures.prefectureCode, prefectureCode),
        ),
      )
      .orderBy(desc(elections.date))

    return history
  } catch (error) {
    console.error(error)
    throw new Error(DB_ERROR)
  }
}

export async function getCityPartyHistory({
  partyCode,
  cityCode,
}: {
  partyCode: string
  cityCode: string
}) {
  try {
    const db = connectDb()
    partyCode = partyCode.toLowerCase()

    const history = await db
      .select({
        electionType: sql<string>`MIN(${elections.electionType})`,
        date: sql`MIN(${elections.date})`
          .mapWith((date) => new Date(date * 1000))
          .as('date'),
        count: sql`SUM(${votesOnCities.count})`,
        rate: sql`SUM(${votesOnCities.count}) / SUM(${totalCountsOnCities.count})`
          .mapWith(mapDecimal)
          .as('rate'),
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
          eq(parties.code, partyCode),
        ),
      )
      .groupBy(elections.code)
      .orderBy(sql`date DESC`)

    return history
  } catch (error) {
    console.error(error)
    throw new Error(DB_ERROR)
  }
}
