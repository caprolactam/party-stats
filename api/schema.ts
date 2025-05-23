import * as v from 'valibot'

export const ListRegionsSchema = v.array(
  v.strictObject({
    code: v.string(),
    name: v.string(),
  }),
)
export type ListRegions = v.InferOutput<typeof ListRegionsSchema>

export const GetRegionSchema = v.strictObject({
  code: v.string(),
  name: v.string(),
})
export type GetRegion = v.InferOutput<typeof GetRegionSchema>

export const ListPrefecturesInRegionSchema = v.array(
  v.strictObject({
    code: v.string(),
    name: v.string(),
  }),
)
export type ListPrefecturesInRegion = v.InferOutput<
  typeof ListPrefecturesInRegionSchema
>

export const GetPrefectureSchema = v.strictObject({
  code: v.string(),
  name: v.string(),
  region: v.strictObject({
    code: v.string(),
    name: v.string(),
  }),
})
export type GetPrefecture = v.InferOutput<typeof GetPrefectureSchema>

export const ListCitiesInPrefectureSchema = v.strictObject({
  data: v.array(
    v.strictObject({
      code: v.string(),
      name: v.string(),
    }),
  ),
  meta: v.strictObject({
    currentPage: v.number(),
    pageSize: v.number(),
    totalItems: v.number(),
    totalPages: v.number(),
  }),
})
export type ListCitiesInPrefecture = v.InferOutput<
  typeof ListCitiesInPrefectureSchema
>

export const GetCitySchema = v.union([
  v.strictObject({
    code: v.string(),
    name: v.string(),
    archived: v.literal(false),
    prefecture: v.strictObject({
      code: v.string(),
      name: v.string(),
    }),
    region: v.strictObject({
      code: v.string(),
      name: v.string(),
    }),
  }),
  v.strictObject({
    code: v.string(),
    name: v.string(),
    archived: v.literal(true),
    redirectTo: v.string(),
    prefecture: v.strictObject({
      code: v.string(),
      name: v.string(),
    }),
    region: v.strictObject({
      code: v.string(),
      name: v.string(),
    }),
  }),
])
export type GetCity = v.InferOutput<typeof GetCitySchema>

export const ListAreaOptionsSchema = v.strictObject({
  meta: v.strictObject({
    cacheKey: v.string(),
    currentPage: v.number(),
    pageSize: v.number(),
    totalItems: v.number(),
    totalPages: v.number(),
  }),
  data: v.array(
    v.strictObject({
      code: v.string(),
      name: v.string(),
    }),
  ),
})
export type ListAreaOptions = v.InferOutput<typeof ListAreaOptionsSchema>

export const GetAreaSchema = v.union([
  v.strictObject({
    unit: v.literal('national'),
  }),
  v.strictObject({
    unit: v.literal('region'),
    ...GetRegionSchema.entries,
  }),
  v.strictObject({
    unit: v.literal('prefecture'),
    ...GetPrefectureSchema.entries,
  }),
  v.strictObject({
    unit: v.literal('city'),
    code: v.string(),
    name: v.string(),
    archived: v.literal(true),
    redirectTo: v.string(),
    prefecture: v.strictObject({
      code: v.string(),
      name: v.string(),
    }),
    region: v.strictObject({
      code: v.string(),
      name: v.string(),
    }),
  }),
  v.strictObject({
    unit: v.literal('city'),
    code: v.string(),
    name: v.string(),
    archived: v.literal(false),
    prefecture: v.strictObject({
      code: v.string(),
      name: v.string(),
    }),
    region: v.strictObject({
      code: v.string(),
      name: v.string(),
    }),
  }),
])
export type GetArea = v.InferOutput<typeof GetAreaSchema>

export const ListElectionsSchema = v.array(
  v.strictObject({
    code: v.string(),
    name: v.string(),
    date: v.string(),
    electionType: v.picklist(['shugiin', 'sangiin']),
  }),
)
export type ListElections = v.InferOutput<typeof ListElectionsSchema>

export const GetElectionSchema = v.strictObject({
  code: v.string(),
  name: v.string(),
  date: v.string(),
  source: v.string(),
  electionType: v.picklist(['shugiin', 'sangiin']),
})
export type GetElection = v.InferOutput<typeof GetElectionSchema>

export const ListPartiesSchema = v.array(
  v.strictObject({
    code: v.string(),
    name: v.string(),
  }),
)
export type ListParties = v.InferOutput<typeof ListPartiesSchema>

export const GetElectionOverviewSchema = v.strictObject({
  totalCount: v.number(),
  parties: v.array(
    v.strictObject({
      code: v.string(),
      name: v.string(),
      color: v.string(),
      count: v.number(),
      prevCount: v.nullable(v.number()),
      rate: v.number(),
      prevRate: v.nullable(v.number()),
    }),
  ),
})
export type GetElectionOverview = v.InferOutput<
  typeof GetElectionOverviewSchema
>

export const GetPartyRankingSchema = v.strictObject({
  meta: v.strictObject({
    sort: v.picklist(['desc-popularity', 'asc-popularity']),
    unit: v.picklist(['region', 'prefecture', 'city']),
    currentPage: v.number(),
    pageSize: v.number(),
    totalItems: v.number(),
    totalPages: v.number(),
  }),
  data: v.array(
    v.strictObject({
      code: v.string(),
      name: v.string(),
      rate: v.number(),
      supportText: v.optional(v.string()),
    }),
  ),
})
export type GetPartyRanking = v.InferOutput<typeof GetPartyRankingSchema>

export const getPartyDetailsSchema = v.strictObject({
  party: v.strictObject({
    code: v.string(),
    name: v.string(),
    color: v.string(),
  }),
  rankInNational: v.optional(
    v.strictObject({
      rank: v.number(),
      totalRank: v.number(),
    }),
  ),
  rankInPrefecture: v.optional(
    v.strictObject({
      rank: v.number(),
      totalRank: v.number(),
    }),
  ),
  changes: v.array(
    v.strictObject({
      election: v.strictObject({
        code: v.string(),
        name: v.string(),
        date: v.string(),
        electionType: v.picklist(['shugiin', 'sangiin']),
      }),
      count: v.number(),
      totalCount: v.number(),
      rate: v.number(),
    }),
  ),
})
export type GetPartyDetails = v.InferOutput<typeof getPartyDetailsSchema>
