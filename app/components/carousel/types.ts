import type React from 'react'

/**
 * カルーセルコンテキストの型定義
 */
export interface CarouselContextValue {
  // 状態 - valueベースの管理
  value: string
  onValueChange: (value: string) => void

  // 内部計算値
  totalItems: number
  currentIndex: number

  // ナビゲーション
  scrollToValue: (value: string) => void
  goToPrevious: () => void
  goToNext: () => void

  // キーボード操作
  handleKeyDown: (event: React.KeyboardEvent, targetValue?: string) => void

  // 参照
  scrollContainerRef: React.RefObject<HTMLDivElement | null>

  // 状態チェック
  canGoToPrevious: boolean
  canGoToNext: boolean
  isAtStart: boolean
  isAtEnd: boolean
}

/**
 * カルーセルルートコンポーネントのProps
 * Radixパターン: 最小限の制御可能なAPI
 */
export interface CarouselRootProps {
  children: React.ReactNode
  value: string
  onValueChange: (value: string) => void
}

/**
 * カルーセルビューポートコンポーネントのProps
 * スクロール機能とスタイリングを担当
 */
export interface CarouselViewportProps {
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

/**
 * カルーセルコンテンツコンポーネントのProps
 * ユニークなvalueで管理
 */
export interface CarouselContentProps {
  children: React.ReactNode
  value: string
  className?: string
}

/**
 * カルーセル前/次ボタンコンポーネントのProps
 * シンプルなボタンコンポーネント
 */
export interface CarouselNavigationButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

/**
 * カルーセルインジケーターコンポーネントのProps
 * シンプルなドットスタイル固定
 */
export interface CarouselIndicatorsProps {
  'className'?: string
  'aria-label'?: string
}

/**
 * 個別インジケーターボタンのProps
 * 内部使用のみ - 通常は外部に公開しない
 */
export interface CarouselIndicatorProps {
  'value': string
  'className'?: string
  'aria-label'?: string
  'children'?: React.ReactNode
}
