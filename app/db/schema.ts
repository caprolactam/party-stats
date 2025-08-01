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
    // 独自の属性
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
    // 独自の属性
    name: text('name').notNull(),
    // 地域レベル
    level: text('level', {
      enum: ['NATIONAL', 'REGION', 'PREFECTURE', 'CITY'],
    }).notNull(),
    // 地域コード（総務省コード等）
    code: text('code').unique()
      .notNull(),
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
    isActive: integer('is_active', { mode: 'boolean' }).notNull()
      .default(true),
    /**
     * 親地域ID（階層構造用）
     * - null許容: 国全体に親は存在しない
     */
    parentId: text('parent_id'),
  },
  (table) => [
    // 親地域への外部キー制約（自己参照）
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: 'fk_areas_parent',
    }),
    // 階層構造検索インデックス
    index('idx_areas_hierarchy').on(table.parentId, table.level),
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
    // 独自の属性
    predecessorId: text('predecessor_id')
      .notNull()
      .references(() => areas.id), // 前身地域ID
    successorId: text('successor_id')
      .notNull()
      .references(() => areas.id), // 後継地域ID
    successionType: text('succession_type', {
      enum: ['MERGE', 'SPLIT', 'RENAME'],
    }).notNull(), // 継承種別
    effectiveDate: text('effective_date').notNull(), // 継承有効日
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
 * parties - 政党情報テーブル
 * 政党の基本情報を管理
 */
export const parties = sqliteTable('parties', {
  id,
  createdAt,
  updatedAt,
  // 独自の属性
  /**
   * 政党名（正式名称）- 非正規化フィールド
   *
   * 設計意図:
   * - 本来は partyNameHistories テーブルの effectiveTo IS NULL レコードから取得すべき値
   * - 頻繁に参照される条件のため、パフォーマンス向上を目的として非正規化
   * - 政党一覧表示やフィルタリングなどの一般的なクエリで高速化を実現
   *
   * データ整合性:
   * - partyNameHistories テーブル更新時に連動して更新する必要あり
   * - 政党名変更は稀な操作のため、更新コストは許容範囲内
   *
   * 想定件数は少ないためインデックスは付けない
   */
  name: text('name').notNull()
    .unique(),
  // 表示色（ルールはドメインによって決定する => check制約を含めない）
  color: text('color').notNull(),
})

/**
 * party_name_histories - 政党名称履歴テーブル
 * 政党の名称変更履歴を時系列で管理
 */
export const partyNameHistories = sqliteTable(
  'party_name_histories',
  {
    id,
    createdAt,
    updatedAt,
    // 独自の属性
    // 政党ID
    partyId: text('party_id')
      .notNull()
      .references(() => parties.id),
    // 政党名
    name: text('name').notNull(),
    // 有効開始日
    effectiveFrom: integer('effective_from', {
      mode: 'timestamp_ms',
    }).notNull(),
    // 有効終了日（nullの場合は現在まで有効）
    effectiveTo: integer('effective_to', { mode: 'timestamp_ms' }),
  },
  (table) => [
    // 政党名称履歴の有効期間制約
    check(
      'chk_effective_period',
      sql`${table.effectiveTo} IS NULL OR ${table.effectiveFrom} <= ${table.effectiveTo}`,
    ),
    // 同一政党で同一期間の名称重複防止
    unique('uk_party_name_period').on(
      table.partyId,
      table.effectiveFrom,
      table.effectiveTo,
    ),
    // インデックス定義
    // 政党IDによる履歴検索用（特定政党の名称履歴取得で使用）
    index('idx_party_names_lookup').on(table.partyId),
  ],
)

/**
 * election_results - 選挙結果テーブル
 * 各選挙における政党別・地域別の得票数と議席数を記録
 */
