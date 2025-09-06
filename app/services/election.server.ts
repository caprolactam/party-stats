import { desc, eq } from 'drizzle-orm'
import { ok, err } from 'neverthrow'
import type { Result } from 'neverthrow'
import type { SelectElection } from '~/db/schema.ts'
import { elections } from '~/db/schema.ts'
import { getFirstItem } from '~/db/utils.ts'
import { formatToJapaneseDate, formatToDatetime } from '~/lib/date.ts'
import { getDB } from '~/middleware/bindings.ts'
import { getName, getShortName } from '~/models/election/election.ts'
import type { ApiErrors } from '~/types/api-error.ts'

interface ElectionDetail {
  id: string
  name: string
  shortName: string
  heldAt: string
  heldAtDatetime: string
  type: SelectElection['type']
}

export async function getLatestElection(): Promise<ElectionDetail | null> {
  const db = getDB()

  const election = await db
    .select()
    .from(elections)
    .orderBy(desc(elections.heldAt))
    .limit(1)
    .then(getFirstItem)

  if (!election) return null

  return {
    id: election.id,
    name: getName(election),
    shortName: getShortName(election),
    heldAt: formatToJapaneseDate(election.heldAt),
    heldAtDatetime: formatToDatetime(election.heldAt),
    type: election.type,
  }
}

export async function getElectionById(electionId: string): Promise<ElectionDetail | null> {
  const db = getDB()

  const election = await db
    .select()
    .from(elections)
    .where(eq(elections.id, electionId))
    .then(getFirstItem)

  if (!election) return null

  return {
    id: election.id,
    name: getName(election),
    shortName: getShortName(election),
    heldAt: formatToJapaneseDate(election.heldAt),
    heldAtDatetime: formatToDatetime(election.heldAt),
    type: election.type,
  }
}

export async function existElection(electionId: string): Promise<Result<boolean, ApiErrors['NetworkError']>> {
  try {
    const election = await getElectionById(electionId)
    return ok(!!election)
  }
  catch (error) {
    console.error(error)
    return err({ type: 'network', message: 'サーバーエラーが発生しました' })
  }
}

export async function getElection(electionId: string): Promise<Result<ElectionDetail, ApiErrors['NotFound' | 'NetworkError']>> {
  try {
    const election = await getElectionById(electionId)

    if (!election) return err({ type: 'notFound', message: '選挙が見つかりません' })

    return ok(election)
  }
  catch (error) {
    console.error(error)
    return err({ type: 'network', message: 'サーバーエラーが発生しました' })
  }
}
