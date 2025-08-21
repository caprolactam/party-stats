import { redirect, href } from 'react-router'
import { NATIONAL_AREA_CODE } from '~/db/helpers/areas.ts'
import type { Route } from './+types/route.ts'

/**
 * インデックスルートへのアクセスは、全国の選挙結果ページにリダイレクト
 * `/elections/${electionId}` => `/elections/${electionId}/areas/${全国のarea_id}`
 */
export async function loader({ params }: Route.LoaderArgs) {
  const { electionId } = params

  // TODO: electionIdをdbでバリデーションする

  throw redirect(
    href('/elections/:electionId/areas/:placeCode', {
      electionId,
      placeCode: NATIONAL_AREA_CODE,
    }),
  )
}
