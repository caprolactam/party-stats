import { eq, desc } from 'drizzle-orm'
import type { Result } from 'neverthrow'
import { ok, err } from 'neverthrow'
import { elections } from '~/db/schema.ts'
import { formatToJapaneseDate, formatToDatetime } from '~/lib/date.ts'
import { getDB } from '~/middleware/bindings.ts'
import { getName as getElectionName } from '~/models/election/election.ts'
import type { ApiErrors } from '~/types/api-error.ts'

type ApiError = ApiErrors['NotFound' | 'NetworkError']

export type ElectionInfo = {
  id: string
  name: string
  date: string
  datetime: string
}
export type GetElectionsResult = Array<ElectionInfo>

export async function getElections(): Promise<Result<GetElectionsResult, ApiError>> {
  try {
    const db = getDB()

    const result = await db
      .select({
        id: elections.id,
        type: elections.type,
        round: elections.round,
        heldAt: elections.heldAt,
      })
      .from(elections)
      .orderBy(desc(elections.heldAt))
      .then((rows) => rows.map((row) => ({
        id: row.id,
        name: getElectionName({ round: row.round, type: row.type }),
        date: formatToJapaneseDate(row.heldAt),
        datetime: formatToDatetime(row.heldAt),
      })))

    if (result.length === 0) return err({ type: 'notFound', message: '選挙が見つかりません' })

    return ok(result)
  }
  catch (error) {
    console.error(error)
    return err({ type: 'network', message: 'サーバーエラーが発生しました' })
  }
}
