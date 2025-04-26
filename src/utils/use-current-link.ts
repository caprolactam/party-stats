import { useChildMatches, useParams, linkOptions } from '@tanstack/react-router'

export function useCurrentLink() {
  const params = useParams({ from: '/elections/$electionCode/$unitCode' })

  const overviewRoute = useChildMatches({
    select: (matches) =>
      matches.find(
        (match) =>
          match.routeId === '/elections/$electionCode/$unitCode/overview/',
      ),
  })
  const isOverview = !!overviewRoute

  const detailsRoute = useChildMatches({
    select: (matches) =>
      matches.find(
        (match) =>
          match.routeId ===
          '/elections/$electionCode/$unitCode/overview/$partyCode',
      ),
  })
  const isDetails = !!detailsRoute

  const rankingRoute = useChildMatches({
    select: (matches) =>
      matches.find(
        (match) =>
          match.routeId === '/elections/$electionCode/$unitCode/ranking',
      ),
  })
  const isRanking = !!rankingRoute

  const linkProps = isOverview
    ? linkOptions({
        to: '/elections/$electionCode/$unitCode/overview',
        params: overviewRoute.params,
      })
    : isDetails
      ? linkOptions({
          to: '/elections/$electionCode/$unitCode/overview/$partyCode',
          params: detailsRoute.params,
          search: detailsRoute.search,
        })
      : isRanking
        ? linkOptions({
            to: '/elections/$electionCode/$unitCode/ranking',
            params: rankingRoute.params,
            search: {
              ...rankingRoute.search,
              page: undefined, // Should be removed ? 🤔
            },
          })
        : linkOptions({
            to: '/elections/$electionCode/$unitCode/overview',
            params,
          })

  return linkProps
}
