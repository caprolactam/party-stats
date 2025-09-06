import { eq } from 'drizzle-orm'
import type { Result } from 'neverthrow'
import { ok, err } from 'neverthrow'
import { areas } from '~/db/schema.ts'
import type { SelectArea } from '~/db/schema.ts'
import { getDB } from '~/middleware/bindings.ts'
import type { ApiErrors } from '~/types/api-error.ts'

interface GetAreaResult extends Pick<SelectArea, 'id' | 'name' | 'kanaName' | 'level' | 'code'> {}

export async function getArea(areaCode: string): Promise<Result<GetAreaResult, ApiErrors['NotFound' | 'NetworkError']>> {
  try {
    const db = getDB()

    const area = await db
      .select({
        id: areas.id,
        name: areas.name,
        kanaName: areas.kanaName,
        level: areas.level,
        code: areas.code,
      })
      .from(areas)
      .where(eq(areas.code, areaCode))
      .get()

    if (!area) return err({ type: 'notFound', message: '地域が見つかりませんでした' })

    return ok(area)
  }
  catch (error) {
    console.error(error)
    return err({ type: 'network', message: 'ネットワークエラーが発生しました' })
  }
}
