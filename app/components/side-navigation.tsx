import { Home, BarChart3, Users, MapPin, Map, GitCompare, Info, ChevronDown } from 'lucide-react'
import React from 'react'
import { Link, useLocation } from 'react-router'
import { cn } from '~/utils/misc.ts'

interface NavigationItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  children?: NavigationItem[]
}

interface SideNavigationProps {
  className?: string
  isOpen?: boolean
  onClose?: () => void
}

// ナビゲーションアイテムの定義
const navigationItems: NavigationItem[] = [
  {
    label: 'ホーム',
    href: '/',
    icon: Home,
  },
  {
    label: '選挙一覧',
    href: '/elections',
    icon: BarChart3,
    children: [
      { label: '選挙一覧', href: '/elections' },
      { label: '最新選挙', href: '/elections/2024' },
    ],
  },
  {
    label: '政党一覧',
    href: '/parties',
    icon: Users,
    children: [
      { label: '政党一覧', href: '/parties' },
    ],
  },
  {
    label: '地域一覧',
    href: '/regions',
    icon: MapPin,
    children: [
      { label: '地域一覧', href: '/regions' },
      { label: '地域マップ', href: '/map' },
    ],
  },
  {
    label: '地域マップ',
    href: '/map',
    icon: Map,
  },
  {
    label: '比較機能',
    href: '/compare',
    icon: GitCompare,
    children: [
      { label: '選挙比較', href: '/compare/elections' },
      { label: '政党比較', href: '/compare/parties' },
      { label: '地域比較', href: '/compare/regions' },
    ],
  },
  {
    label: 'このサイトについて',
    href: '/about',
    icon: Info,
  },
]

// ナビゲーションアイテムコンポーネント
function NavigationItemComponent({ item, level = 0 }: { item: NavigationItem, level?: number }) {
  const location = useLocation()
  const [isExpanded, setIsExpanded] = React.useState(false)
  const hasChildren = item.children && item.children.length > 0
  const isActive = location.pathname === item.href
  const isParentActive = item.children?.some((child) => location.pathname === child.href)

  // 親が現在のパスに関連している場合は展開状態を保持
  React.useEffect(() => {
    if (isParentActive) {
      setIsExpanded(true)
    }
  }, [isParentActive])

  const handleToggle = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded)
    }
  }

  const Icon = item.icon

  return (
    <div>
      <Link
        to={item.href}
        onClick={hasChildren ? handleToggle : undefined}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground',
          level > 0 && 'ml-6',
          isActive && 'bg-accent font-medium text-accent-foreground',
          isParentActive && !isActive && 'text-muted-foreground',
        )}
      >
        {Icon && <Icon className="h-4 w-4" />}
        <span className="flex-1">{item.label}</span>
        {hasChildren && (
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              isExpanded && 'rotate-180',
            )}
          />
        )}
      </Link>
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {item.children?.map((child) => (
            <NavigationItemComponent
              key={child.href}
              item={child}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function SideNavigation({ className, isOpen: _isOpen, onClose: _onClose }: SideNavigationProps) {
  return (
    <nav
      className={cn(
        'flex flex-col bg-background',
        className,
      )}
    >
      <div className="flex flex-col space-y-1 p-4">
        {/* 主要ナビゲーション */}
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <NavigationItemComponent key={item.href} item={item} />
          ))}
        </div>

      </div>
    </nav>
  )
}
