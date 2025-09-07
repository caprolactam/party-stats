import { getAreaSearchService } from '~/middleware/bindings.ts'
import type { Route } from './+types/route'

export async function loader(_: Route.LoaderArgs) {
  const AreaSearchService = getAreaSearchService()

  const sum = await AreaSearchService.add(1, 2)

  return Response.json({
    success: true,
    sum,
  })
}
