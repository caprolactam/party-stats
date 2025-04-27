import { useChildMatches, useParams, linkOptions } from '@tanstack/react-router'

export function useCurrentLink() {
  const params = useParams({ from: '/elections/$electionCode/$areaCode' })

  const overviewRoute = useChildMatches({
    select: (matches) =>
      matches.find(
        (match) =>
          match.routeId === '/elections/$electionCode/$areaCode/overview/',
      ),
  })
  const isOverview = !!overviewRoute

  const detailsRoute = useChildMatches({
    select: (matches) =>
      matches.find(
        (match) =>
          match.routeId ===
          '/elections/$electionCode/$areaCode/overview/$partyCode',
      ),
  })
  const isDetails = !!detailsRoute

  const rankingRoute = useChildMatches({
    select: (matches) =>
      matches.find(
        (match) =>
          match.routeId === '/elections/$electionCode/$areaCode/ranking',
      ),
  })
  const isRanking = !!rankingRoute

  const linkProps = isOverview
    ? linkOptions({
        to: '/elections/$electionCode/$areaCode/overview',
        params: overviewRoute.params,
      })
    : isDetails
      ? linkOptions({
          to: '/elections/$electionCode/$areaCode/overview/$partyCode',
          params: detailsRoute.params,
          search: detailsRoute.search,
        })
      : isRanking
        ? linkOptions({
            to: '/elections/$electionCode/$areaCode/ranking',
            params: rankingRoute.params,
            search: {
              ...rankingRoute.search,
              page: undefined, // Should be removed ? 🤔
            },
          })
        : linkOptions({
            to: '/elections/$electionCode/$areaCode/overview',
            params,
          })

  return linkProps
}
