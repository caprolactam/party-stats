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
  cities: v.array(
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

const GetRankingMetaSchema = v.strictObject({
  sort: v.picklist(['desc-popularity', 'asc-popularity']),
  currentPage: v.number(),
  pageSize: v.number(),
  totalItems: v.number(),
  totalPages: v.number(),
})
const GetRankingDataSchema = v.array(
  v.strictObject({
    code: v.string(),
    name: v.string(),
    rate: v.number(),
    supportText: v.optional(v.string()),
  }),
)

export const GetNationalRankingSchema = v.strictObject({
  meta: v.strictObject({
    ...GetRankingMetaSchema.entries,
    unit: v.picklist(['region', 'prefecture', 'city']),
  }),
  data: GetRankingDataSchema,
})
export type GetJapanRanking = v.InferOutput<typeof GetNationalRankingSchema>

export const GetRegionRankingSchema = v.strictObject({
  meta: v.strictObject({
    ...GetRankingMetaSchema.entries,
    unit: v.picklist(['prefecture', 'city']),
  }),
  data: GetRankingDataSchema,
})
export type GetRegionRanking = v.InferOutput<typeof GetRegionRankingSchema>

export const GetPrefectureRankingSchema = v.strictObject({
  meta: v.strictObject({
    ...GetRankingMetaSchema.entries,
    unit: v.literal('city'),
  }),
  data: GetRankingDataSchema,
})
export type GetPrefectureRanking = v.InferOutput<
  typeof GetPrefectureRankingSchema
>

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
