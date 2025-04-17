import { Hono, type ExecutionContext } from 'hono'
import { contextStorage } from 'hono/context-storage'
import { renderToString } from 'react-dom/server'
import { safeParse } from 'valibot'
import {
  listRegions,
  getRegion,
  checkRegion,
  listPrefecturesInRegion,
  getPrefecture,
  checkPrefecture,
  listCitiesInPrefecture,
  getCity,
  checkCity,
} from './queries/area.ts'
import {
  listElections,
  getElection,
  checkElection,
  checkParty,
  getLeadingParty,
  getNationalOverview,
  getRegionOverview,
  getPrefectureOverview,
  getCityOverview,
} from './queries/election.ts'
import {
  getNationalPartyHistory,
  getRegionPartyHistory,
  getPrefecturePartyHistory,
  getCityPartyHistory,
} from './queries/party-history.ts'
import {
  rankingSortSchema,
  nationalRankingUnitSchema,
  regionRankingUnitSchema,
  getNationalRanking,
  getRegionRanking,
  getPrefectureRanking,
} from './queries/party-ranking.ts'
import { pageSchema, checkHokkaido, DB_ERROR } from './queries/utils.ts'
import { RootRoute } from './root-route.tsx'

const NOT_FOUND_ELECTION = '指定の選挙が見つかりませんでした'
const NOT_FOUND_PARTY = '指定の政党が見つかりませんでした'

export interface HonoEnv {
  Bindings: Env
  Variables: {
    ctx: ExecutionContext
  }
}

const app = new Hono<HonoEnv>()

app.use(contextStorage())

app.use(async (c, next) => {
  c.set('ctx', c.executionCtx)
  await next()
})

app.get('/api/regions', async (c) => {
  const regions = await listRegions()

  return c.json(regions)
})

app.get('/api/regions/:regionCode', async (c) => {
  const { regionCode } = c.req.param()
  const region = await getRegion(regionCode)

  if (!region) {
    return c.json({ message: 'Not found region' }, { status: 404 })
  }

  return c.json(region)
})

app.get('/api/regions/:regionCode/prefectures', async (c) => {
  const { regionCode } = c.req.param()
  const region = await checkRegion(regionCode)

  if (!region) {
    return c.json({ message: 'Not found region' }, { status: 404 })
  }

  const prefectures = await listPrefecturesInRegion(regionCode)

  return c.json(prefectures)
})

app.get('/api/prefectures/:prefectureCode', async (c) => {
  const { prefectureCode } = c.req.param()
  const prefecture = await getPrefecture(prefectureCode)

  if (!prefecture) {
    return c.json({ message: 'Not found prefecture' }, { status: 404 })
  }

  return c.json(prefecture)
})

app.get('/api/prefectures/:prefectureCode/cities', async (c) => {
  const { prefectureCode } = c.req.param()
  const { page: pageQuery } = c.req.query()
  const pageSubmission = safeParse(pageSchema, pageQuery)

  if (!pageSubmission.success) {
    return c.json({ message: 'Invalid page' }, { status: 400 })
  }

  const prefecture = await checkPrefecture(prefectureCode)

  if (!prefecture) {
    return c.json({ message: 'Not found prefecture' }, { status: 404 })
  }

  const { cities, ...pageInfo } = await listCitiesInPrefecture(
    prefectureCode,
    pageSubmission.output,
  )

  return c.json({
    cities,
    meta: pageInfo,
  })
})

app.get('/api/cities/:cityCode', async (c) => {
  const { cityCode } = c.req.param()
  const city = await getCity(cityCode)

  if (!city) {
    return c.json({ message: 'Not found city' }, { status: 404 })
  }

  return c.json(city)
})

app.get('/api/elections', async (c) => {
  const elections = await listElections()

  return c.json(elections)
})

app.get('/api/elections/:electionCode', async (c) => {
  const { electionCode } = c.req.param()
  const election = await getElection(electionCode)

  if (!election) {
    return c.json({ message: NOT_FOUND_ELECTION }, { status: 404 })
  }

  return c.json(election)
})

