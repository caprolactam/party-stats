/**
 * データ処理関連の機能
 * SeedData → InsertData → SQL文字列への変換処理を担当
 */
import { createId as createCuid2 } from '@paralleldrive/cuid2'
import { getTableName, getTableColumns } from 'drizzle-orm'
import type { SQLiteTable } from 'drizzle-orm/sqlite-core'
import { camelCase } from 'scule'
import invariant from 'tiny-invariant'
import { z } from 'zod'
import type { SelectElection } from '~/db/schema.ts'
import {
  areas,
  areaSuccessions,
  elections,
  parties,
  partyNameHistories,
  partyResults,
  regions,
  regionsOnPrefectures,
  votingStatuses,
} from '~/db/schema.ts'
import type {
  SeedData,
  InsertData,
} from './types.ts'

// =============================================================================
// SeedData → InsertData 変換処理
// =============================================================================

/**
 * SeedDataをInsertDataに変換
 * テーブル間の依存関係を考慮して順序付けして処理
 */
export function transformSeedData(seedData: SeedData): InsertData {
  const seedDate = new Date() // 全てのcreatedAt, updatedAtに同じ日時を使用

  // IDマッピング用のMap
  const electionKeyToIdMap = new Map<string, string>()
  const areaCodeToIdMap = new Map<string, string>()
  const partyCodeToIdMap = new Map<string, string>()
  const regionCodeToIdMap = new Map<string, string>()

  // === 1. 独立テーブルの変換 ===
  const elections: InsertData['elections'] = seedData.elections.map((election) => {
    const id = getElectionId({ type: election.type, heldAt: election.heldAt })

    const electionKey = getElectionKey({ type: election.type, round: election.round })
    electionKeyToIdMap.set(electionKey, id)

    return {
      id,
      round: election.round,
      heldAt: new Date(election.heldAt),
      type: election.type,
      createdAt: seedDate,
      updatedAt: seedDate,
    }
  })

  const regions: InsertData['regions'] = seedData.regions.map((region) => {
    const id = createId()
    regionCodeToIdMap.set(region.code, id)

    return {
      id,
      name: region.name,
      code: region.code,
      createdAt: seedDate,
      updatedAt: seedDate,
    }
  })

  const parties: InsertData['parties'] = seedData.parties.map((party) => {
    const id = createId()
    partyCodeToIdMap.set(party.code, id)
    return {
      id,
      code: party.code,
      name: party.name,
      color: party.color,
      createdAt: seedDate,
      updatedAt: seedDate,
    }
  })

  // === 2. 自己参照テーブルの変換 ===

  // areas（地域情報）: NATIONAL → PREFECTURE → CITY の階層順で処理
  enum AreaLevel {
    NATIONAL,
    PREFECTURE,
    CITY,
  }
  const sortedAreasByLevel = seedData.areas.toSorted((a, b) => AreaLevel[a.level] - AreaLevel[b.level])

  const areas: InsertData['areas'] = sortedAreasByLevel.map((area) => {
    // 統廃合済みの地域で、なおかつ統合後の地域と地域コードが同じ場合はデータ作成をスキップする
    // = isActiveがfalseかつ同じareaCodeが既にareaCodeToIdMap登録されている場合
    if (!area.isActive && areaCodeToIdMap.has(area.areaCode)) {
      console.log(`🏷️  統廃合済みかつ統合先と同じ地域コードを持つ地域をスキップ: ${area.areaCode} (${area.name})`)
      return null
    }

    const id = createId()
    areaCodeToIdMap.set(area.areaCode, id)

    const parentId = areaCodeToIdMap.get(area.parentCode ?? '') ?? null
    if (area.level !== 'NATIONAL') {
      invariant(parentId, `Parent area not found for areaCode: ${area.areaCode}`)
    }

    return {
      id,
      name: area.name,
      kanaName: area.kanaName,
      level: area.level,
      code: area.areaCode,
      isActive: area.isActive,
      parentId,
      createdAt: seedDate,
      updatedAt: seedDate,
    }
  }).filter(Boolean)

  // === 3. 参照テーブルの変換 ===

  const partyNameHistories: InsertData['partyNameHistories'] = seedData.parties.flatMap((party) => {
    if (!party.nameHistories) return []

    const partyId = partyCodeToIdMap.get(party.code)
    invariant(partyId, `Party not found for code: ${party.code}`)

    return party.nameHistories.map((history) => ({
      id: createId(),
      partyId,
      name: history.name,
      effectiveFrom: new Date(history.effectiveFrom),
      effectiveTo: new Date(history.effectiveTo),
      createdAt: seedDate,
      updatedAt: seedDate,
    }))
  })

  const regionsOnPrefectures: InsertData['regionsOnPrefectures'] = seedData.regions.flatMap(({ code, prefectures }) => {
    const regionId = regionCodeToIdMap.get(code)
    invariant(regionId, `Region not found for code: ${code}`)

    return prefectures.map((prefectureCode) => {
      const prefectureId = areaCodeToIdMap.get(prefectureCode)
      invariant(prefectureId, `Prefecture not found for code: ${prefectureCode}`)

      return {
        id: createId(),
        regionId,
        prefectureId,
        createdAt: seedDate,
        updatedAt: seedDate,
      }
    })
  })

  const areaSuccessions: InsertData['areaSuccessions'] = seedData.areaSuccessions.map((succession) => {
    // RENAMEで同じコードの場合はスキップ（実際には同じ地域の改名）
    if (succession.successionType === 'RENAME' && succession.predecessorCode === succession.successorCode) {
      console.log(`🏷️  RENAME（同コード）をスキップ: ${succession.predecessorCode}`)
      return null
    }

    const predecessorId = areaCodeToIdMap.get(succession.predecessorCode)
    const successorId = areaCodeToIdMap.get(succession.successorCode)

    invariant(predecessorId, `Predecessor area not found for code: ${succession.predecessorCode}`)
    invariant(successorId, `Successor area not found for code: ${succession.successorCode}`)

    return {
      id: createId(),
      predecessorId,
      successorId,
      successionType: succession.successionType,
      effectiveDate: new Date(succession.effectiveDate),
      note: succession.note ?? null,
      createdAt: seedDate,
      updatedAt: seedDate,
    }
  }).filter(Boolean)

  const votingStatuses = seedData.elections.flatMap((election) => {
    const allAreaData = [
      election.votingStatus.national,
      ...election.votingStatus.prefectures,
      ...election.partyResults.prefectures.flatMap(({ cities }) => cities.flat()),
    ]
    const electionKey = getElectionKey({ type: election.type, round: election.round })
    const electionId = electionKeyToIdMap.get(electionKey)
    invariant(electionId, `Election not found for key: ${electionKey}`)

    const votingStatues = allAreaData.map((area) => {
      const id = createId()
      const areaId = areaCodeToIdMap.get(area.areaCode)
      invariant(areaId, `Area not found for code: ${area.areaCode}`)
      const votingStatus = createVotingStatus(area)

      return {
        id,
        areaId,
        electionId,
        ...votingStatus,
        createdAt: seedDate,
        updatedAt: seedDate,
      }
    })

    return votingStatues
  })

  const partyResults = seedData.elections.flatMap((election) => {
    const { prefectures: prefectureResults, ...nationalResult } = election.partyResults
    const allAreaData = [
      nationalResult,
      ...prefectureResults.flatMap(({ cities, ...pref }) => [pref, ...cities]),
    ]

    const electionKey = getElectionKey({ type: election.type, round: election.round })
    const electionId = electionKeyToIdMap.get(electionKey)
    invariant(electionId, `Election not found for key: ${electionKey}`)

    const partyResults = allAreaData.flatMap((area) => {
      const areaId = areaCodeToIdMap.get(area.areaCode)
      invariant(areaId, `Area not found for code: ${area.areaCode}`)
      const partyResult = createPartyResult(area)

      return partyResult.map((pr) => {
        const partyId = partyCodeToIdMap.get(pr.partyCode)
        invariant(partyId, `Party not found for code: ${pr.partyCode}`)
        return {
          id: createId(),
          electionId,
          areaId,
          partyId,
          votes: pr.votes,
          voteRate: pr.voteRate,
          createdAt: seedDate,
          updatedAt: seedDate,
        }
      })
    })
    return partyResults
  })

  return {
    areas,
    areaSuccessions,
    regions,
    regionsOnPrefectures,
    parties,
    partyNameHistories,
    elections,
    votingStatuses,
    partyResults,
  }
}

