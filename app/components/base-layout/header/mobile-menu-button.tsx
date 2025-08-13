import { Button } from '~/components/ui/button.tsx'
import { Icon } from '~/components/ui/icon.tsx'

// TODO: shadcnを用いてメニューの実装
/**
 * モバイル用ハンバーガーメニューボタン
 *
 * 開閉状態に応じてアイコンが変化：
 * - 閉状態: ハンバーガーアイコン（≡）
 * - 開状態: クローズアイコン（×）
 */
export function MobileMenuButton({ className }: { className?: string }) {
  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      className={className}
    >
      <Icon name="menu" size={16} />
    </Button>
  )
}
