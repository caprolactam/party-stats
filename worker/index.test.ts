import {
  env,
  createExecutionContext,
  waitOnExecutionContext,
} from 'cloudflare:test'
import * as v from 'valibot'
import { test, expect, describe } from 'vitest'
import {
  ListRegionsSchema,
  GetRegionSchema,
  ListPrefecturesInRegionSchema,
  GetPrefectureSchema,
  ListCitiesInPrefectureSchema,
  GetCitySchema,
  ListElectionsSchema,
  GetElectionSchema,
  GetLeaderPartySchema,
  GetElectionOverviewSchema,
  GetNationalRankingSchema,
  GetRegionRankingSchema,
  GetPrefectureRankingSchema,
  GetElectionPartyHistorySchema,
} from '#api/schema.ts'
import app from './index'

const PARTY_CODE = 'ldp'
const REGION_CODE = '3'
const ELECTION_CODE = 'shugiin20241027'
const PREFECTURE_CODE = '130001'
const CITY_CODE = '13101'

describe('GET /api/not-endpoint', () => {
  test('not found endpoint with 404', async () => {
    const ctx = createExecutionContext()
    const res = await app.request('/api/not-endpoint', {}, env, ctx)
    await waitOnExecutionContext(ctx)

    expect(res.status).toBe(404)
  })
})

describe('LIST /api/regions', () => {
  test('list regions with 200', async () => {
    const ctx = createExecutionContext()
    const res = await app.request('/api/regions', {}, env, ctx)
    await waitOnExecutionContext(ctx)

    expect(res.status).toBe(200)

    const sut = await res.json()
    expect(() => v.parse(ListRegionsSchema, sut)).not.toThrow()
  })
})

describe('GET /api/regions/:regionCode', () => {
  test('not found region with 404', async () => {
    const ctx = createExecutionContext()
    const res = await app.request('/api/regions/not-found-region', {}, env, ctx)
    await waitOnExecutionContext(ctx)

    expect(res.status).toBe(404)

    const sut = await res.json()
    expect(sut).toStrictEqual({
      message: 'Not found region',
    })
  }),
    test('get region with 200', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(`/api/regions/${REGION_CODE}`, {}, env, ctx)
      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(200)

      const sut = await res.json()
      expect(() => v.parse(GetRegionSchema, sut)).not.toThrow()
    })
})

describe('LIST /api/regions/:regionCode/prefectures', () => {
  test('not found region with 404', async () => {
    const ctx = createExecutionContext()
    const res = await app.request(
      '/api/regions/not-found-region/prefectures',
      {},
      env,
      ctx,
    )
    await waitOnExecutionContext(ctx)

    expect(res.status).toBe(404)

    const sut = await res.json()
    expect(sut).toStrictEqual({
      message: 'Not found region',
    })
  }),
    test('list prefectures with 200', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/regions/${REGION_CODE}/prefectures`,
        {},
        env,
        ctx,
      )
      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(200)

      const sut = await res.json()
      expect(() => v.parse(ListPrefecturesInRegionSchema, sut)).not.toThrow()
    })
})

describe('GET /api/prefectures/:prefectureCode', () => {
  test('not found prefecture with 404', async () => {
    const ctx = createExecutionContext()
    const res = await app.request(
      '/api/prefectures/not-found-prefecture',
      {},
      env,
      ctx,
    )
    await waitOnExecutionContext(ctx)

    expect(res.status).toBe(404)

    const sut = await res.json()
    expect(sut).toStrictEqual({
      message: 'Not found prefecture',
    })
  }),
    test('get prefecture with 200', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/prefectures/${PREFECTURE_CODE}`,
        {},
        env,
        ctx,
      )
      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(200)

      const sut = await res.json()
      expect(() => v.parse(GetPrefectureSchema, sut)).not.toThrow()
    })
})