// =============================================================================
// InsertData → SQL文字列 変換処理
// =============================================================================

export function transformInsertDataToSql(insertData: InsertData) {
  return {
    areas: generateAreasSqlFile(insertData),
    patriesAndElections: generateCommonSqlFile(insertData),
    elections: generateElectionDataSqlFiles(insertData),
  }
}

const createTableSection = (name: string, statements: string[]) =>
  statements.length > 0 ? [`-- ${name} テーブル`, ...statements, ''] : []

/**
 * Area関連のSQLファイルを生成
 */
function generateAreasSqlFile(insertData: InsertData) {
  // Areaを階層構造でソート（NATIONAL → PREFECTURE → CITYの順序）
  const sortedAreas = insertData.areas.toSorted((a, b) => {
    const areaLevelOrder = ['NATIONAL', 'PREFECTURE', 'CITY']
    return areaLevelOrder.indexOf(a.level) - areaLevelOrder.indexOf(b.level)
  })

  const sqlParts = [
    '-- Area関連データの挿入',
    '-- 生成日時: ' + new Date().toISOString(),
    '',
    ...createTableSection('regions', buildInsertSqlStatements(regions, insertData.regions)),
    ...createTableSection('areas', buildInsertSqlStatements(areas, sortedAreas)),
    ...createTableSection('areaSuccessions', buildInsertSqlStatements(areaSuccessions, insertData.areaSuccessions)),
    ...createTableSection('regionsOnPrefectures', buildInsertSqlStatements(regionsOnPrefectures, insertData.regionsOnPrefectures)),
  ]

  return sqlParts.join('\n')
}

