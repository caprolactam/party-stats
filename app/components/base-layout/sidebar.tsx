import type React from 'react'
import { NavLink, useLocation, useParams, href } from 'react-router'
import { cn } from '~/lib/utils.ts'
import { NATIONAL_AREA_CODE } from '~/shared/areas.ts'
import { Icon } from '../ui/icon.tsx'

const sidebarLinks: SidebarItemProps[] = [
  {
    label: '選挙結果',
    to: href('/areas/:areaCode/elections', {
      areaCode: '000001',
    }),
    icon: <Icon name="how-to-vote" size={16} />,
    prefetch: 'intent',
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  return (
    <nav aria-label="主要ナビゲーション" className={className}>
      <ul className="flex flex-col gap-0.5">
        <li>
          <SidebarItem
            label="ホーム"
            to={href('/')}
            end
            icon={<Icon name="home" size={16} />}
            prefetch="intent"
          />
        </li>
        <SiderbarAreaItem />
        <SiderbarElectiontem />
        <SidebarItem
          label="サイト情報"
          to={href('/about')}
          icon={<Icon name="info" size={16} />}
          end
          prefetch="intent"
        />
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
        'relative flex h-10 items-center gap-3 rounded-md px-3 text-sm hover:bg-hovered active:bg-selected',
        isActive ? 'bg-selected' : '',
        className,
      ])}
      {...props}
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'absolute inset-y-1/2 left-0 h-4 w-[3px] -translate-y-1/2 rounded-full bg-navigation',
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

function SiderbarAreaItem() {
  const { pathname } = useLocation()
  const { areaCode: areaCodeParam } = useParams()
  const areaCode = areaCodeParam ?? NATIONAL_AREA_CODE
  const activePaths = [
    href('/areas'),
    href('/areas/:areaCode', { areaCode }),
  ].filter(Boolean)
  const isActive = activePaths.includes(pathname)

  return (
    <NavLink
      to={href('/areas')}
      className={cn([
        'relative flex h-10 items-center gap-3 rounded-md px-3 text-sm hover:bg-hovered active:bg-selected',
        isActive ? 'bg-selected' : '',
      ])}
      prefetch="intent"
    >
      <span
        className={cn(
          'absolute inset-y-1/2 left-0 h-4 w-[3px] -translate-y-1/2 rounded-full bg-navigation',
          isActive ? 'opacity-100' : 'opacity-0',
        )}
        aria-hidden="true"
      />
      <Icon name="location-on" size={16} />
      <span className="flex-1 truncate font-medium">
        地域
      </span>
    </NavLink>
  )
}

function SiderbarElectiontem() {
  const { areaCode: areaCodeParam } = useParams()

  const areaCode = areaCodeParam ?? NATIONAL_AREA_CODE
  const to = href('/areas/:areaCode/elections', { areaCode })

  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn([
        'relative flex h-10 items-center gap-3 rounded-md px-3 text-sm hover:bg-hovered active:bg-selected',
        isActive ? 'bg-selected' : '',
      ])}
      prefetch="intent"
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'absolute inset-y-1/2 left-0 h-4 w-[3px] -translate-y-1/2 rounded-full bg-navigation',
              isActive ? 'opacity-100' : 'opacity-0',
            )}
            aria-hidden="true"
          />
          <Icon name="how-to-vote" size={16} />
          <span className="flex-1 truncate font-medium">
            選挙結果
          </span>
        </>
      )}
    </NavLink>
  )
}
