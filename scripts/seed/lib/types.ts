import type {
  InsertArea,
  InsertAreaSuccession,
  InsertRegion,
  InsertRegionsOnPrefectures,
  InsertParty,
  InsertPartyNameHistory,
  InsertElection,
  InsertVotingStatus,
  InsertPartyResult,
} from '~/db/schema.ts'
import type {
  AreaData,
  PartyDefinitionData,
  RegionData,
  ElectionMetaData,
  VotingStatusData,
  PartyResultsData,
} from './schema.ts'

// シード処理の手順で使用するデータ構造
export interface SeedData {
  areas: AreaData['areas']
  areaSuccessions: AreaData['successions']
  regions: RegionData['regions']
  parties: PartyDefinitionData
  elections: Array<ElectionMetaData & {
    votingStatus: VotingStatusData
    partyResults: PartyResultsData
  }>
}

export interface InsertData {
  areas: InsertArray<InsertArea>
  areaSuccessions: InsertArray<InsertAreaSuccession>
  regions: InsertArray<InsertRegion>
  regionsOnPrefectures: InsertArray<InsertRegionsOnPrefectures>
  parties: InsertArray<InsertParty>
  partyNameHistories: InsertArray<InsertPartyNameHistory>
  elections: InsertArray<InsertElection>
  votingStatuses: InsertArray<InsertVotingStatus>
  partyResults: InsertArray<InsertPartyResult>
}

type InsertArray<T> = Array<
  Omit<T, 'id' | 'createdAt' | 'updatedAt'> & {
    id: string
    createdAt: Date
    updatedAt: Date
  }>
