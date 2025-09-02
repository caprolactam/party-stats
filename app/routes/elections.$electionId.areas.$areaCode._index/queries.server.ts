import { eq, and, desc } from 'drizzle-orm'
import type { Result } from 'neverthrow'
import { ok, err } from 'neverthrow'
import { areas, elections, partyResults, parties, votingStatuses } from '~/db/schema.ts'
import type { SelectArea, SelectElection, SelectPartyResult, SelectParty } from '~/db/schema.ts'
import { getFirstItem } from '~/db/utils.ts'
import { getAccessibleColor } from '~/lib/color.server.ts'
import { formatToJapaneseDate, formatToDatetime } from '~/lib/date.ts'
import { getDB } from '~/middleware/bindings.ts'
import { getName as getElectionName } from '~/models/election/election.ts'
import type { ApiErrors } from '~/types/api-error.ts'

interface GetAreaResult extends Pick<SelectArea, 'id' | 'name' | 'kanaName' | 'level' | 'code'> {}

export async function getArea(areaCode: string): Promise<Result<GetAreaResult, ApiErrors['NotFound' | 'NetworkError']>> {
  try {
    const db = getDB()

    const area = await db
      .select({
        id: areas.id,
        name: areas.name,
        kanaName: areas.kanaName,
        level: areas.level,
        code: areas.code,
      })
      .from(areas)
      .where(eq(areas.code, areaCode))
      .get()

    if (!area) return err({ type: 'notFound', message: '地域が見つかりませんでした' })

    return ok(area)
  }
  catch (error) {
    console.error(error)
    return err({ type: 'network', message: 'ネットワークエラーが発生しました' })
  }
}

interface GetElectionResult extends Pick<SelectElection, 'id' | 'type'> {
  name: string
  heldAt: string
  heldAtDatetime: string
}

export async function getElection(electionId: string): Promise<Result<GetElectionResult, ApiErrors['NotFound' | 'NetworkError']>> {
  try {
    const db = getDB()

    const election = await db
      .select()
      .from(elections)
      .where(eq(elections.id, electionId))
      .then((rows) => {
        const item = getFirstItem(rows)

        if (!item) return null

        return {
          id: item.id,
          type: item.type,
          name: getElectionName({ round: item.round, type: item.type }),
          heldAt: formatToJapaneseDate(item.heldAt),
          heldAtDatetime: formatToDatetime(item.heldAt),
        }
      })

    if (!election) return err({ type: 'notFound', message: '選挙が見つかりませんでした' })

    return ok(election)
  }
  catch (error) {
    console.error(error)
    return err({ type: 'network', message: 'ネットワークエラーが発生しました' })
  }
}

type GetVotingStatus = {
  electionId: string
  turnout: {
    rate: number
    rateDiffFromPrevious: number | null
    rateChanges: Array<{
      electionId: string
      name: string
      rate: number | null
    }>
  } | null
  invalidVotes: {
    rate: number
    rateDiffFromPrevious: number | null
    rateChanges: Array<{
      electionId: string
      name: string
      rate: number | null
    }>
  } | null
}

const getElectionShortName = ({
  type, round,
}: { type: SelectElection['type'], round: SelectElection['round'] }) => `${type === 'REPRESENTATIVES' ? '衆' : '参'}${round}`

export async function getVotingStatus({
  electionId,
  areaId,
}: { electionId: string, areaId: string }):
Promise<Result<GetVotingStatus, ApiErrors['NotFound' | 'NetworkError']>> {
  try {
    const db = getDB()

    const statuses = await db
      .select({
        electionId: elections.id,
        electionType: elections.type,
        electionRound: elections.round,
        turnoutRate: votingStatuses.turnoutRate,
        invalidVoteRate: votingStatuses.invalidVoteRate,
      })
      .from(elections)
      .leftJoin(votingStatuses, eq(elections.id, votingStatuses.electionId))
      .where(eq(votingStatuses.areaId, areaId))
      .orderBy(desc(elections.heldAt))
      .then((rows) => rows.map((row) => ({
        electionId: row.electionId,
        name: getElectionShortName({ type: row.electionType, round: row.electionRound }),
        turnoutRate: row.turnoutRate ? (row.turnoutRate / 100) : null,
        invalidVoteRate: row.invalidVoteRate ? (row.invalidVoteRate / 100) : null,
      })))

    const currentStatus = statuses.find((s) => s.electionId === electionId)
    if (!currentStatus) return err({ type: 'notFound', message: '投票状況が見つかりませんでした' })

    const prevStatus = statuses[statuses.indexOf(currentStatus) + 1] ?? null

    const turnout = currentStatus.turnoutRate
      ? {
          rate: currentStatus.turnoutRate,
          rateDiffFromPrevious: prevStatus?.turnoutRate ? currentStatus.turnoutRate - prevStatus.turnoutRate : null,
          rateChanges: statuses.map((status) => ({
            electionId: status.electionId,
            name: status.name,
            rate: status.turnoutRate,
          })),
        }
      : null

    const invalidVotes = currentStatus.invalidVoteRate
      ? {
          rate: currentStatus.invalidVoteRate,
          rateDiffFromPrevious: prevStatus?.invalidVoteRate
            ? currentStatus.invalidVoteRate - prevStatus.invalidVoteRate
            : null,
          rateChanges: statuses.map((status) => ({
            electionId: status.electionId,
            name: status.name,
            rate: status.invalidVoteRate,
          })),
        }
      : null

    return ok({
      electionId: currentStatus.electionId,
      turnout,
      invalidVotes,
    })
  }
  catch (error) {
    console.error(error)
    return err({ type: 'network', message: 'ネットワークエラーが発生しました' })
  }
}

type GetPartyResults = Array<
  {
    id: SelectParty['id']
    name: SelectParty['name']
    code: SelectParty['code']
    colors: {
      light: string
      dark: string
    }
    voteRate: SelectPartyResult['voteRate']
  }
>
export async function getPartyResults({ electionId, areaId }: { electionId: string, areaId: string }):
Promise<Result<GetPartyResults, ApiErrors['NetworkError']>> {
  try {
    const db = getDB()

    const results = await db
      .select({
        partyId: partyResults.partyId,
        partyName: parties.name,
        partyCode: parties.code,
        color: parties.color,
        voteRate: partyResults.voteRate,
      })
      .from(partyResults)
      .innerJoin(parties, eq(partyResults.partyId, parties.id))
      .where(
        and(
          eq(partyResults.electionId, electionId),
          eq(partyResults.areaId, areaId),
        ),
      )
      .orderBy(desc(partyResults.votes))
      .then((rows) => rows.map((row) => ({
        id: row.partyId,
        name: row.partyName,
        code: row.partyCode,
        colors: getAccessibleColor(row.color),
        voteRate: row.voteRate / 100,
      })))

    return ok(results)
  }
  catch (error) {
    console.error(error)
    return err({ type: 'network', message: 'ネットワークエラーが発生しました' })
  }
}
