import { parseToHsla, hsla, hasBadContrast, toHex } from 'color2k'

// app/app.css参照 現在 @radix-ui/colors mauve
const LIGHT_BACKGROUND_COLOR = '#FDFCFD'
const DARK_BACKGROUND_COLOR = '#121113'

/**
 * 指定された色を基に、ライトモードとダークモードの背景色に対して
 * WCAG AA基準のコントラスト比を満たし、かつ最も鮮やかな色を返します
 */
export function getAccessibleColor(color: string): { light: string, dark: string } {
  const [h, _s, l, a] = parseToHsla(color)

  // 彩度を最大に設定して最も鮮やかな色を目指す
  const maxSaturation = 1

  // ライトモード用の色を計算
  const lightColor = calculateAccessibleColor(
    h,
    maxSaturation,
    l,
    a,
    LIGHT_BACKGROUND_COLOR,
    'light',
  )

  // ダークモード用の色を計算
  const darkColor = calculateAccessibleColor(
    h,
    maxSaturation,
    l,
    a,
    DARK_BACKGROUND_COLOR,
    'dark',
  )

  return {
    light: lightColor,
    dark: darkColor,
  }
}

/**
 * 指定された色相・彩度・明度から、背景色に対して適切なコントラストを持つ色を計算
 */
function calculateAccessibleColor(
  hue: number,
  saturation: number,
  lightness: number,
  alpha: number,
  backgroundColor: string,
  mode: 'light' | 'dark',
): string {
  // 初期の色を生成
  let currentColor = hsla(hue, saturation, lightness, alpha)

  // すでに十分なコントラストがある場合はそのまま返す
  if (!hasBadContrast(currentColor, 'readable', backgroundColor)) {
    return toHex(currentColor)
  }

  // コントラストが不足している場合、明度を調整してコントラストを上げる
  let adjustedLightness = lightness
  const step = 0.01
  const maxIterations = 100
  let iterations = 0

  while (hasBadContrast(currentColor, 'readable', backgroundColor) && iterations < maxIterations) {
    if (mode === 'light') {
      // ライトモードでは明度を下げてコントラストを上げる
      adjustedLightness = Math.max(0, adjustedLightness - step)
    }
    else {
      // ダークモードでは明度を上げてコントラストを上げる
      adjustedLightness = Math.min(1, adjustedLightness + step)
    }

    currentColor = hsla(hue, saturation, adjustedLightness, alpha)
    iterations++
  }

  // 最終的にコントラストが確保できない場合は、白または黒にフォールバック
  if (hasBadContrast(currentColor, 'readable', backgroundColor)) {
    return mode === 'light' ? '#000000' : '#FFFFFF'
  }

  return toHex(currentColor)
}
