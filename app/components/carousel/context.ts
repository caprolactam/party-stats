import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useDebounceCallback } from 'usehooks-ts'

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
 * カルーセルコンテキスト
 * - 状態管理とメソッド共有
 * - 各子コンポーネントからアクセス可能
 */
export const CarouselContext = createContext<CarouselContextValue | null>(null)

/**
 * カルーセルコンテキストフック
 * - コンテキストの取得とエラーハンドリング
 * - 型安全性の確保
 */
export function useCarousel(): CarouselContextValue {
  const context = useContext(CarouselContext)

  if (context === null) {
    throw new Error(
      'useCarousel must be used within a Carousel.Root component. '
      + 'Wrap your components in <Carousel.Root>...</Carousel.Root> to provide the necessary context.',
    )
  }

  return context
}

/**
 * カルーセル状態のカスタムフック
 * - 内部状態の管理
 * - スクロール同期
 * - キーボード操作
 */
export function useCarouselState(
  value: string,
  onValueChange: (value: string) => void,
): CarouselContextValue {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [values, setValues] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  // DOM要素から子要素のvalueを収集
  const updateValues = useCallback(() => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const contentElements = Array.from(
      container.querySelectorAll('[data-carousel-content]'),
    )

    const newValues = contentElements
      .map((el) => el.getAttribute('data-carousel-value'))
      .filter((val): val is string => val !== null)

    setValues(newValues)
  }, [])

  // valueから現在のindexを計算
  useEffect(() => {
    const index = values.findIndex((v) => v === value)
    setCurrentIndex(index >= 0 ? index : 0)
  }, [value, values])

  // DOM変更の監視
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const observer = new MutationObserver(updateValues)
    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-carousel-value'],
    })

    // 初回更新
    updateValues()

    return () => observer.disconnect()
  }, [updateValues])

  // スクロール位置の監視とvalueの同期
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || values.length === 0) return

    const container = scrollContainerRef.current
    const itemWidth = container.scrollWidth / values.length
    const scrollLeft = container.scrollLeft
    const newIndex = Math.round(scrollLeft / itemWidth)

    if (newIndex >= 0 && newIndex < values.length && newIndex !== currentIndex) {
      const newValue = values[newIndex]
      if (newValue) {
        onValueChange(newValue)
      }
    }
  }, [values, currentIndex, onValueChange])

  const debouncedHandleScroll = useDebounceCallback(handleScroll, 20)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    container.addEventListener('scroll', debouncedHandleScroll)
    return () => container.removeEventListener('scroll', debouncedHandleScroll)
  }, [debouncedHandleScroll])

  // スクロール操作
  const scrollToValue = useCallback((targetValue: string) => {
    if (!scrollContainerRef.current) return

    const targetIndex = values.findIndex((v) => v === targetValue)
    if (targetIndex === -1) return

    const container = scrollContainerRef.current
    const itemWidth = container.scrollWidth / values.length
    container.scrollTo({
      left: itemWidth * targetIndex,
      behavior: 'smooth',
    })
  }, [values])

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      const newValue = values[currentIndex - 1]
      if (newValue) {
        onValueChange(newValue)
      }
    }
  }, [currentIndex, values, onValueChange])

  const goToNext = useCallback(() => {
    if (currentIndex < values.length - 1) {
      const newValue = values[currentIndex + 1]
      if (newValue) {
        onValueChange(newValue)
      }
    }
  }, [currentIndex, values, onValueChange])

  // キーボード操作
  const handleKeyDown = useCallback((
    event: React.KeyboardEvent,
    targetValue?: string,
  ) => {
    let newIndex = currentIndex

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault()
        newIndex = currentIndex < values.length - 1 ? currentIndex + 1 : 0
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault()
        newIndex = currentIndex > 0 ? currentIndex - 1 : values.length - 1
        break
      case 'Home':
        event.preventDefault()
        newIndex = 0
        break
      case 'End':
        event.preventDefault()
        newIndex = values.length - 1
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (targetValue) {
          const index = values.findIndex((v) => v === targetValue)
          if (index >= 0) {
            newIndex = index
          }
        }
        break
      default:
        return
    }

    const newValue = values[newIndex]
    if (newValue) {
      onValueChange(newValue)
    }
  }, [currentIndex, values, onValueChange])

  return {
    value,
    onValueChange,
    totalItems: values.length,
    currentIndex,
    scrollToValue,
    goToPrevious,
    goToNext,
    handleKeyDown,
    scrollContainerRef,
    canGoToPrevious: currentIndex > 0,
    canGoToNext: currentIndex < values.length - 1,
    isAtStart: currentIndex === 0,
    isAtEnd: currentIndex === values.length - 1,
  }
}
