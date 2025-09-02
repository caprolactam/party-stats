import { getContrast } from 'color2k'
import { describe, expect, test } from 'vitest'
import { getAccessibleColor } from './color.server'

const LIGHT_BACKGROUND_COLOR = '#FDFCFD'
const DARK_BACKGROUND_COLOR = '#121113'
const MIN_CONTRAST_RATIO = 3 // readableオプションの基準は3:1

describe('getAccessibleColor', () => {
  test('赤色から適切なコントラストを持つ色を生成する', () => {
    const result = getAccessibleColor('#FF0000')

    // ライトモード用の色がWCAG基準を満たしているか確認
    const lightContrast = getContrast(result.light, LIGHT_BACKGROUND_COLOR)
    expect(lightContrast).toBeGreaterThanOrEqual(MIN_CONTRAST_RATIO)

    // ダークモード用の色がWCAG基準を満たしているか確認
    const darkContrast = getContrast(result.dark, DARK_BACKGROUND_COLOR)
    expect(darkContrast).toBeGreaterThanOrEqual(MIN_CONTRAST_RATIO)
  })

  test('青色から適切なコントラストを持つ色を生成する', () => {
    const result = getAccessibleColor('#0000FF')

    const lightContrast = getContrast(result.light, LIGHT_BACKGROUND_COLOR)
    expect(lightContrast).toBeGreaterThanOrEqual(MIN_CONTRAST_RATIO)

    const darkContrast = getContrast(result.dark, DARK_BACKGROUND_COLOR)
    expect(darkContrast).toBeGreaterThanOrEqual(MIN_CONTRAST_RATIO)
  })

  test('緑色から適切なコントラストを持つ色を生成する', () => {
    const result = getAccessibleColor('#00FF00')

    const lightContrast = getContrast(result.light, LIGHT_BACKGROUND_COLOR)
    expect(lightContrast).toBeGreaterThanOrEqual(MIN_CONTRAST_RATIO)

    const darkContrast = getContrast(result.dark, DARK_BACKGROUND_COLOR)
    expect(darkContrast).toBeGreaterThanOrEqual(MIN_CONTRAST_RATIO)
  })

  test('既に十分なコントラストを持つ色の場合はそのまま返す', () => {
    // 黒に近い色（ライトモードで十分なコントラスト）
    const result = getAccessibleColor('#333333')

    const lightContrast = getContrast(result.light, LIGHT_BACKGROUND_COLOR)
    expect(lightContrast).toBeGreaterThanOrEqual(MIN_CONTRAST_RATIO)

    const darkContrast = getContrast(result.dark, DARK_BACKGROUND_COLOR)
    expect(darkContrast).toBeGreaterThanOrEqual(MIN_CONTRAST_RATIO)
  })

  test('薄い色から適切なコントラストを持つ色を生成する', () => {
    const result = getAccessibleColor('#FFCCCC')

    const lightContrast = getContrast(result.light, LIGHT_BACKGROUND_COLOR)
    expect(lightContrast).toBeGreaterThanOrEqual(MIN_CONTRAST_RATIO)

    const darkContrast = getContrast(result.dark, DARK_BACKGROUND_COLOR)
    expect(darkContrast).toBeGreaterThanOrEqual(MIN_CONTRAST_RATIO)
  })

  test('返される色がHEX形式であることを確認する', () => {
    const result = getAccessibleColor('#FF0000')

    expect(result.light).toMatch(/^#[0-9A-F]{6}$/i)
    expect(result.dark).toMatch(/^#[0-9A-F]{6}$/i)
  })
})