describe('LIST /api/prefectures/:prefectureCode/cities', () => {
  test('not found prefecture with 404', async () => {
    const ctx = createExecutionContext()
    const res = await app.request(
      '/api/prefectures/not-found-prefecture/cities',
      {},
      env,
      ctx,
    )
    await waitOnExecutionContext(ctx)

    expect(res.status).toBe(404)

    const sut = await res.json()
    expect(sut).toStrictEqual({
      message: 'Not found prefecture',
    })
  }),
    test('list cities with 200', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/prefectures/${PREFECTURE_CODE}/cities`,
        {},
        env,
        ctx,
      )
      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(200)

      const sut = await res.json()
      expect(() => v.parse(ListCitiesInPrefectureSchema, sut)).not.toThrow()
    })
})

describe('GET /api/cities/:cityCode', () => {
  test('not found city with 404', async () => {
    const ctx = createExecutionContext()
    const res = await app.request('/api/cities/not-found-city', {}, env, ctx)
    await waitOnExecutionContext(ctx)
    expect(res.status).toBe(404)
    const sut = await res.json()
    expect(sut).toStrictEqual({
      message: 'Not found city',
    })
  }),
    test('get city with 200', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(`/api/cities/${CITY_CODE}`, {}, env, ctx)
      await waitOnExecutionContext(ctx)
      expect(res.status).toBe(200)
      const sut = await res.json()
      expect(() => v.parse(GetCitySchema, sut)).not.toThrow()
    })
})

describe('LIST /api/elections', () => {
  test('list elections with 200', async () => {
    const ctx = createExecutionContext()
    const res = await app.request('/api/elections', {}, env, ctx)

    await waitOnExecutionContext(ctx)

    expect(res.status).toBe(200)
    const sut = await res.json()
    expect(() => v.parse(ListElectionsSchema, sut)).not.toThrow()
  })
})

describe('GET /api/elections/:electionCode', () => {
  test('not found election with 404', async () => {
    const ctx = createExecutionContext()
    const res = await app.request(
      '/api/elections/not-found-election',
      {},
      env,
      ctx,
    )
    await waitOnExecutionContext(ctx)
    expect(res.status).toBe(404)
    const sut = await res.json()
    expect(sut).toStrictEqual({
      message: '指定の選挙が見つかりませんでした',
    })
  }),
    test('get election with 200', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/${ELECTION_CODE}`,
        {},
        env,
        ctx,
      )
      await waitOnExecutionContext(ctx)
      expect(res.status).toBe(200)
      const sut = await res.json()
      expect(() => v.parse(GetElectionSchema, sut)).not.toThrow()
    })
})

describe('GET /api/elections/:electionCode/leader', () => {
  test('not found election with 404', async () => {
    const ctx = createExecutionContext()
    const res = await app.request(
      '/api/elections/not-found-election/leader',
      {},
      env,
      ctx,
    )

    await waitOnExecutionContext(ctx)

    expect(res.status).toBe(404)
    expect(await res.json()).toStrictEqual({
      message: '指定の選挙が見つかりませんでした',
    })
  }),
    test('get election leader with 200', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/${ELECTION_CODE}/leader`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(200)
      const sut = await res.json()
      expect(() => v.parse(GetLeaderPartySchema, sut)).not.toThrow()
    })
})

describe('GET /api/elections/:electionCode/overview/national', () => {
  test('not found election with 404', async () => {
    const ctx = createExecutionContext()
    const res = await app.request(
      '/api/elections/not-found-election/overview/national',
      {},
      env,
      ctx,
    )

    await waitOnExecutionContext(ctx)

    expect(res.status).toBe(404)
    expect(await res.json()).toStrictEqual({
      message: '指定の選挙が見つかりませんでした',
    })
  }),
    test('get election overview with 200', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/${ELECTION_CODE}/overview/national`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(200)
      const sut = await res.json()
      expect(() => v.parse(GetElectionOverviewSchema, sut)).not.toThrow()
    })
})

describe('GET /api/elections/:electionCode/overview/regions/:regionCode', () => {
  test('not found election with 404', async () => {
    const ctx = createExecutionContext()
    const res = await app.request(
      `/api/elections/not-found-election/overview/regions/${REGION_CODE}`,
      {},
      env,
      ctx,
    )

    await waitOnExecutionContext(ctx)

    expect(res.status).toBe(404)
    expect(await res.json()).toStrictEqual({
      message: '指定の選挙が見つかりませんでした',
    })
  }),
    test('not found region with 404', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/${ELECTION_CODE}/overview/regions/not-found-region`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(404)
      expect(await res.json()).toStrictEqual({
        message: 'Not found region',
      })
    }),
    test('get election overview with 200', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/${ELECTION_CODE}/overview/regions/${REGION_CODE}`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(200)
      const sut = await res.json()
      expect(() => v.parse(GetElectionOverviewSchema, sut)).not.toThrow()
    })
})

