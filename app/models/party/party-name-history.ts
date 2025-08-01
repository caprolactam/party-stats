import { z } from 'zod'
import type { ValueObject } from '../helpers/value-object.ts'

/**
 * 政党名称履歴値オブジェクトスキーマ
 * 政党の名称変更履歴を管理します
 */
export const PartyNameHistorySchema = z.object({
  name: z.string()
    .trim()
    .min(1)
    .max(100),
  effectiveFrom: z.date(),
  // 有効期間終了日。nullの場合は現在も有効
  effectiveTo: z.date()
    .nullable(),
})
  .refine((data) => {
  // 有効期間の整合性チェック
    if (data.effectiveTo !== null && data.effectiveFrom >= data.effectiveTo) {
      return false
    }
    return true
  }, {
    message: '有効期間開始日は終了日より前である必要があります',
    path: ['effectiveFrom'],
  })
  .brand<'PartyNameHistory'>() satisfies ValueObject<'PartyNameHistory'>

export type InputPartyNameHistory = z.input<typeof PartyNameHistorySchema>
export type PartyNameHistory = z.output<typeof PartyNameHistorySchema>

export function newPartyNameHistory({
  name,
  effectiveFrom,
  effectiveTo,
}: InputPartyNameHistory): PartyNameHistory {
  return PartyNameHistorySchema.parse({
    name,
    effectiveFrom,
    effectiveTo,
  })
}
