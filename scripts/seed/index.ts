#!/usr/bin/env tsx

/**
 * データベースシードスクリプト（wrangler d1 execute 使用版）
 *
 * このスクリプトは地域データ（areas）と継承関係データ（area_successions）を
 * Cloudflare D1 データベースに投入します。
 *
 * 使用方法:
 * ```bash
 * npm run seed:db
 * ```
 */

import { readFileSync, existsSync, mkdirSync } from 'fs'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { createId } from '@paralleldrive/cuid2'
import { execa } from 'execa'
import invariant from 'tiny-invariant'
import { z } from 'zod'
import { fromError } from 'zod-validation-error'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Zodスキーマ定義
const AreaDataItemSchema = z.object({
  areaCode: z.string(),
  parentCode: z.union([z.string(), z.literal('national')]),
  name: z.string(),
  kanaName: z.string(),
})

const AreaDataSchema = z.object({
  metadata: z.object({
    generatedAt: z.string(),
    totalCount: z.number(),
    breakdown: z.object({
      prefectures: z.number(),
      cities: z.number(),
      wards: z.number(),
    }),
  }),
  data: z.array(AreaDataItemSchema),
})

const AreaSuccessionItemSchema = z.object({
  areaCode: z.string(),
  parentCode: z.string(),
  name: z.string(),
  kanaName: z.string(),
  successorCode: z.string(),
  successionType: z.enum(['MERGE', 'SPLIT', 'RENAME']),
  effectiveDate: z.string(),
  note: z.string().optional(),
})

const AreaSuccessionSchema = z.object({
  metadata: z.object({
    generatedAt: z.string(),
  }),
  data: z.array(AreaSuccessionItemSchema),
})

/**
 * JSONファイルを安全に読み込んでバリデーションする
 */
function loadAndValidateJson<T>(filename: string, schema: z.ZodSchema<T>): T {
  const filePath = join(__dirname, filename)
  const content = readFileSync(filePath, 'utf-8')

  try {
    const rawData = JSON.parse(content)
    return schema.parse(rawData)
  }
  catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = fromError(error)
      console.error(`❌ ${filename} のバリデーションエラー:`, validationError.toString())
    }
    else {
      console.error(`❌ ${filename} の読み込みエラー:`, error)
    }
    process.exit(1)
  }
}

/**
 * SQLエスケープ処理
 */
function escapeSqlString(str: string): string {
  return `'${str.replace(/'/g, '\'\'')}'`
}

/**
 * データをチャンクに分割する
 */
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}

/**
 * 地域データをSQL INSERT文に変換
 */
function generateAreasSql(
  prefectures: Array<{
    id: string
    name: string
    level: 'PREFECTURE'
    code: string
    isActive: boolean
    parentId: null
  }>,
  cities: Array<{
    id: string
    name: string
    level: 'CITY'
    code: string
    isActive: boolean
    parentId: string | null
  }>,
): string[] {
  const allAreas = [...prefectures, ...cities]

  if (allAreas.length === 0) {
    return ['-- No area data to insert']
  }

  const now = Date.now()
  const CHUNK_SIZE = 100 // 1度に100件ずつ挿入
  const chunks = chunkArray(allAreas, CHUNK_SIZE)

  return chunks.map((chunk) => {
    const values = chunk
      .map((area) =>
        `(${escapeSqlString(area.id)}, ${now}, ${now}, ${escapeSqlString(area.name)}, ${escapeSqlString(area.level)}, ${escapeSqlString(area.code)}, ${area.isActive ? 1 : 0}, ${area.parentId ? escapeSqlString(area.parentId) : 'NULL'})`,
      )
      .join(',\n  ')

    return `INSERT INTO areas (id, created_at, updated_at, name, level, code, is_active, parent_id)
VALUES
  ${values};`
  })
}

/**
 * 継承関係データをSQL INSERT文に変換
 */
function generateSuccessionsSql(
  successions: Array<{
    id: string
    predecessorId: string
    successorId: string
    successionType: 'MERGE' | 'SPLIT' | 'RENAME'
    effectiveDate: string
    note?: string
  }>,
): string[] {
  if (successions.length === 0) {
    return ['-- No succession data to insert']
  }

  const now = Date.now()
  const CHUNK_SIZE = 50 // 継承関係は数が少ないので50件ずつ
  const chunks = chunkArray(successions, CHUNK_SIZE)

  return chunks.map((chunk) => {
    const values = chunk
      .map((succession) =>
        `(${escapeSqlString(succession.id)}, ${now}, ${now}, ${escapeSqlString(succession.predecessorId)}, ${escapeSqlString(succession.successorId)}, ${escapeSqlString(succession.successionType)}, ${escapeSqlString(succession.effectiveDate)}, ${succession.note ? escapeSqlString(succession.note) : 'NULL'})`,
      )
      .join(',\n  ')

    return `INSERT INTO area_successions (id, created_at, updated_at, predecessor_id, successor_id, succession_type, effective_date, note)
VALUES
  ${values};`
  })
}

/**
 * wrangler d1 execute コマンドを実行（ファイル経由）
 */