describe('GET /api/elections/:electionCode/overview/prefectures/:prefectureCode', () => {
  test('not found election with 404', async () => {
    const ctx = createExecutionContext()
    const res = await app.request(
      `/api/elections/not-found-election/overview/prefectures/${PREFECTURE_CODE}`,
      {},
      env,
      ctx,
    )

    await waitOnExecutionContext(ctx)

    expect(res.status).toBe(404)
    expect(await res.json()).toStrictEqual({
      message: '指定の選挙が見つかりませんでした',
    })
  }),
    test('not found prefecture with 404', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/${ELECTION_CODE}/overview/prefectures/not-found-prefecture`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(404)
      expect(await res.json()).toStrictEqual({
        message: 'Not found prefecture',
      })
    }),
    test('get election overview with 200', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/${ELECTION_CODE}/overview/prefectures/${PREFECTURE_CODE}`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(200)
      const sut = await res.json()
      expect(() => v.parse(GetElectionOverviewSchema, sut)).not.toThrow()
    })
})

describe('GET /api/elections/:electionCode/overview/cities/:cityCode', () => {
  test('not found election with 404', async () => {
    const ctx = createExecutionContext()
    const res = await app.request(
      `/api/elections/not-found-election/overview/cities/${CITY_CODE}`,
      {},
      env,
      ctx,
    )

    await waitOnExecutionContext(ctx)

    expect(res.status).toBe(404)
    expect(await res.json()).toStrictEqual({
      message: '指定の選挙が見つかりませんでした',
    })
  }),
    test('not found city with 404', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/${ELECTION_CODE}/overview/cities/not-found-city`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(404)
      expect(await res.json()).toStrictEqual({
        message: 'Not found city',
      })
    }),
    test('get election overview with 200', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/${ELECTION_CODE}/overview/cities/${CITY_CODE}`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(200)
      const sut = await res.json()
      expect(() => v.parse(GetElectionOverviewSchema, sut)).not.toThrow()
    })
})

describe('GET /api/elections/:electionCode/ranking/parties/:partyCode/national', () => {
  test('invalid sort with 400', async () => {
    const ctx = createExecutionContext()
    const res = await app.request(
      `/api/elections/${ELECTION_CODE}/ranking/parties/${PARTY_CODE}/national?sort=invalid`,
      {},
      env,
      ctx,
    )
    await waitOnExecutionContext(ctx)
    expect(res.status).toBe(400)
    const sut = await res.json()
    expect(sut).toStrictEqual({
      message: 'Invalid sort',
    })
  }),
    test.each(['asc-popularity', 'desc-popularity'])(
      'valid sort with %s',
      async (sort) => {
        const ctx = createExecutionContext()
        const res = await app.request(
          `/api/elections/${ELECTION_CODE}/ranking/parties/${PARTY_CODE}/national?sort=${sort}`,
          {},
          env,
          ctx,
        )
        await waitOnExecutionContext(ctx)
        expect(res.status).toBe(200)
        const sut = await res.json()
        expect(() => v.parse(GetNationalRankingSchema, sut)).not.toThrow()
      },
    ),
    test('invalid unit with 400', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/${ELECTION_CODE}/ranking/parties/${PARTY_CODE}/national?unit=invalid`,
        {},
        env,
        ctx,
      )
      await waitOnExecutionContext(ctx)
      expect(res.status).toBe(400)
      const sut = await res.json()
      expect(sut).toStrictEqual({
        message: 'Invalid unit',
      })
    }),
    test.each(['region', 'prefecture', 'city'])(
      'valid unit with %s',
      async (unit) => {
        const ctx = createExecutionContext()
        const res = await app.request(
          `/api/elections/${ELECTION_CODE}/ranking/parties/${PARTY_CODE}/national?unit=${unit}`,
          {},
          env,
          ctx,
        )
        await waitOnExecutionContext(ctx)
        expect(res.status).toBe(200)
        const sut = await res.json()
        expect(() => v.parse(GetNationalRankingSchema, sut)).not.toThrow()
      },
    ),
    test('not found election with 404', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/not-found-election/ranking/parties/${PARTY_CODE}/national`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(404)
      expect(await res.json()).toStrictEqual({
        message: '指定の選挙が見つかりませんでした',
      })
    }),
    test('not found party with 404', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/${ELECTION_CODE}/ranking/parties/not-found-party/national`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(404)
      expect(await res.json()).toStrictEqual({
        message: '指定の政党が見つかりませんでした',
      })
    }),
    test('get election party ranking with 200', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/${ELECTION_CODE}/ranking/parties/${PARTY_CODE}/national`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(200)
      const sut = await res.json()
      expect(() => v.parse(GetNationalRankingSchema, sut)).not.toThrow()
    })
})

