import { eq, and, desc, asc } from 'drizzle-orm'
import type { Result } from 'neverthrow'
import { ok, err } from 'neverthrow'
import { elections, partyResults, parties } from '~/db/schema.ts'
import type { SelectElection, SelectParty } from '~/db/schema.ts'
import { getFirstItem } from '~/db/utils.ts'
import { getDB } from '~/middleware/bindings.ts'
import { getName as getElectionName, getShortName as getElectionShortName } from '~/models/election/election.ts'
import type { ApiErrors } from '~/types/api-error.ts'

export async function getElectionById(electionId: string): Promise<Result<SelectElection, ApiErrors['NotFound' | 'NetworkError']>> {
  try {
    const db = getDB()

    const election = await db
      .select()
      .from(elections)
      .where(eq(elections.id, electionId))
      .then(getFirstItem)

    if (!election) {
      return err({ type: 'notFound', message: '指定された選挙が見つかりません' })
    }
    return ok(election)
  }
  catch (error) {
    console.error(error)
    return err({ type: 'network', message: 'ネットワークエラーが発生しました' })
  }
}

export async function getPartyByCode(partyCode: string): Promise<Result<SelectParty, ApiErrors['NotFound' | 'NetworkError']>> {
  try {
    const db = getDB()

    const party = await db
      .select()
      .from(parties)
      .where(eq(parties.code, partyCode))
      .then(getFirstItem)

    if (!party) {
      return err({ type: 'notFound', message: '指定された政党が見つかりません' })
    }
    return ok(party)
  }
  catch (error) {
    console.error(error)
    return err({ type: 'network', message: 'ネットワークエラーが発生しました' })
  }
}

type GetPartyResult = {
  currentElectionId: string
  sort: 'asc' | 'desc'
  rates: Array<{
    election: {
      id: string
      shortName: string
      name: string
    }
    result: {
      votes: number
      voteRate: number
    } | null
  }>
}

export async function getPartyResult({ electionId, areaId, partyId }: {
  electionId: string
  areaId: string
  partyId: string
}): Promise<Result<GetPartyResult, ApiErrors['NetworkError']>> {
  try {
    const db = getDB()

    const SORT: 'asc' | 'desc' = 'desc'

    const partyResult = await db
      .select({
        electionId: elections.id,
        electionType: elections.type,
        electionRound: elections.round,
        electionHeldAt: elections.heldAt,
        votes: partyResults.votes,
        voteRate: partyResults.voteRate,
      })
      .from(elections)
      .leftJoin(partyResults, eq(elections.id, partyResults.electionId))
      .where(and(
        eq(partyResults.areaId, areaId),
        eq(partyResults.partyId, partyId),
      ))
      .orderBy(SORT === 'desc' ? desc(elections.heldAt) : asc(elections.heldAt))
      .then((rows) => rows.map((row) => ({
        election: {
          id: row.electionId,
          shortName: getElectionShortName({
            heldAt: row.electionHeldAt,
            type: row.electionType,
          }),
          name: getElectionName({
            round: row.electionRound,
            type: row.electionType,
          }),
        },
        result: row.votes !== null && row.voteRate !== null
          ? {
              votes: row.votes,
              voteRate: row.voteRate,
            }
          : null,
      })))

    return ok({
      currentElectionId: electionId,
      sort: 'desc',
      rates: partyResult,
    })
  }
  catch (error) {
    console.error(error)
    return err({ type: 'network', message: 'ネットワークエラーが発生しました' })
  }
}
