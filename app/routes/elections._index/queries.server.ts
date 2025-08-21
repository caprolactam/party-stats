import { ok, err } from 'neverthrow'
import type { Result } from 'neverthrow'
import { NATIONAL_AREA_CODE } from '~/db/helpers/areas.ts'
import { formatToJapaneseDate, formatToDatetime } from '~/lib/date.ts'
import { getName as getElectionName } from '~/models/election/election.ts'
import type { ApiErrors } from '~/types/api-error.ts'
import { MOCK_ELECTIONS } from './data.ts'
import type { Election } from './types.ts'

export interface ElectionList {
  representativesElections: Array<Election>
  councillorsElections: Array<Election>
}
type ApiError = ApiErrors['NotFound' | 'NetworkError']

export async function getElections(): Promise<Result<ElectionList, ApiError>> {
  try {
  // TODO: APIの実装
    const elections = MOCK_ELECTIONS

    if (elections.length === 0) {
      return err({
        type: 'notFound',
        message: '選挙が見つかりませんでした',
      })
    }

    function mapElectionsByType(type: 'REPRESENTATIVES' | 'COUNCILLORS') {
      return elections
        .filter((election) => election.type === type)
        .toSorted((a, b) => b.heldAt.getTime() - a.heldAt.getTime())
        .map((election) => ({
          name: getElectionName({ round: election.round, type: election.type }),
          description: `${formatToJapaneseDate(election.heldAt)} 投開票`,
          datetime: formatToDatetime(election.heldAt),
          to: `/elections/${election.id}/areas/${NATIONAL_AREA_CODE}`,
        }))
    }

    const representativesElections = mapElectionsByType('REPRESENTATIVES')
    const councillorsElections = mapElectionsByType('COUNCILLORS')

    return ok({
      representativesElections,
      councillorsElections,
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