describe('GET /api/elections/:electionCode/ranking/parties/:partyCode/regions/:regionCode', () => {
  test('invalid sort with 400', async () => {
    const ctx = createExecutionContext()
    const res = await app.request(
      `/api/elections/${ELECTION_CODE}/ranking/parties/${PARTY_CODE}/regions/${REGION_CODE}?sort=invalid`,
      {},
      env,
      ctx,
    )
    await waitOnExecutionContext(ctx)
    expect(res.status).toBe(400)
    const sut = await res.json()
    expect(sut).toStrictEqual({
      message: 'Invalid sort',
    })
  }),
    test.each(['asc-popularity', 'desc-popularity'])(
      'valid sort with %s',
      async (sort) => {
        const ctx = createExecutionContext()
        const res = await app.request(
          `/api/elections/${ELECTION_CODE}/ranking/parties/${PARTY_CODE}/regions/${REGION_CODE}?sort=${sort}`,
          {},
          env,
          ctx,
        )
        await waitOnExecutionContext(ctx)
        expect(res.status).toBe(200)
        const sut = await res.json()
        expect(() => v.parse(GetRegionRankingSchema, sut)).not.toThrow()
      },
    ),
    test('invalid unit with 400', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/${ELECTION_CODE}/ranking/parties/${PARTY_CODE}/regions/${REGION_CODE}?unit=invalid`,
        {},
        env,
        ctx,
      )
      await waitOnExecutionContext(ctx)
      expect(res.status).toBe(400)
      const sut = await res.json()
      expect(sut).toStrictEqual({
        message: 'Invalid unit',
      })
    }),
    test.each(['prefecture', 'city'])('valid unit with %s', async (unit) => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/${ELECTION_CODE}/ranking/parties/${PARTY_CODE}/regions/${REGION_CODE}?unit=${unit}`,
        {},
        env,
        ctx,
      )
      await waitOnExecutionContext(ctx)
      expect(res.status).toBe(200)
      const sut = await res.json()
      expect(() => v.parse(GetRegionRankingSchema, sut)).not.toThrow()
    }),
    test('not found election with 404', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/not-found-election/ranking/parties/${PARTY_CODE}/regions/${REGION_CODE}`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(404)
      expect(await res.json()).toStrictEqual({
        message: '指定の選挙が見つかりませんでした',
      })
    }),
    test('not found region with 404', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/${ELECTION_CODE}/ranking/parties/${PARTY_CODE}/regions/not-found-region`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(404)
      expect(await res.json()).toStrictEqual({
        message: 'Not found region',
      })
    }),
    test('not found party with 404', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/${ELECTION_CODE}/ranking/parties/not-found-party/regions/${REGION_CODE}`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(404)
      expect(await res.json()).toStrictEqual({
        message: '指定の政党が見つかりませんでした',
      })
    }),
    test('get election party ranking with 200', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/${ELECTION_CODE}/ranking/parties/${PARTY_CODE}/regions/${REGION_CODE}`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(200)
      const sut = await res.json()
      expect(() => v.parse(GetRegionRankingSchema, sut)).not.toThrow()
    })
})

