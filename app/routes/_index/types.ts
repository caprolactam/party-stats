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
  totalPrefectures: number // 地方内の都道府県数
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
