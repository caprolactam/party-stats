import {
  text,
  integer,
  real,
  sqliteTable,
  primaryKey,
  index,
} from 'drizzle-orm/sqlite-core'

export const elections = sqliteTable('elections', {
  code: text().primaryKey(),
  name: text().notNull(),
  date: integer({ mode: 'timestamp' }).notNull(),
  source: text().notNull(),
  electionType: text('election_type', {
    enum: ['shugiin', 'sangiin'],
  }).notNull(),
})

export const parties = sqliteTable('parties', {
  id: text().primaryKey(),
  code: text().notNull().unique(),
  name: text().notNull(),
  color: text().notNull(),
})

export const regions = sqliteTable('regions', {
  code: text().primaryKey(),
  name: text().notNull(),
})

export const prefectures = sqliteTable('prefectures', {
  code: text().primaryKey(),
  name: text().notNull(),
  regionCode: text('region_code')
    .references(() => regions.code)
    .notNull(),
})

export const cities = sqliteTable('cities', {
  code: text().primaryKey(),
  name: text().notNull(),
  prefectureCode: text('prefecture_code')
    .references(() => prefectures.code)
    .notNull(),
  archived: integer({ mode: 'boolean' }).notNull(),
})

// Closure table
// e.g. city1とcity2がありcity2がcity1に合併される場合、1-1, 1-2, 2-2の3つのレコードが必要
export const citiesHistories = sqliteTable(
  'cities_histories',
  {
    ancestor: text()
      .references(() => cities.code)
      .notNull(),
    descendant: text()
      .references(() => cities.code)
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.ancestor, table.descendant],
    }),
    index('ch_desc_anc_idx').on(table.descendant, table.ancestor),
  ],
)

export const votesOnCities = sqliteTable(
  'votes_on_cities',
  {
    cityCode: text('city_code')
      .references(() => cities.code)
      .notNull(),
    electionCode: text('election_code')
      .references(() => elections.code)
      .notNull(),
    partyId: text('party_id')
      .references(() => parties.id)
      .notNull(),
    // 按分により小数点以下が生じる
    count: real().notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.cityCode, table.electionCode, table.partyId],
    }),
    index('voc_election_idx').on(table.electionCode),
  ],
)

// パフォーマンス上の利点、変更が生じにくいことから非正規化を行う
export const votesOnPrefectures = sqliteTable(
  'votes_on_prefectures',
  {
    prefectureCode: text('prefecture_code')
      .references(() => prefectures.code)
      .notNull(),
    electionCode: text('election_code')
      .references(() => elections.code)
      .notNull(),
    partyId: text('party_id')
      .references(() => parties.id)
      .notNull(),
    // 按分により小数点以下が生じる
    count: real().notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.prefectureCode, table.electionCode, table.partyId],
    }),
    index('vop_election_idx').on(table.electionCode),
  ],
)

export const votesOnRegions = sqliteTable(
  'votes_on_regions',
  {
    regionCode: text('region_code')
      .references(() => regions.code)
      .notNull(),
    electionCode: text('election_code')
      .references(() => elections.code)
      .notNull(),
    partyId: text('party_id')
      .references(() => parties.id)
      .notNull(),
    // 按分により小数点以下が生じる
    count: real().notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.regionCode, table.electionCode, table.partyId],
    }),
    index('vor_election_idx').on(table.electionCode),
  ],
)

export const votesOnAll = sqliteTable(
  'votes_on_all',
  {
    electionCode: text('election_code')
      .references(() => elections.code)
      .notNull(),
    partyId: text('party_id')
      .references(() => parties.id)
      .notNull(),
    // 按分により小数点以下が生じる
    count: real().notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.electionCode, table.partyId],
    }),
  ],
)

export const totalCountsOnCities = sqliteTable(
  'total_counts_on_cities',
  {
    cityCode: text('city_code')
      .references(() => cities.code)
      .notNull(),
    electionCode: text('election_code')
      .references(() => elections.code)
      .notNull(),
    // 按分により小数点以下が生じる
    count: real().notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.cityCode, table.electionCode],
    }),
  ],
)

export const totalCountsOnPrefectures = sqliteTable(
  'total_counts_on_prefectures',
  {
    prefectureCode: text('prefecture_code')
      .references(() => prefectures.code)
      .notNull(),
    electionCode: text('election_code')
      .references(() => elections.code)
      .notNull(),
    // 按分により小数点以下が生じる
    count: real().notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.prefectureCode, table.electionCode],
    }),
  ],
)
export const totalCountsOnRegions = sqliteTable(
  'total_counts_on_regions',
  {
    regionCode: text('region_code')
      .references(() => regions.code)
      .notNull(),
    electionCode: text('election_code')
      .references(() => elections.code)
      .notNull(),
    // 按分により小数点以下が生じる
    count: real().notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.regionCode, table.electionCode],
    }),
  ],
)
export const totalCountsOnAll = sqliteTable('total_counts_on_all', {
  electionCode: text('election_code')
    .primaryKey()
    .references(() => elections.code),
  // 按分により小数点以下が生じる
  count: real().notNull(),
})