describe('GET /api/elections/:electionCode/ranking/parties/:partyCode/prefectures/:prefectureCode', () => {
  test('invalid sort with 400', async () => {
    const ctx = createExecutionContext()
    const res = await app.request(
      `/api/elections/${ELECTION_CODE}/ranking/parties/${PARTY_CODE}/prefectures/${PREFECTURE_CODE}?sort=invalid`,
      {},
      env,
      ctx,
    )
    await waitOnExecutionContext(ctx)
    expect(res.status).toBe(400)
    const sut = await res.json()
    expect(sut).toStrictEqual({
      message: 'Invalid sort',
    })
  }),
    test.each(['asc-popularity', 'desc-popularity'])(
      'valid sort with %s',
      async (sort) => {
        const ctx = createExecutionContext()
        const res = await app.request(
          `/api/elections/${ELECTION_CODE}/ranking/parties/${PARTY_CODE}/prefectures/${PREFECTURE_CODE}?sort=${sort}`,
          {},
          env,
          ctx,
        )
        await waitOnExecutionContext(ctx)
        expect(res.status).toBe(200)
        const sut = await res.json()
        expect(() => v.parse(GetPrefectureRankingSchema, sut)).not.toThrow()
      },
    ),
    test('not found election with 404', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/not-found-election/ranking/parties/${PARTY_CODE}/prefectures/${PREFECTURE_CODE}`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(404)
      expect(await res.json()).toStrictEqual({
        message: '指定の選挙が見つかりませんでした',
      })
    }),
    test('not found prefecture with 404', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/${ELECTION_CODE}/ranking/parties/${PARTY_CODE}/prefectures/not-found-prefecture`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(404)
      expect(await res.json()).toStrictEqual({
        message: 'Not found prefecture',
      })
    }),
    test('not found party with 404', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/${ELECTION_CODE}/ranking/parties/not-found-party/prefectures/${PREFECTURE_CODE}`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(404)
      expect(await res.json()).toStrictEqual({
        message: '指定の政党が見つかりませんでした',
      })
    }),
    test('get election party ranking with 200', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/${ELECTION_CODE}/ranking/parties/${PARTY_CODE}/prefectures/${PREFECTURE_CODE}`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(200)
      const sut = await res.json()
      expect(() => v.parse(GetPrefectureRankingSchema, sut)).not.toThrow()
    })
})

describe('GET /api/elections/:electionCode/ranking/parties/:partyCode/cities/:cityCode', () => {
  test('invalid sort with 400', async () => {
    const ctx = createExecutionContext()
    const res = await app.request(
      `/api/elections/${ELECTION_CODE}/ranking/parties/${PARTY_CODE}/cities/${CITY_CODE}?sort=invalid`,
      {},
      env,
      ctx,
    )
    await waitOnExecutionContext(ctx)
    expect(res.status).toBe(400)
    const sut = await res.json()
    expect(sut).toStrictEqual({
      message: 'Invalid sort',
    })
  }),
    test.each(['asc-popularity', 'desc-popularity'])(
      'valid sort with %s',
      async (sort) => {
        const ctx = createExecutionContext()
        const res = await app.request(
          `/api/elections/${ELECTION_CODE}/ranking/parties/${PARTY_CODE}/cities/${CITY_CODE}?sort=${sort}`,
          {},
          env,
          ctx,
        )
        await waitOnExecutionContext(ctx)
        expect(res.status).toBe(200)
        const sut = await res.json()
        expect(() => v.parse(GetPrefectureRankingSchema, sut)).not.toThrow()
      },
    ),
    test('not found election with 404', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/not-found-election/ranking/parties/${PARTY_CODE}/cities/${CITY_CODE}`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(404)
      expect(await res.json()).toStrictEqual({
        message: '指定の選挙が見つかりませんでした',
      })
    }),
    test('not found city with 404', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/${ELECTION_CODE}/ranking/parties/${PARTY_CODE}/cities/not-found-city`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(404)
      expect(await res.json()).toStrictEqual({
        message: 'Not found city',
      })
    }),
    test('not found party with 404', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/${ELECTION_CODE}/ranking/parties/not-found-party/cities/${CITY_CODE}`,
        {},
        env,
        ctx,
      )
      await waitOnExecutionContext(ctx)
      expect(res.status).toBe(404)
      const sut = await res.json()
      expect(sut).toStrictEqual({
        message: '指定の政党が見つかりませんでした',
      })
    }),
    test('get election party ranking with 200', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/${ELECTION_CODE}/ranking/parties/${PARTY_CODE}/cities/${CITY_CODE}`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(200)
      const sut = await res.json()
      expect(() => v.parse(GetPrefectureRankingSchema, sut)).not.toThrow()
    })
})

