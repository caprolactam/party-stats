import { href } from 'react-router'
import type { To } from 'react-router'
import { StickyTitleBar } from '~/components/ui/sticky-title-bar.tsx'
import { handleApiError } from '~/lib/error-handling.server.ts'
import { setSearchParamsString } from '~/lib/search-params.ts'
import { getArea } from '~/services/area.server.ts'
import type { Route } from './+types/route.ts'
import { BasicInfoSection } from './components/basic-info-section.tsx'
import { PartyResultsSection } from './components/party-results-section.tsx'
import { VotingStatusSection } from './components/voting-status-section.tsx'
import { getElection, getPartyResults, getVotingStatus } from './queries.server.ts'

export async function loader({ params, request }: Route.LoaderArgs) {
  const { searchParams } = new URL(request.url)
  const { electionId, areaCode } = params

  const [areaResult, electionResult] = await Promise.all([
    getArea(areaCode),
    getElection(electionId),
  ])

  if (areaResult.isErr()) handleApiError(areaResult.error)
  if (electionResult.isErr()) handleApiError(electionResult.error)

  const [
    partyResultsResult,
    votingStatusResult,
  ] = await Promise.all([
    getPartyResults({ electionId, areaId: areaResult.value.id }),
    getVotingStatus({ electionId, areaId: areaResult.value.id }),
  ])
  if (partyResultsResult.isErr()) handleApiError(partyResultsResult.error)
  if (votingStatusResult.isErr()) handleApiError(votingStatusResult.error)

  const { turnout, invalidVotes } = votingStatusResult.value

  return {
    area: areaResult.value,
    election: electionResult.value,
    partyResults: partyResultsResult.value.map((party) => ({
      ...party,
      to: href('/elections/:electionId/areas/:areaCode/:partyCode', {
        electionId,
        areaCode,
        partyCode: party.code,
      }),
    })),
    votingStatus: {
      electionId: electionId,
      turnout: turnout
        ? {
            ...turnout,
            to: {
              pathname: href('/elections/:electionId/areas/:areaCode/status', { electionId, areaCode }),
            } satisfies To,
          }
        : null,
      invalidVotes: invalidVotes
        ? {
            ...invalidVotes,
            to: {
              pathname: href('/elections/:electionId/areas/:areaCode/status', { electionId, areaCode }),
              search: setSearchParamsString(searchParams, { tab: 'votes' }),
            } satisfies To,
          }
        : null,
    },
  }
}

export default function Route({ loaderData }: Route.ComponentProps) {
  const areaName = loaderData.area.name
  const electionName = loaderData.election.name
  const heldAt = loaderData.election.heldAt

  const pageTitle = `${areaName}の選挙結果概要`

  const description = `${electionName}における${areaName}の投票率、無効投票率、政党別得票率などの詳細な選挙結果をご覧いただけます。${heldAt}に実施された選挙データです。`
  const keywords = [electionName, areaName, '選挙結果', '投票率', '政党別得票率', '無効投票率', '選挙統計']

  return (
    <>
      <title>{`${pageTitle} ${electionName.replaceAll(/\s/g, '')} | 政党スタッツ`}</title>
      <meta name="description" content={description} />
      <meta
        name="keywords"
        content={keywords.join(',')}
      />
      <StickyTitleBar
        title={pageTitle}
      >
        <StickyTitleBar.Trigger>
          <h1
            className="text-4xl font-medium tracking-tight text-foreground"
          >
            {pageTitle}
          </h1>
        </StickyTitleBar.Trigger>
        <div className="mt-(--space-lg) grid gap-(--space-lg)">
          <BasicInfoSection
            area={loaderData.area}
            election={loaderData.election}
          />
          <VotingStatusSection
            {...loaderData.votingStatus}
          />
          <PartyResultsSection parties={loaderData.partyResults} />
        </div>
      </StickyTitleBar>
    </>
  )
}

// TODO:
// - error boundary
