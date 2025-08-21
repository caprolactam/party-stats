import { data, redirect } from 'react-router'
import { Link } from 'react-router'
import { Button } from '~/components/ui/button.tsx'
import { Icon } from '~/components/ui/icon.tsx'
import { WithTouchTarget } from '~/components/ui/touch-target.tsx'
import type { Route } from './+types/route.ts'
import { getPlaceType, getLatestElection, getPlaceAndChildren } from './queries.server.ts'

export async function loader({ params }: Route.LoaderArgs) {
  const { placeCode } = params

  const [placeType, latestElection] = await Promise.all([
    getPlaceType(placeCode),
    getLatestElection(),
  ])

  if (placeType.isErr()) {
    const { message, type } = placeType.error
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
  if (latestElection.isErr()) {
    const { message, type } = latestElection.error
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

  // 市区町村レベルの場合は選挙結果ページにリダイレクト
  if (placeType.value.type === 'AREA' && placeType.value.areaLevel === 'CITY') {
    throw redirect(`/elections/${latestElection.value.id}/areas/${placeCode}`)
  }

  const placeAndChildren = await getPlaceAndChildren({
    placeType: placeType.value,
    electionId: latestElection.value.id,
  })

  if (placeAndChildren.isErr()) {
    const { message, type } = placeAndChildren.error
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

  return placeAndChildren.value
}

export function headers() {
  return {
    'Cache-Control': 'private, max-age=3600',
  }
}

export default function AreaSelectionPage({
  loaderData,
}: Route.ComponentProps) {
  const { areaLevel, currentPlace, parent, children } = loaderData
  return (
    <div className="grid max-w-3xl gap-(--space-base)">
      <h1 className="sr-only">地域</h1>
      {parent && (
        <div className="inline-flex">
          <WithTouchTarget stretch="horizontal">
            <Link to={parent.to} className="inline-flex gap-1 font-medium text-red-400 hover:text-red-500 active:text-red-600">
              <Icon name="chevron-left" size={22} />
              {parent.name}
            </Link>
          </WithTouchTarget>
        </div>
      )}
      <h2 className="text-2xl leading-none font-bold tracking-tight text-foreground md:text-3xl">
        {currentPlace.name}
      </h2>
      {currentPlace.to
        ? (
            <Link to={currentPlace.to} className="flex h-11 w-full items-center gap-4 rounded-md bg-card px-4 font-medium hover:bg-hovered active:bg-selected">
              <Icon name="how-to-vote" size={20} />
              最新の選挙結果
            </Link>
          )
        : (
            <div>
              <div
                aria-hidden={true}
                className="flex h-11 w-full items-center gap-4 rounded-md bg-card px-4 font-medium text-muted-foreground"
              >
                <Icon name="how-to-vote" size={20} />
                最新の選挙結果
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                この地域の選挙結果データは存在しません。
              </div>
            </div>
          )}
      <ul>
        {children.map((child) => (
          <li key={child.to} className="bg-card first-of-type:rounded-t-md last-of-type:rounded-b-md">
            <Link to={child.to} className="flex h-11 w-full items-center justify-between gap-4 rounded-[inherit] px-4 font-medium hover:bg-hovered active:bg-selected">
              {child.name}
              {areaLevel !== 'PREFECTURE' && (
                <Icon name="chevron-right" size={20} className="text-muted-foreground" />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
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
