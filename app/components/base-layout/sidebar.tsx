import type { ReactNode } from 'react'
import { useState } from 'react'
import { cn } from '~/lib/utils.ts'

const defaultItems: SidebarNavItem[] = [
  {
    label: 'ダッシュボード',
    href: '/',
    isActive: true,
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    label: '選挙データ',
    children: [
      {
        label: '衆議院選挙',
        href: '/elections/house-representatives',
      },
      {
        label: '参議院選挙',
        href: '/elections/house-councillors',
      },
      {
        label: '地方選挙',
        href: '/elections/local',
      },
    ],
  },
  {
    label: '政党情報',
    children: [
      {
        label: '政党一覧',
        href: '/parties',
      },
      {
        label: '政党比較',
        href: '/parties/comparison',
      },
    ],
  },
  {
    label: '統計分析',
    href: '/analytics',
  },
]

interface SidebarProps {
  /**
   * ナビゲーションアイテムのリスト
   */
  navigationItems?: SidebarNavItem[]
  className?: string
}

/**
 * サイドバーコンポーネント
 *
 * デスクトップ: 固定サイドバーとして表示（260px幅）
 * モバイル: ドロワーメニューとして表示（後で実装）
 */
export function Sidebar({ navigationItems = [], className }: SidebarProps) {
  // デフォルトのナビゲーションアイテム（開発用）

  const items = navigationItems.length > 0 ? navigationItems : defaultItems

  return (
    <nav aria-label="主要ナビゲーション" className={cn('grid gap-1', className)}>
      {items.map((item, index) => (
        <SidebarNavItem
          key={`${item.label}-${index}`}
          item={item}
        />
      ))}
    </nav>
  )
}

interface SidebarNavItem {
  /**
   * ナビゲーションアイテムのテキスト
   */
  label: string
  /**
   * リンク先のURL
   */
  href?: string
  /**
   * アイテムがアクティブかどうか
   */
  isActive?: boolean
  /**
   * 子要素（入れ子ナビゲーション用）
   */
  children?: SidebarNavItem[]
  /**
   * アイコン要素
   */
  icon?: ReactNode
}

/**
 * 個別のナビゲーションアイテムコンポーネント
 */
function SidebarNavItem({ item, level = 0 }: { item: SidebarNavItem, level?: number }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasChildren = item.children && item.children.length > 0

  const paddingLeft = `${(level + 1) * 16}px`

  return (
    <div>
      <div
        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-hovered hover:text-sidebar-accent-foreground ${
          item.isActive ? 'bg-selected text-sidebar-accent-foreground' : ''
        }`}
        style={{ paddingLeft }}
      >
        {/* アイコン */}
        {item.icon && (
          <span className="flex h-4 w-4 shrink-0 items-center justify-center">
            {item.icon}
          </span>
        )}

        {/* ラベル */}
        {item.href
          ? (
              <a
                href={item.href}
                className="flex-1 truncate"
                title={item.label}
              >
                {item.label}
              </a>
            )
          : (
              <span className="flex-1 truncate" title={item.label}>
                {item.label}
              </span>
            )}

        {/* 展開/折りたたみボタン */}
        {hasChildren && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded hover:bg-sidebar-accent-foreground/10"
            aria-label={isExpanded ? 'サブメニューを閉じる' : 'サブメニューを開く'}
            aria-expanded={isExpanded}
          >
            <svg
              className={`h-3 w-3 transition-transform duration-200 ${
                isExpanded ? 'rotate-90' : 'rotate-0'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </div>

      {/* 子要素 */}
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {item.children!.map((child, index) => (
            <SidebarNavItem
              key={`${child.label}-${index}`}
              item={child}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
