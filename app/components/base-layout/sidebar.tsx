import type React from 'react'
import { NavLink } from 'react-router'
import { cn } from '~/lib/utils.ts'
import { Icon } from '../ui/icon.tsx'

const sidebarLinks: SidebarItemProps[] = [
  {
    label: 'ホーム',
    to: '/',
    end: true,
    icon: <Icon name="home" size={16} />,
    prefetch: 'intent',
  },
  {
    label: '選挙結果',
    to: '/elections',
    icon: <Icon name="how-to-vote" size={16} />,
    prefetch: 'intent',
  },
  {
    label: '地域',
    to: '/areas',
    icon: <Icon name="location-on" size={16} />,
    end: true,
    prefetch: 'intent',
  },
  {
    label: 'サイト情報',
    to: '/about',
    icon: <Icon name="info" size={16} />,
    end: true,
    prefetch: 'intent',
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  return (
    <nav aria-label="主要ナビゲーション" className={className}>
      <ul className="grid gap-0.5">
        {sidebarLinks.map((linkProps, index) => (
          <li
            key={`${linkProps.label}-${index}`}
          >
            <SidebarItem
              {...linkProps}
            />
          </li>
        ))}
      </ul>
    </nav>
  )
}

interface SidebarItemProps extends React.ComponentPropsWithRef<typeof NavLink> {
  /**
   * ナビゲーションアイテムのテキスト
   */
  label: string
  icon: React.ReactNode
}

function SidebarItem({ to, className, icon, label, ...props }: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn([
        'relative flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium hover:bg-hovered active:bg-selected',
        isActive ? 'bg-selected' : '',
        className,
      ])}
      {...props}
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'absolute inset-y-1/2 left-0 h-4 w-[3px] -translate-y-1/2 rounded-full bg-red-500',
              isActive ? 'opacity-100' : 'opacity-0',
            )}
            aria-hidden="true"
          />
          {icon}
          <span className="flex-1 truncate font-medium">
            {label}
          </span>
        </>
      )}
    </NavLink>
  )
}
