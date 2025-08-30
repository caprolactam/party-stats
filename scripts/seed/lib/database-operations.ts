/**
 * データベース操作関連の機能
 * テーブルクリーンアップ、コマンド実行、データ挿入を担当
 */
import fs from 'node:fs'
import path from 'node:path'
import { getTableName } from 'drizzle-orm'
import { $ } from 'execa'
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
import { transformInsertDataToSql } from './data-processor.ts'
import type { InsertData } from './types.ts'

// =============================================================================
// 設定と初期化
// =============================================================================

const DATABASE_NAME = 'party-stats'

// アクティブなプロセスを管理するためのセット
const activeProcesses = new Set<ReturnType<typeof $>>()

/**
 * データ挿入スクリプト実行中にメインプロセスを終了してもexecaのコマンドが実行される問題の対策
 */
process.on('SIGINT', async () => {
  console.log('\n⚠️ プロセス終了が要求されました。アクティブなプロセスを終了しています...')

  const killPromises = Array.from(activeProcesses).map(async (activeProcess) => {
    try {
      activeProcess.kill('SIGTERM')
      await activeProcess
    }
    catch {
      // プロセスが既に終了している場合は無視
    }
  })

  await Promise.allSettled(killPromises)
  process.exit(0)
})

// =============================================================================
// データベースクリーンアップ
// =============================================================================

/**
 * すべてのテーブルをクリア
 * 外部キー制約の順序を考慮して削除: 子テーブル → 親テーブル の順序で削除
 */
export async function clearAllTables(): Promise<void> {
  const deleteStatements = [
    // 1. 最も依存関係の深い子テーブルから削除
    `DELETE FROM ${getTableName(partyResults)};`,
    `DELETE FROM ${getTableName(votingStatuses)};`,
    `DELETE FROM ${getTableName(regionsOnPrefectures)};`,
    `DELETE FROM ${getTableName(partyNameHistories)};`,
    `DELETE FROM ${getTableName(areaSuccessions)};`,

    // 2. 自己参照テーブル areas.level CITY → PREFECTURE → NATIONAL の順序で削除
    `DELETE FROM ${getTableName(areas)} WHERE level = 'CITY';`,
    `DELETE FROM ${getTableName(areas)} WHERE level = 'PREFECTURE';`,
    `DELETE FROM ${getTableName(areas)} WHERE level = 'NATIONAL';`,
    // 念のためクリーンアップ
    `DELETE FROM ${getTableName(areas)};`,

    // 3. 親テーブルの削除
    `DELETE FROM ${getTableName(parties)};`,
    `DELETE FROM ${getTableName(regions)};`,
    `DELETE FROM ${getTableName(elections)};`,
  ]

  await executeWranglerCommand(deleteStatements.join(' '))
}

// =============================================================================
// データ挿入処理
// =============================================================================

export async function insertAllData(insertData: InsertData): Promise<void> {
  const {
    areas,
    patriesAndElections,
    elections,
  } = transformInsertDataToSql(insertData)

  await executeWranglerFromFile(areas)

  await executeWranglerFromFile(patriesAndElections)

  for (const { electionId, sql } of elections) {
    console.log(`📥 election-${electionId} データの挿入を開始...`)
    await executeWranglerFromFile(sql)
    console.log(`✅ election-${electionId} データの挿入が完了`)
  }
}

// =============================================================================
// Wranglerコマンド実行
// =============================================================================

// tempディレクトリのパスを取得
function getTempDir(): string {
  const seedTempDir = path.resolve(process.cwd(), 'scripts/seed/temp')

  // ディレクトリが存在しない場合は作成
  if (!fs.existsSync(seedTempDir)) {
    fs.mkdirSync(seedTempDir, { recursive: true })
  }

  return seedTempDir
}

/**
 * wranglerコマンド実行（DELETE文用）
 */
export function executeWranglerCommand(command: string) {
  const process = $`wrangler d1 execute ${DATABASE_NAME} --local --command ${command}`
  activeProcesses.add(process)

  // プロセス完了時にセットから削除
  process.finally(() => {
    activeProcesses.delete(process)
  })

  return process
}

/**
 * SQLファイルを使用してwranglerコマンドを実行
 */
export async function executeWranglerFromFile(sqlContent: string): Promise<void> {
  // 一時ファイルを作成
  const tempDir = getTempDir()
  const tempFilePath = path.join(tempDir, `seed-${Date.now()}.sql`)

  try {
    // SQLファイルに書き込み
    await fs.promises.writeFile(tempFilePath, sqlContent, 'utf8')

    /**
     * wrangler のバージョンを指定して実行
     * TODO: ローカルのWranglerで大量のデータを含むsqlファイルを実行するとエラーが発生する問題、プロダクション環境では問題ない
     * https://github.com/cloudflare/workers-sdk/issues/8153
     */
    const process = $`npx --yes wrangler@3.107.0 d1 execute ${DATABASE_NAME} --local --file ${tempFilePath}`
    activeProcesses.add(process)

    // プロセス完了時にセットから削除
    process.finally(() => {
      activeProcesses.delete(process)
    })

    await process
  }
  finally {
    // 一時ファイルを削除
    try {
      await fs.promises.unlink(tempFilePath)
    }
    catch {
      // ファイル削除に失敗しても処理を続行
    }
  }
}
