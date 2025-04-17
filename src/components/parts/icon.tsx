import { type SVGProps } from 'react'
import { cn } from '#src/utils/misc'
import { type IconName } from '@/icon-name'

export { IconName }

export function Icon({
  name,
  className,
  size,
  width,
  height,
  'aria-hidden': ariaHidden = true,
  children: _,
  ...props
}: SVGProps<SVGSVGElement> & {
  name: IconName
  size?: number | string
}) {
  return (
    <svg
      {...props}
      className={cn(
        'inline shrink-0 fill-current object-contain text-current',
        className,
      )}
      width={size ?? width}
      height={size ?? height}
      aria-hidden={ariaHidden}
    >
      <use href={`/sprite.svg#${name}`} />
    </svg>
  )
}