async function executeWranglerCommandViaFile(sqlContent: string): Promise<void> {
  const tempDir = join(__dirname, 'temp')
  const tempFileName = `seed-${createId()}.sql`
  const tempFilePath = join(tempDir, tempFileName)

  try {
    // 一時ディレクトリを作成（存在しない場合）
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true })
    }

    // SQLを一時ファイルに書き出し
    await writeFile(tempFilePath, sqlContent, 'utf8')
    console.log(`📝 SQLを一時ファイルに書き出しました: ${tempFilePath}`)

    // wranglerで実行
    const args = [
      'd1',
      'execute',
      'party-stats',
      '--local',
      '--file',
      tempFilePath,
    ]

    await execa('npx', ['wrangler', ...args], {
      stdio: 'inherit',
    })

    console.log(`✅ SQLの実行が完了しました: ${tempFilePath}`)
  }
  catch (error) {
    console.error('❌ wranglerコマンドの実行に失敗:', error)
    throw error
  }
  finally {
    // 一時ファイルを削除
    try {
      await unlink(tempFilePath)
      console.log(`🗑️ 一時ファイルを削除しました: ${tempFilePath}`)
    }
    catch (unlinkError) {
      console.warn(`⚠️ 一時ファイルの削除に失敗: ${unlinkError}`)
    }
  }
}

/**
 * wrangler d1 execute コマンドを実行
 */
async function executeWranglerCommand(command: string, isFile = false): Promise<void> {
  try {
    const args = [
      'd1',
      'execute',
      'party-stats',
      '--local',
    ]

    if (isFile) {
      args.push('--file', command)
    }
    else {
      args.push('--command', command)
    }

    await execa('npx', ['wrangler', ...args], {
      stdio: 'inherit',
    })
  }
  catch (error) {
    console.error('❌ wranglerコマンドの実行に失敗:', error)
    throw error
  }
}

/**
 * 地域データを変換する
 */
function transformAreaData(areaData: z.infer<typeof AreaDataSchema>): {
  prefectures: Array<{
    id: string
    name: string
    level: 'PREFECTURE'
    code: string
    isActive: boolean
    parentId: null
  }>
  cities: Array<{
    id: string
    name: string
    level: 'CITY'
    code: string
    isActive: boolean
    parentId: string | null
  }>
  codeToIdMap: Map<string, string>
} {
  const codeToIdMap = new Map<string, string>()

  // 都道府県データを変換
  const prefectures = areaData.data
    .filter((item) => item.parentCode === 'national')
    .map((item) => {
      const id = createId()
      codeToIdMap.set(item.areaCode, id)

      return {
        id,
        name: item.name,
        level: 'PREFECTURE' as const,
        code: item.areaCode,
        isActive: true,
        parentId: null,
      }
    })

  // 市区町村データを変換（parentIdは後でマッピング）
  const cities = areaData.data
    .filter((item) => item.parentCode !== 'national')
    .map((item) => {
      const id = createId()
      codeToIdMap.set(item.areaCode, id)

      return {
        id,
        name: item.name,
        level: 'CITY' as const,
        code: item.areaCode,
        isActive: true,
        parentId: item.parentCode, // 一旦文字列のまま保持
      }
    })

  return { prefectures, cities, codeToIdMap }
}

/**
 * 継承関係データを変換し、非アクティブ地域も作成
 */
function transformSuccessionData(
  successionData: z.infer<typeof AreaSuccessionSchema>,
  codeToIdMap: Map<string, string>,
): {
  successions: Array<{
    id: string
    predecessorId: string
    successorId: string
    successionType: 'MERGE' | 'SPLIT' | 'RENAME'
    effectiveDate: string
    note?: string
  }>
  inactiveAreas: Array<{
    id: string
    name: string
    kanaName?: string
    level: 'CITY'
    code: string
    isActive: false
    parentId: string | null
  }>
} {
  const transformedSuccessions: Array<{
    id: string
    predecessorId: string
    successorId: string
    successionType: 'MERGE' | 'SPLIT' | 'RENAME'
    effectiveDate: string
    note?: string
  }> = []

  const inactiveAreas: Array<{
    id: string
    name: string
    kanaName?: string
    level: 'CITY'
    code: string
    isActive: false
    parentId: string | null
  }> = []

  for (const succession of successionData.data) {
    // RENAMEで同じコードの場合はスキップ（実際には同じ地域の改名）
    if (succession.successionType === 'RENAME' && succession.areaCode === succession.successorCode) {
      console.log(`🏷️  RENAME（同コード）をスキップ: ${succession.areaCode} (${succession.name})`)
      continue
    }

    // 非アクティブ地域（前身地域）を作成
    const predecessorId = createId()
    codeToIdMap.set(succession.areaCode, predecessorId)

    // parentCodeからparentIdを取得（存在すれば）
    const parentId = succession.parentCode ? codeToIdMap.get(succession.parentCode) || null : null

    inactiveAreas.push({
      id: predecessorId,
      name: succession.name,
      kanaName: succession.kanaName,
      level: 'CITY',
      code: succession.areaCode,
      isActive: false,
      parentId: parentId,
    })

    // 後継地域IDを取得（アクティブな地域データに存在するはず）
    const successorId = codeToIdMap.get(succession.successorCode)
    if (!successorId) {
      console.warn(`⚠️  後継地域コード ${succession.successorCode} がアクティブ地域データに見つかりません`)
      continue
    }

    // 継承関係を追加
    transformedSuccessions.push({
      id: createId(),
      predecessorId,
      successorId,
      successionType: succession.successionType,
      effectiveDate: succession.effectiveDate,
      note: succession.note,
    })
  }

  console.log(`✅ 非アクティブ地域データ作成: ${inactiveAreas.length} 件`)
  console.log(`✅ 継承関係データ処理完了: ${transformedSuccessions.length} 件`)

  return { successions: transformedSuccessions, inactiveAreas }
}

