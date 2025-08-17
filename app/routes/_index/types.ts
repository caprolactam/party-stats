// 選挙データ
export interface Election {
  id: string
  name: string
  date: string // YYYY年MM月DD日 サーバーサイドで変換
  datetime: string // YYYY-MM-DD
  type: 'house' | 'councillors' // 衆議院・参議院選挙
}

// 地域データ
export interface Region {
  id: string
  name: string
  displayOrder: number
  prefectures: Array<Prefecture> // 地域に属する都道府県の配列
}

// 都道府県データ
export interface Prefecture {
  id: string
  name: string
  displayOrder: number
  regionId: string // 所属する地方のID
}

// 政党データ
export interface Party {
  id: string
  name: string
  displayOrder: number
  color: string // 政党カラー（UI表示用）
  isMainParty: boolean
}

// ページデータ全体
export interface HomePageData {
  elections: Array<Election>
  regions: Array<Region>
  parties: Array<Party>
}
