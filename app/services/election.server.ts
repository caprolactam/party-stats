import { desc, eq } from 'drizzle-orm'
import { ok, err } from 'neverthrow'
import type { Result } from 'neverthrow'
import type { SelectElection } from '~/db/schema.ts'
import { elections } from '~/db/schema.ts'
import { getFirstItem } from '~/db/utils.ts'
import { getDB } from '~/middleware/bindings.ts'
import type { ApiErrors } from '~/types/api-error.ts'

export async function getLatestElection(): Promise<SelectElection | null> {
  const db = getDB()

  const election = await db
    .select()
    .from(elections)
    .orderBy(desc(elections.heldAt))
    .limit(1)
    .then(getFirstItem)

  return election
}

export async function getElectionById(electionId: string): Promise<SelectElection | null> {
  const db = getDB()

  const election = await db
    .select()
    .from(elections)
    .where(eq(elections.id, electionId))
    .then(getFirstItem)

  return election
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
