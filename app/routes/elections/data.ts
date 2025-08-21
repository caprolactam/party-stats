// モックデータ定義
export const MOCK_ELECTIONS = [
  {
    id: 'hr50-2021',
    round: 50,
    heldAt: new Date('2021-10-31'),
    type: 'REPRESENTATIVES' as const,
  },
  {
    id: 'hr49-2017',
    round: 49,
    heldAt: new Date('2017-10-22'),
    type: 'REPRESENTATIVES' as const,
  },
  {
    id: 'hr48-2014',
    round: 48,
    heldAt: new Date('2014-12-14'),
    type: 'REPRESENTATIVES' as const,
  },
  {
    id: 'hc25-2019',
    round: 25,
    heldAt: new Date('2019-07-21'),
    type: 'COUNCILLORS' as const,
  },
  {
    id: 'hc24-2016',
    round: 24,
    heldAt: new Date('2016-07-10'),
    type: 'COUNCILLORS' as const,
  },
]
