/**
 * @see [ER図設計書](/designs/er-diagram.md)
 */
import { sql } from 'drizzle-orm'
import {
  sqliteTable,
  text,
  integer,
  unique,
  check,
  index,
  foreignKey,
} from 'drizzle-orm/sqlite-core'
import { id } from './helpers/id.ts'
import { createdAt, updatedAt } from './helpers/timestamps.ts'

export const elections = sqliteTable(
  'elections',
  {
    id,
    createdAt,
    updatedAt,
    // 選挙回次（第50回など）
    round: integer('round').notNull(),
    // 選挙実施日
    heldAt: integer('held_at', { mode: 'timestamp_ms' }).notNull(),
    // 選挙種別
    type: text('type', { enum: ['REPRESENTATIVES', 'COUNCILLORS'] }).notNull(),
  },
  (table) => [
    unique().on(table.type, table.round), // 選挙種別と回次の組み合わせは一意
  ],
)

/**
 * areas - 地域情報テーブル
 * 国全体から市区町村まで階層的な地域情報を管理
 * 市町村合併等の継承関係は area_succession テーブルで別途管理
 */
export const areas = sqliteTable(
  'areas',
  {
    id,
    createdAt,
    updatedAt,
    name: text('name').notNull(),
    // 地域名かな（検索・並び替え用）
    kanaName: text('kana_name').notNull(),
    // 地域レベル
    level: text('level', {
      enum: ['NATIONAL', 'PREFECTURE', 'CITY'],
    }).notNull(),
    // 地域コード（総務省コード等）
    // UNIQUE制約あり - RENAME同コードケースは継承レコード作成をスキップするため重複なし
    code: text('code').unique().notNull(),
    /**
     * 現在の地域が合併などにより存在しているかどうか（非正規化フィールド）
     *
     * 設計意図:
     * - 本来は area_successions テーブルから計算されるべき値
     * - 頻繁に参照される条件のため、パフォーマンス向上を目的として非正規化
     * - 「現在有効な地域のみ表示」などの一般的なクエリで高速化を実現
     *
     * データ整合性:
     * - area_succession テーブル更新時に連動して更新する必要あり
     */
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    /**
     * 親地域ID（階層構造用）
     * - null許容: 国全体に親は存在しない
     */
    parentId: text('parent_id'),
  },
  (table) => [
    /**
     * 親地域への外部キー制約（自己参照）
     * https://orm.drizzle.team/docs/joins#aliases--selfjoins
     * ```ts
     * import { alias } from 'drizzle-orm/sqlite-core';
     * const parent = alias(user, 'parent');
     * ```
     */
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: 'fk_areas_parent',
    }),
    // 階層構造検索インデックス
    index('idx_areas_hierarchy').on(table.parentId),
  ],
)

/**
 * area_successions - 地域継承関係テーブル
 * 市町村合併・分割・改名における地域間の継承関係を管理
 */
export const areaSuccessions = sqliteTable(
  'area_successions',
  {
    id,
    createdAt,
    updatedAt,
    predecessorId: text('predecessor_id')
      .notNull()
      .references(() => areas.id), // 前身地域ID
    successorId: text('successor_id')
      .notNull()
      .references(() => areas.id), // 後継地域ID
    successionType: text('succession_type', { enum: ['MERGE', 'SPLIT', 'RENAME'] }).notNull(), // 継承種別
    effectiveDate: integer('effective_date', { mode: 'timestamp_ms' }).notNull(), // 継承有効日
    note: text('note'), // 継承に関するメモ
  },
  (table) => [
    // 同一継承関係の重複防止（日付込み）
    unique('uk_successions_relation').on(
      table.predecessorId,
      table.successorId,
      table.effectiveDate,
    ),
    // 自己参照防止制約
    check(
      'chk_no_self_successions',
      sql`${table.predecessorId} != ${table.successorId}`,
    ),
  ],
)

/**
 * regions - 地方区分テーブル
 * UI上での検索・選択補助を目的とし、地域階層には含まれない独立したエンティティ
 */
export const regions = sqliteTable(
  'regions',
  {
    id,
    createdAt,
    updatedAt,
    name: text('name').notNull().unique(), // 地方名（北海道・東北・関東など）
    code: text('code').notNull().unique(), // 地方コード（kanto, kinkiなど）
  })

/**
 * regions_on_prefectures - 地方・都道府県関連テーブル
 * 地方区分と都道府県の多対多関係を管理する中間テーブル
 */
