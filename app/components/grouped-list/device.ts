/**
 * ブラウザーがマルチタッチに対応しているかを調べる。
 * ユーザーエージェントからデバイスを調べる代わりに、Navigator APIを利用する。
 * https://developer.mozilla.org/ja/docs/Web/HTTP/Guides/Browser_detection_using_the_user_agent
 */
export function isMultiTouchDevice(): boolean {
  if (typeof window === 'undefined') return false

  return 'maxTouchPoints' in navigator && navigator.maxTouchPoints > 1
}
