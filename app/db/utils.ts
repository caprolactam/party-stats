import invariant from 'tiny-invariant'

/**
 * データベースクエリ結果から最初のアイテムを安全に取得するジェネリックヘルパー関数
 *
 * @param results クエリ結果の配列
 * @returns 最初の要素、または存在しない場合はnull
 */
export function getFirstItem<T>(results: T[]): T | null {
  if (results.length === 0) return null

  const firstItem = results[0]
  invariant(firstItem, 'Expected first item to be defined')

  return firstItem
}
