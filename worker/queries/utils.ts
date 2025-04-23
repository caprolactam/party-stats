import { eq, lte, desc } from 'drizzle-orm'
import {
  optional,
  unknown,
  pipe,
  transform,
  safeInteger,
  minValue,
  maxValue,
} from 'valibot'
import { connectDb } from '../databases.ts'
import { elections } from '../schema.ts'

export const DB_ERROR = 'DB_ERROR'
export const DEFAULT_PAGE_LIMIT = 10

export type Unit = 'national' | 'region' | 'prefecture' | 'city'
export type UnitInfo =
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
    }
  | {
      unit: 'city'
      cityCode: string
    }

export function estimateUnit(unitCodeParam: string): UnitInfo | null {
  const unitCode = unitCodeParam.toLowerCase()
  const regionRegex = /^[0-9]$/
  const prefectureRegex = /^[0-9]{6}$/
  const cityRegex = /^[0-9]{5}$/

  if (unitCode === 'national') {
    return { unit: 'national' }
  } else if (regionRegex.test(unitCode)) {
    return { unit: 'region', regionCode: unitCode }
  } else if (prefectureRegex.test(unitCode)) {
    return { unit: 'prefecture', prefectureCode: unitCode }
  } else if (cityRegex.test(unitCode)) {
    return { unit: 'city', cityCode: unitCode }
  }

  return null
}

export const pageSchema = pipe(
  optional(pipe(unknown(), transform(Number)), 1),
  safeInteger(),
  minValue(1),
  maxValue(1000),
)

export function getFirstItem<T>(items: T[]) {
  const firstItem = items[0]

  return firstItem ?? null
}

export function checkHokkaido(code: string) {
  const isHokkaido = code === '1'

  if (isHokkaido) {
    return {
      isHokkaido: true,
      prefectureCode: '010006',
    } as const
  }
  return {
    isHokkaido: false,
  } as const
}

export function floorDecimal(value: number, point = 2) {
  const digits = Math.pow(10, point)
  return Math.floor(value * digits) / digits
}

export function findElectionAndPrevious(electionCode: string) {
  const db = connectDb()

  electionCode = electionCode.toLowerCase()

  return db
    .select({ electionCode: elections.code })
    .from(elections)
    .where(
      lte(
        elections.date,
        db
          .select({ date: elections.date })
          .from(elections)
          .where(eq(elections.code, electionCode)),
      ),
    )
    .orderBy(desc(elections.date))
    .limit(2)
}
