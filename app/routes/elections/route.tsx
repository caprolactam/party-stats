import { Link, data } from 'react-router'
import type { Route } from './+types/route'
import { getElections } from './queries.server.ts'
import type { Election } from './types.ts'

export async function loader(_: Route.LoaderArgs) {
  const elections = await getElections()

  if (elections.isErr()) {
    const { message, type } = elections.error
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

  return elections.value
}

// HTTPキャッシュ設定
export function headers() {
  return {
    'Cache-Control': 'private, max-age=3600',
  }
}

export default function ElectionsPage({ loaderData }: Route.ComponentProps) {
  const { representativesElections, councillorsElections } = loaderData

  return (
    <section className="grid max-w-3xl gap-(--space-base)">
      <h1 className="text-2xl leading-none font-bold tracking-tight text-foreground md:text-3xl">
        選挙結果
      </h1>
      <ul className="grid gap-(--space-base)">
        <li>
          <span className="mb-2 ml-2 block text-sm text-muted-foreground">衆議院</span>
          <ul>
            {representativesElections.map((election) => (
              <ElectionItem
                key={election.to}
                to={election.to}
                name={election.name}
                description={election.description}
                datetime={election.datetime}
              />
            ))}
          </ul>
        </li>
        <li>
          <span className="mb-2 ml-2 block text-sm text-muted-foreground">参議院</span>
          <ul>
            {councillorsElections.map((election) => (
              <ElectionItem
                key={election.to}
                to={election.to}
                name={election.name}
                description={election.description}
                datetime={election.datetime}
              />
            ))}
          </ul>
        </li>
      </ul>
    </section>
  )
}

export function ErrorBoundary() {
  return (
    <div className="mx-auto grid max-w-3xl gap-6 px-4 py-6 text-center">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
        エラーが発生しました
      </h1>
      <p className="text-muted-foreground">
        選挙一覧の取得に失敗しました。
      </p>
      <Link
        to="/"
        className="inline-flex justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        ホームに戻る
      </Link>
    </div>
  )
}

function ElectionItem({
  to,
  name,
  description,
  datetime,
}: Election) {
  return (
    <li className="bg-card first-of-type:rounded-t-md last-of-type:rounded-b-md">
      <Link to={to} className="flex w-full flex-col justify-center rounded-[inherit] px-4 py-2 font-medium hover:bg-hovered active:bg-selected">
        {name}
        <span className="text-sm font-normal text-muted-foreground">
          <time dateTime={datetime}>
            {description}
          </time>
        </span>
      </Link>
    </li>
  )
}
