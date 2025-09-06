import { handleApiError } from '~/lib/error-handling.server.ts'
import { listElections } from '~/services/election.server.ts'
import type { Route } from './+types/route'

export async function loader({ request }: Route.LoaderArgs) {
  const { searchParams } = new URL(request.url)
  const sort = searchParams.get('sort') === 'asc' ? 'asc' : 'desc'

  const electionsResult = await listElections(sort)

  if (electionsResult.isErr()) handleApiError(electionsResult.error)

  return {
    elections: electionsResult.value.elections,
    sort: electionsResult.value.sort,
  }
}

export function headers() {
  return {
    'Cache-Control': 'private, max-age=3600',
  }
}
