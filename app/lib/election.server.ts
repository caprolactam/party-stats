import { desc } from 'drizzle-orm'
import type { SelectElection } from '~/db/schema.ts'
import { elections } from '~/db/schema.ts'
import { getFirstItem } from '~/db/utils.ts'
import { getDB } from '~/middleware/bindings.ts'

// TODO: 選挙データをデータベースに登録する
export async function getLatestElection(): Promise<SelectElection | null> {
  const MOCK_ELECTION_ID = 'THIS_IS_MOCK_ID'
  return {
    id: MOCK_ELECTION_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    round: 50,
    heldAt: new Date('2020-05-20'),
    type: 'REPRESENTATIVES',
  }

  const db = getDB()

  const election = await db
    .select()
    .from(elections)
    .orderBy(desc(elections.heldAt))
    .limit(1)
    .then(getFirstItem)

  return election
}
