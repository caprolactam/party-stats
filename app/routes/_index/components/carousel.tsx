import type React from 'react'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useDebounceCallback } from 'usehooks-ts'
import { cn } from '~/lib/utils.ts'

// Context Types
interface CarouselContextType {
  currentIndex: number
  totalItems: number
  scrollToIndex: (index: number) => void
  goToPrevious: () => void
  goToNext: () => void
  handleKeyDown: (event: React.KeyboardEvent, index: number) => void
  scrollContainerRef: React.RefObject<HTMLUListElement | null>
}

const CarouselContext = createContext<CarouselContextType | null>(null)

function useCarousel() {
  const context = useContext(CarouselContext)
  if (!context) {
    throw new Error('Carousel components must be used within Carousel.Root')
  }
  return context
}

// Root Component
interface CarouselRootProps {
  children: React.ReactNode
  totalItems: number
  className?: string
}

function CarouselRoot({ children, totalItems, className }: CarouselRootProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLUListElement>(null)

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const itemWidth = container.scrollWidth / totalItems
    const scrollLeft = container.scrollLeft
    const newIndex = Math.round(scrollLeft / itemWidth)

    setCurrentIndex(newIndex)
  }, [totalItems])

  const debouncedHandleScroll = useDebounceCallback(handleScroll, 20)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    container.addEventListener('scroll', debouncedHandleScroll)
    return () => container.removeEventListener('scroll', debouncedHandleScroll)
  }, [debouncedHandleScroll])

  const scrollToIndex = useCallback((index: number) => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const itemWidth = container.scrollWidth / totalItems
    container.scrollTo({
      left: itemWidth * index,
      behavior: 'smooth',
    })
  }, [totalItems])

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1)
    }
  }, [currentIndex, scrollToIndex])

  const goToNext = useCallback(() => {
    if (currentIndex < totalItems - 1) {
      scrollToIndex(currentIndex + 1)
    }
  }, [currentIndex, totalItems, scrollToIndex])

  const handleKeyDown = useCallback((event: React.KeyboardEvent, index: number) => {
    let newIndex = currentIndex

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault()
        newIndex = currentIndex < totalItems - 1 ? currentIndex + 1 : 0
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault()
        newIndex = currentIndex > 0 ? currentIndex - 1 : totalItems - 1
        break
      case 'Home':
        event.preventDefault()
        newIndex = 0
        break
      case 'End':
        event.preventDefault()
        newIndex = totalItems - 1
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        newIndex = index
        break
      default:
        return
    }

    scrollToIndex(newIndex)
  }, [currentIndex, totalItems, scrollToIndex])

  const contextValue: CarouselContextType = {
    currentIndex,
    totalItems,
    scrollToIndex,
    goToPrevious,
    goToNext,
    handleKeyDown,
    scrollContainerRef,
  }

  return (
    <CarouselContext.Provider value={contextValue}>
      {children}
    </CarouselContext.Provider>
  )
}

// Viewport Component
interface CarouselViewportProps {
  children: React.ReactNode
  className?: string
}

function CarouselViewport({ children, className }: CarouselViewportProps) {
  const { scrollContainerRef } = useCarousel()

  return (
    <div className={cn('isolate flex h-full w-full min-w-0 shrink grow', className)}>
      <div className="relative flex w-full grow">
        <div className="flex grow overflow-hidden">
          <div className="relative flex grow overflow-hidden">
            <CarouselNext />
            <CarouselPrevious />
            <ul
              ref={scrollContainerRef}
              className="relative flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth before:invisible before:absolute before:inset-0 before:-z-1 before:overflow-hidden"
            >
              {children}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Content Component
interface CarouselContentProps {
  'children': React.ReactNode
  'index': number
  'className'?: string
  'role'?: string
  'id'?: string
  'aria-labelledby'?: string
}

function CarouselContent({
  children,
  index,
  className,
  role = 'tabpanel',
  id,
  'aria-labelledby': ariaLabelledby,
}: CarouselContentProps) {
  const { currentIndex, totalItems } = useCarousel()

  const isFirst = index === 0
  const isLast = index === totalItems - 1
  const isActive = currentIndex === index

  return (
    <li
      role={role}
      id={id || `carousel-panel-${index}`}
      aria-labelledby={ariaLabelledby || `carousel-tab-${index}`}
      aria-hidden={!isActive}
      className={cn(
        'w-[85%] shrink-0 snap-center',
        (isFirst || isLast) && 'w-[92%]',
        className,
      )}
    >
      <span className="sr-only">{`ページ ${index + 1}`}</span>
      {children}
    </li>
  )
}

// Previous Button Component
interface CarouselPreviousProps {
  'className'?: string
  'aria-label'?: string
}

function CarouselPrevious({
  className,
  'aria-label': ariaLabel = '前のページに戻る',
}: CarouselPreviousProps) {
  const { currentIndex, goToPrevious } = useCarousel()

  return (
    <button
      onClick={goToPrevious}
      tabIndex={-1}
      disabled={currentIndex === 0}
      className={cn(
        'absolute top-1/2 left-2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-600 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 pointer-coarse:hidden',
        className,
      )}
      aria-label={ariaLabel}
    >
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  )
}

// Next Button Component
interface CarouselNextProps {
  'className'?: string
  'aria-label'?: string
}

function CarouselNext({
  className,
  'aria-label': ariaLabel = '次のページに進む',
}: CarouselNextProps) {
  const { currentIndex, totalItems, goToNext } = useCarousel()

  return (
    <button
      onClick={goToNext}
      tabIndex={-1}
      disabled={currentIndex === totalItems - 1}
      className={cn(
        'absolute top-1/2 right-2 z-10 block -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-600 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 pointer-coarse:hidden',
        className,
      )}
      aria-label={ariaLabel}
    >
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )
}

// Indicators Component
interface CarouselIndicatorsProps {
  'className'?: string
  'aria-label'?: string
}

function CarouselIndicators({
  className,
  'aria-label': ariaLabel = 'ページ選択',
}: CarouselIndicatorsProps) {
  const { currentIndex, totalItems, scrollToIndex, handleKeyDown } = useCarousel()

  return (
    <div className={cn('mt-4 flex items-center justify-center gap-2', className)}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="flex items-center justify-center gap-2"
      >
        {Array.from({ length: totalItems }, (_, index) => (
          <button
            key={index}
            role="tab"
            aria-selected={currentIndex === index}
            aria-controls={`carousel-panel-${index}`}
            id={`carousel-tab-${index}`}
            tabIndex={currentIndex === index ? 0 : -1}
            onClick={() => scrollToIndex(index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              'h-3 w-3 rounded-full border-2 transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none',
              currentIndex === index
                ? 'border-primary bg-primary'
                : 'border-muted-foreground/30 bg-transparent hover:border-muted-foreground/50',
            )}
            aria-label={`${index + 1}ページ目に移動`}
          />
        ))}
      </div>
    </div>
  )
}

// Export as compound component
export const Carousel = {
  Root: CarouselRoot,
  Viewport: CarouselViewport,
  Content: CarouselContent,
  Previous: CarouselPrevious,
  Next: CarouselNext,
  Indicators: CarouselIndicators,
}
