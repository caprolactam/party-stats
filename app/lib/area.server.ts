import { eq } from 'drizzle-orm'
import { areas } from '~/db/schema.ts'
import { getFirstItem } from '~/db/utils.ts'
import { getDB } from '~/middleware/bindings.ts'

export async function getArea(areaCode: string) {
  const db = getDB()

  const area = await db
    .select()
    .from(areas)
    .where(
      eq(areas.code, areaCode),
    )
    .then(getFirstItem)

  return area
}
