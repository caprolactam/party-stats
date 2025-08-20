import { eq, desc } from 'drizzle-orm'
import { ok, err } from 'neverthrow'
import type { Result } from 'neverthrow'
import { database } from '~/db/index.ts'
import { areas, regions, regionsOnPrefectures, elections } from '~/db/schema'
import type { SelectElection } from '~/db/schema'
import { getFirstItem } from '~/db/utils.ts'

type ApiError =
  | { type: 'notFound', message: string }
  | { type: 'network', message: string }

type GetPlaceType = {
  REGION: {
    id: string
    type: 'REGION'
  }
  AREA: {
    id: string
    type: 'AREA'
    areaLevel: 'NATIONAL' | 'PREFECTURE' | 'CITY'
  }
}
type PlaceType = GetPlaceType[keyof GetPlaceType]

export async function getPlaceType(placeId: string): Promise<Result<PlaceType, ApiError>> {
  try {
    const db = database()

    const region = await db
      .select()
      .from(regions)
      .where(eq(regions.id, placeId))
      .then(getFirstItem)

    if (region) {
      return ok({ id: region.id, type: 'REGION' })
    }

    // RegionでなければArea確認
    const area = await db
      .select()
      .from(areas)
      .where(eq(areas.id, placeId))
      .then(getFirstItem)

    if (area) {
      return ok({ id: area.id, type: 'AREA', areaLevel: area.level })
    }

    return err({
      type: 'notFound',
      message: '存在しない地域です',
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

// TODO: 選挙データをデータベースに登録する
export async function getLatestElection(): Promise<Result<SelectElection, ApiError>> {
  const MOCK_ELECTION_ID = 'THIS_IS_MOCK_ID'
  return ok({
    id: MOCK_ELECTION_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    round: 50,
    heldAt: new Date('2020-05-20'),
    type: 'REPRESENTATIVES',
  })

  try {
    const db = database()

    const election = await db
      .select()
      .from(elections)
      .orderBy(desc(elections.heldAt))
      .limit(1)
      .then(getFirstItem)

    if (!election) {
      return err({
        type: 'notFound',
        message: '選挙が存在しません',
      })
    }

    // @ts-expect-error 上記の早期リターンで型エラーが出る
    return ok(election)
  }
  catch (error) {
    console.error(error)
    return err({
      type: 'network',
      message: 'サーバーエラーが発生しました',
    })
  }
}

export type GetPlaceAndChildren = {
  Region: {
    type: 'REGION'
    areaLevel?: never
    currentPlace: {
      name: string
      // 地方向けのリンクは存在しない
      to?: undefined
    }
    // "全国"地域
    parent: {
      name: string
      to: string
    }
    // 地方に属する都道府県のリスト
    children: Array<{
      name: string
      to: string
      kana?: undefined
    }>
  }
  NATIONAL: {
    type: 'AREA'
    areaLevel: 'NATIONAL'
    currentPlace: {
      name: string
      to: string
    }
    parent: null
    children: Array<{
      name: string
      to: string
      kana?: undefined
    }>
  }
  PREFECTURE: {
    type: 'AREA'
    areaLevel: 'PREFECTURE'
    currentPlace: {
      name: string
      to: string
    }
    // 地方が親
    parent: {
      name: string
      to: string
    }
    children: Array<{
      name: string
      to: string
      kana: string
    }>
  }
  CITY: {
    type: 'AREA'
    areaLevel: 'CITY'
    currentPlace: {
      name: string
      to: string
    }
    // 都道府県が親
    parent: {
      name: string
      to: string
    }
    // 市区町村は空配列
    children: Array<{
      name: string
      to: string
      kana?: undefined
    }>
  }
}
type PlaceAndChildren = GetPlaceAndChildren[keyof GetPlaceAndChildren]

// TODO: 将来的に`react-router`の`href`を用いて型安全にする
const getPlaceDetailsHref = ({ placeId, electionId }: { placeId: string, electionId: string }) => `/elections/${electionId}/areas/${placeId}`
const getPlaceListHref = (placeId: string) => `/areas/${placeId}`

// 地方の場合の処理を分離
async function getRegionData(
  db: ReturnType<typeof database>,
  placeId: string,
  electionId: string,
): Promise<Result<GetPlaceAndChildren['Region'], ApiError>> {
  const [regionWithPrefectures, nationalArea] = await Promise.all([
    db
      .select({
        regionId: regions.id,
        regionName: regions.name,
        prefectureId: regionsOnPrefectures.prefectureId,
        prefectureName: areas.name,
      })
      .from(regions)
      .innerJoin(
        regionsOnPrefectures,
        eq(regions.id, regionsOnPrefectures.regionId),
      )
      .innerJoin(areas, eq(regionsOnPrefectures.prefectureId, areas.id))
      .where(eq(regions.id, placeId))
      .orderBy(areas.code),
    db
      .select()
      .from(areas)
      .where(eq(areas.level, 'NATIONAL'))
      .then(getFirstItem),
  ])

  if (regionWithPrefectures.length === 0) {
    return err({
      type: 'notFound',
      message: '地方が見つかりません',
    })
  }

  if (!nationalArea) {
    return err({
      type: 'notFound',
      message: '全国地域が見つかりません',
    })
  }

  const regionName = regionWithPrefectures[0]!.regionName
  const children = regionWithPrefectures.map((row) => ({
    name: row.prefectureName,
    to: getPlaceListHref(row.prefectureId),
  }))

  return ok({
    type: 'REGION',
    currentPlace: {
      name: regionName,
      to: undefined,
    },
    parent: {
      name: nationalArea.name,
      to: getPlaceListHref(nationalArea.id),
    },
    children,
  })
}

// 全国の場合の処理を分離
async function getNationalData(
  db: ReturnType<typeof database>,
  currentArea: { id: string, name: string, kanaName: string, level: string, code: string, isActive: boolean, parentId: string | null, createdAt: Date, updatedAt: Date },
  electionId: string,
): Promise<Result<GetPlaceAndChildren['NATIONAL'], ApiError>> {
  const allRegions = await db.select().from(regions)

  const children = allRegions.map((region) => ({
    name: region.name,
    to: getPlaceListHref(region.id),
  }))

  return ok({
    type: 'AREA',
    areaLevel: 'NATIONAL',
    currentPlace: {
      name: currentArea.name,
      to: getPlaceDetailsHref({ placeId: currentArea.id, electionId }),
    },
    parent: null,
    children,
  })
}

// 都道府県の場合の処理を分離
async function getPrefectureData(
  db: ReturnType<typeof database>,
  currentArea: { id: string, name: string, kanaName: string, level: string, code: string, isActive: boolean, parentId: string | null, createdAt: Date, updatedAt: Date },
  placeId: string,
  electionId: string,
): Promise<Result<GetPlaceAndChildren['PREFECTURE'], ApiError>> {
  const [parentRegion, childCities] = await Promise.all([
    db
      .select({
        regionId: regions.id,
        regionName: regions.name,
      })
      .from(regions)
      .innerJoin(
        regionsOnPrefectures,
        eq(regions.id, regionsOnPrefectures.regionId),
      )
      .where(eq(regionsOnPrefectures.prefectureId, placeId))
      .then(getFirstItem),
    db
      .select()
      .from(areas)
      .where(eq(areas.parentId, placeId)),
  ])

  if (!parentRegion) {
    return err({
      type: 'notFound',
      message: '都道府県の親地方が見つかりません',
    })
  }

  const children = childCities.map((city) => ({
    name: city.name,
    to: getPlaceDetailsHref({ placeId: city.id, electionId }),
    kana: city.kanaName,
  }))

  return ok({
    type: 'AREA',
    areaLevel: 'PREFECTURE',
    currentPlace: {
      name: currentArea.name,
      to: getPlaceDetailsHref({ placeId: currentArea.id, electionId }),
    },
    parent: {
      name: parentRegion.regionName,
      to: getPlaceListHref(parentRegion.regionId),
    },
    children,
  })
}

// 市区町村の場合の処理を分離
async function getCityData(
  db: ReturnType<typeof database>,
  currentArea: { id: string, name: string, kanaName: string, level: string, code: string, isActive: boolean, parentId: string | null, createdAt: Date, updatedAt: Date },
  electionId: string,
): Promise<Result<GetPlaceAndChildren['CITY'], ApiError>> {
  const parentPrefecture = await db
    .select()
    .from(areas)
    .where(eq(areas.id, currentArea.parentId!))
    .then(getFirstItem)

  if (!parentPrefecture) {
    return err({
      type: 'notFound',
      message: '市区町村の親都道府県が見つかりません',
    })
  }

  return ok({
    type: 'AREA',
    areaLevel: 'CITY',
    currentPlace: {
      name: currentArea.name,
      to: getPlaceDetailsHref({ placeId: currentArea.id, electionId }),
    },
    parent: {
      name: parentPrefecture.name,
      to: getPlaceDetailsHref({ placeId: parentPrefecture.id, electionId }),
    },
    children: [],
  })
}

export async function getPlaceAndChildren({
  placeType,
  electionId,
}: { placeType: PlaceType, electionId: string }): Promise<Result<PlaceAndChildren, ApiError>> {
  try {
    const db = database()

    // 地方の場合
    if (placeType.type === 'REGION') {
      return await getRegionData(db, placeType.id, electionId)
    }

    // 地域の場合 - まず現在の地域情報を取得
    if (placeType.type === 'AREA') {
      const currentArea = await db
        .select()
        .from(areas)
        .where(eq(areas.id, placeType.id))
        .then(getFirstItem)

      if (!currentArea) {
        return err({
          type: 'notFound',
          message: '地域が見つかりません',
        })
      }

      // レベルに応じて処理を分岐
      switch (placeType.areaLevel) {
        case 'NATIONAL':
          return await getNationalData(db, currentArea, electionId)
        case 'PREFECTURE':
          return await getPrefectureData(db, currentArea, placeType.id, electionId)
        case 'CITY':
          return await getCityData(db, currentArea, electionId)
        default:
          return err({
            type: 'notFound',
            message: '不正な地域レベルです',
          })
      }
    }

    return err({
      type: 'notFound',
      message: '不正な地域タイプです',
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
