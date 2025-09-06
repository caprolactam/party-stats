import React from 'react'
import * as Slot from '@radix-ui/react-slot'
import mergeRefs from 'merge-refs'
import { cn } from '~/lib/utils.ts'
import { CarouselContext, useCarouselState } from './context.ts'
import { useCarousel } from './context.ts'

export interface CarouselRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  value: string
  onValueChange: (value: string) => void
  asChild?: boolean
}

export function CarouselRoot({
  children,
  value,
  onValueChange,
  asChild = false,
  ...props
}: CarouselRootProps) {
  const carouselState = useCarouselState(value, onValueChange)
  const Comp = asChild ? Slot.Root : 'div'

  return (
    <Comp
      role="region"
      aria-roledescription="carousel"
      aria-live="polite"
      aria-atomic="false"
      {...props}
    >
      <CarouselContext.Provider value={carouselState}>
        {children}
      </CarouselContext.Provider>
    </Comp>
  )
}

export interface CarouselViewportProps extends React.ComponentPropsWithRef<'div'> {
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

export function CarouselViewport({
  children,
  className,
  asChild = false,
  ref,
  ...props
}: CarouselViewportProps) {
  const caroulseContentRef = React.useRef<HTMLDivElement>(null)
  const { scrollContainerRef } = useCarousel()

  React.useEffect(() => {
    if (!caroulseContentRef.current) return

    scrollContainerRef.current = caroulseContentRef.current
  }, [scrollContainerRef])

  const Comp = asChild ? Slot.Root : 'div'

  return (
    <div className="relative isolate flex h-full w-full min-w-0">
      <div className="relative flex w-full overflow-hidden">
        <Comp
          ref={mergeRefs(ref, caroulseContentRef)}
          className={cn(
            // 基本レイアウト
            'flex w-full overflow-x-auto',
            // スクロールスナップ
            'snap-x snap-mandatory',
            // スムーズスクロール
            'scroll-smooth',
            className,
          )}
          {...props}
        >
          {children}
        </Comp>
      </div>
    </div>
  )
}

export interface CarouselContentProps extends React.ComponentPropsWithRef<'div'> {
  value: string
  asChild?: boolean
}

export function CarouselContent({ children, value, className, asChild, ref, ...props }: CarouselContentProps) {
  const itemRef = React.useRef<HTMLDivElement>(null)

  const { value: currentValue } = useCarousel()
  const Comp = asChild ? Slot.Root : 'div'
  const isActive = currentValue === value

  return (
    <Comp
      ref={mergeRefs(ref, itemRef)}
      role="group"
      aria-roledescription="slide"
      aria-hidden={!isActive}
      tabIndex={isActive ? undefined : -1}
      data-carousel-content
      data-carousel-value={value}
      data-state={isActive ? 'active' : 'inactive'}
      className={cn(
        // 基本レイアウト
        'min-w-0 shrink-0',
        // スクロールスナップ
        'snap-center',
        // 幅設定（App Store風）
        'w-[85%]',
        // 最初と最後の要素は少し広く
        'first:w-[92%] last:w-[92%] data-[state=inactive]:pointer-events-none',
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  )
}

export interface CarouselNavigationButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export function CarouselPrevious({
  className,
  'aria-label': ariaLabel = '前のスライドに移動',
  children,
  asChild = false,
  onClick,
  disabled: disabledProp,
  ...props
}: CarouselNavigationButtonProps) {
  const { goToPrevious, canGoToPrevious } = useCarousel()

  const Comp = asChild ? Slot.Root : 'button'
  const disabled = disabledProp ?? !canGoToPrevious

  return (
    <Comp
      type="button"
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented) return
        goToPrevious()
      }}
      disabled={disabled}
      className={className}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </Comp>
  )
}

export function CarouselNext({
  className,
  'aria-label': ariaLabel = '次のスライドに移動',
  children,
  asChild = false,
  onClick,
  disabled: disabledProp,
  ...props
}: CarouselNavigationButtonProps) {
  const { goToNext, canGoToNext } = useCarousel()

  const Comp = asChild ? Slot.Root : 'button'
  const disabled = disabledProp ?? !canGoToNext

  return (
    <Comp
      type="button"
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented) return
        goToNext()
      }}
      disabled={disabled}
      className={className}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </Comp>
  )
}

export interface CarouselIndicatorsProps extends React.ComponentPropsWithRef<'div'> {}

export function CarouselIndicators({
  children,
  ...props
}: CarouselIndicatorsProps) {
  return (
    <div
      role="group"
      {...props}
    >
      {children}
    </div>
  )
}

export interface CarouselIndicatorProps extends React.ComponentPropsWithRef<'button'> {
  value: string
}

export function CarouselIndicator({
  value: indicatorValue,
  className,
  'aria-label': ariaLabel,
  children,
  ...props
}: CarouselIndicatorProps) {
  const { value, onValueChange, handleKeyDown } = useCarousel()

  const isActive = value === indicatorValue

  return (
    <button
      type="button"
      aria-pressed={isActive}
      aria-disabled={isActive}
      tabIndex={isActive ? undefined : -1}
      onClick={() => {
        if (!isActive) {
          onValueChange(indicatorValue)
        }
      }}
      onKeyDown={(event) => handleKeyDown(event, indicatorValue)}
      className={cn(
        // 基本スタイル
        'h-3 w-3 rounded-full border-2 transition-colors',
        'focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none',
        // アクティブ状態
        isActive
          ? 'border-primary bg-primary'
          : 'border-muted-foreground/30 bg-transparent hover:border-muted-foreground/50',
        className,
      )}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  )
}

export const Carousel = Object.assign(CarouselRoot, {
  Viewport: CarouselViewport,
  Content: CarouselContent,
  Previous: CarouselPrevious,
  Next: CarouselNext,
  Indicators: CarouselIndicators,
  Indicator: CarouselIndicator,
})
