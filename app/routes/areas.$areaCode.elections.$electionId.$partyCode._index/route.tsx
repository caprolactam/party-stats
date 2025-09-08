import { href } from 'react-router'
import { StickyTitleBar } from '~/components/ui/sticky-title-bar.tsx'
import { handleApiError } from '~/lib/error-handling.server.ts'
import { getArea } from '~/services/area.server.ts'
import type { Route } from './+types/route.ts'
import { getPartyResult, getElectionById, getPartyByCode } from './queries.server.ts'

export async function loader({ params }: Route.LoaderArgs) {
  const { electionId, areaCode, partyCode } = params

  const [
    electionResult,
    areaResult,
    partyResult,
  ] = await Promise.all([
    getElectionById(electionId),
    getArea(areaCode),
    getPartyByCode(partyCode),
  ])

  if (electionResult.isErr()) handleApiError(electionResult.error)
  if (areaResult.isErr()) handleApiError(areaResult.error)
  if (partyResult.isErr()) handleApiError(partyResult.error)

  const { value: election } = electionResult
  const { value: area } = areaResult
  const { value: party } = partyResult

  const partyResultResult = await getPartyResult({ electionId, areaId: area.id, partyId: party.id })

  if (partyResultResult.isErr()) handleApiError(partyResultResult.error)

  return {
    backLink: {
      to: href('/areas/:areaCode/elections/:electionId', {
        electionId: election.id,
        areaCode: area.code,
      }),
      label: '概要',
    },
    party,
    area,
    election,
    result: partyResultResult.value,
  }
}

export default function Route({ loaderData }: Route.ComponentProps) {
  const { backLink, result, area, election, party } = loaderData
  const pageTitle = `${area.name}の${party.name}`

  return (
    <>
      <StickyTitleBar
        title={pageTitle}
        backLink={backLink}
      >
        <StickyTitleBar.Trigger>
          <h1
            className="text-4xl font-medium tracking-tight text-foreground"
          >
            {pageTitle}
          </h1>
        </StickyTitleBar.Trigger>
      </StickyTitleBar>
      <div className="mt-(--space-lg) grid gap-(--space-lg)">
        <section>
          <h2 className="mb-(--space-xs) pl-(--space-xs) text-sm text-muted-foreground">投票率の推移</h2>
          <div className="rounded-md bg-card p-4">
            TODO: 折れ線グラフで選挙ごとの得票率を表示します。
          </div>
        </section>
        <section>
          <h2 className="mb-(--space-xs) pl-(--space-xs) text-sm text-muted-foreground">投票率の地域比較</h2>
          <div className="rounded-md bg-card p-4">
            TODO: ヒストグラムで、同じ選挙における他の地域の得票率分布を表示します。
          </div>
        </section>
        <section>
          <h2 className="mb-(--space-xs) pl-(--space-xs) text-sm text-muted-foreground">政党別得票率について</h2>
          <p className="rounded-md bg-card p-4">
            政党別得票率は、各政党がその地域の中でどの程度の支持を得たかを示します。各政党の得票数を有効投票総数で割ることで求められます。
          </p>
        </section>
      </div>
    </>
  )
}
