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
    id: 'hokkaido-tohoku',
    name: '北海道・東北',
    displayOrder: 1,
    prefectures: [
      { id: 'hokkaido', name: '北海道', regionId: 'hokkaido', displayOrder: 1 },
      { id: 'aomori', name: '青森県', regionId: 'tohoku', displayOrder: 2 },
      { id: 'iwate', name: '岩手県', regionId: 'tohoku', displayOrder: 3 },
      { id: 'miyagi', name: '宮城県', regionId: 'tohoku', displayOrder: 4 },
      { id: 'akita', name: '秋田県', regionId: 'tohoku', displayOrder: 5 },
      { id: 'yamagata', name: '山形県', regionId: 'tohoku', displayOrder: 6 },
      { id: 'fukushima', name: '福島県', regionId: 'tohoku', displayOrder: 7 },
    ],

  },
  {
    id: 'kanto',
    name: '関東',
    displayOrder: 2,
    prefectures: [
      { id: 'ibaraki', name: '茨城県', regionId: 'kanto', displayOrder: 1 },
      { id: 'tochigi', name: '栃木県', regionId: 'kanto', displayOrder: 2 },
      { id: 'gunma', name: '群馬県', regionId: 'kanto', displayOrder: 3 },
      { id: 'saitama', name: '埼玉県', regionId: 'kanto', displayOrder: 4 },
      { id: 'chiba', name: '千葉県', regionId: 'kanto', displayOrder: 5 },
      { id: 'tokyo', name: '東京都', regionId: 'kanto', displayOrder: 6 },
      { id: 'kanagawa', name: '神奈川県', regionId: 'kanto', displayOrder: 7 },
      { id: 'yamanashi', name: '山梨県', regionId: 'chubu', displayOrder: 8 },
    ],
  },
  {
    id: 'tokai',
    name: '東海・北信越',
    displayOrder: 3,
    prefectures: [
      { id: 'niigata', name: '新潟県', regionId: 'chubu', displayOrder: 1 },
      { id: 'toyama', name: '富山県', regionId: 'chubu', displayOrder: 2 },
      { id: 'ishikawa', name: '石川県', regionId: 'chubu', displayOrder: 3 },
      { id: 'fukui', name: '福井県', regionId: 'chubu', displayOrder: 4 },
      { id: 'nagano', name: '長野県', regionId: 'chubu', displayOrder: 5 },
      { id: 'gifu', name: '岐阜県', regionId: 'chubu', displayOrder: 6 },
      { id: 'shizuoka', name: '静岡県', regionId: 'chubu', displayOrder: 7 },
      { id: 'aichi', name: '愛知県', regionId: 'chubu', displayOrder: 8 },
    ],
  },
  {
    id: 'kansai',
    name: '関西',
    displayOrder: 4,
    prefectures: [
      { id: 'mie', name: '三重県', regionId: 'kansai', displayOrder: 1 },
      { id: 'shiga', name: '滋賀県', regionId: 'kansai', displayOrder: 2 },
      { id: 'kyoto', name: '京都府', regionId: 'kansai', displayOrder: 3 },
      { id: 'osaka', name: '大阪府', regionId: 'kansai', displayOrder: 4 },
      { id: 'hyogo', name: '兵庫県', regionId: 'kansai', displayOrder: 5 },
      { id: 'nara', name: '奈良県', regionId: 'kansai', displayOrder: 6 },
      { id: 'wakayama', name: '和歌山県', regionId: 'kansai', displayOrder: 7 },
    ],
  },
  {
    id: 'chugoku-shikoku',
    name: '中国・四国',
    displayOrder: 5,
    prefectures: [
      { id: 'tottori', name: '鳥取県', regionId: 'chugoku', displayOrder: 1 },
      { id: 'shimane', name: '島根県', regionId: 'chugoku', displayOrder: 2 },
      { id: 'okayama', name: '岡山県', regionId: 'chugoku', displayOrder: 3 },
      { id: 'hiroshima', name: '広島県', regionId: 'chugoku', displayOrder: 4 },
      { id: 'yamaguchi', name: '山口県', regionId: 'chugoku', displayOrder: 5 },
      { id: 'tokushima', name: '徳島県', regionId: 'shikoku', displayOrder: 6 },
      { id: 'kagawa', name: '香川県', regionId: 'shikoku', displayOrder: 7 },
      { id: 'ehime', name: '愛媛県', regionId: 'shikoku', displayOrder: 8 },
      { id: 'kochi', name: '高知県', regionId: 'shikoku', displayOrder: 9 },
    ],
  },
  {
    id: 'kyushu-okinawa',
    name: '九州・沖縄',
    displayOrder: 6,
    prefectures: [
      { id: 'fukuoka', name: '福岡県', regionId: 'kyushu-okinawa', displayOrder: 1 },
      { id: 'saga', name: '佐賀県', regionId: 'kyushu-okinawa', displayOrder: 2 },
      { id: 'nagasaki', name: '長崎県', regionId: 'kyushu-okinawa', displayOrder: 3 },
      { id: 'kumamoto', name: '熊本県', regionId: 'kyushu-okinawa', displayOrder: 4 },
      { id: 'oita', name: '大分県', regionId: 'kyushu-okinawa', displayOrder: 5 },
      { id: 'miyazaki', name: '宮崎県', regionId: 'kyushu-okinawa', displayOrder: 6 },
      { id: 'kagoshima', name: '鹿児島県', regionId: 'kyushu-okinawa', displayOrder: 7 },
      { id: 'okinawa', name: '沖縄県', regionId: 'kyushu-okinawa', displayOrder: 8 },
    ],
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
