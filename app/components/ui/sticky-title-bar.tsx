import { useEffect, useRef, useState, createContext, use } from 'react'
import { Link } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { Icon } from './icon.tsx'
import { WithTouchTarget } from './touch-target.tsx'

interface StickyTitleBarContextValue {
  showStickyTitle: boolean
  setShowStickyTitle: (show: boolean) => void
  stickyContainerRef: React.RefObject<HTMLDivElement | null>
}

const StickyTitleBarContext = createContext<StickyTitleBarContextValue | null>(null)

function useStickyTitleBarContext() {
  const context = use(StickyTitleBarContext)
  if (!context) {
    throw new Error('StickyTitleBar components must be used within StickyTitleBar')
  }
  return context
}

interface StickyTitleBarProps {
  title: string
  backLink?: {
    to: string
    label: string
  }
  children: React.ReactNode
}

function StickyTitleBar({ title, backLink, children }: StickyTitleBarProps) {
  const [showStickyTitle, setShowStickyTitle] = useState(false)
  const stickyContainerRef = useRef<HTMLDivElement | null>(null)

  const contextValue: StickyTitleBarContextValue = {
    showStickyTitle,
    setShowStickyTitle,
    stickyContainerRef,
  }

  return (
    <StickyTitleBarContext.Provider value={contextValue}>
      <div
        ref={stickyContainerRef}
        className="sticky top-0 z-50"
      >
        <div className="relative top-0 flex h-14 w-full items-center bg-background">
          {backLink
            ? (
                <div className="absolute inset-y-0 left-0 inline-flex items-center">
                  <WithTouchTarget stretch="horizontal">
                    <Link
                      to={backLink.to}
                      className="inline-flex gap-1 font-medium text-navigation hover:text-navigation-hovered active:text-navigation-selected"
                    >
                      <Icon name="chevron-left" size={22} />
                      {backLink.label}
                    </Link>
                  </WithTouchTarget>
                </div>
              )
            : null}
          <AnimatePresence initial={false} mode="sync">
            {showStickyTitle && (
              <motion.div
                key="sticky-title"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, type: 'tween', ease: 'linear' }}
                className="flex w-full items-center justify-center px-4 font-semibold"
              >
                {title}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {children}
    </StickyTitleBarContext.Provider>
  )
}

interface StickyTitleBarTriggerProps {
  children: React.ReactNode
}

function StickyTitleBarTrigger({ children }: StickyTitleBarTriggerProps) {
  const { setShowStickyTitle, stickyContainerRef } = useStickyTitleBarContext()
  const triggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!triggerRef.current || !stickyContainerRef.current) return

    // スティッキーコンテナの高さを取得
    const containerHeight = stickyContainerRef.current.offsetHeight

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        // triggerRef要素の下端がstickyContainerの下端に達したかを判定
        // isIntersecting が false になったとき = triggerの下端がコンテナの下端を通過したとき
        setShowStickyTitle(!entry.isIntersecting)
      },
      {
        // スティッキーコンテナの下端を基準点として設定
        // ビューポートの上端からcontainerHeight分下の位置で判定
        rootMargin: `-${containerHeight}px 0px 0px 0px`,
        threshold: 0,
      },
    )

    observer.observe(triggerRef.current)

    return () => {
      observer.disconnect()
    }
  }, [setShowStickyTitle, stickyContainerRef])

  return (
    <div ref={triggerRef}>
      {children}
    </div>
  )
}

StickyTitleBar.Trigger = StickyTitleBarTrigger

export { StickyTitleBar }
