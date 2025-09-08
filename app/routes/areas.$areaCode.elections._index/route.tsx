import { Link, href } from 'react-router'
import { GroupedList } from '~/components/grouped-list/index.tsx'
import { Button } from '~/components/ui/button.tsx'
import { Icon } from '~/components/ui/icon.tsx'
import { StickyTitleBar } from '~/components/ui/sticky-title-bar.tsx'
import { handleApiError } from '~/lib/error-handling.server.ts'
import { getArea } from '~/services/area.server.ts'
import { listElections } from '~/services/election.server.ts'
import type { Route } from './+types/route.ts'

export async function loader({ params }: Route.LoaderArgs) {
  const { areaCode } = params

  const [
    areaResult,
    electionsResult,
  ] = await Promise.all([
    getArea(areaCode),
    listElections('desc'),
  ])

  if (areaResult.isErr()) handleApiError(areaResult.error)
  if (electionsResult.isErr()) handleApiError(electionsResult.error)

  const area = areaResult.value
  const { elections } = electionsResult.value

  return {
    currentArea: area,
    elections,
  }
}

export function headers() {
  return {
    'Cache-Control': 'private, max-age=3600',
  }
}

export default function AreaElectionList({ loaderData }: Route.ComponentProps) {
  const { currentArea, elections } = loaderData
  const title = `${currentArea.name}の選挙結果`

  return (
    <>
      <Meta />
      <StickyTitleBar
        title={title}
        backLink={{
          to: href('/areas/:areaCode', { areaCode: currentArea.code }),
          label: '地域',
        }}
      >
        <StickyTitleBar.Trigger>
          <h1 className="text-4xl font-medium tracking-tight text-foreground">
            {title}
          </h1>
        </StickyTitleBar.Trigger>
        <div className="mt-(--space-lg) grid gap-(--space-lg)">
          <ul className="divide-y divide-border/70 rounded-md bg-card">
            {elections.map((election) => (
              <li
                key={election.id}
                className="first-of-type:rounded-t-md last-of-type:rounded-b-md"
              >
                <Link
                  to={href('/areas/:areaCode/elections/:electionId', {
                    electionId: election.id,
                    areaCode: currentArea.code,
                  })}
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
        </div>
      </StickyTitleBar>
    </>
  )
}

function Meta() {
  return (
    <meta name="robots" content="noindex, follow" />
  )
}

// TODO:
// - meta
// - error boundary
