import { useFetcher } from 'react-router'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '~/components/ui/sheet.tsx'

const FETCHER_KEY = 'election-change-sheet'

interface ElectionChangeSheetProps {
  children?: React.ReactNode
}

export function ElectionChangeSheet({ children }: ElectionChangeSheetProps) {
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

interface ElectionChangeSheetTriggerProps extends React.ComponentPropsWithRef<typeof SheetTrigger> {
  currentElectionId: string
}

export function ElectionChangeSheetTrigger({ currentElectionId, onClick, ...props }: ElectionChangeSheetTriggerProps) {
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