export const regionsOnPrefectures = sqliteTable(
  'regions_on_prefectures',
  {
    id,
    createdAt,
    updatedAt,
    regionId: text('region_id')
      .notNull()
      .references(() => regions.id), // 地方ID
    prefectureId: text('prefecture_id')
      .notNull()
      .references(() => areas.id), // 都道府県ID（areas.level = 'PREFECTURE'）
  },
  (table) => [
    // 地方と都道府県の組み合わせは一意
    unique('uk_regions_on_prefectures').on(table.regionId, table.prefectureId),
  ],
)

/**
 * parties - 政党情報テーブル
 * 政党の基本情報を管理
 */
export const parties = sqliteTable('parties', {
  id,
  createdAt,
  updatedAt,
  /**
   * 政党コード - URL用識別子
   *
   * 設計意図:
   * - URLパラメータとして使用される識別子
   * - 政党に詳しいユーザーにとって直感的で理解しやすい（例: "ldp", "cdp", "jcp"）
   * - 一度設定したcodeは可能な限り変更しない運用とする
   * - SEO・アクセシビリティ・ユーザビリティの向上
   *
   * データ整合性:
   * - UNIQUE制約により政党間での重複を防ぐ
   * - URLルーティングで使用されるため、安定性が重要
   */
  code: text('code').unique().notNull(),
  /**
   * 政党名（正式名称）
   *
   * 設計意図:
   * - 政党の現在の正式名称を保持する正規化カラム
   * - 政党一覧表示やフィルタリングなどの一般的なクエリで直接参照
   *
   * データ整合性:
   * - 名称変更時は古い名称をpartyNameHistories に記録してから更新
   * - 政党名変更は稀な操作のため、更新コストは許容範囲内
   * - unique制約の削除 同じ名前で異なる政党がありうる
   */
  name: text('name').notNull(),
  // 表示色（ルールはドメインによって決定する => check制約を含めない）
  color: text('color').notNull(),
})

/**
 * party_name_histories - 政党名称履歴テーブル
 * 政党の過去の名称変更履歴を時系列で管理。現在の名称は政党テーブルで管理し、こちらは過去履歴のみ。
 */
