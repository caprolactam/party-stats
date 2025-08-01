import { test, describe, expect } from 'vitest'
import type { InputPartyNameHistory } from './party-name-history.ts'
import { PartyNameHistorySchema, newPartyNameHistory } from './party-name-history.ts'

describe('PartyNameHistory', () => {
  describe('newPartyNameHistory', () => {
    test('有効な値オブジェクトを生成できる', () => {
      const input: InputPartyNameHistory = {
        name: '自由民主党',
        effectiveFrom: new Date('2024-01-01'),
        effectiveTo: null,
      }

      const result = newPartyNameHistory(input)

      expect(result.name)
        .toBe('自由民主党')
      expect(result.effectiveFrom)
        .toEqual(new Date('2024-01-01'))
      expect(result.effectiveTo)
        .toBeNull()
    })

    test('有効期間終了日がある場合も正常に生成できる', () => {
      const input: InputPartyNameHistory = {
        name: '民主党',
        effectiveFrom: new Date('2024-01-01'),
        effectiveTo: new Date('2024-12-31'),
      }

      const result = newPartyNameHistory(input)

      expect(result.name)
        .toBe('民主党')
      expect(result.effectiveFrom)
        .toEqual(new Date('2024-01-01'))
      expect(result.effectiveTo)
        .toEqual(new Date('2024-12-31'))
    })

    test('政党名の前後の空白が自動的に削除される', () => {
      const input: InputPartyNameHistory = {
        name: '  自由民主党  ',
        effectiveFrom: new Date('2024-01-01'),
        effectiveTo: null,
      }

      const result = newPartyNameHistory(input)

      expect(result.name)
        .toBe('自由民主党')
    })
  })

  describe('スキーマバリデーション', () => {
    describe('正常系', () => {
      test('有効期間終了日がnullの場合', () => {
        expect(() => {
          PartyNameHistorySchema.parse({
            name: '政党名',
            effectiveFrom: new Date('2024-01-01'),
            effectiveTo: null,
          })
        }).not.toThrow()
      })

      test('有効期間終了日が開始日より後の場合', () => {
        expect(() => {
          PartyNameHistorySchema.parse({
            name: '政党名',
            effectiveFrom: new Date('2024-01-01'),
            effectiveTo: new Date('2024-12-31'),
          })
        }).not.toThrow()
      })

      test('政党名が1文字の場合', () => {
        expect(() => {
          PartyNameHistorySchema.parse({
            name: '党',
            effectiveFrom: new Date('2024-01-01'),
            effectiveTo: null,
          })
        }).not.toThrow()
      })

      test('政党名が100文字の場合', () => {
        const longName = 'あ'.repeat(100)
        expect(() => {
          PartyNameHistorySchema.parse({
            name: longName,
            effectiveFrom: new Date('2024-01-01'),
            effectiveTo: null,
          })
        }).not.toThrow()
      })
    })

    describe('異常系', () => {
      test('政党名が空文字の場合はエラー', () => {
        expect(() => {
          PartyNameHistorySchema.parse({
            name: '',
            effectiveFrom: new Date('2024-01-01'),
            effectiveTo: null,
          })
        })
          .toThrow()
      })

      test('政党名が空白のみの場合はエラー', () => {
        expect(() => {
          PartyNameHistorySchema.parse({
            name: '   ',
            effectiveFrom: new Date('2024-01-01'),
            effectiveTo: null,
          })
        })
          .toThrow()
      })

      test('政党名が100文字を超える場合はエラー', () => {
        const tooLongName = 'あ'.repeat(101)
        expect(() => {
          PartyNameHistorySchema.parse({
            name: tooLongName,
            effectiveFrom: new Date('2024-01-01'),
            effectiveTo: null,
          })
        })
          .toThrow()
      })

      test('有効期間開始日が終了日と同じ場合はエラー', () => {
        expect(() => {
          PartyNameHistorySchema.parse({
            name: '政党名',
            effectiveFrom: new Date('2024-01-01'),
            effectiveTo: new Date('2024-01-01'),
          })
        })
          .toThrow('有効期間開始日は終了日より前である必要があります')
      })

      test('有効期間開始日が終了日より後の場合はエラー', () => {
        expect(() => {
          PartyNameHistorySchema.parse({
            name: '政党名',
            effectiveFrom: new Date('2024-01-02'),
            effectiveTo: new Date('2024-01-01'),
          })
        })
          .toThrow('有効期間開始日は終了日より前である必要があります')
      })
    })
  })
})