export const electionResults = sqliteTable(
  'election_results',
  {
    id,
    createdAt,
    updatedAt,
    // 独自の属性
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
    votes: integer('votes').notNull()
      .default(0),
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
    voteRate: integer('vote_rate').notNull()
      .default(0),
    /**
     * 議席数
     *
     * null: この選挙・地域において議席という概念が存在しない
     *       （例：参議院全国比例代表における東京都・A党の獲得議席）
     * 0:    議席が割り当てられる可能性はあったが、結果として0議席
     *       （例：衆議院選比例代表近畿ブロックにおいて届出したB党の獲得議席が0）
     * 1以上: 実際に獲得した議席数
     */
    seats: integer('seats'),
  },
  (table) => [
    // 得票数の範囲制約（0以上）
    check('chk_votes', sql`${table.votes} >= 0`),
    // 得票率の範囲制約（100倍保存: 0〜10000 = 0%〜100%）
    check(
      'chk_vote_rate',
      sql`${table.voteRate} >= 0 AND ${table.voteRate} <= 10000`,
    ),
    // 議席数の範囲制約（nullまたは0以上）
    check('chk_seats', sql`${table.seats} IS NULL OR ${table.seats} >= 0`),
    // 得票数と議席数の整合性制約（議席があるなら得票もあるべき）
    check(
      'chk_seats_votes_relation',
      sql`${table.seats} IS NULL OR ${table.seats} = 0 OR ${table.votes} > 0`,
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
 * election_area_meta - 選挙地域メタデータテーブル
 * 各選挙における地域別の有権者数、投票率などの統計情報を男女別に管理
 */
export const electionAreaMetas = sqliteTable(
  'election_area_metas',
  {
    id,
    createdAt,
    updatedAt,
    // 独自の属性
    electionId: text('election_id')
      .notNull()
      .references(() => elections.id), // 選挙ID
    areaId: text('area_id')
      .notNull()
      .references(() => areas.id), // 地域ID
    /**
     * 有権者総数 - 非正規化フィールド
     *
     * データ形式: 小数点2桁まで管理、100倍してINTEGERで保存
     * 例: 12345.67人 → 1234567として保存
     *
     * 設計意図:
     * - 本来は registeredVotersMale + registeredVotersFemale で計算される値
     * - アプリケーションサービスで頻繁に参照されるため、パフォーマンス向上を目的として非正規化
     * - 有権者数による並び替えや統計計算などの一般的なクエリで高速化を実現
     *
     * データ整合性:
     * - 男女別有権者数更新時に連動して更新する必要あり
     * - JavaScript側では100で割って元の値に復元
     */
    registered: integer('registered').notNull()
      .default(0),
    /**
     * 男性有権者数
     *
     * データ形式: 小数点2桁まで管理、100倍してINTEGERで保存
     * 例: 6789.12人 → 678912として保存
     *
     * データ整合性:
     * - JavaScript側では100で割って元の値に復元
     */
    registeredVotersMale: integer('registered_voters_male')
      .notNull()
      .default(0),
    /**
     * 女性有権者数
     *
     * データ形式: 小数点2桁まで管理、100倍してINTEGERで保存
     * 例: 5556.55人 → 555655として保存
     *
     * データ整合性:
     * - JavaScript側では100で割って元の値に復元
     */
    registeredVotersFemale: integer('registered_voters_female')
      .notNull()
      .default(0),
    /**
     * 男性投票者数
     *
     * データ形式: 小数点2桁まで管理、100倍してINTEGERで保存
     * 例: 4321.09人 → 432109として保存
     *
     * データ整合性:
     * - JavaScript側では100で割って元の値に復元
     */
    turnoutVotersMale: integer('turnout_voters_male').notNull()
      .default(0),
    /**
     * 女性投票者数
     *
     * データ形式: 小数点2桁まで管理、100倍してINTEGERで保存
     * 例: 3987.44人 → 398744として保存
     *
     * データ整合性:
     * - JavaScript側では100で割って元の値に復元
     */
    turnoutVotersFemale: integer('turnout_voters_female').notNull()
      .default(0),
    /**
     * 投票率（%） - 非正規化フィールド
     *
     * データ形式: 小数点2桁まで管理、100倍してINTEGERで保存
     * 例: 67.89% → 6789として保存
     *
     * 設計意図:
     * - 本来は (turnoutVotersMale + turnoutVotersFemale) / registered * 100 で計算される値
     * - 投票率による並び替えや統計分析で頻繁に参照されるため、パフォーマンス向上を目的として非正規化
     * - 投票率ランキング表示などの一般的なクエリで高速化を実現
     *
     * データ整合性:
     * - 男女別投票者数または有権者数更新時に連動して再計算・更新する必要あり
     * - JavaScript側では100で割って元の値（%）に復元
     */
    turnoutRate: integer('turnout_rate').notNull()
      .default(0),
    /**
     * 有効投票数
     *
     * データ形式: 小数点2桁まで管理、100倍してINTEGERで保存
     * 例: 8500.21票 → 850021として保存
     *
     * データ整合性:
     * - JavaScript側では100で割って元の値に復元
     */
    validVotes: integer('valid_votes').notNull()
      .default(0),
    /**
     * 無効投票数
     *
     * データ形式: 小数点2桁まで管理、100倍してINTEGERで保存
     * 例: 265.22票 → 26522として保存
     *
     * データ整合性:
     * - JavaScript側では100で割って元の値に復元
     * - 投票総数は validVotes + invalidVotes で計算される
     */
    invalidVotes: integer('invalid_votes').notNull()
      .default(0),
  },
  (table) => [
    // 選挙メタデータの一意性制約（選挙・地域の組み合わせは一意）
    unique('uk_election_metas').on(table.electionId, table.areaId),
    // 投票率の範囲制約（100倍保存: 0〜10000 = 0%〜100%）
    check(
      'chk_turnout_rate',
      sql`${table.turnoutRate} >= 0 AND ${table.turnoutRate} <= 10000`,
    ),
    // 男性有権者数・投票者数は0以上
    check(
      'chk_male_voters',
      sql`${table.registeredVotersMale} >= 0 AND ${table.turnoutVotersMale} >= 0`,
    ),
    // 女性有権者数・投票者数は0以上
    check(
      'chk_female_voters',
      sql`${table.registeredVotersFemale} >= 0 AND ${table.turnoutVotersFemale} >= 0`,
    ),
    // 男性投票者数は男性有権者数以下
    check(
      'chk_male_turnout',
      sql`${table.turnoutVotersMale} <= ${table.registeredVotersMale}`,
    ),
    // 女性投票者数は女性有権者数以下
    check(
      'chk_female_turnout',
      sql`${table.turnoutVotersFemale} <= ${table.registeredVotersFemale}`,
    ),
    // 投票数は0以上
    check(
      'chk_vote_counts',
      sql`${table.validVotes} >= 0 AND ${table.invalidVotes} >= 0`,
    ),
    // 有権者総数は0以上
    check('chk_registered', sql`${table.registered} >= 0`),
    // 男女別有権者数の合計と総数の整合性
    check(
      'chk_gender_registered_sum',
      sql`${table.registeredVotersMale} + ${table.registeredVotersFemale} <= ${table.registered}`,
    ),
    // 男女別投票者数の合計は有権者総数以下
    check(
      'chk_gender_turnout_registered',
      sql`${table.turnoutVotersMale} + ${table.turnoutVotersFemale} <= ${table.registered}`,
    ),
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

export type SelectElectionResult = typeof electionResults.$inferSelect
export type InsertElectionResult = typeof electionResults.$inferInsert

export type SelectElectionAreaMeta = typeof electionAreaMetas.$inferSelect
export type InsertElectionAreaMeta = typeof electionAreaMetas.$inferInsert