/**
 * 共通データ（elections, parties）のSQLファイルを生成
 */
function generateCommonSqlFile(insertData: InsertData) {
  const sqlParts = [
    '-- 共通データ（選挙・政党）の挿入',
    '-- 生成日時: ' + new Date().toISOString(),
    '',
    ...createTableSection('elections', buildInsertSqlStatements(elections, insertData.elections)),
    ...createTableSection('parties', buildInsertSqlStatements(parties, insertData.parties)),
    ...createTableSection('partyNameHistories', buildInsertSqlStatements(partyNameHistories, insertData.partyNameHistories)),
  ]

  return sqlParts.join('\n')
}

/**
 * 選挙別の統合データファイルを生成（votingStatuses + partyResults）
 */
function generateElectionDataSqlFiles(insertData: InsertData) {
  const allElectionIds = new Set<string>([
    ...insertData.votingStatuses.map((v) => v.electionId),
    ...insertData.partyResults.map((p) => p.electionId),
  ])

  const electionGroups = Array.from(allElectionIds).map((electionId) => {
    return {
      electionId,
      votingStatuses: insertData.votingStatuses.filter((v) => v.electionId === electionId),
      partyResults: insertData.partyResults.filter((p) => p.electionId === electionId),
    }
  })

  const data = electionGroups.map((election) => {
    const sqlParts = [
      `-- 選挙データ (electionId: ${election.electionId})`,
      '-- 生成日時: ' + new Date().toISOString(),
      '',
      ...createTableSection('votingStatuses',
        buildInsertSqlStatements(votingStatuses, election.votingStatuses)),
      ...createTableSection('partyResults',
        buildInsertSqlStatements(partyResults, election.partyResults)),
    ]
    return {
      electionId: election.electionId,
      sql: sqlParts.join('\n'),
    }
  })

  return data
}

// =============================================================================
// ユーティリティ関数
// =============================================================================

function createId() {
  return createCuid2()
}

function getElectionId({ type, heldAt }: { type: SelectElection['type'], heldAt: string }) {
  z.iso.date().parse(heldAt)
  const prefix = type === 'REPRESENTATIVES' ? 'shu' : 'san'
  return `${prefix}-${heldAt}`
}

function getElectionKey({ type, round }: { type: string, round: number }) {
  return `${type}-${round}`
}

function roundToDecimalPlaces(value: number, decimalPlaces: number): number {
  const basis = Math.pow(10, decimalPlaces)
  return Math.round(value * basis) / basis
}

/**
 * 数値を100倍してINTEGER形式に変換
 * データベースでは小数点数値を100倍して保存する
 */
function toIntegerFormat(value: number): number {
  return Math.round(value * 100)
}

