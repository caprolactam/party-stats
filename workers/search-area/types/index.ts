/**
 * 地域検索API型定義
 *
 * 設計書: /party-stats-blueprint/designs/area-search-api-spec.md
 * をもとに生成
 */

// =============================================================================
// リクエスト型
// =============================================================================

export interface SearchAreaParams {
  /** 検索キーワード（正式名称・ひらがな読み両対応） */
  q: string
  /** 地域レベルフィルタ */
  level?: AreaLevel
  /** 最大取得件数（1-100、デフォルト: 10） */
  limit?: number
  /** ページ番号（1から開始、デフォルト: 1） */
  page?: number
  /** 統廃合済み地域を含むか（デフォルト: false） */
  include_inactive?: boolean
}

export type AreaLevel = 'NATIONAL' | 'PREFECTURE' | 'CITY'

// =============================================================================
// レスポンス型
// =============================================================================

export interface SearchAreaResponse {
  success: true
  query: string
  results: SearchResult[]
  total: number
  page: number // 現在のページ番号
  limit: number // 1ページあたりの件数
  hasMore: boolean // 次のページが存在するか
  totalPages: number // 総ページ数
}

export interface SearchResult {
  /** 地域コード（例: "130001"） */
  areaCode: string
  /** 正式名称（例: "東京都"） */
  name: string
  /** ひらがな読み（例: "とうきょうと"） */
  kanaName: string
  /** 地域レベル */
  level: AreaLevel
  /** 現在有効かどうか */
  isActive: boolean
  /** 検索スコア（0.0-1.0） */
  score: number
  /** 親地域情報（市区町村の場合） */
  parentArea?: ParentAreaInfo
}

export interface ParentAreaInfo {
  areaCode: string
  name: string
}

// =============================================================================
// エラーレスポンス型
// =============================================================================

export interface SearchAreaErrorResponse {
  success: false
  error: SearchAreaError
}

export interface SearchAreaError {
  type: SearchAreaErrorType
  message: string
  details?: Record<string, any>
}

export type SearchAreaErrorType =
  | 'INVALID_QUERY'
  | 'INVALID_LEVEL'
  | 'INVALID_LIMIT'
  | 'INVALID_PAGE'
  | 'SEARCH_FAILED'
  | 'RATE_LIMITED'

// =============================================================================
// Union型
// =============================================================================

export type SearchAreaApiResponse = SearchAreaResponse | SearchAreaErrorResponse

// =============================================================================
// 内部処理用型
// =============================================================================

export interface SearchOptions {
  level?: AreaLevel
  limit: number
  page: number
  includeInactive: boolean
}

export interface RawAreaData {
  areaCode: string
  name: string
  kanaName: string
  level: AreaLevel
  isActive: boolean
  parentCode?: string | null
}

export interface ProcessedAreaData extends RawAreaData {
  parentArea?: ParentAreaInfo
}

// =============================================================================
// 検索アルゴリズム用型
// =============================================================================

export interface MatchResult {
  area: ProcessedAreaData
  score: number
  matchType: MatchType
  matchField: MatchField
}

export type MatchType = 'exact' | 'prefix' | 'partial'
export type MatchField = 'name' | 'kanaName'

export interface SearchScoreWeights {
  exact: { name: number, kanaName: number }
  prefix: { name: number, kanaName: number }
  partial: { name: number, kanaName: number }
}

// =============================================================================
// 設定・定数型
// =============================================================================

export interface SearchConfig {
  defaultLimit: number
  maxLimit: number
  minQueryLength: number
  maxQueryLength: number
  scoreWeights: SearchScoreWeights
}

// =============================================================================
// 型ガード
// =============================================================================

export function isSearchAreaResponse(response: SearchAreaApiResponse): response is SearchAreaResponse {
  return response.success === true
}

export function isSearchAreaErrorResponse(response: SearchAreaApiResponse): response is SearchAreaErrorResponse {
  return response.success === false
}

export function isValidAreaLevel(level: string): level is AreaLevel {
  return ['NATIONAL', 'PREFECTURE', 'CITY'].includes(level)
}
