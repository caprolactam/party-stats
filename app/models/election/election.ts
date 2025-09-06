export function getName({
  round,
  type,
}: {
  round: number
  type: 'REPRESENTATIVES' | 'COUNCILLORS'
}): string {
  switch (type) {
    case 'REPRESENTATIVES':
      return `第${round}回 衆議院議員総選挙`
    case 'COUNCILLORS':
      return `第${round}回 参議院議員通常選挙`
    default:
      const _: never = type
      throw new Error(`Unknown election type: ${type}`)
  }
}

export function getShortName({
  heldAt,
  type,
}: {
  heldAt: Date
  type: 'REPRESENTATIVES' | 'COUNCILLORS'
}): string {
  // 実施年の下2桁を取得
  const year = heldAt.getFullYear().toString().slice(-2)
  switch (type) {
    case 'REPRESENTATIVES':
      return `衆${year}`
    case 'COUNCILLORS':
      return `参${year}`
    default:
      const _: never = type
      throw new Error(`Unknown election type: ${type}`)
  }
}
