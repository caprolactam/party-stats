import { useChildMatches, useParams, linkOptions } from '@tanstack/react-router'

export function useCurrentLink() {
  const params = useParams({ from: '/elections/$electionId/$unitId' })

  const overviewRoute = useChildMatches({
    select: (matches) =>
      matches.find(
        (match) => match.routeId === '/elections/$electionId/$unitId/overview/',
      ),
  })
  const isOverview = !!overviewRoute

  const detailsRoute = useChildMatches({
    select: (matches) =>
      matches.find(
        (match) =>
          match.routeId ===
          '/elections/$electionId/$unitId/overview/$partyCode',
      ),
  })
  const isDetails = !!detailsRoute

  const rankingRoute = useChildMatches({
    select: (matches) =>
      matches.find(
        (match) => match.routeId === '/elections/$electionId/$unitId/ranking',
      ),
  })
  const isRanking = !!rankingRoute

  const linkProps = isOverview
    ? linkOptions({
        to: '/elections/$electionId/$unitId/overview',
        params: overviewRoute.params,
      })
    : isDetails
      ? linkOptions({
          to: '/elections/$electionId/$unitId/overview/$partyCode',
          params: detailsRoute.params,
          search: detailsRoute.search,
        })
      : isRanking
        ? linkOptions({
            to: '/elections/$electionId/$unitId/ranking',
            params: rankingRoute.params,
            search: {
              ...rankingRoute.search,
              page: undefined, // Should be removed ? 🤔
            },
          })
        : linkOptions({
            to: '/elections/$electionId/$unitId/overview',
            params,
          })

  return linkProps
}
