import type React from 'react'
import { Link } from 'react-router'
import { chunkArray } from '~/lib/chunk-array.ts'
import { cn } from '~/lib/utils.ts'
import type { Election } from '../types.ts'
import { Carousel } from './carousel.tsx'
import { SectionContainer } from './section.tsx'

interface ElectionSectionProps {
  elections: Election[]
}

export function ElectionSection({ elections }: ElectionSectionProps) {
  return (
    <SectionContainer title="選挙結果を選ぶ">
      <DesktopElectionGrid elections={elections} />
      <MobileElectionCarousel elections={elections} />
    </SectionContainer>
  )
}

/**
 * デスクトップ用選挙一覧グリッドレイアウト
 */
function DesktopElectionGrid({ elections }: { elections: Election[] }) {
  return (
    <ul className="hidden md:grid md:grid-cols-2 lg:grid-cols-3">
      {elections.map((election) => (
        <li key={election.id}>
          <ElectionItem
            to={`/elections/${election.id}`}
            prefetch="intent"
            title={election.name}
            date={election.date}
            datetime={election.datetime}
            icon="🗳️"
          />
        </li>
      ))}
    </ul>
  )
}

/**
 * モバイル用選挙一覧カルーセルレイアウト
 */
function MobileElectionCarousel({ elections }: { elections: Election[] }) {
  const chunkedElections = chunkArray(elections, 3)

  return (
    <>
      {/* モバイル用横スクロールレイアウト */}
      {/* <div className="md:hidden"> */}
      <Carousel.Root totalItems={chunkedElections.length}>
        <Carousel.Viewport className="md:hidden">
          {chunkedElections.map((chunkElections, i) => (
            <Carousel.Content key={i} index={i}>
              <ul>
                {chunkElections.map((election) => (
                  <li key={election.id}>
                    <ElectionItem
                      to={`/elections/${election.id}/all`}
                      prefetch="intent"
                      title={election.name}
                      date={election.date}
                      datetime={election.datetime}
                      icon="🗳️"
                    />
                  </li>
                ))}
              </ul>
            </Carousel.Content>
          ))}
        </Carousel.Viewport>
        <Carousel.Indicators aria-label="選挙ページ" />
      </Carousel.Root>
      {/* </div> */}
    </>
  )
}

interface SelectionCardProps extends React.ComponentPropsWithoutRef<typeof Link> {
  title: string
  date: string
  datetime: string
  icon?: React.ReactNode
}

export function ElectionItem({
  title,
  date,
  datetime,
  to,
  icon,
  className,
  ...props
}: SelectionCardProps) {
  return (
    <Link
      to={to}
      className={cn(
        'group flex items-center gap-4 py-2 pr-4 transition-opacity',
        className,
      )}
      {...props}
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
        <div className="truncate text-xs text-muted-foreground md:text-sm">
          <time dateTime={datetime}>{`${date} 投開票`}</time>
        </div>
      </div>
      <div
        className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-hovered"
        aria-hidden="true"
      >
        詳細
      </div>
    </Link>
  )
}
