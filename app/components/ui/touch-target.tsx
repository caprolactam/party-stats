import type React from 'react'
import * as Slot from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '~/lib/utils.ts'

/**
 * `before`疑似要素を使用して、視覚的要素を変更せずに44pxのタッチ可能領域を確保します。
 *
 * **重要**: このバリアントを使用する要素には、`relative`クラスを含める必要があります。
 * `before`疑似要素が`absolute`配置のため、親要素に`relative`が必要です。
 *
 * @example
 * ```tsx
 * // 直接使用する場合（relativeクラスが必要）
 * <button className={cn('relative', touchTargetVariants({ stretch: 'vertical' }))}>
 *   小さなボタン
 * </button>
 * ```
  *
 */
export const touchTargetVariants = cva('before:absolute', {
  variants: {
    stretch: {
      // 縦方向に引き延ばし、横幅は最小44pxを確保
      vertical: 'before:inset-x-1/2 before:h-full before:min-w-11 before:-translate-x-1/2',
      // 横方向に引き延ばし、高さは最小44pxを確保
      horizontal: 'before:inset-y-1/2 before:min-h-11 before:w-full before:-translate-y-1/2',
      // 中央配置で44px × 44pxのタッチターゲットを確保
      false: 'before:inset-1/2 before:size-11 before:-translate-x-1/2 before:-translate-y-1/2',
    },
  },
  defaultVariants: {
    stretch: false,
  },
})

export interface TouchTargetProps extends React.ComponentPropsWithRef<typeof Slot.Root> {
  /**
   * - vertical: 縦方向に引き延ばし、横幅は最小44pxを確保
   * - horizontal: 横方向に引き延ばし、高さは最小44pxを確保
   * - false: 中央配置で44px × 44pxのタッチターゲットを確保
   */
  stretch?: 'vertical' | 'horizontal' | false
}
/**
 * アクセシビリティに配慮した最小44pxのタッチターゲットを提供するコンポーネント
 *
 * このコンポーネントは視覚的なデザインを変更することなく、タッチ・クリック可能な
 * 領域を最小44pxに拡張します。小さなボタンやリンクのアクセシビリティ向上に使用します。
 *
 * **Radix UI Slotパターン**: 子要素のpropsとマージし合成します。
 *
 * @example
 * ```tsx
 * <TouchTarget stretch="vertical">
 *   <button className="h-20 w-8 bg-blue-500">|</button>
 * </TouchTarget>
 * ```
 *
 */
export function WithTouchTarget({
  stretch = false,
  className,
  children,
  ...props
}: TouchTargetProps) {
  return (
    <Slot.Root
      {...props}
      className={cn('relative', touchTargetVariants({ stretch }), className)}
    >
      {children}
    </Slot.Root>
  )
}
