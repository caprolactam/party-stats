import { href } from 'react-router'
import { eq, and } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'
import { ok, err } from 'neverthrow'
import type { Result } from 'neverthrow'
import invariant from 'tiny-invariant'
import { areas } from '~/db/schema'
import type { SelectArea } from '~/db/schema'
import { getFirstItem } from '~/db/utils.ts'
import { getLatestElection } from '~/lib/election.server.ts'
import { getDB } from '~/middleware/bindings.ts'
import type { ApiErrors } from '~/types/api-error.ts'

type ApiError = ApiErrors['NotFound' | 'NetworkError']

/**
 * 親地域の情報
 */
interface ParentAreaInfo {
  name: string
  to: string
}

/**
 * 自地域の情報
 */
interface SelfAreaInfo {
  name: string
  to: string
  level: SelectArea['level']
}

/**
 * 子地域の情報
 */
interface ChildAreaInfo {
  name: string
  to: string
  kanaName: string
}

/**
 * 地域の階層構造情報
 */
interface AreaFamily {
  parent: ParentAreaInfo | null
  self: SelfAreaInfo
  // Mapのキーはグルーピングのための文字列（地方グループ、あかさたな行など）
  children: Map<string, ChildAreaInfo[]> | null
}

/**
 * 地域の階層構造情報を取得する
 */
export async function getAreaFamily(areaCode: string): Promise<Result<AreaFamily, ApiError>> {
  try {
    const [areaAndParent, election] = await Promise.all([
      getAreaAndParent(areaCode),
      getLatestElection(),
    ])

    if (!areaAndParent) {
      return err({
        type: 'notFound',
        message: '地域が存在しません',
      })
    }
    if (!election) {
      return err({
        type: 'notFound',
        message: '選挙が存在しません',
      })
    }

    const self = createSelfAreaInfo(areaAndParent, election.id)
    const parent = createParentAreaInfo(areaAndParent)
    const children = await createChildrenAreaInfo(areaAndParent)

    return ok({
      parent,
      self,
      children,
    })
  }
  catch (error) {
    console.error(error)
    return err({
      type: 'network',
      message: 'サーバーエラーが発生しました',
    })
  }
}

/**
 * 自地域の情報を作成する
 */
function createSelfAreaInfo(areaAndParent: NonNullable<Awaited<ReturnType<typeof getAreaAndParent>>>, electionId: string): SelfAreaInfo {
  return {
    name: areaAndParent.name,
    to: getElectionResultHref({ areaCode: areaAndParent.code, electionId }),
    level: areaAndParent.level,
  }
}

/**
 * 親地域の情報を作成する
 */
function createParentAreaInfo(areaAndParent: NonNullable<Awaited<ReturnType<typeof getAreaAndParent>>>): ParentAreaInfo | null {
  if (areaAndParent.level === 'NATIONAL') {
    return null
  }

  validateParentExists(areaAndParent)

  return {
    name: areaAndParent.parentName!,
    to: getAreaSelectionHref(areaAndParent.parentCode!),
  }
}

/**
 * 子地域の情報を作成する
 */
async function createChildrenAreaInfo(areaAndParent: NonNullable<Awaited<ReturnType<typeof getAreaAndParent>>>): Promise<Map<string, ChildAreaInfo[]> | null> {
  switch (areaAndParent.level) {
    case 'NATIONAL': {
      const prefectures = await getPrefecturesByNationalId(areaAndParent.id)
      return sortGyoMap(groupByGyo(prefectures))
    }
    case 'PREFECTURE': {
      const cities = await getCitiesByPrefectureId(areaAndParent.id)
      return sortGyoMap(groupByGyo(cities))
    }
    // 市区町村には子地域が存在しないため null を返す
    case 'CITY': {
      return null
    }
    default: {
      const _: never = areaAndParent.level
      throw Error(`Unexpected area level: ${areaAndParent.level}`)
    }
  }
}

/**
 * 親地域が存在することを確認する
 */
function validateParentExists(areaAndParent: NonNullable<Awaited<ReturnType<typeof getAreaAndParent>>>) {
  const levelName = areaAndParent.level === 'PREFECTURE' ? '都道府県' : '市区町村'

  invariant(areaAndParent.parentId, `${levelName}の親地域が登録されていません`)
  invariant(areaAndParent.parentName, `${levelName}の親地域が登録されていません`)
  invariant(areaAndParent.parentCode, `${levelName}の親地域が登録されていません`)
}

/**
 * 五十音行の定義（清音）
 */
