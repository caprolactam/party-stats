import { ok, err } from 'neverthrow'
import type { Result } from 'neverthrow'
import { NATIONAL_AREA_CODE } from '~/db/helpers/aera.ts'
import { MOCK_ELECTIONS } from './data.ts'
import type { ElectionList } from './types.ts'

type ApiError =
  | { type: 'notFound', message: string }
  | { type: 'network', message: string }

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

    const representativesElections = elections
      .filter((election) => election.type === 'REPRESENTATIVES')
      .toSorted((a, b) => b.heldAt.getTime() - a.heldAt.getTime())
      .map((election) => ({
        name: getElectionName({ round: election.round, type: election.type }),
        description: `${formatJapaneseDate(election.heldAt)} 投開票`,
        datetime: formatDatetime(election.heldAt),
        to: `/elections/${election.id}/areas/${NATIONAL_AREA_CODE}`,
      }))

    const councillorsElections = elections
      .filter((election) => election.type === 'COUNCILLORS')
      .toSorted((a, b) => b.heldAt.getTime() - a.heldAt.getTime())
      .map((election) => ({
        name: getElectionName({ round: election.round, type: election.type }),
        description: `${formatJapaneseDate(election.heldAt)} 投開票`,
        datetime: formatDatetime(election.heldAt),
        to: `/elections/${election.id}/areas/${NATIONAL_AREA_CODE}`,
      }))

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

function getElectionName({
  round,
  type,
}: {
  round: number
  type: 'REPRESENTATIVES' | 'COUNCILLORS'
}): string {
  switch (type) {
    case 'REPRESENTATIVES':
      return `第${round}回 衆議院議員総選挙`
    case 'COUNCILLORS':
      return `第${round}回 参議院議員通常選挙`
    default:
      const _: never = type
      throw new Error(`Unknown election type: ${type}`)
  }
}

function formatJapaneseDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}年${month}月${day}日`
}

// YYYY-MM-DD形式の日時文字列を返す
function formatDatetime(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
