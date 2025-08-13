import { cn } from '~/lib/utils.ts'
import { BrandLogo } from '../brand-logo.tsx'
import { MobileMenuButton } from './mobile-menu-button.tsx'
import { ThemeToggle } from './theme-toggle.tsx'

interface HeaderProps {
  className?: string
}

export function Header({
  className,
}: HeaderProps) {
  return (
    <header
      className={cn('flex h-(--header-height) items-center gap-4', className)}
    >
      <MobileMenuButton className="lg:hidden" />
      <BrandLogo className="lg:hidden" />
      <div className="flex-1"></div>
      <ThemeToggle />
    </header>
  )
}
