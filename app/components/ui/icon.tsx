import type { SVGProps } from 'react'
import { cn } from '~/lib/utils.ts'
import href from '../icons/sprite.svg?url'
import type { IconName } from '@/icon-name'

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name' | 'children'> {
  /**
   * アイコンの選択
   */
  name: IconName
  /**
   * アイコンのサイズ
   * `width` と `height` の両方を一括して設定します。`width` や `height` を指定するとそちらが優先されます。
   */
  size?: number | string
}

export function Icon({
  name,
  className,
  size = '1em',
  width,
  height,
  'aria-hidden': ariaHidden = true,
  ...props
}: IconProps) {
  return (
    <svg
      {...props}
      className={cn(
        'inline shrink-0 fill-current object-contain text-current',
        className,
      )}
      width={width ?? size}
      height={height ?? size}
      aria-hidden={ariaHidden}
    >
      <use href={`${href}#${name}`} />
    </svg>
  )
}
