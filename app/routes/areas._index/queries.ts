import { eq } from 'drizzle-orm'
import { Result, ok, err } from 'neverthrow'
import { NATIONAL_AREA_CODE } from '~/db/helpers/aera.ts'
import { database } from '~/db/index.ts'
import { areas } from '~/db/schema.ts'
import { getFirstItem } from '~/db/utils.ts'

type ApiError =
  | { type: 'notFound', message: string }
  | { type: 'network', message: string }

export async function getNationalArea(): Promise<Result<{ id: string }, ApiError>> {
  try {
    const db = database()

    const nationalArea = await db
      .select()
      .from(areas)
      .where(eq(areas.code, NATIONAL_AREA_CODE))
      .then(getFirstItem)

    if (!nationalArea) {
      return err({
        type: 'notFound',
        message: '地域（全国）が見つかりません',
      })
    }

    return ok({
      id: nationalArea.id,
    })
  }
  catch (error) {
    console.error(error)
    return err({
      type: 'network',
      message: 'サーバーエラーが発生しました',
    })
  }
}
