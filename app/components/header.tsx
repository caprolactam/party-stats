import { Moon, Sun, Menu } from 'lucide-react'
import { Link } from 'react-router'
import { cn } from '~/utils/misc.ts'
import { useTheme } from '~/utils/theme.tsx'
import { useHydrated } from '~/utils/use-hydrated.ts'
import { Button } from './ui/button.tsx'
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from './ui/navigation-menu.tsx'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet.tsx'
import { WithTouchTarget } from './ui/touch-target.tsx'

// ナビゲーションメニューの項目
const navigationItems = [
  {
    title: '選挙',
    href: '/elections',
    description: '選挙結果と分析',
    children: [
      { title: '選挙一覧', href: '/elections', description: '過去の選挙結果を閲覧' },
      { title: '最新選挙', href: '/elections/2024', description: '2024年の選挙結果' },
    ],
  },
  {
    title: '政党',
    href: '/parties',
    description: '政党情報と分析',
    children: [
      { title: '政党一覧', href: '/parties', description: '全政党の情報と実績' },
    ],
  },
  {
    title: '地域',
    href: '/regions',
    description: '地域別選挙分析',
    children: [
      { title: '地域一覧', href: '/regions', description: '都道府県・市区町村別結果' },
      { title: '地域マップ', href: '/map', description: 'インタラクティブな地図表示' },
    ],
  },
  {
    title: '比較',
    href: '/compare',
    description: '比較・分析ツール',
    children: [
      { title: '選挙比較', href: '/compare/elections', description: '複数選挙の比較分析' },
      { title: '政党比較', href: '/compare/parties', description: '複数政党の比較分析' },
      { title: '地域比較', href: '/compare/regions', description: '複数地域の比較分析' },
    ],
  },
]

interface HeaderProps {
  className?: string
}
export function Header({ className }: HeaderProps) {
  return (
    <header
      className={cn(
        className,
      )}
    >
      <div className="container flex h-14 items-center md:h-16">
        {/* ロゴエリア */}
        <div className="mr-4 flex lg:mr-6">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold">選挙統計</span>
          </Link>
        </div>

        {/* デスクトップナビゲーション */}
        <div className="mr-4 hidden lg:flex">
          <NavigationMenu>
            <NavigationMenuList>
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            className="flex h-full w-full flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none select-none focus:shadow-md"
                            to={item.href}
                          >
                            <div className="mt-4 mb-2 text-lg font-medium">
                              {item.title}
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              {item.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      {item.children?.map((child) => (
                        <li key={child.href}>
                          <NavigationMenuLink asChild>
                            <Link
                              className="block space-y-1 rounded-md p-3 leading-none no-underline outline-none select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              to={child.href}
                            >
                              <div className="text-sm leading-none font-medium">
                                {child.title}
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {child.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* 右側ユーティリティエリア */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* 検索機能等が必要な場合はここに追加 */}
          </div>
          <nav className="flex items-center">
            <ThemeToggle />
            <MobileNavigation />
          </nav>
        </div>
      </div>
    </header>
  )
}

// モバイル用ナビゲーションメニュー
function MobileNavigation() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="ナビゲーションメニューを開く"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <nav className="flex flex-col space-y-4">
          <Link
            to="/"
            className="text-lg font-semibold"
          >
            選挙統計
          </Link>
          <div className="flex flex-col space-y-2">
            {navigationItems.map((item) => (
              <div key={item.href} className="space-y-2">
                <Link
                  to={item.href}
                  className="block font-medium text-foreground hover:text-primary"
                >
                  {item.title}
                </Link>
                {item.children && (
                  <div className="ml-4 space-y-2">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        to={child.href}
                        className="block text-sm text-muted-foreground hover:text-foreground"
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}

const ThemeVariants: Record<'light' | 'dark', {
  icon: React.ReactNode
  label: string
}> = {
  light: {
    icon: <Sun className="size-4" />,
    label: 'ダークモードに切り替え',
  },
  dark: {
    icon: <Moon className="size-4" />,
    label: 'ライトモードに切り替え',
  },
}

function ThemeToggle() {
  const { resolvedTheme: theme, toggleTheme } = useTheme()
  const { label } = ThemeVariants[theme]

  return (
    <WithTouchTarget stretch={false}>
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        aria-label={label}
        title={label}
      >
        <ThemeIcon theme={theme} />
      </Button>
    </WithTouchTarget>
  )
}

function ThemeIcon({ theme }: { theme: 'light' | 'dark' }) {
  const isHydrated = useHydrated()

  // ハイドレーション前はcssでアイコンの表示を切り替える
  if (!isHydrated)
    return (
      <>
        <div className="hidden dark:inline-flex">{ThemeVariants['dark'].icon}</div>
        <div className="inline-flex dark:hidden">{ThemeVariants['light'].icon}</div>
      </>
    )

  return ThemeVariants[theme].icon
}
