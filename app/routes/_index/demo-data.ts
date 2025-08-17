import type { HomePageData } from './types'

// 選挙サンプルデータ
export const demoElections: HomePageData['elections'] = [
  {
    id: 'house-2024',
    name: '第50回衆議院議員総選挙',
    date: '2024年10月31日',
    datetime: '2024-10-31',
    type: 'house',
  },
  {
    id: 'councillors-2022',
    name: '第26回参議院議員通常選挙',
    date: '2022年07月10日',
    datetime: '2022-07-10',
    type: 'councillors',
  },
  {
    id: 'house-2021',
    name: '第49回衆議院議員総選挙',
    date: '2021年10月31日',
    datetime: '2021-10-31',
    type: 'house',
  },
  {
    id: 'councillors-2019',
    name: '第25回参議院議員通常選挙',
    date: '2019年07月21日',
    datetime: '2019-07-21',
    type: 'councillors',
  },
  {
    id: 'house-2017',
    name: '第48回衆議院議員総選挙',
    date: '2017年10月22日',
    datetime: '2017-10-22',
    type: 'house',
  },
  {
    id: 'councillors-2016',
    name: '第24回参議院議員通常選挙',
    date: '2016年07月10日',
    datetime: '2016-07-10',
    type: 'councillors',
  },
]

// 地域サンプルデータ
export const demoRegions: HomePageData['regions'] = [
  {
    id: 'hokkaido',
    name: '北海道',
    displayOrder: 1,
    totalPrefectures: 1,
  },
  {
    id: 'tohoku',
    name: '東北',
    displayOrder: 2,
    totalPrefectures: 6,
  },
  {
    id: 'kanto',
    name: '関東',
    displayOrder: 3,
    totalPrefectures: 7,
  },
  {
    id: 'chubu',
    name: '中部',
    displayOrder: 4,
    totalPrefectures: 9,
  },
  {
    id: 'kansai',
    name: '関西',
    displayOrder: 5,
    totalPrefectures: 7,
  },
  {
    id: 'chugoku',
    name: '中国',
    displayOrder: 6,
    totalPrefectures: 5,
  },
  {
    id: 'shikoku',
    name: '四国',
    displayOrder: 7,
    totalPrefectures: 4,
  },
  {
    id: 'kyushu-okinawa',
    name: '九州・沖縄',
    displayOrder: 8,
    totalPrefectures: 8,
  },
]

// 政党サンプルデータ
export const demoParties: HomePageData['parties'] = [
  {
    id: 'ldp',
    name: '自由民主党',
    displayOrder: 1,
    color: '#3C82F6', // 青系
    isMainParty: true,
  },
  {
    id: 'cdp',
    name: '立憲民主党',
    displayOrder: 2,
    color: '#EF4444', // 赤系
    isMainParty: true,
  },
  {
    id: 'komeito',
    name: '公明党',
    displayOrder: 3,
    color: '#F59E0B', // オレンジ系
    isMainParty: true,
  },
  {
    id: 'jcp',
    name: '日本共産党',
    displayOrder: 4,
    color: '#DC2626', // 深い赤
    isMainParty: true,
  },
  {
    id: 'innovation',
    name: '日本維新の会',
    displayOrder: 5,
    color: '#16A34A', // 緑系
    isMainParty: true,
  },
  {
    id: 'democratic-party',
    name: '国民民主党',
    displayOrder: 6,
    color: '#8B5CF6', // 紫系
    isMainParty: true,
  },
  {
    id: 'reiwa',
    name: 'れいわ新選組',
    displayOrder: 7,
    color: '#EC4899', // ピンク系
    isMainParty: false,
  },
  {
    id: 'social-democratic',
    name: '社会民主党',
    displayOrder: 8,
    color: '#06B6D4', // シアン系
    isMainParty: false,
  },
  {
    id: 'political-reform',
    name: '政治家女子48党',
    displayOrder: 9,
    color: '#84CC16', // ライム系
    isMainParty: false,
  },
  {
    id: 'independents',
    name: '諸派・無所属',
    displayOrder: 10,
    color: '#6B7280', // グレー系
    isMainParty: false,
  },
]

// 統合されたデモデータ
export const demoHomePageData: HomePageData = {
  elections: demoElections,
  regions: demoRegions,
  parties: demoParties,
}
