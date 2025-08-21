export interface Election {
  to: string
  name: string
  description: string
  /**
   * 選挙の日時 YYYY-MM-DD
   */
  datetime: string
}
