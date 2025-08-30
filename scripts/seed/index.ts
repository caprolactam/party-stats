import { parseArgs } from 'node:util'
import { transformSeedData } from './lib/data-processor.ts'
import { clearAllTables, insertAllData } from './lib/database-operations.ts'
import { loadSeedData, generateAllSqlFiles } from './lib/file-operations.ts'

async function main() {
  const options = parseCommandLineArgs()

  if (options.mode === 'sql') {
    await runSqlGeneration()
    return
  }

  await runDatabaseSeed()
}

main().catch((error) => {
  console.error('シードスクリプトの実行に失敗しました:', error)
  process.exit(1)
})

interface CliOptions {
  mode: 'database' | 'sql'
  help: boolean
}

function parseCommandLineArgs(): CliOptions {
  const { values } = parseArgs({
    options: {
      mode: {
        type: 'string',
        short: 'm',
      },
      help: {
        type: 'boolean',
        short: 'h',
      },
    },
    allowPositionals: false,
  })

  if (values.help) {
    console.log(`
使用方法:
  npm run db:seed                    # データベースに直接挿入（デフォルト）
  npm run db:seed -- --mode=sql      # 本番用SQLファイルを生成
  npm run db:seed -- --mode=database # データベースに直接挿入
  npm run db:seed -- --help          # このヘルプを表示

SQLファイル生成時の出力:
  - scripts/seed/output/areas.sql                        # Area関連データ
  - scripts/seed/output/common.sql                       # 共通データ（選挙・政党）
  - scripts/seed/output/election-{election}.sql   # 選挙別投票データ
`)
    process.exit(0)
  }

  const mode = values.mode === 'sql' ? 'sql' : 'database'

  return {
    mode,
    help: false,
  }
}

async function runSqlGeneration() {
  console.log('📄 本番用SQLファイル生成を開始...')
  console.time('📄 SQLファイル生成が完了しました')

  console.log('📚 JSONファイルを読み込み中...')
  console.time('📚 JSONファイルを読み込みました')

  const seedData = await loadSeedData()

  console.timeEnd('📚 JSONファイルを読み込みました')

  console.log('🔄 データを加工しています...')
  console.time('🔄 データの加工しました')

  const insertData = transformSeedData(seedData)

  console.timeEnd('🔄 データの加工しました')

  console.log('📝 SQLファイルを生成しています...')
  console.time('📝 SQLファイルを生成しました')

  await generateAllSqlFiles(insertData)

  console.timeEnd('📝 SQLファイルを生成しました')
  console.timeEnd('📄 SQLファイル生成が完了しました')
}

async function runDatabaseSeed() {
  console.log('🌱 シードスクリプトの実行中...')
  console.time('🌱 シードスクリプトが完了しました。')

  console.log('📚 JSONファイルを読み込み中...')
  console.time('📚 JSONファイルを読み込みました')

  const seedData = await loadSeedData()

  console.timeEnd('📚 JSONファイルを読み込みました')

  console.log('🔄 データを加工しています...')
  console.time('🔄 データの加工しました')

  const insertData = transformSeedData(seedData)

  console.timeEnd('🔄 データの加工しました')

  console.log('🗑️ 既存のテーブルデータを消去しています...')
  console.time('🗑️ テーブルデータを消去しました')

  await clearAllTables()

  console.timeEnd('🗑️ テーブルデータを消去しました')

  console.log('📥 データを挿入しています...')
  console.time('📥 データを挿入しました')

  await insertAllData(insertData)

  console.timeEnd('📥 データを挿入しました')

  console.timeEnd('🌱 シードスクリプトが完了しました。')
}
