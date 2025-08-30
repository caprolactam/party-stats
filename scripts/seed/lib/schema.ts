/**
 * シードデータ用のZodスキーマ定義
 * JSONファイルから読み込むデータの型安全性を担保する
 */

import { z } from 'zod'

// 地域データ（area-data.json）のスキーマ
const AreaCodeSchema = z.string().regex(/^\d{6}$/, '地域コードは6桁の数字である必要があります')

const AreaSchema = z.object({
  areaCode: AreaCodeSchema,
  parentCode: z.union([
    z.null(), // 全国地域に親は存在しない
    AreaCodeSchema,
  ]),
  name: z.string()
    .min(1, '地域名は空文字列にできません')
    .max(50, '地域名は50文字以下である必要があります'),
  kanaName: z.string()
    .max(100, 'かな名は100文字以下である必要があります')
    .regex(/^[ぁ-ん\u30FC\u30A0-\u30FF\s]*$/, 'かな名はひらがな、カタカナ、長音符のみ使用可能です'),
  isActive: z.boolean()
    .describe('地域が現在有効かどうか（true: 現在有効, false: 統廃合済み）'),
  level: z.enum(['NATIONAL', 'PREFECTURE', 'CITY']),
})

const SuccessionSchema = z.object({
  predecessorCode: AreaCodeSchema.describe('統廃合前の地域コード'),
  successorCode: AreaCodeSchema.describe('統廃合後の地域コード'),
  successionType: z.enum(['MERGE', 'SPLIT', 'RENAME']).describe('統廃合の種類'),
  effectiveDate: z.iso.date().describe('統廃合が行われた日'),
  note: z.string()
    .max(200, '備考は200文字以下である必要があります')
    .optional()
    .describe('統廃合に関する備考'),
})

export const AreaDataSchema = z.object({
  schema: z.any(),
  data: z.object({
    areas: z.array(AreaSchema),
    successions: z.array(SuccessionSchema),
  }),
})

export type Area = z.infer<typeof AreaSchema>
export type Succession = z.infer<typeof SuccessionSchema>
export type AreaData = z.infer<typeof AreaDataSchema.shape.data>

// 地方データ（region-data.jsonc）のスキーマ

export const RegionSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  prefectures: z.array(
    AreaSchema.shape.areaCode,
  ).min(1),
})

export const RegionDataSchema = z.object({
  regions: z.array(RegionSchema),
})

export type Region = z.infer<typeof RegionSchema>
export type RegionData = z.infer<typeof RegionDataSchema>

// 政党定義（party-definition.json）のスキーマ
export const PartyDefinitionSchema = z.object({
  code: z.string(), // URL用識別子
  name: z.string(),
  color: z.string(), // CSSのカラーキーワード
  nameHistories: z.array(z.object({
    name: z.string(),
    effectiveFrom: z.iso.date(),
    effectiveTo: z.iso.date(),
  })).optional(),
})

export const PartyDefinitionDataSchema = z.object({
  schema: z.any(),
  data: z.array(PartyDefinitionSchema),
})

export type PartyDefinition = z.infer<typeof PartyDefinitionSchema>
export type PartyDefinitionData = z.infer<typeof PartyDefinitionDataSchema.shape.data>

// 選挙メタデータ（meta.json）のスキーマ
export const ElectionMetaSchema = z.object({
  round: z.number().int().positive(), // 選挙回次
  heldAt: z.iso.date(),
  type: z.enum(['REPRESENTATIVES', 'COUNCILLORS']),
})

export const ElectionMetaDataSchema = z.object({
  schema: z.any(),
  data: ElectionMetaSchema,
})

export type ElectionMeta = z.infer<typeof ElectionMetaSchema>
export type ElectionMetaData = z.infer<typeof ElectionMetaDataSchema.shape.data>

// 投票状況（voting-status.json）のスキーマ
export const VotingCountSchema = z.object({
  total: z.number().int().nonnegative(),
  male: z.number().int().nonnegative(),
  female: z.number().int().nonnegative(),
})
// 総数は男女の合計と一致する
  .refine((data) => data.total === (data.male + data.female))

export const VotingStatusSchema = z.object({
  areaCode: AreaCodeSchema,
  areaName: z.string().min(1), // 地域名（検証用）
  /**
   * 投票者関連
   */
  voters: z.object({
    eligibles: VotingCountSchema, // 有権者総数（男女別）
    voters: VotingCountSchema, // 投票者数（男女別）
    abstainers: VotingCountSchema, // 棄権者数（男女別）
    // 投票率（%, 男女別）
    turnoutRate: z.object({
      total: z.number().nonnegative(),
      male: z.number().nonnegative(),
      female: z.number().nonnegative(),
    }),
  }),
  /**
   * 有効投票数関連
   * 案分票の場合、投票総数・有効投票数は小数点以下になることがある
   */
  votes: z.object({
    total: z.number().nonnegative(), // 投票総数
    valid: z.number().nonnegative(), // 有効投票数
    invalid: z.number().nonnegative(), // 無効投票数
    invalidVoteRate: z.number().nonnegative(), // 無効投票率（%）
  }),
})

export const VotingStatusDataSchema = z.object({
  schema: z.any(),
  data: z.object({
  /** 全国データ（都道府県データの合計値） */
    national: VotingStatusSchema,
    /** 47都道府県のデータ配列 */
    prefectures: z.array(VotingStatusSchema).length(47),
  }),
})

export type VotingStatus = z.infer<typeof VotingStatusSchema>
export type VotingStatusData = z.infer<typeof VotingStatusDataSchema.shape.data>

// 政党結果（party-results.json）のスキーマ
export const PartyResultsSchema = z.object({
  areaCode: AreaCodeSchema,
  areaName: z.string().min(1),
  // 案分票のため、小数点以下を許容
  totalVotes: z.number().nonnegative(),
  parties: z.array(z.object({
    code: z.string().min(1),
    name: z.string().min(1),
    votes: z.number().nonnegative(),
  })),
}).refine((data) => {
  const sum = data.parties.reduce((acc, party) => acc + party.votes, 0)
  return Math.abs(sum - data.totalVotes) < 1 // 許容誤差1票
})

// 全国・都道府県・市区町村の政党別得票数が階層で表現される
export const PartyResultsDataSchema = z.object({
  schema: z.any(),
  data: PartyResultsSchema.safeExtend({
    prefectures: z.array(
      PartyResultsSchema.safeExtend({
        cities: z.array(PartyResultsSchema),
      }),
    ).length(47),
  }),
})

export type PartyResults = z.infer<typeof PartyResultsSchema>
export type PartyResultsData = z.infer<typeof PartyResultsDataSchema.shape.data>
