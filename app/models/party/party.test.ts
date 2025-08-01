import { test, describe, expect } from 'vitest'
import { PartyIdSchema, PartySchema, newParty } from './party.ts'
import type { InputParty } from './party.ts'

describe('PartyId', () => {
  test('PartyIdSchemaが正常に動作すること', () => {
    const result = PartyIdSchema.parse('party-123')
    expect(result).toBe('party-123')
  })

  test('空文字はエラーになる', () => {
    expect(() => PartyIdSchema.parse('')).toThrow()
  })

  test('文字列以外は受け入れない', () => {
    expect(() => PartyIdSchema.parse(123))
      .toThrow()
    expect(() => PartyIdSchema.parse(null))
      .toThrow()
    expect(() => PartyIdSchema.parse(undefined))
      .toThrow()
  })
})

describe('Party', () => {
  describe('newParty: 正常系', () => {
    test('必須プロパティのみで政党エンティティを生成できる', () => {
      const party = newParty({
        id: 'party-001',
        name: '自由民主党',
        color: '#3F48CC',
      })

      expect(party.id).toBe('party-001')
      expect(party.name).toBe('自由民主党')
      expect(party.color).toBe('#3F48CC')
      expect(party.nameHistories).toEqual([])
    })

    test('名称履歴がある政党エンティティを生成できる', () => {
      const party = newParty({
        id: 'party-002',
        name: '立憲民主党',
        color: '#ED1B24',
        nameHistories: [
          {
            name: '民主党',
            effectiveFrom: new Date('1996-09-28'),
            effectiveTo: new Date('2016-03-27'),
          },
          {
            name: '立憲民主党',
            effectiveFrom: new Date('2017-10-03'),
            effectiveTo: null,
          },
        ],
      })

      expect(party.id).toBe('party-002')
      expect(party.name).toBe('立憲民主党')
      expect(party.color).toBe('#ED1B24')
      expect(party.nameHistories).toHaveLength(2)
      expect(party.nameHistories[0]?.name).toBe('民主党')
      expect(party.nameHistories[1]?.name).toBe('立憲民主党')
    })

    test('nameHistoriesを明示的に空配列で指定しても正常に動作する', () => {
      const party = newParty({
        id: 'party-003',
        name: '公明党',
        color: '#FF9900',
        nameHistories: [],
      })

      expect(party.nameHistories).toEqual([])
    })
  })

  describe('newParty: 異常系', () => {
    test('無効なカラーコードの場合はエラーが発生する', () => {
      expect(() => newParty({
        id: 'party-001',
        name: '政党名',
        color: 'invalid-color',
      })).toThrow('政党カラーは有効なHEXカラーコード（#RRGGBB）である必要があります')
    })

    test('カラーコードに小文字が含まれても有効', () => {
      expect(() => newParty({
        id: 'party-001',
        name: '政党名',
        color: '#abcdef',
      })).not.toThrow()
    })

    test('カラーコードが短い場合はエラーが発生する', () => {
      expect(() => newParty({
        id: 'party-001',
        name: '政党名',
        color: '#ABC',
      })).toThrow()
    })

    test('カラーコードに#がない場合はエラーが発生する', () => {
      expect(() => newParty({
        id: 'party-001',
        name: '政党名',
        color: 'FF0000',
      })).toThrow()
    })
  })

  describe('名称履歴の重複期間チェック', () => {
    test('重複しない期間の場合は正常に作成される', () => {
      const input: InputParty = {
        id: 'party-001',
        name: '現在の政党名',
        color: '#FF0000',
        nameHistories: [
          {
            name: '旧政党名1',
            effectiveFrom: new Date('2000-01-01'),
            effectiveTo: new Date('2010-12-31'),
          },
          {
            name: '旧政党名2',
            effectiveFrom: new Date('2011-01-01'),
            effectiveTo: new Date('2020-12-31'),
          },
          {
            name: '現在の政党名',
            effectiveFrom: new Date('2021-01-01'),
            effectiveTo: null,
          },
        ],
      }

      expect(() => newParty(input)).not.toThrow()
    })

    test('期間が重複する場合はエラーが発生する', () => {
      const input: InputParty = {
        id: 'party-001',
        name: '政党名',
        color: '#FF0000',
        nameHistories: [
          {
            name: '政党名A',
            effectiveFrom: new Date('2000-01-01'),
            effectiveTo: new Date('2010-12-31'),
          },
          {
            name: '政党名B',
            effectiveFrom: new Date('2005-01-01'), // 重複
            effectiveTo: new Date('2015-12-31'),
          },
        ],
      }

      expect(() => newParty(input))
        .toThrow('政党名称履歴に重複する期間があります')
    })

    test('開始日が同じ場合はエラーが発生する', () => {
      const input: InputParty = {
        id: 'party-001',
        name: '政党名',
        color: '#FF0000',
        nameHistories: [
          {
            name: '政党名A',
            effectiveFrom: new Date('2000-01-01'),
            effectiveTo: new Date('2010-12-31'),
          },
          {
            name: '政党名B',
            effectiveFrom: new Date('2000-01-01'), // 同じ開始日
            effectiveTo: new Date('2005-12-31'),
          },
        ],
      }

      expect(() => newParty(input))
        .toThrow('政党名称履歴に重複する期間があります')
    })

    test('終了日が同じ場合はエラーが発生する', () => {
      const input: InputParty = {
        id: 'party-001',
        name: '政党名',
        color: '#FF0000',
        nameHistories: [
          {
            name: '政党名A',
            effectiveFrom: new Date('2000-01-01'),
            effectiveTo: new Date('2010-12-31'),
          },
          {
            name: '政党名B',
            effectiveFrom: new Date('2005-01-01'),
            effectiveTo: new Date('2010-12-31'), // 同じ終了日
          },
        ],
      }

      expect(() => newParty(input))
        .toThrow('政党名称履歴に重複する期間があります')
    })

    test('一方がnull（無期限）で重複する場合はエラーが発生する', () => {
      const input: InputParty = {
        id: 'party-001',
        name: '政党名',
        color: '#FF0000',
        nameHistories: [
          {
            name: '政党名A',
            effectiveFrom: new Date('2000-01-01'),
            effectiveTo: new Date('2010-12-31'),
          },
          {
            name: '政党名B',
            effectiveFrom: new Date('2005-01-01'),
            effectiveTo: null, // 無期限で重複
          },
        ],
      }

      expect(() => newParty(input))
        .toThrow('政党名称履歴に重複する期間があります')
    })

    test('両方がnull（無期限）の場合はエラーが発生する', () => {
      const input: InputParty = {
        id: 'party-001',
        name: '政党名',
        color: '#FF0000',
        nameHistories: [
          {
            name: '政党名A',
            effectiveFrom: new Date('2000-01-01'),
            effectiveTo: null,
          },
          {
            name: '政党名B',
            effectiveFrom: new Date('2005-01-01'),
            effectiveTo: null, // 両方とも無期限
          },
        ],
      }

      expect(() => newParty(input))
        .toThrow('政党名称履歴に重複する期間があります')
    })

    test('隣接する期間（終了日の翌日が開始日）は重複しない', () => {
      const input: InputParty = {
        id: 'party-001',
        name: '政党名',
        color: '#FF0000',
        nameHistories: [
          {
            name: '政党名A',
            effectiveFrom: new Date('2000-01-01'),
            effectiveTo: new Date('2010-12-31'),
          },
          {
            name: '政党名B',
            effectiveFrom: new Date('2011-01-01'), // 翌日開始
            effectiveTo: null,
          },
        ],
      }

      expect(() => newParty(input)).not.toThrow()
    })

    test('複数の履歴がある場合でも正常に動作する', () => {
      const input: InputParty = {
        id: 'party-001',
        name: '政党名',
        color: '#FF0000',
        nameHistories: [
          {
            name: '政党名A',
            effectiveFrom: new Date('1990-01-01'),
            effectiveTo: new Date('1999-12-31'),
          },
          {
            name: '政党名B',
            effectiveFrom: new Date('2000-01-01'),
            effectiveTo: new Date('2009-12-31'),
          },
          {
            name: '政党名C',
            effectiveFrom: new Date('2010-01-01'),
            effectiveTo: new Date('2019-12-31'),
          },
          {
            name: '政党名D',
            effectiveFrom: new Date('2020-01-01'),
            effectiveTo: null,
          },
        ],
      }

      expect(() => newParty(input)).not.toThrow()
    })

    test('単一の履歴では重複チェックが実行されない', () => {
      const input: InputParty = {
        id: 'party-001',
        name: '政党名',
        color: '#FF0000',
        nameHistories: [
          {
            name: '政党名A',
            effectiveFrom: new Date('2000-01-01'),
            effectiveTo: null,
          },
        ],
      }

      expect(() => newParty(input)).not.toThrow()
    })

    test('時刻まで同じ場合でも重複と判定される', () => {
      const sameDateTime = new Date('2000-01-01T12:00:00Z')
      const input: InputParty = {
        id: 'party-001',
        name: '政党名',
        color: '#FF0000',
        nameHistories: [
          {
            name: '政党名A',
            effectiveFrom: sameDateTime,
            effectiveTo: new Date('2010-12-31'),
          },
          {
            name: '政党名B',
            effectiveFrom: sameDateTime, // 同じ時刻
            effectiveTo: new Date('2005-12-31'),
          },
        ],
      }

      expect(() => newParty(input))
        .toThrow('政党名称履歴に重複する期間があります')
    })

    test('期間が内包関係にある場合はエラーが発生する', () => {
      const input: InputParty = {
        id: 'party-001',
        name: '政党名',
        color: '#FF0000',
        nameHistories: [
          {
            name: '政党名A',
            effectiveFrom: new Date('2000-01-01'),
            effectiveTo: new Date('2010-12-31'),
          },
          {
            name: '政党名B',
            effectiveFrom: new Date('2002-01-01'), // 内包される期間
            effectiveTo: new Date('2008-12-31'),
          },
        ],
      }

      expect(() => newParty(input))
        .toThrow('政党名称履歴に重複する期間があります')
    })

    test('逆順の期間（時系列が入れ替わっている）でも重複チェックが動作する', () => {
      const input: InputParty = {
        id: 'party-001',
        name: '政党名',
        color: '#FF0000',
        nameHistories: [
          {
            name: '政党名B',
            effectiveFrom: new Date('2005-01-01'), // 後の期間を先に定義
            effectiveTo: new Date('2015-12-31'),
          },
          {
            name: '政党名A',
            effectiveFrom: new Date('2000-01-01'),
            effectiveTo: new Date('2010-12-31'), // 重複
          },
        ],
      }

      expect(() => newParty(input))
        .toThrow('政党名称履歴に重複する期間があります')
    })
  })

  describe('PartySchema直接テスト', () => {
    test('PartySchemaで直接パースできる', () => {
      const input = {
        id: 'party-001',
        name: '政党名',
        color: '#FF0000',
      }

      const result = PartySchema.parse(input)

      expect(result.id).toBe('party-001')
      expect(result.name).toBe('政党名')
      expect(result.color).toBe('#FF0000')
      expect(result.nameHistories).toEqual([])
    })

    test('無効なデータの場合はZodErrorが発生する', () => {
      const input = {
        id: 'party-001',
        name: '政党名',
        color: 'invalid-color',
      }

      expect(() => PartySchema.parse(input))
        .toThrow()
    })
  })
})
