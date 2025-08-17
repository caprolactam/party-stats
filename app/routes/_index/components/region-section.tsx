import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import { Icon } from '~/components/ui/icon.tsx'
import { cn } from '~/lib/utils.ts'
import type { Region } from '../types.ts'

interface RegionSectionProps {
  regions: Region[]
  className?: string
}

export function RegionSection({ regions, className }: RegionSectionProps) {
  const [areaMode, setAreaMode] = useState<'all' | Region['id']>('all')

  const isRegionMode = areaMode !== 'all'
  const selectedRegion = isRegionMode ? regions.find((region) => region.id === areaMode) : null
  const prefectures = selectedRegion ? selectedRegion.prefectures : []

  const handleRegionClick = (region: Region) => {
    setAreaMode(region.id)
  }

  const handleBackToNational = () => {
    setAreaMode('all')
  }

  const title = isRegionMode && selectedRegion
    ? `${selectedRegion.name}の都道府県`
    : '地域から探す'

  return (
    <section className={cn('grid gap-(--space-sm)', className)}>
      <h2
        className={cn('text-xl leading-none font-bold tracking-tight text-foreground', isRegionMode && 'sr-only')}
      >
        {title}
      </h2>
      <AnimatePresence>
        {isRegionMode && (
          <motion.button
            onClick={handleBackToNational}
            className="flex items-center text-sm font-bold text-blue-400"
          >
            全国
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isRegionMode ? 'prefecture-list' : 'region-list'}
          initial={{ x: isRegionMode ? 100 : -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: isRegionMode ? -100 : 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <SelectionGrid>
            {isRegionMode
              ? (
                  prefectures.map((prefecture) => (
                    <SelectionCard
                      key={prefecture.id}
                      title={prefecture.name}
                      href={`/prefectures/${prefecture.id}`}
                      icon="🏛️"
                    />
                  ))
                )
              : (
                  <>
                    <li className="col-span-full grid grid-cols-subgrid">
                      <NationalCard />
                    </li>
                    <RegionCards regions={regions} onRegionClick={handleRegionClick} />
                  </>
                )}
          </SelectionGrid>
        </motion.div>
      </AnimatePresence>
    </section>
  )
}

interface NationalCardProps {
  className?: string
}

function NationalCard({ className }: NationalCardProps = {}) {
  const title = '全国'
  const icon = '📍'
  return (
    <Link
      to="/elections/2024-house/areas/national"
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
        <motion.div
          // layoutId={BACK_TO_NATIONAL_ID}
          className="truncate text-sm font-medium underline-offset-2 group-hover:underline md:text-base"
        >
          {title}
        </motion.div>
      </div>
    </Link>
    // <li className={`col-span-full grid grid-cols-subgrid ${className || ''}`.trim()}>
    //   <SelectionCard
    //     title="全国"
    //     icon="📍"
    //     href="/elections/2024-shu col-start-auto"
    //   />
    // </li>
  )
}

interface RegionCardsProps {
  regions: Region[]
  onRegionClick: (region: Region) => void
}

function RegionCards({ regions, onRegionClick }: RegionCardsProps) {
  return (
    <>
      {regions.map((region) => (
        <li key={region.id}>
          <SelectionCard
            title={region.name}
            icon="📍"
            isButton={true}
            layoutId={region.id}
            onClick={() => onRegionClick(region)}
          />
        </li>
      ))}
    </>
  )
}

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
  href?: string
  icon?: ReactNode
  className?: string
  onClick?: () => void
  isButton?: boolean
  layoutId?: string
}

export function SelectionCard({
  title,
  description,
  href,
  icon,
  className,
  onClick,
  isButton = false,
  layoutId,
}: SelectionCardProps) {
  const content = (
    <>
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
        <motion.div
          layoutId={layoutId}
          className="truncate text-sm font-medium underline-offset-2 group-hover:underline md:text-base"
        >
          {title}
        </motion.div>
        {description && (
          <div className="truncate text-xs text-muted-foreground md:text-sm">
            {description}
          </div>
        )}
      </div>
    </>
  )

  if (isButton) {
    return (
      <li>
        <button
          onClick={onClick}
          className={cn('group flex w-full items-center gap-4 py-2 pr-4 text-left', className)}
        >
          {content}
        </button>
      </li>
    )
  }

  return (
    <li>
      <Link
        to={href!}
        className={cn('group flex items-center gap-4 py-2 pr-4', className)}
      >
        {content}
      </Link>
    </li>
  )
}
