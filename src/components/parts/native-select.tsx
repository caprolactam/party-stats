import { cn } from '#src/utils/misc'

export function selectStyles(className?: string) {
  return cn(
    'border-brand-7 hover:bg-brand-4 hover:border-brand-8 focus-visible:bg-brand-5 active:bg-brand-5 relative inline-flex h-8 shrink-0 items-center rounded-md border pl-2 text-sm select-none',
    className,
  )
}
