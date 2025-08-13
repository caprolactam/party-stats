import { Button } from '~/components/ui/button.tsx'
import { Icon } from '~/components/ui/icon.tsx'
import { useTheme } from '~/lib/theme.tsx'
import type { ResolvedTheme } from '~/lib/theme.tsx'
import { useHydrated } from '~/lib/use-hydrated.ts'

const ThemeVariants: Record<ResolvedTheme, {
  icon: React.ReactNode
  label: string
}> = {
  light: {
    icon: <Icon name="wb-sunny" size={16} />,
    label: 'ダークモードに切り替える',
  },
  dark: {
    icon: <Icon name="dark-mode" size={16} />,
    label: 'ライトモードに切り替える',
  },
}

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme()
  const { icon, label } = ThemeVariants[resolvedTheme]

  const isHydrated = useHydrated()

  // ハイドレーション前後での内容のミスマッチを防ぐ
  const title = isHydrated ? label : 'テーマを切り替える'
  const themeIcon = isHydrated
    ? icon
  // ハイドレーション前はテーマ状態が不明なので、CSSでアイコンを切り替えてフラッシュ（ちらつき）を防ぐ
    : (
        <>
          <div className="hidden dark:inline-flex">{ThemeVariants['dark'].icon}</div>
          <div className="inline-flex dark:hidden">{ThemeVariants['light'].icon}</div>
        </>
      )

  return (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      onClick={toggleTheme}
      title={title}
    >
      {themeIcon}
    </Button>
  )
}
