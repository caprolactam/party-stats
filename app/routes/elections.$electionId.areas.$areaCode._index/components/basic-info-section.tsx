import { useFetcher, href, NavLink } from 'react-router'
import { clsx } from 'clsx'
import { Pressable } from 'react-aria-components'
import { Icon } from '~/components/ui/icon.tsx'
import {
  SheetTrigger,
  SheetContent,
} from '~/components/ui/sheet'
import { Skeleton } from '~/components/ui/skeleton.tsx'
import type { loader } from '~/routes/resources.elections/route.ts'

interface BasicInfoSectionProps {
  area: {
    name: string
    code: string
  }
  election: {
    id: string
    name: string
    heldAt: string
    heldAtDatetime: string
  }
}

export function BasicInfoSection({
  area: {
    name: areaName,
    code: areaCode,
  },
  election: {
    id: _electionId,
    name: electionName,
    heldAt,
    heldAtDatetime,
  },
}: BasicInfoSectionProps) {
  return (
    <section>
      <h2 className="mb-(--space-xs) pl-(--space-xs) text-sm text-muted-foreground">情報</h2>
      <ul className="divide-y divide-border/70 rounded-md bg-card">
        <li className="rounded-t-md">
          <ElectionChangeSheet
            className="block size-full rounded-[inherit] hover:bg-hovered active:bg-selected"
            currentAreaCode={areaCode}
          >
            <ListItem label="選挙">
              {electionName}
              <Icon name="chevron-right" className="-translate-y-px text-muted-foreground" size={22} />
            </ListItem>
          </ElectionChangeSheet>
        </li>
        <li>
          <ListItem label="投票日">
            <time dateTime={heldAtDatetime}>{heldAt}</time>
          </ListItem>
        </li>
        <li>
          <ListItem label="集計対象">
            比例代表選挙
          </ListItem>
        </li>
        <li>
          <AreaChangeSheet
            className="block size-full rounded-b-md hover:bg-hovered active:bg-selected"
            currentAreaCode={areaCode}
          >
            <ListItem label="地域">
              {areaName}
              <Icon name="chevron-right" className="-translate-y-px text-muted-foreground" size={22} />
            </ListItem>
          </AreaChangeSheet>
        </li>
      </ul>
    </section>
  )
}

interface ListItemProps {
  label: string
  children: React.ReactNode
}

function ListItem({
  label,
  children,
}: ListItemProps) {
  return (
    <div className="flex h-12 items-center px-4">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <div className="flex flex-1 items-center justify-end gap-1">
        {children}
      </div>
    </div>
  )
}

interface AreaChangeSheetProps {
  currentAreaCode: string
  children: React.ReactElement
  className?: string
}

export function AreaChangeSheet({ currentAreaCode, className, children }: AreaChangeSheetProps) {
  const fetcher = useFetcher()

  return (
    <SheetTrigger>
      <Pressable>
        <button type="button" className={className}>
          {children}
        </button>
      </Pressable>
      <SheetContent title="地域を変更">
      </SheetContent>
    </SheetTrigger>
  )
}

interface ElectionChangeSheetProps {
  children: React.ReactElement
  className?: string
  currentAreaCode: string
}

export function ElectionChangeSheet({ currentAreaCode, className, children }: ElectionChangeSheetProps) {
  const fetcher = useFetcher<typeof loader>()

  const isLoading = fetcher.state === 'loading'
  const representatives = fetcher.data?.elections.filter((election) => election.type === 'REPRESENTATIVES') ?? null
  const councillors = fetcher.data?.elections.filter((election) => election.type === 'COUNCILLORS') ?? null

  return (
    <SheetTrigger>
      <Pressable>
        <button
          type="button"
          className={className}
          onClick={() => {
            fetcher.load(href('/resources/elections'))
          }}
        >
          {children}
        </button>
      </Pressable>
      <SheetContent title="選挙を変更">
        {({ close: closeSheet }) => (
          <div className="flex flex-col gap-y-(--space-lg) px-4 py-(--space-lg)">
            <ElectionList
              title="衆議院選挙"
              elections={representatives}
              areaCode={currentAreaCode}
              isLoading={isLoading}
              skeltonCount={3}
              handleClose={closeSheet}
            />
            <ElectionList
              title="参議院選挙"
              elections={councillors}
              areaCode={currentAreaCode}
              isLoading={isLoading}
              skeltonCount={2}
              handleClose={closeSheet}
            />
          </div>
        )}
      </SheetContent>
    </SheetTrigger>
  )
}

function ElectionList({
  title,
  elections,
  areaCode,
  isLoading,
  skeltonCount = 3,
  handleClose,
}: {
  title: string
  elections: Array<{ id: string, name: string, heldAtDatetime: string }> | null
  areaCode: string
  isLoading: boolean
  skeltonCount?: number
  handleClose: () => void
}) {
  const hasResults = elections && elections.length > 0

  if (isLoading) return (
    <section>
      <h3 className="mb-(--space-xs) pl-(--space-xs) text-sm text-muted-foreground">{title}</h3>
      <ul className="divide-y divide-border/70 rounded-md bg-card">
        {Array.from({ length: Math.floor(skeltonCount) }).map((_, index) => (
          <li
            key={index}
            className="first-of-type:rounded-t-md last-of-type:rounded-b-md"
          >
            <div className="relative flex h-11 w-full items-center gap-2 rounded-[inherit] px-4 text-sm">
              <span className="min-w-0 flex-1">
                <Skeleton className="h-3 w-32" />
              </span>
              <span className="shrink-0">
                <Skeleton className="h-3 w-16" />
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )

  if (!hasResults) return (
    <section>
      <h3 className="mb-(--space-xs) pl-(--space-xs) text-sm text-muted-foreground">{title}</h3>
      <div className="flex items-center justify-center rounded-md bg-card p-4 text-sm text-muted-foreground">
        利用可能な選挙がありません
      </div>
    </section>
  )

  return (
    <section>
      <h3 className="mb-(--space-xs) pl-(--space-xs) text-sm text-muted-foreground">{title}</h3>
      <ul className="divide-y divide-border/70 rounded-md bg-card">
        {elections.map((election) => (
          <li
            key={election.id}
            className="first-of-type:rounded-t-md last-of-type:rounded-b-md"
          >
            <NavLink
              to={href('/elections/:electionId/areas/:areaCode', {
                electionId: election.id,
                areaCode,
              })}
              end
              onClick={handleClose}
              className="relative flex h-11 w-full items-center gap-2 rounded-[inherit] px-4 text-sm hover:bg-hovered active:bg-selected"
            >
              {({ isActive }) => (
                <>
                  <span
                    className={clsx('absolute inset-y-1/2 left-0 h-4 w-[3px] -translate-y-1/2 rounded-full bg-navigation',
                      isActive ? 'opacity-100' : 'opacity-0',
                    )}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {election.name}
                  </span>
                  <span className="shrink-0 text-muted-foreground">
                    <time>{election.heldAtDatetime}</time>
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </section>
  )
}
