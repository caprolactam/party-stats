import { Hono, type ExecutionContext } from 'hono'
import { contextStorage } from 'hono/context-storage'
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
  checkUnit,
} from './queries/area.ts'
import {
  listElections,
  getElection,
  checkElection,
  checkParty,
  listParties,
  getOverview,
} from './queries/election.ts'
import { getPartyDetails } from './queries/party-details.ts'
import {
  rankingSortSchema,
  rankingUnitSchema,
  getPartyRanking,
} from './queries/party-ranking.ts'
import {
  pageSchema,
  DB_ERROR,
  NOT_FOUND_AREA,
  NOT_FOUND_ELECTION,
  NOT_FOUND_PARTY,
} from './queries/utils.ts'

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

  return c.json(elections, 200, {
    'Cache-Control': 'private, max-age=3600, must-revalidate',
  })
})

app.get('/api/elections/:electionCode', async (c) => {
  const { electionCode } = c.req.param()
  const election = await getElection(electionCode)

  if (!election) {
    return c.json({ message: NOT_FOUND_ELECTION }, { status: 404 })
  }

  return c.json(election)
})

app.get('/api/elections/:electionCode/overview/unit/:unitCode', async (c) => {
  const { electionCode, unitCode } = c.req.param()

  const [election, unitInfo] = await Promise.all([
    checkElection(electionCode),
    checkUnit(unitCode),
  ])

  if (!unitInfo) {
    return c.json({ message: NOT_FOUND_AREA }, { status: 404 })
  }
  if (!election) {
    return c.json({ message: NOT_FOUND_ELECTION }, { status: 404 })
  }

  const overview = await getOverview({
    electionCode: election.code,
    unitInfo,
  })

  return c.json(overview)
})

app.get(
  '/api/elections/:electionCode/details/:partyCode/unit/:unitCode',
  async (c) => {
    const { electionCode, partyCode, unitCode } = c.req.param()

    const [election, party, unitInfo] = await Promise.all([
      checkElection(electionCode),
      checkParty(partyCode),
      checkUnit(unitCode),
    ])

    if (!unitInfo) {
      return c.json({ message: 'Invalid unit' }, { status: 400 })
    }
    if (!election) {
      return c.json({ message: NOT_FOUND_ELECTION }, { status: 404 })
    }
    if (!party) {
      return c.json({ message: NOT_FOUND_PARTY }, { status: 404 })
    }

    const details = await getPartyDetails({
      partyId: party.id,
      electionCode: election.code,
      unitInfo,
    })

    const { id, ...rest } = party

    return c.json({
      party: rest,
      ...details,
    })
  },
)

app.get(
  '/api/elections/:electionCode/ranking/:partyCode/unit/:unitCode',
  async (c) => {
    const { sort: sortQuery, unit: unitQuery, page: pageQuery } = c.req.query()

    const sortSubmission = safeParse(rankingSortSchema, sortQuery)
    const unitSubmission = safeParse(rankingUnitSchema, unitQuery)
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

    const { electionCode, partyCode, unitCode } = c.req.param()

    const [election, party, unitInfo] = await Promise.all([
      checkElection(electionCode),
      checkParty(partyCode),
      checkUnit(unitCode),
    ])

    if (!unitInfo) {
      return c.json({ message: NOT_FOUND_AREA }, { status: 404 })
    }
    if (!election) {
      return c.json({ message: NOT_FOUND_ELECTION }, { status: 404 })
    }
    if (!party) {
      return c.json({ message: NOT_FOUND_PARTY }, { status: 404 })
    }

    const ranking = await getPartyRanking({
      electionCode: election.code,
      partyId: party.id,
      unitInfo,
      sort,
      unit,
      page,
    })

    return c.json(ranking)
  },
)

app.get('/api/elections/:electionCode/parties', async (c) => {
  const { electionCode } = c.req.param()
  const election = await checkElection(electionCode)

  if (!election) {
    return c.json({ message: NOT_FOUND_ELECTION }, { status: 404 })
  }

  const parties = await listParties(election.code)

  return c.json(parties, 200, {
    'Cache-Control': 'private, max-age=3600, must-revalidate',
  })
})

app.get('/api/*', (c) => {
  return c.notFound()
})

app.get('*', (c) => {
  // we should return response through ASSETS binding, because worker script is invoked when the requested route has not matched any static assets.
  // source: https://developers.cloudflare.com/workers/static-assets/binding/#runtime-api-reference
  return c.env.ASSETS.fetch(c.req.url)
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
