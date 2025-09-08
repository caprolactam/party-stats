import { href, data } from 'react-router'
import { StickyTitleBar } from '~/components/ui/sticky-title-bar.tsx'
import { handleApiError } from '~/lib/error-handling.server.ts'
import { getArea } from '~/services/area.server.ts'
import { getElection } from '~/services/election.server.ts'
import type { Route } from './+types/route.ts'
import { TAB_OPTIONS, getTab } from './queries.server.ts'

export async function loader({ params, request }: Route.LoaderArgs) {
  const { searchParams } = new URL(request.url)
  const { electionId, areaCode } = params

  const tab = getTab(searchParams)

  const [
    areaResult,
    getElectionResult,
  ] = await Promise.all([
    getArea(areaCode),
    getElection(electionId),
  ])

  if (areaResult.isErr()) handleApiError(areaResult.error)
  if (getElectionResult.isErr()) handleApiError(getElectionResult.error)

  const { value: area } = areaResult
  const { value: election } = getElectionResult

  // area.levelがCITYの場合はデータが存在しないため400エラーを返す
  if (area.level === 'CITY') {
    throw data({ type: 'badRequest', message: '市区町村レベルの地域の投票状況は表示できません' }, { status: 400 })
  }

  return {
    title: `${area.name}の${TAB_OPTIONS[tab].label}`,
    backLink: {
      to: href('/areas/:areaCode/elections/:electionId', {
        electionId: election.id,
        areaCode: area.code,
      }),
      label: '概要',
    },
    area,
    election,
  }
}

export default function Route({ loaderData }: Route.ComponentProps) {
  const { area, election, backLink, title } = loaderData
  const pageTitle = `${area.name}の投票状況`

  // NOTE: クエリパラメータのtabによって投票率に関するデータ、無効投票率に関するデータをサーバ側で切り替えて取得します。

  return (
    <>
      <StickyTitleBar
        title={title}
        backLink={backLink}
      >
        <StickyTitleBar.Trigger>
          <h1
            className="text-4xl font-medium tracking-tight text-foreground"
          >
            {title}
          </h1>
        </StickyTitleBar.Trigger>
      </StickyTitleBar>
      <div className="mt-(--space-lg) grid gap-(--space-lg)">
        <section>
          <h2 className="mb-(--space-xs) pl-(--space-xs) text-sm text-muted-foreground">投票率の推移</h2>
          <div className="rounded-md bg-card p-4">
            TODO: 折れ線グラフで選挙ごとの投票率を表示します。
            - 文字データとしては、選択している選挙の有権者数、投票者数、棄権者数を表示します。
          </div>
        </section>
        <section>
          <h2 className="mb-(--space-xs) pl-(--space-xs) text-sm text-muted-foreground">投票率の地域比較</h2>
          <div className="rounded-md bg-card p-4">
            TODO: ヒストグラムで、同じ選挙における他の地域の投票率分布を表示します。
          </div>
        </section>
        <section>
          <h2 className="mb-(--space-xs) pl-(--space-xs) text-sm text-muted-foreground">投票率について</h2>
          <p className="rounded-md bg-card p-4">
            投票率は、有権者のうちどの程度の人が投票を行ったかを示します。投票率は、投票者数を有権者数で割ることで求められます。
          </p>
        </section>
      </div>
    </>
  )
}
