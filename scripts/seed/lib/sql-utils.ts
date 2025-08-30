/**
 * SQL関連のユーティリティ機能
 * SQL文字列のエスケープとSQL文の構築を担当
 */
import { getTableName, getTableColumns } from 'drizzle-orm'
import type { SQLiteTable } from 'drizzle-orm/sqlite-core'
import { camelCase } from 'scule'
import invariant from 'tiny-invariant'

// =============================================================================
// SQL文字列エスケープ処理
// =============================================================================

/**
 * SQLクエリ用の文字列エスケープ処理
 */
export function escapeSql(value: unknown): string {
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

// =============================================================================
// SQL文構築処理
// =============================================================================

export const DEFAULT_BATCH_SIZE = 200

/**
 * 一度のステートメントで大量のデータを挿入するとエラーになるため、バッチに分割してINSERT文を生成
 * https://developers.cloudflare.com/d1/best-practices/import-export-data/#resolve-statement-too-long-error
 */
export function createBatches<T>(data: T[], batchSize: number = DEFAULT_BATCH_SIZE): T[][] {
  const batches: T[][] = []
  for (let i = 0; i < data.length; i += batchSize) {
    batches.push(data.slice(i, i + batchSize))
  }
  return batches
}

/**
 * INSERT文を生成する
 */
export function buildInsertSqlStatements<T extends Record<string, unknown>>(
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
