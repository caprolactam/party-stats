import { redirect } from 'react-router'
import { NATIONAL_AREA_CODE } from '~/db/helpers/areas.ts'
import type { Route } from './+types/route.ts'

/**
 * インデックスルートへのアクセスは、全国内の地域選択ページにリダイレクト
 * `/areas` => `/areas/${全国のarea_id}`
 */
export async function loader(_: Route.LoaderArgs) {
  throw redirect(`/areas/${NATIONAL_AREA_CODE}`)
}
