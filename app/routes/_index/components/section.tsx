import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { cn } from '~/lib/utils.ts'

interface SectionContainerProps {
  children: ReactNode
  className?: string
  title: string
  description?: string
}

export function SectionContainer({
  children,
  className,
  title,
  description,
}: SectionContainerProps) {
  const hasDescription = !!description

  return (
    <section
      className={cn('grid gap-(--space-sm)', className)}
    >
      {hasDescription
        ? (
            <>
              <h2 className="text-lg leading-none font-bold tracking-tight text-foreground">
                {title}
              </h2>
              <p className="text-base leading-none text-muted-foreground">
                {description}
              </p>
            </>
          )
        : <h2 className="text-xl leading-none font-bold tracking-tight text-foreground">{title}</h2>}
      {children}
    </section>
  )
}

interface SelectionGridProps {
  children: ReactNode
  className?: string
}

export function SelectionGrid({
  children,
  className,
}: SelectionGridProps) {
  return (
    <ul className={cn(
      'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      className,
    )}
    >
      {children}
    </ul>
  )
}

interface SelectionCardProps {
  title: string
  description?: string
  href: string
  icon?: ReactNode
  className?: string
  onClick?: () => void
}

export function SelectionCard({
  title,
  description,
  href,
  icon,
  className,
}: SelectionCardProps) {
  return (
    <li>
      <Link
        to={href}
        className={cn('group flex items-center gap-4 py-2 pr-4', className)}
      >
        <div
          className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md border"
          aria-hidden="true"
        >
          {/* 例示のプレースホルダ（差し替えてください） */}
          {icon ?? (
            <div className="size-full" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium underline-offset-2 group-hover:underline md:text-base">
            {title}
          </div>
          {description && (
            <div className="truncate text-xs text-muted-foreground md:text-sm">
              {description}
            </div>
          )}
        </div>
      </Link>
    </li>
  )
}
