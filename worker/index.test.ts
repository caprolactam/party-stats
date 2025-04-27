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
  GetElectionOverviewSchema,
  GetPartyRankingSchema,
  getPartyDetailsSchema,
} from '#api/schema.ts'
import {
  NOT_FOUND_AREA,
  NOT_FOUND_ELECTION,
  NOT_FOUND_PARTY,
} from './queries/utils.ts'
import app from './index'

const ELECTION_CODE = 'shugiin20241027'
const PARTY_CODE = 'ldp'
const REGION_CODE = '3'
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

describe('GET /api/elections/:electionCode/overview/area/:areaCode', () => {
  test('not found election with 404', async () => {
    const ctx = createExecutionContext()
    const res = await app.request(
      '/api/elections/not-found-election/overview/area/national',
      {},
      env,
      ctx,
    )

    await waitOnExecutionContext(ctx)

    expect(res.status).toBe(404)
    expect(await res.json()).toStrictEqual({
      message: NOT_FOUND_ELECTION,
    })
  }),
    test('not found area with 404', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/${ELECTION_CODE}/overview/area/not-found-area`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(404)
      expect(await res.json()).toStrictEqual({
        message: NOT_FOUND_AREA,
      })
    }),
    describe('get area national', () => {
      test('get election overview with 200', async () => {
        const ctx = createExecutionContext()
        const res = await app.request(
          `/api/elections/${ELECTION_CODE}/overview/area/national`,
          {},
          env,
          ctx,
        )

        await waitOnExecutionContext(ctx)

        expect(res.status).toBe(200)
        const sut = await res.json()
        expect(() => v.parse(GetElectionOverviewSchema, sut)).not.toThrow()
      })
    }),
    describe('get area region', () => {
      test('get election overview with 200', async () => {
        const ctx = createExecutionContext()
        const res = await app.request(
          `/api/elections/${ELECTION_CODE}/overview/area/${REGION_CODE}`,
          {},
          env,
          ctx,
        )

        await waitOnExecutionContext(ctx)

        expect(res.status).toBe(200)
        const sut = await res.json()
        expect(() => v.parse(GetElectionOverviewSchema, sut)).not.toThrow()
      })
    }),
    describe('get area prefecture', () => {
      test('get election overview with 200', async () => {
        const ctx = createExecutionContext()
        const res = await app.request(
          `/api/elections/${ELECTION_CODE}/overview/area/${PREFECTURE_CODE}`,
          {},
          env,
          ctx,
        )

        await waitOnExecutionContext(ctx)

        expect(res.status).toBe(200)
        const sut = await res.json()
        expect(() => v.parse(GetElectionOverviewSchema, sut)).not.toThrow()
      })
    }),
    describe('get area city', () => {
      test('get election overview with 200', async () => {
        const ctx = createExecutionContext()
        const res = await app.request(
          `/api/elections/${ELECTION_CODE}/overview/area/${CITY_CODE}`,
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
})

describe('GET /api/elections/:electionCode/ranking/:partyCode/area/:areaCode', () => {
  test('invalid sort with 400', async () => {
    const ctx = createExecutionContext()
    const res = await app.request(
      `/api/elections/${ELECTION_CODE}/ranking/${PARTY_CODE}/area/national?sort=invalid`,
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
    test('invalid unit with 400', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/${ELECTION_CODE}/ranking/${PARTY_CODE}/area/national?unit=invalid`,
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
    test('not found election with 404', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/not-found-election/ranking/${PARTY_CODE}/area/national`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(404)
      expect(await res.json()).toStrictEqual({
        message: NOT_FOUND_ELECTION,
      })
    }),
    test('not found party with 404', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/${ELECTION_CODE}/ranking/not-found-party/area/national`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(404)
      expect(await res.json()).toStrictEqual({
        message: NOT_FOUND_PARTY,
      })
    }),
    test('not found area with 404', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/${ELECTION_CODE}/ranking/${PARTY_CODE}/area/not-found-area`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(404)
      expect(await res.json()).toStrictEqual({
        message: NOT_FOUND_AREA,
      })
    }),
    describe('get area national', () => {
      test('get party ranking with 200', async () => {
        const ctx = createExecutionContext()
        const res = await app.request(
          `/api/elections/${ELECTION_CODE}/ranking/${PARTY_CODE}/area/national`,
          {},
          env,
          ctx,
        )

        await waitOnExecutionContext(ctx)

        expect(res.status).toBe(200)
        const sut = await res.json()
        expect(() => v.parse(GetPartyRankingSchema, sut)).not.toThrow()
      }),
        test.each(['asc-popularity', 'desc-popularity'])(
          'valid sort with %s',
          async (sort) => {
            const ctx = createExecutionContext()
            const res = await app.request(
              `/api/elections/${ELECTION_CODE}/ranking/${PARTY_CODE}/area/national?sort=${sort}`,
              {},
              env,
              ctx,
            )
            await waitOnExecutionContext(ctx)
            expect(res.status).toBe(200)
            const sut = await res.json()
            expect(() => v.parse(GetPartyRankingSchema, sut)).not.toThrow()
          },
        ),
        test.each(['region', 'prefecture', 'city'])(
          'valid unit with %s',
          async (unit) => {
            const ctx = createExecutionContext()
            const res = await app.request(
              `/api/elections/${ELECTION_CODE}/ranking/${PARTY_CODE}/area/national?unit=${unit}`,
              {},
              env,
              ctx,
            )
            await waitOnExecutionContext(ctx)
            expect(res.status).toBe(200)
            const sut = await res.json()
            expect(() => v.parse(GetPartyRankingSchema, sut)).not.toThrow()
          },
        )
    }),
    describe('get area region', () => {
      test('get party ranking with 200', async () => {
        const ctx = createExecutionContext()
        const res = await app.request(
          `/api/elections/${ELECTION_CODE}/ranking/${PARTY_CODE}/area/${REGION_CODE}`,
          {},
          env,
          ctx,
        )

        await waitOnExecutionContext(ctx)

        expect(res.status).toBe(200)
        const sut = await res.json()
        expect(() => v.parse(GetPartyRankingSchema, sut)).not.toThrow()
      }),
        test.each(['asc-popularity', 'desc-popularity'])(
          'valid sort with %s',
          async (sort) => {
            const ctx = createExecutionContext()
            const res = await app.request(
              `/api/elections/${ELECTION_CODE}/ranking/${PARTY_CODE}/area/${REGION_CODE}?sort=${sort}`,
              {},
              env,
              ctx,
            )
            await waitOnExecutionContext(ctx)
            expect(res.status).toBe(200)
            const sut = await res.json()
            expect(() => v.parse(GetPartyRankingSchema, sut)).not.toThrow()
          },
        ),
        test.each(['prefecture', 'city'])(
          'valid unit with %s',
          async (unit) => {
            const ctx = createExecutionContext()
            const res = await app.request(
              `/api/elections/${ELECTION_CODE}/ranking/${PARTY_CODE}/area/${REGION_CODE}?unit=${unit}`,
              {},
              env,
              ctx,
            )
            await waitOnExecutionContext(ctx)
            expect(res.status).toBe(200)
            const sut = await res.json()
            expect(() => v.parse(GetPartyRankingSchema, sut)).not.toThrow()
          },
        )
    }),
    describe('get area prefecture', () => {
      test('get party ranking with 200', async () => {
        const ctx = createExecutionContext()
        const res = await app.request(
          `/api/elections/${ELECTION_CODE}/ranking/${PARTY_CODE}/area/${PREFECTURE_CODE}`,
          {},
          env,
          ctx,
        )

        await waitOnExecutionContext(ctx)

        expect(res.status).toBe(200)
        const sut = await res.json()
        expect(() => v.parse(GetPartyRankingSchema, sut)).not.toThrow()
      }),
        test.each(['asc-popularity', 'desc-popularity'])(
          'valid sort with %s',
          async (sort) => {
            const ctx = createExecutionContext()
            const res = await app.request(
              `/api/elections/${ELECTION_CODE}/ranking/${PARTY_CODE}/area/${PREFECTURE_CODE}?sort=${sort}`,
              {},
              env,
              ctx,
            )
            await waitOnExecutionContext(ctx)
            expect(res.status).toBe(200)
            const sut = await res.json()
            expect(() => v.parse(GetPartyRankingSchema, sut)).not.toThrow()
          },
        ),
        test.each(['city'])('valid unit with %s', async (unit) => {
          const ctx = createExecutionContext()
          const res = await app.request(
            `/api/elections/${ELECTION_CODE}/ranking/${PARTY_CODE}/area/${PREFECTURE_CODE}?unit=${unit}`,
            {},
            env,
            ctx,
          )
          await waitOnExecutionContext(ctx)
          expect(res.status).toBe(200)
          const sut = await res.json()
          expect(() => v.parse(GetPartyRankingSchema, sut)).not.toThrow()
        })
    }),
    describe('get area city', () => {
      test('get party ranking with 200', async () => {
        const ctx = createExecutionContext()
        const res = await app.request(
          `/api/elections/${ELECTION_CODE}/ranking/${PARTY_CODE}/area/${CITY_CODE}`,
          {},
          env,
          ctx,
        )

        await waitOnExecutionContext(ctx)

        expect(res.status).toBe(200)
        const sut = await res.json()
        expect(() => v.parse(GetPartyRankingSchema, sut)).not.toThrow()
      }),
        test.each(['asc-popularity', 'desc-popularity'])(
          'valid sort with %s',
          async (sort) => {
            const ctx = createExecutionContext()
            const res = await app.request(
              `/api/elections/${ELECTION_CODE}/ranking/${PARTY_CODE}/area/${CITY_CODE}?sort=${sort}`,
              {},
              env,
              ctx,
            )
            await waitOnExecutionContext(ctx)
            expect(res.status).toBe(200)
            const sut = await res.json()
            expect(() => v.parse(GetPartyRankingSchema, sut)).not.toThrow()
          },
        ),
        test.each(['city'])('valid unit with %s', async (unit) => {
          const ctx = createExecutionContext()
          const res = await app.request(
            `/api/elections/${ELECTION_CODE}/ranking/${PARTY_CODE}/area/${CITY_CODE}?unit=${unit}`,
            {},
            env,
            ctx,
          )
          await waitOnExecutionContext(ctx)
          expect(res.status).toBe(200)
          const sut = await res.json()
          expect(() => v.parse(GetPartyRankingSchema, sut)).not.toThrow()
        })
    })
})

describe('GET /api/elections/:electionCode/details/:partyCode/area/:areaCode', () => {
  test('not found election with 404', async () => {
    const ctx = createExecutionContext()
    const res = await app.request(
      `/api/elections/not-found-election/details/${PARTY_CODE}/area/${REGION_CODE}`,
      {},
      env,
      ctx,
    )

    await waitOnExecutionContext(ctx)

    expect(res.status).toBe(404)
    expect(await res.json()).toStrictEqual({
      message: NOT_FOUND_ELECTION,
    })
  }),
    test('not found party with 404', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/${ELECTION_CODE}/details/not-found-party/area/${REGION_CODE}`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(404)
      expect(await res.json()).toStrictEqual({
        message: NOT_FOUND_PARTY,
      })
    }),
    test('invalid unit with 404', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/${ELECTION_CODE}/details/${PARTY_CODE}/area/not-found-unit`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(404)
      expect(await res.json()).toStrictEqual({
        message: NOT_FOUND_AREA,
      })
    }),
    test('get national party details with 200', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/${ELECTION_CODE}/details/${PARTY_CODE}/area/national`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(200)
      const sut = await res.json()
      expect(() => v.parse(getPartyDetailsSchema, sut)).not.toThrow()
    }),
    test('get region party details with 200', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/${ELECTION_CODE}/details/${PARTY_CODE}/area/${REGION_CODE}`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(200)
      const sut = await res.json()
      expect(() => v.parse(getPartyDetailsSchema, sut)).not.toThrow()
    }),
    test('get prefecture party details with 200', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/${ELECTION_CODE}/details/${PARTY_CODE}/area/${PREFECTURE_CODE}`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(200)
      const sut = await res.json()
      expect(() => v.parse(getPartyDetailsSchema, sut)).not.toThrow()
    }),
    test('get city party details with 200', async () => {
      const ctx = createExecutionContext()
      const res = await app.request(
        `/api/elections/${ELECTION_CODE}/details/${PARTY_CODE}/area/${CITY_CODE}`,
        {},
        env,
        ctx,
      )

      await waitOnExecutionContext(ctx)

      expect(res.status).toBe(200)
      const sut = await res.json()
      expect(() => v.parse(getPartyDetailsSchema, sut)).not.toThrow()
    })
})
