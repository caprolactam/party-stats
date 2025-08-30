import { test, expect, describe } from 'vitest'
import { escapeSql } from './sql-utils.ts'

describe('escapeSql', () => {
  describe('null and undefined values', () => {
    test('null値をNULLにエスケープする', () => {
      expect(escapeSql(null)).toBe('NULL')
    })

    test('undefined値をNULLにエスケープする', () => {
      expect(escapeSql(undefined)).toBe('NULL')
    })
  })

  describe('number values', () => {
    test('正の整数を正しくエスケープする', () => {
      expect(escapeSql(42)).toBe('42')
    })

    test('負の整数を正しくエスケープする', () => {
      expect(escapeSql(-42)).toBe('-42')
    })

    test('0を正しくエスケープする', () => {
      expect(escapeSql(0)).toBe('0')
    })

    test('正の小数を正しくエスケープする', () => {
      expect(escapeSql(3.14)).toBe('3.14')
    })

    test('負の小数を正しくエスケープする', () => {
      expect(escapeSql(-3.14)).toBe('-3.14')
    })

    test('NaNをNULLにエスケープする', () => {
      expect(escapeSql(NaN)).toBe('NULL')
    })

    test('正のInfinityをNULLにエスケープする', () => {
      expect(escapeSql(Infinity)).toBe('NULL')
    })

    test('負のInfinityをNULLにエスケープする', () => {
      expect(escapeSql(-Infinity)).toBe('NULL')
    })
  })

  describe('boolean values', () => {
    test('trueを1にエスケープする', () => {
      expect(escapeSql(true)).toBe('1')
    })

    test('falseを0にエスケープする', () => {
      expect(escapeSql(false)).toBe('0')
    })
  })

  describe('string values', () => {
    test('通常の文字列を正しくエスケープする', () => {
      expect(escapeSql('hello')).toBe('\'hello\'')
    })

    test('空文字列を正しくエスケープする', () => {
      expect(escapeSql('')).toBe('\'\'')
    })

    test('シングルクォートを含む文字列を正しくエスケープする', () => {
      expect(escapeSql('don\'t')).toBe('\'don\'\'t\'')
    })

    test('複数のシングルクォートを含む文字列を正しくエスケープする', () => {
      expect(escapeSql('It\'s a \'test\'')).toBe('\'It\'\'s a \'\'test\'\'\'')
    })

    test('改行文字を含む文字列を正しくエスケープする', () => {
      expect(escapeSql('line1\nline2')).toBe('\'line1\nline2\'')
    })

    test('特殊文字を含む文字列を正しくエスケープする', () => {
      expect(escapeSql('test\ttab\rcarriage')).toBe('\'test\ttab\rcarriage\'')
    })

    test('日本語文字列を正しくエスケープする', () => {
      expect(escapeSql('こんにちは')).toBe('\'こんにちは\'')
    })
  })

  describe('Date values', () => {
    test('Dateオブジェクトをタイムスタンプに変換する', () => {
      const date = new Date('2023-01-01T00:00:00.000Z')
      const expectedTimestamp = date.getTime().toString()
      expect(escapeSql(date)).toBe(expectedTimestamp)
    })

    test('現在時刻のDateオブジェクトを正しく処理する', () => {
      const now = new Date()
      const expectedTimestamp = now.getTime().toString()
      expect(escapeSql(now)).toBe(expectedTimestamp)
    })

    test('Invalid Dateを正しく処理する', () => {
      const invalidDate = new Date('invalid')
      const expectedTimestamp = invalidDate.getTime().toString() // "NaN"になる
      // Invalid DateもgetTime()の結果をそのまま返す（DB層での検証に委ねる）
      expect(escapeSql(invalidDate)).toBe(expectedTimestamp)
    })
  })

  describe('unsupported types', () => {
    test('オブジェクトに対してエラーを投げる', () => {
      expect(() => escapeSql({})).toThrow('Unsupported data type for SQL escape')
    })

    test('配列に対してエラーを投げる', () => {
      expect(() => escapeSql([])).toThrow('Unsupported data type for SQL escape')
    })

    test('関数に対してエラーを投げる', () => {
      expect(() => escapeSql(() => {})).toThrow('Unsupported data type for SQL escape')
    })

    test('Symbolに対してエラーを投げる', () => {
      expect(() => escapeSql(Symbol('test'))).toThrow('Cannot convert a Symbol value to a string')
    })
  })

  describe('edge cases', () => {
    test('非常に大きな数値を正しく処理する', () => {
      const largeNumber = Number.MAX_SAFE_INTEGER
      expect(escapeSql(largeNumber)).toBe(largeNumber.toString())
    })

    test('非常に小さな数値を正しく処理する', () => {
      const smallNumber = Number.MIN_SAFE_INTEGER
      expect(escapeSql(smallNumber)).toBe(smallNumber.toString())
    })

    test('極小の正の数値を正しく処理する', () => {
      const tinyNumber = Number.MIN_VALUE
      expect(escapeSql(tinyNumber)).toBe(tinyNumber.toString())
    })
  })
})
