import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui'
import React from 'react'
import { cn } from '#src/utils/misc.ts'

function ToggleGroup({
  className,
  children,
  ...props
}: React.ComponentPropsWithRef<typeof ToggleGroupPrimitive.Root>) {
  return (
    <ToggleGroupPrimitive.Root
      className={cn(
        'border-brand-7 inline-flex h-10 items-center rounded-lg border',
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Root>
  )
}

function ToggleGroupItem({
  className,
  children,
  ...props
}: React.ComponentPropsWithRef<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      className={cn(
        'data-[state=on]:bg-brand-5 [&_]:hover:bg-brand-4 [&_]:active:bg-brand-5 relative inline-flex h-full shrink-0 grow items-center justify-center gap-2 rounded-none border-l px-4 text-sm font-medium shadow-none first:rounded-l-lg first:border-l-0 last:rounded-r-lg focus-visible:z-10',
        className,
      )}
      {...props}
    >
      {children}
      <div className='absolute inset-x-0 inset-y-1/2 h-12 -translate-y-1/2' />
    </ToggleGroupPrimitive.Item>
  )
}

export { ToggleGroup, ToggleGroupItem }
