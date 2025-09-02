import React from 'react'
import { Separator as SeparatorPrimitive } from 'radix-ui'

import { cn } from '~/lib/utils'

function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  muted = false,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root> & {
  /**
   * セパレーターの色を変えます。
   */
  muted?: boolean
}) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
        muted ? 'bg-border/70' : 'bg-border',
        className,
      )}
      {...props}
    />
  )
}

export { Separator }