describe('GET /api/parties/:partyCode/history/national', () => {
  test('not found party with 404', async () => {
    const ctx = createExecutionContext()
    const res = await app.request(
      '/api/parties/not-found-party/history/national',
      {},
      env,
      ctx,
    )

    await waitOnExecutionContext(ctx)

    expect(res.status).toBe(404)
    expect(await res.json()).toStrictEqual({
      message: '指定の政党が見つかりませんでした',
    })
  }),
    test('get party history with 200', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/parties/${PARTY_CODE}/history/national`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(200)
      const sut = await res.json()
      expect(() => v.parse(GetElectionPartyHistorySchema, sut)).not.toThrow()
    })
})

describe('GET /api/parties/:partyCode/history/regions/:regionCode', () => {
  test('not found party with 404', async () => {
    const ctx = createExecutionContext()
    const res = await app.request(
      `/api/parties/not-found-party/history/regions/${REGION_CODE}`,
      {},
      env,
      ctx,
    )

    await waitOnExecutionContext(ctx)

    expect(res.status).toBe(404)
    expect(await res.json()).toStrictEqual({
      message: '指定の政党が見つかりませんでした',
    })
  }),
    test('not found region with 404', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/parties/${PARTY_CODE}/history/regions/not-found-region`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(404)
      expect(await res.json()).toStrictEqual({
        message: 'Not found region',
      })
    }),
    test('get party history with 200', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/parties/${PARTY_CODE}/history/regions/${REGION_CODE}`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(200)
      const sut = await res.json()
      expect(() => v.parse(GetElectionPartyHistorySchema, sut)).not.toThrow()
    })
})
describe('GET /api/parties/:partyCode/history/prefectures/:prefectureCode', () => {
  test('not found party with 404', async () => {
    const ctx = createExecutionContext()
    const res = await app.request(
      `/api/parties/not-found-party/history/prefectures/${PREFECTURE_CODE}`,
      {},
      env,
      ctx,
    )

    await waitOnExecutionContext(ctx)

    expect(res.status).toBe(404)
    expect(await res.json()).toStrictEqual({
      message: '指定の政党が見つかりませんでした',
    })
  }),
    test('not found prefecture with 404', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/parties/${PARTY_CODE}/history/prefectures/not-found-prefecture`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(404)
      expect(await res.json()).toStrictEqual({
        message: 'Not found prefecture',
      })
    }),
    test('get party history with 200', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/parties/${PARTY_CODE}/history/prefectures/${PREFECTURE_CODE}`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(200)
      const sut = await res.json()
      expect(() => v.parse(GetElectionPartyHistorySchema, sut)).not.toThrow()
    })
})
describe('GET /api/parties/:partyCode/history/cities/:cityCode', () => {
  test('not found party with 404', async () => {
    const ctx = createExecutionContext()
    const res = await app.request(
      `/api/parties/not-found-party/history/cities/${CITY_CODE}`,
      {},
      env,
      ctx,
    )

    await waitOnExecutionContext(ctx)

    expect(res.status).toBe(404)
    expect(await res.json()).toStrictEqual({
      message: '指定の政党が見つかりませんでした',
    })
  }),
    test('not found city with 404', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/parties/${PARTY_CODE}/history/cities/not-found-city`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(404)
      expect(await res.json()).toStrictEqual({
        message: 'Not found city',
      })
    }),
    test('get party history with 200', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/parties/${PARTY_CODE}/history/cities/${CITY_CODE}`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(200)
      const sut = await res.json()
      expect(() => v.parse(GetElectionPartyHistorySchema, sut)).not.toThrow()
    })
})