const GOJUON_BASE_GYO: readonly [string, readonly string[]][] = [
  ['あ', ['あ', 'い', 'う', 'え', 'お']],
  ['か', ['か', 'き', 'く', 'け', 'こ']],
  ['さ', ['さ', 'し', 'す', 'せ', 'そ']],
  ['た', ['た', 'ち', 'つ', 'て', 'と']],
  ['な', ['な', 'に', 'ぬ', 'ね', 'の']],
  ['は', ['は', 'ひ', 'ふ', 'へ', 'ほ']],
  ['ま', ['ま', 'み', 'む', 'め', 'も']],
  ['や', ['や', 'ゆ', 'よ']],
  ['ら', ['ら', 'り', 'る', 'れ', 'ろ']],
  ['わ', ['わ', 'を', 'ん']],
] as const

/**
 * 濁音・半濁音の対応表
 */
const DAKUTEN_MAP: Readonly<Record<string, readonly string[]>> = {
  か: ['が', 'ぎ', 'ぐ', 'げ', 'ご'],
  さ: ['ざ', 'じ', 'ず', 'ぜ', 'ぞ'],
  た: ['だ', 'ぢ', 'づ', 'で', 'ど'],
  は: ['ば', 'び', 'ぶ', 'べ', 'ぼ', 'ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'],
} as const

/**
 * 五十音行の並び順
 */
const GYO_ORDER = ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ', 'その他'] as const

/**
 * 選挙結果ページのhrefを生成する
 */
const getElectionResultHref = ({ areaCode, electionId }: { areaCode: string, electionId: string }) => href('/elections/:electionId/areas/:areaCode', { electionId, areaCode })

/**
 * 地域選択ページのhrefを生成する
 */
const getAreaSelectionHref = (areaCode: string) => href('/areas/:areaCode', { areaCode })

/**
 * 地域とその親地域の情報を取得する
 */
async function getAreaAndParent(areaCode: string) {
  const db = getDB()

  const parent = alias(areas, 'parent')

  const area = await db
    .select({
      id: areas.id,
      name: areas.name,
      code: areas.code,
      level: areas.level,
      parentId: parent.id,
      parentName: parent.name,
      parentCode: parent.code,
    })
    .from(areas)
    .where(eq(areas.code, areaCode))
    .leftJoin(parent, eq(areas.parentId, parent.id))
    .then(getFirstItem)

  return area
}

async function getPrefecturesByNationalId(nationalId: string) {
  const db = getDB()

  const prefectues = await db
    .select()
    .from(areas)
    .where(and(
      eq(areas.level, 'PREFECTURE'),
      eq(areas.parentId, nationalId),
    ))

  return prefectues
}

async function getCitiesByPrefectureId(prefectureId: string) {
  const db = getDB()

  const cities = await db
    .select()
    .from(areas)
    .where(and(
      eq(areas.level, 'CITY'),
      eq(areas.parentId, prefectureId),
    ))

  return cities
}

/**
 * 地域一覧を五十音行でグルーピングする
 */
function groupByGyo(
  areas: SelectArea[],
): Map<string, Array<{ name: string, kanaName: string, to: string }>> {
  // baseGyo + dakuten を展開
  const gyoMap: Map<string, string[]> = new Map()
  for (const [label, chars] of GOJUON_BASE_GYO) {
    const expanded = [...chars].flatMap((c) => [c, ...(DAKUTEN_MAP[c] ?? [])])
    gyoMap.set(label, expanded)
  }

  const result = new Map<string, Array<{ name: string, kanaName: string, to: string }>>()

  for (const area of areas) {
    const firstChar = area.kanaName.charAt(0)
    const gyo = [...gyoMap.entries()].find(([_, chars]) =>
      chars.includes(firstChar),
    )?.[0]

    const key = gyo ?? 'その他'

    if (!result.has(key)) {
      result.set(key, [])
    }

    result.get(key)!.push({
      name: area.name,
      kanaName: area.kanaName,
      to: getAreaSelectionHref(area.code),
    })
  }

  return result
}

/**
 * 五十音行でグルーピングされたMapを正しい順序でソートする
 */
function sortGyoMap(
  gyoMap: ReturnType<typeof groupByGyo>,
) {
  // Mapを配列に変換してキー順にソート
  const sortedEntries = [...gyoMap.entries()].sort(
    ([keyA], [keyB]) => GYO_ORDER.indexOf(keyA as typeof GYO_ORDER[number]) - GYO_ORDER.indexOf(keyB as typeof GYO_ORDER[number]),
  )

  const result = new Map<string, Array<{ name: string, kanaName: string, to: string }>>()

  for (const [key, areas] of sortedEntries) {
    // 各行内を kanaName の五十音順でソート
    const sortedAreas = [...areas].sort((a, b) =>
      a.kanaName.localeCompare(b.kanaName, 'ja'),
    )
    result.set(key, sortedAreas)
  }

  return result
}
