import { useFetcher } from 'react-router'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '~/components/ui/sheet.tsx'

const FETCHER_KEY = 'area-change-sheet'

interface AreaChangeSheetProps {
  children?: React.ReactNode
}

export function AreaChangeSheet({ children }: AreaChangeSheetProps) {
  const fetcher = useFetcher({ key: FETCHER_KEY })

  return (
    <Sheet>
      {children}
      <SheetContent>
        <SheetHeader>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
}

interface AreaChangeSheetTriggerProps extends React.ComponentPropsWithRef<typeof SheetTrigger> {
  currentAreaCode: string
}

export function AreaChangeSheetTrigger({ currentAreaCode, onClick, ...props }: AreaChangeSheetTriggerProps) {
  const fetcher = useFetcher({ key: FETCHER_KEY })

  return (
    <SheetTrigger
      {...props}
      onClick={(e) => {
        onClick?.(e)
      }}
    />
  )
}
