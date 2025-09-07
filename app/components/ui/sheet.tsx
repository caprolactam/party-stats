import React from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { TargetAndTransition } from 'motion/react'
import {
  Dialog,
  DialogTrigger as AriaDialogTrigger,
  Button,
  Heading,
  Modal,
  ModalOverlay,
  OverlayTriggerStateContext,
  composeRenderProps,
} from 'react-aria-components'
import type { DialogProps as AriaDialogProps } from 'react-aria-components'
import { useIsMobile } from '~/lib/use-media-query.ts'
import { cn } from '~/lib/utils.ts'
import { buttonVariants } from './button.tsx'
import { Icon } from './icon.tsx'

interface SheetContextValue {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}
const SheetContext = React.createContext<SheetContextValue | undefined>(undefined)

function useSheetContext() {
  const context = React.use(SheetContext)
  if (context === undefined) {
    throw new Error('useSheetContext must be used within a Sheet')
  }
  return context
}

function SheetTrigger({ children, ...props }: Omit<React.ComponentPropsWithRef<typeof AriaDialogTrigger>,
  | 'isOpen'
  | 'defaultOpen'
  | 'onOpenChange'
>) {
  const [open, setOpen] = React.useState(false)
  return (
    <AriaDialogTrigger {...props} isOpen={open} onOpenChange={setOpen}>
      <SheetContext value={{ isOpen: open, setIsOpen: setOpen }}>
        {children}
      </SheetContext>
    </AriaDialogTrigger>
  )
}

const MotionModal = motion.create(Modal)
const MotionModalOverlay = motion.create(ModalOverlay)

interface SheetContentProps extends Omit<AriaDialogProps,
  | 'role'
> {
  title: string
}
function SheetContent({
  title,
  children,
  ...props
}: SheetContentProps) {
  const { isOpen, setIsOpen } = useSheetContext()
  const isMobile = useIsMobile()
  // モバイルの場合は下から上へ、それ以外は右から左へ
  const slideDirection = isMobile ? 'bottom' : 'right'

  const variants = {
    bottom: {
      initial: { y: '100%' },
      animate: {
        y: 0,
        transition: { type: 'spring', duration: 0.5, bounce: 0 },
      },
      exit: {
        y: '100%',
        transition: { type: 'spring', duration: 0.3, bounce: 0 },
      },
    },
    right: {
      initial: { x: '100%' },
      animate: {
        x: 0,
        transition: { type: 'spring', duration: 0.5, bounce: 0 },
      },
      exit: {
        x: '100%',
        transition: { type: 'spring', duration: 0.3, bounce: 0 },
      },
    },
  } satisfies Record<'bottom' | 'right', Record<'initial' | 'animate' | 'exit', TargetAndTransition>>

  return (
    <AnimatePresence>
      {isOpen && (
        <MotionModalOverlay
          isOpen
          onOpenChange={setIsOpen}
          isDismissable
          className="fixed inset-0 z-50 bg-black/80"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: { type: 'spring', duration: 0.5, bounce: 0 },
          }}
          exit={{
            opacity: 0,
            transition: { type: 'spring', duration: 0.3, bounce: 0 },
          }}
        >
          <MotionModal
            className={cn(
              // will-changeを解釈し最適化する時間がないので、`will-change-transform`は指定しない。
              // https://developer.mozilla.org/ja/docs/Web/CSS/will-change
              'fixed z-50 bg-background',
              {
                'inset-x-0 bottom-0 max-h-[85vh] rounded-t-xl': slideDirection === 'bottom',
                'inset-y-0 right-0 max-h-full w-3/4 sm:max-w-sm': slideDirection === 'right',
              },
            )}
            {...variants[slideDirection]}
          >
            <Dialog
              role="dialog"
              className="h-full overflow-auto"
            >
              {composeRenderProps(children, (children) => (
                <>
                  <div className="sticky top-0">
                    <div className="relative flex h-14 w-full items-center bg-background">
                      <Heading className="flex w-full items-center justify-center px-4 font-semibold" slot="title">{title}</Heading>
                      <div className="absolute inset-y-0 right-4 inline-flex items-center">
                        <Button
                          slot="close"
                          className={buttonVariants({
                            variant: 'ghost',
                            size: 'icon',
                          })}
                        >
                          <Icon name="close" size={16} />
                          <span className="sr-only">閉じる</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                  {children}
                </>
              ))}
            </Dialog>
          </MotionModal>
        </MotionModalOverlay>
      )}
    </AnimatePresence>
  )
}

function useSheetClose() {
  const state = React.use(OverlayTriggerStateContext)
  if (!state) {
    throw new Error('useSheetClose must be used within a Sheet')
  }
  return state.close
}

export {
  SheetTrigger,
  SheetContent,
  useSheetClose,
}
