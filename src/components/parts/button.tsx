import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import React from 'react'

import { cn } from '#src/utils/misc'

const buttonVariants = cva(
  'data-disabled:bg-brand-4 disabled:bg-brand-4 data-disabled:text-brand-9 disabled:text-brand-9 inline-flex items-center justify-center gap-2 rounded-sm text-sm font-medium whitespace-nowrap select-none disabled:pointer-events-none data-disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default:
          'bg-brand-5 text-brand-12 hover:bg-brand-6 active:bg-brand-7 focus-visible:bg-brand-7',
        outline:
          'bg-brand-1 border-brand-7 hover:bg-brand-4 hover:border-brand-8 active:bg-brand-5 focus-visible:bg-brand-5 border',
        ghost:
          'text-brand-12 hover:bg-brand-4 active:bg-brand-5 focus-visible:bg-brand-5',
        accent:
          'bg-brand-12 text-brand-1 hover:bg-brand-11 active:bg-brand-11 focus-visible:bg-brand-11',
      },
      size: {
        sm: 'h-8',
        md: 'h-9',
        lg: 'h-10',
      },
      withIcon: {
        leading: 'pr-4 pl-2',
        trailing: 'pr-2 pl-4',
        false: 'px-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'lg',
      withIcon: false,
    },
  },
)

export interface ButtonProps
  extends React.ComponentPropsWithRef<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  withIcon,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className, withIcon }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