/**
 * メイン実行関数
 */
async function main() {
  try {
    console.log('🌱 データベースシード開始...')

    // JSONファイルの読み込みとバリデーション
    console.log('📂 データファイルを読み込み中...')
    const areaData = loadAndValidateJson('area-data.json', AreaDataSchema)
    const successionData = loadAndValidateJson('area-succession.json', AreaSuccessionSchema)

    console.log(`✅ 地域データ: ${areaData.data.length} 件`)
    console.log(`✅ 継承関係データ: ${successionData.data.length} 件`)

    // データ変換
    console.log('🔄 データ変換中...')
    const { prefectures, cities, codeToIdMap } = transformAreaData(areaData)

    // 市区町村のparentIdを正しいIDに変換
    const citiesWithCorrectParentId = cities.map((city) => ({
      ...city,
      parentId: codeToIdMap.get(city.parentId as string) || null,
    }))

    const successionResult = transformSuccessionData(successionData, codeToIdMap)

    // 既存データのクリア
    console.log('🧹 既存データをクリア中...')
    await executeWranglerCommandViaFile('DELETE FROM area_successions;')
    await executeWranglerCommandViaFile('DELETE FROM areas;')

    console.log('🏛️ 地域データを投入中...')
    // 1. 都道府県と市区町村を一括投入（バッチ処理）
    const areasSqlBatches = generateAreasSql(prefectures, citiesWithCorrectParentId)
    console.log(`  📦 地域データをバッチ処理: ${areasSqlBatches.length} バッチ`)

    for (let i = 0; i < areasSqlBatches.length; i++) {
      console.log(`  🏛️ バッチ ${i + 1}/${areasSqlBatches.length} を実行中...`)
      const areasSqlBatch = areasSqlBatches[i]
      invariant(areasSqlBatch, 'SQLバッチが空です。')
      await executeWranglerCommandViaFile(areasSqlBatch)
    }

    console.log(`  📍 都道府県データ投入: ${prefectures.length} 件`)
    console.log(`  🏘️ 市区町村データ投入: ${citiesWithCorrectParentId.length} 件`)

    // 2. 非アクティブ地域データを投入
    if (successionResult.inactiveAreas.length > 0) {
      console.log(`🔗 非アクティブ地域データ投入: ${successionResult.inactiveAreas.length} 件`)
      const inactiveAreasSqlBatches = generateAreasSql([], successionResult.inactiveAreas)
      console.log(`  📦 非アクティブ地域データをバッチ処理: ${inactiveAreasSqlBatches.length} バッチ`)

      for (let i = 0; i < inactiveAreasSqlBatches.length; i++) {
        console.log(`  🏛️ バッチ ${i + 1}/${inactiveAreasSqlBatches.length} を実行中...`)
        const inactiveAreasSqlBatch = inactiveAreasSqlBatches[i]
        invariant(inactiveAreasSqlBatch, 'SQLバッチが空です。')
        await executeWranglerCommandViaFile(inactiveAreasSqlBatch)
      }
    }

    // 3. 継承関係データを投入（バッチ処理）
    if (successionResult.successions.length > 0) {
      console.log(`🔗 継承関係データ投入: ${successionResult.successions.length} 件`)
      const successionsSqlBatches = generateSuccessionsSql(successionResult.successions)
      console.log(`  📦 継承関係データをバッチ処理: ${successionsSqlBatches.length} バッチ`)

      for (let i = 0; i < successionsSqlBatches.length; i++) {
        console.log(`  🔗 バッチ ${i + 1}/${successionsSqlBatches.length} を実行中...`)
        const successionsSqlBatch = successionsSqlBatches[i]
        invariant(successionsSqlBatch, 'SQLバッチが空です。')
        await executeWranglerCommandViaFile(successionsSqlBatch)
      }
    }
    else {
      console.log('🔗 継承関係データ: 投入対象なし')
    }

    console.log('🎉 シード処理が完了しました！')

    // 投入結果の確認
    await executeWranglerCommand('SELECT COUNT(*) as areas_count FROM areas;')
    await executeWranglerCommand('SELECT COUNT(*) as successions_count FROM area_successions;')
  }
  catch (error) {
    console.error('❌ シード処理中にエラーが発生しました:', error)
    process.exit(1)
  }
}

// スクリプトが直接実行された場合のみmain()を呼び出し
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { main }
