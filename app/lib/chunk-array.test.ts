import { describe, expect, test } from 'vitest'
import { chunkArray } from './chunk-array.ts'

describe('chunkArray', () => {
  describe('正常ケース', () => {
    test('空配列の場合、空配列を返す', () => {
      const result = chunkArray([], 3)
      expect(result).toEqual([])
    })

    test('要素数がチャンクサイズより少ない場合、1つのチャンクを返す', () => {
      const items = [1, 2]
      const result = chunkArray(items, 3)
      expect(result).toEqual([[1, 2]])
    })

    test('要素数がチャンクサイズと同じ場合、1つのチャンクを返す', () => {
      const items = [1, 2, 3]
      const result = chunkArray(items, 3)
      expect(result).toEqual([[1, 2, 3]])
    })

    test('要素数がチャンクサイズより多い場合、複数のチャンクに分割する', () => {
      const items = [1, 2, 3, 4, 5]
      const result = chunkArray(items, 2)
      expect(result).toEqual([[1, 2], [3, 4], [5]])
    })

    test('要素数がチャンクサイズの倍数の場合、均等に分割する', () => {
      const items = [1, 2, 3, 4, 5, 6]
      const result = chunkArray(items, 3)
      expect(result).toEqual([[1, 2, 3], [4, 5, 6]])
    })

    test('チャンクサイズが1の場合、各要素が個別のチャンクになる', () => {
      const items = ['a', 'b', 'c']
      const result = chunkArray(items, 1)
      expect(result).toEqual([['a'], ['b'], ['c']])
    })

    test('文字列配列でも正しく動作する', () => {
      const items = ['apple', 'banana', 'cherry', 'date', 'elderberry']
      const result = chunkArray(items, 3)
      expect(result).toEqual([
        ['apple', 'banana', 'cherry'],
        ['date', 'elderberry'],
      ])
    })

    test('オブジェクト配列でも正しく動作する', () => {
      const items = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' },
        { id: 4, name: 'David' },
      ]
      const result = chunkArray(items, 2)
      expect(result).toEqual([
        [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }],
        [{ id: 3, name: 'Charlie' }, { id: 4, name: 'David' }],
      ])
    })
  })

  describe('エラーケース', () => {
    test('チャンクサイズが0の場合、エラーを投げる', () => {
      expect(() => chunkArray([1, 2, 3], 0)).toThrow('chunkSize は自然数である必要があります')
    })

    test('チャンクサイズが負の値の場合、エラーを投げる', () => {
      expect(() => chunkArray([1, 2, 3], -1)).toThrow('chunkSize は自然数である必要があります')
    })

    test('チャンクサイズが小数の場合、エラーを投げる', () => {
      expect(() => chunkArray([1, 2, 3], 2.5)).toThrow('chunkSize は自然数である必要があります')
    })

    test('チャンクサイズがNaNの場合、エラーを投げる', () => {
      expect(() => chunkArray([1, 2, 3], NaN)).toThrow('chunkSize は自然数である必要があります')
    })

    test('チャンクサイズがInfinityの場合、エラーを投げる', () => {
      expect(() => chunkArray([1, 2, 3], Infinity)).toThrow('chunkSize は自然数である必要があります')
    })
  })

  describe('イミュータビリティ', () => {
    test('元の配列を変更しない', () => {
      const originalItems = [1, 2, 3, 4, 5]
      const itemsCopy = [...originalItems]

      chunkArray(originalItems, 2)

      expect(originalItems).toEqual(itemsCopy)
    })

    test('読み取り専用配列でも動作する', () => {
      const items: readonly number[] = [1, 2, 3, 4, 5] as const
      const result = chunkArray(items, 2)
      expect(result).toEqual([[1, 2], [3, 4], [5]])
    })
  })
})
