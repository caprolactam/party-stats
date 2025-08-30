/**
 * ファイル操作関連の機能
 * JSONデータ読み込みとSQLファイル生成を担当
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse as parseJsonc } from 'jsonc-parser'
import { transformInsertDataToSql } from './data-processor.ts'
import {
  AreaDataSchema,
  RegionDataSchema,
  PartyDefinitionDataSchema,
  ElectionMetaDataSchema,
  PartyResultsDataSchema,
  VotingStatusDataSchema,
} from './schema.ts'
import type { SeedData, InsertData } from './types.ts'

// =============================================================================
// パス設定
// =============================================================================

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const join = (...paths: Array<string>) => path.join(__dirname, ...paths)

const OUTPUT_DIR = path.join(__dirname, '../output')

// =============================================================================
// JSONデータ読み込み
// =============================================================================

export async function loadSeedData(): Promise<SeedData> {
  const { areas, successions: areaSuccessions } = await loadAreaData()
  console.log(`✅ 地域データ: ${areas.length}件`)

  const regions = await loadRegionData()
  console.log(`✅ 地域区分データ: ${regions.length}件`)

  const parties = await loadPartyDefinition()
  console.log(`✅ 政党データ: ${parties.length}件`)

  const elections = await loadElectionData()
  console.log(`✅ 選挙データ: ${elections.length}回分`)

  const formattedElections = elections.map(({ meta, votingStatus, partyResults }) => ({
    ...meta,
    votingStatus,
    partyResults,
  }))

  return {
    areas,
    areaSuccessions,
    regions,
    parties,
    elections: formattedElections,
  }
}

async function loadAreaData() {
  const rawData = await import(
    join('../data/area-data.json'), { with: { type: 'json' } },
  )

  const parsedData = AreaDataSchema.parse(rawData)
  return parsedData.data
}

async function loadRegionData() {
  const rawData = await fs.readFile(join('../data/regions.jsonc'), 'utf-8')
    .then((data) => parseJsonc(data))

  const parsedData = RegionDataSchema.parse(rawData)
  return parsedData.regions
}

async function loadPartyDefinition() {
  const rawData = await import(
    join('../data/party-definition.json'), { with: { type: 'json' } },
  )

  const parsedData = PartyDefinitionDataSchema.parse(rawData)
  return parsedData.data
}

/**
 * 選挙データの読み込み
 * 各選挙フォルダ（san-*, shu-*）から meta.json, party-results.json, voting-status.json を読み込む
 */
async function loadElectionData() {
  const electionFolders = await fs.readdir(join('../data'), { withFileTypes: true })
    .then((dirents) => (
      dirents
        .filter((dirent) => dirent.isDirectory())
        .filter((dirent) => dirent.name.startsWith('san-') || dirent.name.startsWith('shu-'))
        .map((dirent) => dirent.name)
    ))

  return await Promise.all(electionFolders.map(async (folderName) => {
    const folderPath = join('../data', folderName)

    const [
      meta,
      votingStatus,
      partyResults,
    ] = await Promise.all([
      loadElectionMeta(folderPath),
      loadVotingStatus(folderPath),
      loadPartyResults(folderPath),
    ])

    return {
      meta,
      votingStatus,
      partyResults,
    }
  }))
}

/**
 * 選挙メタデータ（meta.json）の読み込み
 */
async function loadElectionMeta(folderPath: string) {
  const rawData = await import(
    path.join(folderPath, 'meta.json'), { with: { type: 'json' } },
  )

  const parsedData = ElectionMetaDataSchema.parse(rawData)
  return parsedData.data
}

/**
 * 投票状況（voting-status.json）の読み込み
 */
async function loadVotingStatus(folderPath: string) {
  const rawData = await import(
    path.join(folderPath, 'voting-status.json'), { with: { type: 'json' } },
  )

  const parsedData = VotingStatusDataSchema.parse(rawData)
  return parsedData.data
}

/**
 * 政党結果（party-results.json）の読み込み
 */
async function loadPartyResults(folderPath: string) {
  const rawData = await import(
    path.join(folderPath, 'party-results.json'), { with: { type: 'json' } },
  )

  const parsedData = PartyResultsDataSchema.parse(rawData)
  return parsedData.data
}

// =============================================================================
// SQLファイル生成
// =============================================================================

/**
 * すべてのSQLファイルを生成する
 */
export async function generateAllSqlFiles(insertData: InsertData): Promise<void> {
  console.log('📝 SQLファイル生成を開始...')
  console.time('✅ 全てのSQLファイル生成が完了しました')

  // 出力ディレクトリを準備
  await ensureOutputDirectory()

  // SQLファイルを生成
  const {
    areas,
    patriesAndElections,
    elections,
  } = transformInsertDataToSql(insertData)

  // 各SQLファイルを順番に書き出す
  const datetime = Date.now()
  const counter = new Couter()

  await writeToFile(`${datetime}_${counter.next()}_areas.sql`, areas)
  await writeToFile(`${datetime}_${counter.next()}_parties_and_elections.sql`, patriesAndElections)
  for (const { electionId, sql } of elections) {
    await writeToFile(`${datetime}_${counter.next()}_election-${electionId}.sql`, sql)
  }

  console.timeEnd('✅ 全てのSQLファイル生成が完了しました')
}

/**
 * 出力ディレクトリが存在しない場合は作成
 */
async function ensureOutputDirectory(): Promise<void> {
  try {
    await fs.access(OUTPUT_DIR)
  }
  catch {
    await fs.mkdir(OUTPUT_DIR, { recursive: true })
    console.log(`📁 出力ディレクトリを作成しました: ${OUTPUT_DIR}`)
  }
}

/**
 * SQLファイルにコンテンツを書き込み
 */
async function writeToFile(filename: string, content: string): Promise<void> {
  const filePath = path.join(OUTPUT_DIR, filename)
  await fs.writeFile(filePath, content, 'utf8')
  console.log(`✅ ${filename} を生成しました`)
}

class Couter {
  #count = 0

  next() {
    this.#count += 1
    if (this.#count > 999) {
      throw new Error('Counter exceeded its limit of 999')
    }
    // 0埋め3桁 例: 001, 002, ..., 010, ..., 100, ...
    return String(this.#count).padStart(3, '0')
  }
}
