import { parse } from 'valibot'
import { test, expect, describe } from 'vitest'
import { pageSchema } from './utils.ts'

describe('parse pageQuery with pageSchema', () => {
  test('default to 1, input is undefined', () => {
    const result = parse(pageSchema, undefined)
    expect(result).toBe(1)
  })

  test('succeed valid string integer values', () => {
    const result = parse(pageSchema, '10')
    expect(result).toBe(10)
  })

  test('throw an error for non-integer', () => {
    expect(() => parse(pageSchema, '3.5')).toThrow()
    expect(() => parse(pageSchema, 'abc')).toThrow()
  })

  test('throw for less than 1', () => {
    expect(() => parse(pageSchema, '0')).toThrow()
    expect(() => parse(pageSchema, '-10')).toThrow()
  })

  test('throw for greater than 1000', () => {
    expect(() => parse(pageSchema, '1001')).toThrow()
  })

  test('throw for exceeding safe integer', () => {
    expect(() => parse(pageSchema, '9007199254740992')).toThrow() // Number.MAX_SAFE_INTEGER + 1
    expect(() => parse(pageSchema, '-9007199254740992')).toThrow() // -(Number.MAX_SAFE_INTEGER + 1)
  })
})