app.get('/api/elections/:electionCode/leader', async (c) => {
  const { electionCode } = c.req.param()
  const election = await checkElection(electionCode)

  if (!election) {
    return c.json({ message: NOT_FOUND_ELECTION }, { status: 404 })
  }

  const leader = await getLeadingParty(electionCode)

  return c.json(leader)
})

app.get('/api/elections/:electionCode/overview/national', async (c) => {
  const { electionCode } = c.req.param()

  const election = await checkElection(electionCode)

  if (!election) {
    return c.json({ message: NOT_FOUND_ELECTION }, { status: 404 })
  }

  const overview = await getNationalOverview(election.code)

  return c.json(overview)
})

app.get(
  '/api/elections/:electionCode/overview/regions/:regionCode',
  async (c) => {
    const { regionCode, electionCode } = c.req.param()

    const [region, election] = await Promise.all([
      checkRegion(regionCode),
      checkElection(electionCode),
    ])

    if (!region) {
      return c.json({ message: 'Not found region' }, { status: 404 })
    }
    if (!election) {
      return c.json({ message: NOT_FOUND_ELECTION }, { status: 404 })
    }

    const overview = await getRegionOverview({
      electionCode: election.code,
      regionCode: region.code,
    })

    return c.json(overview)
  },
)

app.get(
  '/api/elections/:electionCode/overview/prefectures/:prefectureCode',
  async (c) => {
    const { prefectureCode, electionCode } = c.req.param()

    const [prefecture, election] = await Promise.all([
      checkPrefecture(prefectureCode),
      checkElection(electionCode),
    ])

    if (!prefecture) {
      return c.json({ message: 'Not found prefecture' }, { status: 404 })
    }
    if (!election) {
      return c.json({ message: NOT_FOUND_ELECTION }, { status: 404 })
    }

    const overview = await getPrefectureOverview({
      electionCode: election.code,
      prefectureCode: prefecture.code,
    })

    return c.json(overview)
  },
)

app.get('/api/elections/:electionCode/overview/cities/:cityCode', async (c) => {
  const { cityCode, electionCode } = c.req.param()

  const [city, election] = await Promise.all([
    checkCity(cityCode),
    checkElection(electionCode),
  ])

  if (!city) {
    return c.json({ message: 'Not found city' }, { status: 404 })
  }
  if (!election) {
    return c.json({ message: NOT_FOUND_ELECTION }, { status: 404 })
  }

  const overview = await getCityOverview({
    electionCode: election.code,
    cityCode: city.code,
  })

  return c.json(overview)
})

app.get(
  '/api/elections/:electionCode/ranking/parties/:partyCode/national',
  async (c) => {
    const { electionCode, partyCode } = c.req.param()
    const { sort: sortQuery, unit: unitQuery, page: pageQuery } = c.req.query()

    const sortSubmission = safeParse(rankingSortSchema, sortQuery)
    const unitSubmission = safeParse(nationalRankingUnitSchema, unitQuery)
    const pageSubmission = safeParse(pageSchema, pageQuery)

    if (!sortSubmission.success) {
      return c.json({ message: 'Invalid sort' }, { status: 400 })
    }
    if (!unitSubmission.success) {
      return c.json({ message: 'Invalid unit' }, { status: 400 })
    }
    if (!pageSubmission.success) {
      return c.json({ message: 'Invalid page' }, { status: 400 })
    }

    const { output: sort } = sortSubmission
    const { output: unit } = unitSubmission
    const { output: page } = pageSubmission

    const [election, party] = await Promise.all([
      checkElection(electionCode),
      checkParty(partyCode),
    ])
    if (!election) {
      return c.json({ message: NOT_FOUND_ELECTION }, { status: 404 })
    }
    if (!party) {
      return c.json({ message: NOT_FOUND_PARTY }, { status: 404 })
    }

    const { data, ...pageInfo } = await getNationalRanking({
      electionCode: election.code,
      partyId: party.id,
      sort,
      unit,
      page,
    })

    return c.json({
      meta: {
        unit,
        sort,
        ...pageInfo,
      },
      data,
    })
  },
)