function createVotingStatus(data:
  | SeedData['elections'][number]['votingStatus']['national']
  | SeedData['elections'][number]['votingStatus']['prefectures'][number]
  | SeedData['elections'][number]['partyResults']['prefectures'][number]['cities'][number],
): Omit<
InsertData['votingStatuses'][number],
| 'id' | 'areaId' | 'electionId' | 'createdAt' | 'updatedAt'
> {
  // CITYレベルでは有効票数のみが提供される
  if ('totalVotes' in data) {
    return {
      validVotes: toIntegerFormat(data.totalVotes),
      votedMale: null,
      votedFemale: null,
      abstainedMale: null,
      abstainedFemale: null,
      totalVoters: null,
      turnoutRate: null,
      invalidVotes: null,
      invalidVoteRate: null,
    }
  }

  const { voters, votes } = data

  const totalVoters = toIntegerFormat(voters.eligibles.total)
  const votedMale = toIntegerFormat(voters.voters.male)
  const votedFemale = toIntegerFormat(voters.voters.female)
  const abstainedMale = toIntegerFormat(voters.abstainers.male)
  const abstainedFemale = toIntegerFormat(voters.abstainers.female)
  const turnoutRate = toIntegerFormat(voters.turnoutRate.total)

  const validVotes = toIntegerFormat(votes.valid)
  const invalidVotes = toIntegerFormat(votes.invalid)
  const invalidVoteRate = toIntegerFormat(votes.invalidVoteRate)

  return {
    totalVoters,
    votedMale,
    votedFemale,
    abstainedMale,
    abstainedFemale,
    turnoutRate,
    validVotes,
    invalidVotes,
    invalidVoteRate,
  }
}

function createPartyResult({
  totalVotes,
  parties,
}:
  | Omit<SeedData['elections'][number]['partyResults'], 'prefectures'>
  | Omit<SeedData['elections'][number]['partyResults']['prefectures'][number], 'cities'>
  | SeedData['elections'][number]['partyResults']['prefectures'][number]['cities'][number],
): Array<
  Omit<InsertData['partyResults'][number], 'id' | 'electionId' | 'areaId' | 'partyId' | 'createdAt' | 'updatedAt'> & { partyCode: string }
> {
  const partyResult = parties.map((party) => {
    const votes = toIntegerFormat(party.votes)
    const voteRate = toIntegerFormat(
      roundToDecimalPlaces(party.votes / totalVotes, 2),
    )

    return {
      partyCode: party.code,
      votes,
      voteRate,
    }
  })

  return partyResult
}

// =============================================================================
// SQL関連ユーティリティ関数
// =============================================================================

const DEFAULT_BATCH_SIZE = 200

/**
 * SQLクエリ用の文字列エスケープ処理
 */
function escapeSql(value: unknown): string {
  if (value == null) {
    return 'NULL'
  }

  if (typeof value === 'number') {
    // 数値は直接返す（NaN や Infinity のチェック）
    if (!Number.isFinite(value)) {
      return 'NULL'
    }
    return value.toString()
  }

  if (typeof value === 'boolean') {
    // boolean は 1/0 に変換（SQLite形式）
    return value ? '1' : '0'
  }

  if (typeof value === 'string') {
    // 文字列のエスケープ処理
    return `'${value.replace(/'/g, '\'\'')}'`
  }

  // Date オブジェクトの処理(drizzleでDateを`integer({ mode: 'timestamp_ms' })`として管理しているため)
  if (value instanceof Date) {
    // Invalid Dateの場合もgetTime()の結果をそのまま返す
    // DB層でのデータ整合性チェックに委ねる
    return value.getTime().toString()
  }

  // 別のデータを保存する場合はここに追加
  throw new Error(`Unsupported data type for SQL escape: ${value}`)
}

/**
 * 一度のステートメントで大量のデータを挿入するとエラーになるため、バッチに分割してINSERT文を生成
 * https://developers.cloudflare.com/d1/best-practices/import-export-data/#resolve-statement-too-long-error
 */
function createBatches<T>(data: T[], batchSize: number = DEFAULT_BATCH_SIZE): T[][] {
  const batches: T[][] = []
  for (let i = 0; i < data.length; i += batchSize) {
    batches.push(data.slice(i, i + batchSize))
  }
  return batches
}

/**
 * INSERT文を生成する
 */
function buildInsertSqlStatements<T extends Record<string, unknown>>(
  table: SQLiteTable,
  data: T[],
  batchSize: number = DEFAULT_BATCH_SIZE,
): string[] {
  if (data.length === 0) {
    return []
  }

  const batches = createBatches(data, batchSize)
  const tableName = getTableName(table)
  const columns = Object.values(getTableColumns(table)).map(({ name }) => name)
  const columnList = columns.join(', ')

  return batches.map((batch, batchIndex) => {
    const values = batch.map((row) => {
      const valuesList = columns.map((col) => {
        const colCamel = camelCase(col)
        invariant(colCamel in row, `Column ${col} not found in row`)
        return escapeSql(row[colCamel])
      })
      return `(${valuesList.join(', ')})`
    }).join(',\n    ')

    return `-- Batch ${batchIndex + 1}/${batches.length}
INSERT INTO ${tableName} (${columnList}) VALUES
    ${values};`
  })
}
