import { cn } from '#src/utils/misc.ts'

export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      className={cn('bg-brand-5 h-2 w-40 animate-pulse rounded', className)}
    />
  )
}
