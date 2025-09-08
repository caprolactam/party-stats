import { href } from 'react-router'
import { Link } from 'react-router'
import { GroupedList } from '~/components/grouped-list/index.tsx'
import { Button } from '~/components/ui/button.tsx'
import { Icon } from '~/components/ui/icon.tsx'
import { StickyTitleBar } from '~/components/ui/sticky-title-bar.tsx'
import { WithTouchTarget } from '~/components/ui/touch-target.tsx'
import { handleApiError } from '~/lib/error-handling.server.ts'
import { listElections } from '~/services/election.server.ts'
import type { Route } from './+types/route.ts'
import { getAreaFamily } from './queries.server.ts'

const ELECTION_LIST_LIMIT = 3

export async function loader({ params }: Route.LoaderArgs) {
  const { areaCode } = params

  const [
    electionsResult,
    areaFamilyResult,
  ] = await Promise.all([
    listElections('desc'),
    getAreaFamily(areaCode),
  ])

  if (electionsResult.isErr()) handleApiError(electionsResult.error)
  if (areaFamilyResult.isErr()) handleApiError(areaFamilyResult.error)

  const { elections: allElections } = electionsResult.value
  const areaFamily = areaFamilyResult.value

  const elections = allElections.slice(0, ELECTION_LIST_LIMIT)
    .map((election) => ({
      id: election.id,
      name: election.name,
      heldAtDatetime: election.heldAtDatetime,
      to: href('/areas/:areaCode/elections/:electionId', {
        electionId: election.id,
        areaCode: areaFamily.self.code,
      }),
    }))

  return {
    elections,
    areaFamily,
  }
}

export function headers() {
  return {
    'Cache-Control': 'private, max-age=3600',
  }
}

export default function AreaSelectionPage({
  loaderData,
}: Route.ComponentProps) {
  const { elections, areaFamily } = loaderData
  const { parent: areaParent, self: currentArea, children: areaChildren } = areaFamily

  return (
    <>
      <meta name="robots" content="noindex, follow" />
      <StickyTitleBar
        title={currentArea.name}
        backLink={areaParent ? { to: areaParent.to, label: areaParent.name } : undefined}
      >
        <h1 className="sr-only">地域</h1>
        <StickyTitleBar.Trigger>
          <h2
            className="text-4xl font-medium tracking-tight text-foreground"
          >
            {currentArea.name}
          </h2>
        </StickyTitleBar.Trigger>
        <div className="mt-(--space-lg) grid gap-(--space-lg)">
          <section>
            <div className="mb-(--space-xs) flex items-center justify-between gap-2 pl-(--space-xs)">
              <h3 className="text-sm text-muted-foreground">選挙結果</h3>
              <WithTouchTarget stretch="horizontal">
                <Link to={href('/areas/:areaCode/elections', { areaCode: currentArea.code })} className="text-sm font-medium text-navigation hover:underline">すべて見る</Link>
              </WithTouchTarget>
            </div>
            <ul className="divide-y divide-border/70 rounded-md bg-card">
              {elections.map((election) => (
                <li
                  key={election.id}
                  className="first-of-type:rounded-t-md last-of-type:rounded-b-md"
                >
                  <Link
                    to={election.to}
                    className="relative flex h-12 w-full items-center gap-2 rounded-[inherit] px-4 text-sm hover:bg-hovered active:bg-selected"
                  >
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {election.name}
                    </span>
                    <span className="shrink-0 font-mono text-muted-foreground">
                      <time>{election.heldAtDatetime}</time>
                    </span>
                    <Icon name="chevron-right" size={22} className="shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <div className="mb-(--space-xs) flex items-center justify-between gap-2 pl-(--space-xs)">
              <h3 className="text-sm text-muted-foreground">{currentArea.level === 'NATIONAL' ? '都道府県' : '市区町村'}</h3>
            </div>
            <GroupedList asChild>
              <ul className="isolate">
                {areaChildren == null
                  ? (
                      <li className="text-sm text-muted-foreground">子地域は存在しません</li>
                    )
                  : Array.from(areaChildren).map(([groupLabel, groupedAreas]) => (
                      <GroupedList.Group
                        key={groupLabel}
                        asChild
                        value={groupLabel}
                        heading={(
                          // <div className="sticky top-(--header-height) z-10 rounded-[inherit] bg-card">
                          <span className="flex items-center bg-card px-4 py-1 text-base font-bold">
                            {groupLabel}
                          </span>
                          // </div>
                        )}
                      >
                        <li className="bg-card first-of-type:rounded-t-md last-of-type:rounded-b-md">
                          <ul>
                            {groupedAreas.map((area) => (
                              <GroupedList.Item asChild key={area.to}>
                                <li>
                                  <Link to={area.to} className="flex h-11 w-full items-center justify-between gap-4 rounded-[inherit] px-4 hover:bg-hovered active:bg-selected">
                                    {area.name}
                                    {currentArea.level !== 'PREFECTURE' && (
                                      <Icon name="chevron-right" size={20} className="text-muted-foreground" />
                                    )}
                                  </Link>
                                </li>
                              </GroupedList.Item>
                            ))}
                          </ul>
                        </li>
                      </GroupedList.Group>
                    ))}
              </ul>
            </GroupedList>
          </section>
        </div>
      </StickyTitleBar>
    </>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const errorMessage = error instanceof Error ? error.message : '予期しないエラーが発生しました'

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold">
          エラーが発生しました
        </h1>
        <p className="mb-6 text-muted-foreground">
          {errorMessage}
        </p>
        <Button asChild>
          <Link to="/areas/area_national_001">ホームに戻る</Link>
        </Button>
      </div>
    </div>
  )
}