export const partyNameHistories = sqliteTable(
  'party_name_histories',
  {
    id,
    createdAt,
    updatedAt,
    // 政党ID
    partyId: text('party_id')
      .notNull()
      .references(() => parties.id),
    // 政党名
    name: text('name').notNull(),
    // 有効開始日
    effectiveFrom: integer('effective_from', { mode: 'timestamp_ms' }).notNull(),
    // 有効終了日（過去履歴のため必須）
    effectiveTo: integer('effective_to', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    // 政党名称履歴の有効期間制約
    check(
      'chk_effective_period',
      sql`${table.effectiveFrom} <= ${table.effectiveTo}`,
    ),
    // 同一政党で同一期間の名称重複防止
    unique('uk_party_name_period').on(
      table.partyId,
      table.effectiveFrom,
      table.effectiveTo,
    ),
    // 政党IDによる履歴検索用（特定政党の名称履歴取得で使用）
    index('idx_party_names_lookup').on(table.partyId),
  ],
)

/**
 * party_results - 政党結果テーブル
 * 各選挙における政党別・地域別の得票数と議席数を記録
 */
export const partyResults = sqliteTable(
  'party_results',
  {
    id,
    createdAt,
    updatedAt,
    electionId: text('election_id')
      .notNull()
      .references(() => elections.id),
    areaId: text('area_id')
      .notNull()
      .references(() => areas.id),
    partyId: text('party_id')
      .notNull()
      .references(() => parties.id),
    /**
     * 得票数（按分票計算により小数点を含む場合がある）
     *
     * データ形式: 小数点2桁まで管理、100倍してINTEGERで保存
     * 例: 1234.56票 → 123456として保存
     *
     * データ整合性:
     * - JavaScript側では100で割って元の値に復元
     */
    votes: integer('votes').notNull().default(0),
    /**
     * 得票率（%） - 非正規化フィールド
     *
     * データ形式: 小数点2桁まで管理、100倍してINTEGERで保存
     * 例: 12.34% → 1234として保存
     *
     * 設計意図:
     * - 本来は votes と election_area_metas.valid_votes から計算される値
     * - 頻繁に参照される条件のため、パフォーマンス向上を目的として非正規化
     * - ランキング表示や得票率での並び替えなどの一般的なクエリで高速化を実現
     *
     * データ整合性:
     * - election_area_metas または votes 更新時に連動して再計算・更新する必要あり
     * - JavaScript側では100で割って元の値（%）に復元
     */
    voteRate: integer('vote_rate').notNull().default(0),
  },
  (table) => [
    // 得票数の範囲制約（0以上）
    check('chk_votes', sql`${table.votes} >= 0`),
    // 得票率の範囲制約（100倍保存: 0〜10000 = 0%〜100%）
    check(
      'chk_vote_rate',
      sql`${table.voteRate} >= 0 AND ${table.voteRate} <= 10000`,
    ),
    // 選挙結果の一意性制約（選挙・地域・政党の組み合わせは一意）
    unique('uk_election_result').on(
      table.electionId,
      table.areaId,
      table.partyId,
    ),
  ],
)

/**
 * voting_statuses - 投票状況テーブル
 * 各選挙における地域別の有権者数、投票率などの統計情報を男女別に管理
 */
export const votingStatuses = sqliteTable(
  'voting_statuses',
  {
    id,
    createdAt,
    updatedAt,
    electionId: text('election_id')
      .notNull()
      .references(() => elections.id), // 選挙ID
    areaId: text('area_id')
      .notNull()
      .references(() => areas.id), // 地域ID
    /**
     * 有権者数（総計） - 非正規化フィールド
     *
     * 計算式: voted_male + voted_female + abstained_male + abstained_female
     * データ形式: 小数点2桁まで管理、100倍してINTEGERで保存
     * 例: 12345.67人 → 1234567として保存
     *
     * 設計意図:
     * - 頻繁に参照される条件のため、パフォーマンス向上を目的として非正規化
     * - 有権者総数による並び替えなどの一般的なクエリで高速化を実現
     *
     * データ整合性:
     * - 男女別有権者数更新時に連動して再計算・更新する必要あり
     * - JavaScript側では100で割って元の値に復元
     * - CITYレベルでは計算元データが存在しないためNULL
     */
    totalVoters: integer('total_voters'),
    /**
     * 投票した男性数
     *
     * データ形式: 小数点2桁まで管理、100倍してINTEGERで保存
     * 例: 4321.09人 → 432109として保存
     *
     * データ整合性:
     * - JavaScript側では100で割って元の値に復元
     * - CITYレベルではデータが存在しないためNULL
     */
    votedMale: integer('voted_male'),
    /**
     * 投票した女性数
     *
     * データ形式: 小数点2桁まで管理、100倍してINTEGERで保存
     * 例: 3987.44人 → 398744として保存
     *
     * データ整合性:
     * - JavaScript側では100で割って元の値に復元
     * - CITYレベルではデータが存在しないためNULL
     */
    votedFemale: integer('voted_female'),
    /**
     * 棄権した男性数
     *
     * データ形式: 小数点2桁まで管理、100倍してINTEGERで保存
     * 例: 2468.03人 → 246803として保存
     *
     * データ整合性:
     * - JavaScript側では100で割って元の値に復元
     * - CITYレベルではデータが存在しないためNULL
     */
    abstainedMale: integer('abstained_male'),
    /**
     * 棄権した女性数
     *
     * データ形式: 小数点2桁まで管理、100倍してINTEGERで保存
     * 例: 1569.11人 → 156911として保存
     *
     * データ整合性:
     * - JavaScript側では100で割って元の値に復元
     * - CITYレベルではデータが存在しないためNULL
     */
    abstainedFemale: integer('abstained_female'),
    /**
     * 投票率（%） - 非正規化フィールド
     *
     * 計算式: (voted_male + voted_female) / (voted_male + voted_female + abstained_male + abstained_female) * 100
     * データ形式: 小数点2桁まで管理、100倍してINTEGERで保存
     * 例: 67.89% → 6789として保存
     *
     * 設計意図:
     * - 地域レベル別での投票率による並び替えが頻繁に行われるため、パフォーマンス向上を目的として非正規化
     * - 投票率ランキング表示などの一般的なクエリで高速化を実現
     *
     * データ整合性:
     * - 男女別投票者数・棄権者数更新時に連動して再計算・更新する必要あり
     * - JavaScript側では100で割って元の値（%）に復元
     * - CITYレベルでは計算元データが存在しないためNULL
     */
    turnoutRate: integer('turnout_rate'),
    /**
     * 有効投票数
     *
     * データ形式: 小数点2桁まで管理、100倍してINTEGERで保存
     * 例: 8500.21票 → 850021として保存
     *
     * すべての地域レベルで必須
     *
     * データ整合性:
     * - JavaScript側では100で割って元の値に復元
     */
    validVotes: integer('valid_votes').notNull().default(0),
    /**
     * 無効投票数
     *
     * データ形式: 小数点2桁まで管理、100倍してINTEGERで保存
     * 例: 265.22票 → 26522として保存
     *
     * データ整合性:
     * - JavaScript側では100で割って元の値に復元
     * - 投票総数は validVotes + invalidVotes で計算される
     * - CITYレベルではデータが存在しないためNULL
     */
    invalidVotes: integer('invalid_votes'),
    /**
     * 有効投票率（%） - 非正規化フィールド
     *
     * 計算式: valid_votes / (valid_votes + invalid_votes) * 100
     * データ形式: 小数点2桁まで管理、100倍してINTEGERで保存
     * 例: 98.25% → 9825として保存
     *
     * 設計意図:
     * - 有効投票率による分析・比較が頻繁に行われるため、パフォーマンス向上を目的として非正規化
     * - 有効投票率ランキング表示などの一般的なクエリで高速化を実現
     *
     * データ整合性:
     * - 有効・無効投票数更新時に連動して再計算・更新する必要あり
     * - JavaScript側では100で割って元の値（%）に復元
     * - CITYレベルでは無効投票数が存在しないため計算不可でNULL
     */
    validVoteRate: integer('valid_vote_rate'),
  },
  (table) => [
    // 投票状況の一意性制約（選挙・地域の組み合わせは一意）
    unique('uk_voting_statuses').on(table.electionId, table.areaId),
    // 投票率の範囲制約（100倍保存: 0〜10000 = 0%〜100%、NULLも許可）
    check(
      'chk_turnout_rate',
      sql`${table.turnoutRate} IS NULL OR (${table.turnoutRate} >= 0 AND ${table.turnoutRate} <= 10000)`,
    ),
    // 有効投票率の範囲制約（100倍保存: 0〜10000 = 0%〜100%、NULLも許可）
    check(
      'chk_valid_vote_rate',
      sql`${table.validVoteRate} IS NULL OR (${table.validVoteRate} >= 0 AND ${table.validVoteRate} <= 10000)`,
    ),
    // 男性投票・棄権者数は NULLまたは0以上
    check(
      'chk_male_voters',
      sql`(${table.votedMale} IS NULL OR ${table.votedMale} >= 0) AND (${table.abstainedMale} IS NULL OR ${table.abstainedMale} >= 0)`,
    ),
    // 女性投票・棄権者数は NULLまたは0以上
    check(
      'chk_female_voters',
      sql`(${table.votedFemale} IS NULL OR ${table.votedFemale} >= 0) AND (${table.abstainedFemale} IS NULL OR ${table.abstainedFemale} >= 0)`,
    ),
    // 投票数は0以上（有効票数は必須、無効票数はNULL許可）
    check(
      'chk_vote_counts',
      sql`${table.validVotes} >= 0 AND (${table.invalidVotes} IS NULL OR ${table.invalidVotes} >= 0)`,
    ),
    // 有権者数は NULLまたは0以上
    check(
      'chk_total_voters',
      sql`${table.totalVoters} IS NULL OR ${table.totalVoters} >= 0`,
    ),
    // 投票率単体でのソート用インデックス
    index('idx_voting_statuses_turnout_rate').on(table.turnoutRate),
    // 有効投票率単体でのソート用インデックス
    index('idx_voting_statuses_valid_vote_rate').on(table.validVoteRate),
    // 選挙内での投票率ソート用複合インデックス（推奨）
    index('idx_voting_statuses_election_turnout').on(table.electionId, table.turnoutRate),
  ],
)

// ========== 型定義 ==========

export type SelectElection = typeof elections.$inferSelect
export type InsertElection = typeof elections.$inferInsert

export type SelectArea = typeof areas.$inferSelect
export type InsertArea = typeof areas.$inferInsert

export type SelectAreaSuccession = typeof areaSuccessions.$inferSelect
export type InsertAreaSuccession = typeof areaSuccessions.$inferInsert

export type SelectParty = typeof parties.$inferSelect
export type InsertParty = typeof parties.$inferInsert

export type SelectPartyNameHistory = typeof partyNameHistories.$inferSelect
export type InsertPartyNameHistory = typeof partyNameHistories.$inferInsert

export type SelectPartyResult = typeof partyResults.$inferSelect
export type InsertPartyResult = typeof partyResults.$inferInsert

export type SelectVotingStatus = typeof votingStatuses.$inferSelect
export type InsertVotingStatus = typeof votingStatuses.$inferInsert

export type SelectRegion = typeof regions.$inferSelect
export type InsertRegion = typeof regions.$inferInsert

export type SelectRegionsOnPrefectures = typeof regionsOnPrefectures.$inferSelect
export type InsertRegionsOnPrefectures = typeof regionsOnPrefectures.$inferInsert