app.get(
  '/api/elections/:electionCode/ranking/parties/:partyCode/regions/:regionCode',
  async (c) => {
    const { regionCode, electionCode, partyCode } = c.req.param()
    const { sort: sortQuery, unit: unitQuery, page: pageQuery } = c.req.query()

    const sortSubmission = safeParse(rankingSortSchema, sortQuery)
    const unitSubmission = safeParse(regionRankingUnitSchema, unitQuery)
    const regionSubmission = checkHokkaido(regionCode)
    const pageSubmission = safeParse(pageSchema, pageQuery)

    if (!sortSubmission.success) {
      return c.json({ message: 'Invalid sort' }, { status: 400 })
    }
    if (!unitSubmission.success) {
      return c.json({ message: 'Invalid unit' }, { status: 400 })
    }
    if (!pageSubmission.success) {
      return c.json({ message: 'Invalid page' }, { status: 400 })
    }
    if (regionSubmission.isHokkaido) {
      const originalUrl = new URL(c.req.url)

      return c.redirect(
        `/api/elections/${electionCode}/ranking/parties/${partyCode}/prefectures/${regionSubmission.prefectureCode}${originalUrl.search}`,
        301,
      )
    }

    const { output: sort } = sortSubmission
    const { output: unit } = unitSubmission
    const { output: page } = pageSubmission

    const [election, party, region] = await Promise.all([
      checkElection(electionCode),
      checkParty(partyCode),
      checkRegion(regionCode),
    ])
    if (!election) {
      return c.json({ message: NOT_FOUND_ELECTION }, { status: 404 })
    }
    if (!party) {
      return c.json({ message: NOT_FOUND_PARTY }, { status: 404 })
    }
    if (!region) {
      return c.json({ message: 'Not found region' }, { status: 404 })
    }

    const { data, ...pageInfo } = await getRegionRanking({
      electionCode: election.code,
      partyId: party.id,
      regionCode: region.code,
      sort,
      unit,
      page,
    })

    return c.json({
      meta: {
        unit,
        sort,
        ...pageInfo,
      },
      data,
    })
  },
)

app.get(
  '/api/elections/:electionCode/ranking/parties/:partyCode/prefectures/:prefectureCode',
  async (c) => {
    const { prefectureCode, electionCode, partyCode } = c.req.param()
    const { sort: sortQuery, page: pageQuery } = c.req.query()

    const sortSubmission = safeParse(rankingSortSchema, sortQuery)
    const pageSubmission = safeParse(pageSchema, pageQuery)

    if (!sortSubmission.success) {
      return c.json({ message: 'Invalid sort' }, { status: 400 })
    }
    if (!pageSubmission.success) {
      return c.json({ message: 'Invalid page' }, { status: 400 })
    }

    const { output: sort } = sortSubmission
    const { output: page } = pageSubmission

    const [prefecture, party, election] = await Promise.all([
      checkPrefecture(prefectureCode),
      checkParty(partyCode),
      checkElection(electionCode),
    ])
    if (!election) {
      return c.json({ message: NOT_FOUND_ELECTION }, { status: 404 })
    }
    if (!party) {
      return c.json({ message: NOT_FOUND_PARTY }, { status: 404 })
    }
    if (!prefecture) {
      return c.json({ message: 'Not found prefecture' }, { status: 404 })
    }

    const { data, ...pageInfo } = await getPrefectureRanking({
      electionCode: election.code,
      partyId: party.id,
      prefectureCode: prefecture.code,
      sort,
      page,
    })

    return c.json({
      meta: {
        sort,
        unit: 'city',
        ...pageInfo,
      },
      data,
    })
  },
)

