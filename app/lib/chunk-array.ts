/**
 * 配列を指定サイズのチャンクに分割する汎用的な純粋関数。
 * 引数の配列は読み取り専用として扱われ、変更されません。
 *
 * @template T - 配列要素の型
 * @param items - 分割対象の配列
 * @param chunkSize - チャンクのサイズ（1以上の整数）
 * @returns チャンクに分割された二次元配列
 *
 * @example
 * ```typescript
 * const numbers = [1, 2, 3, 4, 5]
 * const chunks = chunkArray(numbers, 2)
 * // [[1, 2], [3, 4], [5]]
 * ```
 */
export function chunkArray<T>(items: readonly T[], chunkSize: number): T[][] {
  if (chunkSize <= 0 || !Number.isInteger(chunkSize)) {
    throw new Error('chunkSize は自然数である必要があります')
  }

  if (items.length === 0) {
    return []
  }

  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize))
  }
  return chunks
}
