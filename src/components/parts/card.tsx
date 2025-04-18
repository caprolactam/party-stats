import { Slot } from 'radix-ui'
import React from 'react'
import { cn } from '#src/utils/misc.ts'

interface CardProps extends React.ComponentPropsWithRef<'div'> {
  variant?: 'outline' | 'filled'
  asChild?: boolean
}

function Card({
  className,
  variant = 'filled',
  asChild = false,
  ...props
}: CardProps) {
  const Comp = asChild ? Slot.Root : 'div'

  return (
    <Comp
      className={cn(
        'rounded-lg',
        variant === 'outline' && 'border-brand-7 border',
        variant === 'filled' && 'bg-brand-3',
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({
  className,
  ...props
}: React.ComponentPropsWithRef<'div'>) {
  return (
    <div
      className={cn('flex flex-col gap-y-1 p-4', className)}
      {...props}
    />
  )
}

function CardTitle({
  className,
  ...props
}: React.ComponentPropsWithRef<'div'>) {
  return (
    <div
      className={cn(
        'text-xl leading-none font-semibold tracking-tight',
        className,
      )}
      {...props}
    />
  )
}

function CardDescription({
  className,
  ...props
}: React.ComponentPropsWithRef<'div'>) {
  return (
    <div
      className={cn('text-brand-11 text-sm', className)}
      {...props}
    />
  )
}

function CardContent({
  className,
  ...props
}: React.ComponentPropsWithRef<'div'>) {
  return (
    <div
      className={cn('p-4 pt-0', className)}
      {...props}
    />
  )
}

function CardFooter({
  className,
  ...props
}: React.ComponentPropsWithRef<'div'>) {
  return (
    <div
      className={cn('flex items-center p-4 pt-0', className)}
      {...props}
    />
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