app.get(
  '/api/elections/:electionCode/ranking/parties/:partyCode/cities/:cityCode',
  async (c) => {
    const { cityCode, electionCode, partyCode } = c.req.param()
    const { sort: sortQuery, page: pageQuery } = c.req.query()

    const sortSubmission = safeParse(rankingSortSchema, sortQuery)
    const pageSubmission = safeParse(pageSchema, pageQuery)

    if (!sortSubmission.success) {
      return c.json({ message: 'Invalid sort' }, { status: 400 })
    }
    if (!pageSubmission.success) {
      return c.json({ message: 'Invalid page' }, { status: 400 })
    }

    const { output: sort } = sortSubmission
    const { output: page } = pageSubmission

    const [city, party, election] = await Promise.all([
      checkCity(cityCode),
      checkParty(partyCode),
      checkElection(electionCode),
    ])
    if (!election) {
      return c.json({ message: NOT_FOUND_ELECTION }, { status: 404 })
    }
    if (!party) {
      return c.json({ message: NOT_FOUND_PARTY }, { status: 404 })
    }
    if (!city) {
      return c.json({ message: 'Not found city' }, { status: 404 })
    }

    const { data, ...pageInfo } = await getPrefectureRanking({
      electionCode: election.code,
      partyId: party.id,
      prefectureCode: city.prefectureCode,
      sort,
      page,
    })

    return c.json({
      meta: {
        sort,
        unit: 'city',
        ...pageInfo,
      },
      data,
    })
  },
)
app.get('/api/parties/:partyCode/history/national', async (c) => {
  const { partyCode } = c.req.param()

  const party = await checkParty(partyCode)
  if (!party) {
    return c.json({ message: NOT_FOUND_PARTY }, { status: 404 })
  }

  const history = await getNationalPartyHistory({ partyCode: party.code })

  return c.json(history)
})

app.get('/api/parties/:partyCode/history/regions/:regionCode', async (c) => {
  const { regionCode, partyCode } = c.req.param()

  const regionSubmission = checkHokkaido(regionCode)

  if (regionSubmission.isHokkaido) {
    const originalUrl = new URL(c.req.url)

    return c.redirect(
      `/api/parties/${partyCode}/history/prefectures/${regionSubmission.prefectureCode}${originalUrl.search}`,
      301,
    )
  }

  const [party, region] = await Promise.all([
    checkParty(partyCode),
    checkRegion(regionCode),
  ])
  if (!party) {
    return c.json({ message: NOT_FOUND_PARTY }, { status: 404 })
  }
  if (!region) {
    return c.json({ message: 'Not found region' }, { status: 404 })
  }

  const history = await getRegionPartyHistory({
    partyCode: party.code,
    regionCode,
  })

  return c.json(history)
})

app.get(
  '/api/parties/:partyCode/history/prefectures/:prefectureCode',
  async (c) => {
    const { prefectureCode, partyCode } = c.req.param()

    const [prefecture, party] = await Promise.all([
      checkPrefecture(prefectureCode),
      checkParty(partyCode),
    ])
    if (!party) {
      return c.json({ message: NOT_FOUND_PARTY }, { status: 404 })
    }
    if (!prefecture) {
      return c.json({ message: 'Not found prefecture' }, { status: 404 })
    }

    const history = await getPrefecturePartyHistory({
      partyCode: party.code,
      prefectureCode,
    })

    return c.json(history)
  },
)

app.get('/api/parties/:partyCode/history/cities/:cityCode', async (c) => {
  const { cityCode, partyCode } = c.req.param()

  const [city, party] = await Promise.all([
    checkCity(cityCode),
    checkParty(partyCode),
  ])
  if (!party) {
    return c.json({ message: NOT_FOUND_PARTY }, { status: 404 })
  }
  if (!city) {
    return c.json({ message: 'Not found city' }, { status: 404 })
  }

  const history = await getCityPartyHistory({
    partyCode: party.code,
    cityCode,
  })

  return c.json(history)
})

app.get('/api/*', (c) => {
  return c.notFound()
})

app.get('*', (c) => {
  const html = `<!DOCTYPE html>` + renderToString(<RootRoute />)
  return c.html(html)
})

app.onError((error, c) => {
  const { message } = error

  switch (message) {
    case DB_ERROR:
    default: {
      return c.json(
        {
          message:
            'We’re sorry, but there’s an issue on our side. Please try again later.',
        },
        500,
      )
    }
  }
})

export default app
