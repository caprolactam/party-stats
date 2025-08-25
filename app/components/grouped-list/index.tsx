import type React from 'react'
import { useState, useRef, useEffect, createContext, use, useId, useLayoutEffect, useMemo, useCallback } from 'react'
import { Slot } from 'radix-ui'
import { createPortal } from 'react-dom'
import { RemoveScroll } from 'react-remove-scroll'
import { useHydrated } from '~/lib/use-hydrated.ts'
import { isIOS } from './browser.ts'
import { isMultiTouchDevice } from './device.ts'

interface GroupedListContextValue {
  jumpIndexRef: React.RefObject<HTMLDivElement | null>
  group: (value: string, ref: React.RefObject<HTMLDivElement | null>) => () => void
  onPress: (event: React.PointerEvent<HTMLDivElement>) => void
  onRelease: (event: React.PointerEvent<HTMLDivElement>) => void
  onDrag: (event: React.PointerEvent<HTMLDivElement>) => void
}

const GroupedListContext = createContext<GroupedListContextValue | null>(null)

function useGroupedListContext() {
  const context = use(GroupedListContext)
  if (!context) {
    throw new Error('GroupedList components must be used within a <GroupedList> component.')
  }
  return context
}

export interface GroupedListProps extends React.ComponentPropsWithRef<'div'> {
  asChild?: boolean
}

export function GroupedListRoot({
  children,
  className,
  asChild = false,
  ...props
}: GroupedListProps) {
  const [isDragging, setIsDragging] = useState(false)
  const jumpIndexRef = useRef<HTMLDivElement | null>(null)
  const allGroupsRef = useRef<Map<string, React.RefObject<HTMLDivElement | null>>>(new Map()) // value => groupRef
  const pointerStartRef = useRef<number | null>(null)
  const isAllowedToDrag = useRef<boolean>(false)

  const isHydrated = useHydrated()

  const schedule = useScheduleLayoutEffect()

  const handleJumpTo = useCallback((value: string) => {
    const ref = allGroupsRef.current.get(value)
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'instant', block: 'start' })
    }
  }, [])

  function onPress(e: React.PointerEvent<HTMLDivElement>) {
    if (!jumpIndexRef.current || !jumpIndexRef.current.contains(e.target as Node)) return

    setIsDragging(true)

    // iOS doesn't trigger mouseUp after scrolling so we need to listen to touched in order to disallow dragging
    if (isIOS()) {
      window.addEventListener('touchend', () => (isAllowedToDrag.current = false), { once: true })
    }

    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    pointerStartRef.current = e.pageY
  }

  function onRelease(e: React.PointerEvent<HTMLDivElement>) {
    // if (!jumpIndexRef.current || !isDragging) return

    isAllowedToDrag.current = false
    setIsDragging(false)
    pointerStartRef.current = null
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
  }

  function onDrag(e: React.PointerEvent<HTMLDivElement>) {
    // if (!jumpIndexRef.current || !isDragging) return
  }

  const context = useMemo(() => ({
    jumpIndexRef,
    group: (value, ref) => {
      allGroupsRef.current.set(value, ref)
      // update ref and re-render one time
      schedule(1, () => {})

      return () => {
        allGroupsRef.current.delete(value)
        schedule(2, () => {})
      }
    },
    onPress,
    onRelease,
    onDrag,
  }), [schedule]) satisfies GroupedListContextValue

  const Comp = asChild ? Slot.Root : 'div'

  return (
    <Comp
      {...props}
      className={className}
    >
      <GroupedListContext.Provider value={context}>
        <Slot.Slottable>{children}</Slot.Slottable>
        {isHydrated && createPortal(
          (
            <RemoveScroll enabled={isDragging && allGroupsRef.current.size > 0}>
              <JumpIndex>
                {Array.from(allGroupsRef.current.keys()).map((value) => (
                  <JumpIndexItem key={value}>
                    {value}
                  </JumpIndexItem>
                ))}
              </JumpIndex>
            </RemoveScroll>
          ),
          document.body,
        )}
      </GroupedListContext.Provider>
    </Comp>
  )
}

export interface GroupedListGroupProps extends React.ComponentPropsWithRef<'div'> {
  heading: React.ReactNode
  value: string
  asChild?: boolean
}

export function GroupedListGroup({
  children,
  className,
  heading,
  value,
  asChild = false,
  ...props
}: GroupedListGroupProps) {
  const Comp = asChild ? Slot.Root : 'div'
  const headingId = useId()
  const headingRef = useRef<HTMLDivElement>(null)

  const { group } = useGroupedListContext()

  useEffect(() => {
    const cleanup = group(value, headingRef)

    return cleanup
  }, [group, value])

  return (
    <Comp
      {...props}
      className={className}
    >
      <div ref={headingRef} id={headingId} data-grouped-list-heading="">
        {heading}
      </div>
      <Slot.Slottable>{children}</Slot.Slottable>
    </Comp>
  )
}

export interface GroupedListItemProps extends React.ComponentPropsWithRef<'div'> {
  asChild?: boolean
}

export function GroupedListItem({
  children,
  className,
  asChild = false,
  ...props
}: GroupedListItemProps) {
  const Comp = asChild ? Slot.Root : 'div'

  return (
    <Comp
      {...props}
      className={className}
    >
      {children}
    </Comp>
  )
}

function JumpIndex({ children }: { children?: React.ReactNode }) {
  const {
    jumpIndexRef,
    onPress,
    onRelease,
    onDrag,
  } = useGroupedListContext()

  return (
    <div
      className="fixed top-1/2 right-0 z-40 -translate-y-1/2"
      ref={jumpIndexRef}
      onPointerDown={onPress}
      onPointerMove={onDrag}
      onPointerUp={onRelease}
      onPointerCancel={onRelease}
    >
      <div className="grid">
        {children}
      </div>
    </div>
  )
}

function JumpIndexItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-4 p-0.5 text-right text-xs font-semibold text-navigation select-none">
      {children}
    </div>
  )
}

export const GroupedList = Object.assign(GroupedListRoot, {
  Group: GroupedListGroup,
  Item: GroupedListItem,
})

const useScheduleLayoutEffect = () => {
  const [s, ss] = useState<object>()
  const fns = useRef(new Map<string | number, () => void>())

  useLayoutEffect(() => {
    fns.current.forEach((f) => f())
    fns.current = new Map()
  }, [s])

  const fn = useCallback((id: string | number, cb: () => void) => {
    fns.current.set(id, cb)
    ss({})
  }, [])

  return fn

  // return (id: string | number, cb: () => void) => {
  //   fns.current.set(id, cb)
  //   ss({})
  // }
}
