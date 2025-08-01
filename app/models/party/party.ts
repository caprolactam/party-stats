import { z } from 'zod'
import type { ValueObject } from '../helpers/value-object.ts'
import { PartyNameHistorySchema } from './party-name-history.ts'
import type { PartyNameHistory } from './party-name-history.ts'

// 政党エンティティを識別するためのid
export const PartyIdSchema = z.string()
  .min(1)
  .brand<'PartyId'>() satisfies ValueObject<'PartyId'>
export type PartyId = z.output<typeof PartyIdSchema>

// 他のエンティティや値オブジェクトに依存するプロパティを定義
const nameSchema = PartyNameHistorySchema.shape.name

// 政党エンティティスキーマ定義
export const PartySchema = z.object({
  id: PartyIdSchema,
  name: nameSchema,
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, '政党カラーは有効なHEXカラーコード（#RRGGBB）である必要があります'),
  nameHistories: z.array(PartyNameHistorySchema)
    .default([])
    .refine(validateNoOverlappingPeriods, {
      message: '政党名称履歴に重複する期間があります',
      path: ['nameHistories'],
    }),
})

export type InputParty = z.input<typeof PartySchema>
export type Party = z.output<typeof PartySchema>

// ファクトリ関数の定義
export function newParty(input: InputParty): Party {
  return PartySchema.parse(input)
}

/**
 * 政党名称履歴の配列に重複する期間がないかを検証します
 *
 * 重複チェックのアプローチ：
 * 1. 全ての期間の組み合わせをチェック（O(n²)だが、政党名称履歴は通常少数）
 * 2. 明確で理解しやすいロジック
 * 3. 早期リターンによる効率化
 *
 * @param histories - 政党名称履歴の配列
 * @returns 重複がない場合はtrue
 */
function validateNoOverlappingPeriods(histories: PartyNameHistory[]): boolean {
  if (histories.length <= 1) {
    return true
  }

  // 全ての組み合わせをチェック
  for (let i = 0; i < histories.length; i++) {
    for (let j = i + 1; j < histories.length; j++) {
      const history1 = histories[i]!
      const history2 = histories[j]!

      if (arePeriodsOverlapping(history1, history2)) {
        return false
      }
    }
  }

  return true
}

/**
 * 2つの期間が重複しているかを判定します
 *
 * 重複条件：
 * - 期間Aの開始 ≤ 期間Bの終了 AND 期間Bの開始 ≤ 期間Aの終了
 *
 * @param period1 - 最初の期間
 * @param period2 - 2番目の期間
 * @returns 重複している場合はtrue
 */
function arePeriodsOverlapping(
  period1: Pick<PartyNameHistory, 'effectiveFrom' | 'effectiveTo'>,
  period2: Pick<PartyNameHistory, 'effectiveFrom' | 'effectiveTo'>,
): boolean {
  const period1End = getEffectiveEndDate(period1.effectiveTo)
  const period2End = getEffectiveEndDate(period2.effectiveTo)

  return period1.effectiveFrom <= period2End && period2.effectiveFrom <= period1End
}

/**
 * 期間の終了日を取得します（nullの場合は最大日付）
 */
function getEffectiveEndDate(effectiveTo: Date | null): Date {
  return effectiveTo || new Date('9999-12-31')
}
