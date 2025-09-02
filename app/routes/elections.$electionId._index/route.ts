import { redirect, href, data } from 'react-router'
import { NATIONAL_AREA_CODE } from '~/db/helpers/areas.ts'
import { handleApiError } from '~/lib/error-handling.server.ts'
import { existElection } from '~/services/election.server.ts'
import type { Route } from './+types/route'

/**
 * インデックスルートへのアクセスは、全国の選挙結果ページにリダイレクト
 * `/elections/${electionId}` => `/elections/${electionId}/areas/${全国のarea_id}`
 */
export async function loader({ params }: Route.LoaderArgs) {
  const { electionId } = params
  const isExistingResult = await existElection(electionId)

  if (isExistingResult.isErr()) handleApiError(isExistingResult.error)

  const isExisting = isExistingResult.value

  if (!isExisting) {
    throw data('選挙が見つかりません', { status: 404 })
  }

  throw redirect(
    href('/elections/:electionId/areas/:areaCode', {
      electionId,
      areaCode: NATIONAL_AREA_CODE,
    }),
  )
}
