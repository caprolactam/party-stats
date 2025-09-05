import { data, redirect } from 'react-router'
import { Link } from 'react-router'
import { GroupedList } from '~/components/grouped-list/index.tsx'
import { Button } from '~/components/ui/button.tsx'
import { Icon } from '~/components/ui/icon.tsx'
import { WithTouchTarget } from '~/components/ui/touch-target.tsx'
import type { Route } from './+types/route.ts'
import { getAreaFamily } from './queries.server.ts'

export async function loader({ params }: Route.LoaderArgs) {
  const { areaCode } = params

  const areaFamilyResult = await getAreaFamily(areaCode)

  if (areaFamilyResult.isErr()) {
    const { message, type } = areaFamilyResult.error
    switch (type) {
      case 'notFound':
        throw data(message, 404)
      case 'network':
        throw data(message, 500)
      default:
        const _: never = type
        throw Error(`Unexpected error type: ${type}`)
    }
  }

  const { value: areaFamily } = areaFamilyResult

  // 市区町村の場合は、その地域の選挙結果ページにリダイレクト
  if (areaFamily.self.level === 'CITY') {
    throw redirect(areaFamily.self.to)
  }

  return areaFamily
}

export function headers() {
  return {
    'Cache-Control': 'private, max-age=3600',
  }
}

export default function AreaSelectionPage({
  loaderData,
}: Route.ComponentProps) {
  const { parent: areaParent, self: currentArea, children: areaChildren } = loaderData

  return (
    <>
      <div className="grid gap-(--space-base)">
        <h1 className="sr-only">地域</h1>
        {areaParent && (
          <div className="inline-flex">
            <WithTouchTarget stretch="horizontal">
              <Link to={areaParent.to} className="inline-flex gap-1 font-medium text-navigation hover:text-navigation-hovered active:text-navigation-selected">
                <Icon name="chevron-left" size={22} />
                {areaParent.name}
              </Link>
            </WithTouchTarget>
          </div>
        )}
        <h2 className="text-4xl leading-none font-bold tracking-tight text-foreground">
          {currentArea.name}
        </h2>
        <Link to={currentArea.to} className="inline-flex h-11 items-center gap-4 rounded-md bg-card px-4 font-medium text-navigation hover:bg-hovered active:bg-selected">
          <Icon name="how-to-vote" size={20} />
          最新の選挙結果
        </Link>
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
      </div>
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
