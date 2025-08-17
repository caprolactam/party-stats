# Carousel API設計

参考実装：
* Radix UI (合成パターン)
* CMDK (合成パターン)  
* Embla Carousel (カルーセルAPI)

W3C準拠：Grouped Carousel Pattern
* Container: role="region" + aria-roledescription="carousel"
* Slides: role="group" + aria-roledescription="slide"
* Indicators: role="group" + button pattern

import type {
  CarouselRootProps,
  CarouselViewportProps,
  CarouselContentProps,
  CarouselNavigationButtonProps,
  CarouselIndicatorsProps,
  CarouselIndicatorProps,
} from './types.ts'

## カルーセルコンポーネントAPI

使用例:

```tsx
<Carousel.Root value={currentItem} onValueChange={setCurrentItem}>
  <Carousel.Viewport className="h-64">
    {items.map((item) => (
      <Carousel.Content key={item.id} value={item.id}>
        <ItemCard item={item} />
      </Carousel.Content>
    ))}
  </Carousel.Viewport>
  
  <Carousel.Previous aria-label="前の商品を表示" />
  <Carousel.Next aria-label="次の商品を表示" />
  
  <Carousel.Indicators aria-label="商品ページを選択" />
</Carousel.Root>
```
export interface CarouselAPI {
  /**
   * ルートコンテナ
   * - カルーセル全体の状態管理
   * - コンテキスト提供
   * - W3C: role="region" + aria-roledescription="carousel"
   */
  Root: (props: CarouselRootProps) => React.JSX.Element

  /**
   * ビューポート
   * - スクロール可能な表示領域
   * - scroll-snap実装
   * - 隣接コンテンツの部分表示
   */
  Viewport: (props: CarouselViewportProps) => React.JSX.Element

  /**
   * スライドコンテンツ
   * - 個々のスライド要素
   * - W3C: role="group" + aria-roledescription="slide"
   */
  Content: (props: CarouselContentProps) => React.JSX.Element

  /**
   * 前へボタン
   * - 前のスライドに移動
   * - W3C: button pattern
   * - レスポンシブ: モバイルで非表示
   */
  Previous: (props: CarouselNavigationButtonProps) => React.JSX.Element

  /**
   * 次へボタン
   * - 次のスライドに移動
   * - W3C: button pattern
   * - レスポンシブ: モバイルで非表示
   */
  Next: (props: CarouselNavigationButtonProps) => React.JSX.Element

  /**
   * インジケーター群
   * - スライド選択UI
   * - W3C: role="group" + button pattern
   * - オプショナル実装
   */
  Indicators: (props: CarouselIndicatorsProps) => React.JSX.Element

  /**
   * 個別インジケーター
   * - 特定スライドへの直接移動
   * - W3C: button + aria-disabled for current
   */
  Indicator: (props: CarouselIndicatorProps) => React.JSX.Element
}

/**
 * 設計原則
 * 
 * 1. **合成パターン**: 各コンポーネントは独立して動作し、組み合わせて使用
 * 2. **プログレッシブエンハンスメント**: 基本機能（スクロール）はJS無しでも動作
 * 3. **アクセシビリティファースト**: W3C準拠を最優先
 * 4. **柔軟性**: スタイリングとレイアウトは完全にカスタマイズ可能
 * 5. **パフォーマンス**: ネイティブスクロールを活用
 */

/**
 * 実装優先順位
 * 
 * Phase 1: 基本実装
 * - Root (コンテキスト)
 * - Viewport (スクロール領域)
 * - Content (スライド)
 * 
 * Phase 2: ナビゲーション
 * - Previous/Next ボタン
 * - キーボード操作
 * 
 * Phase 3: インジケーター
 * - Indicators (グループ)
 * - Indicator (個別)
 * 
 * Phase 4: 高度な機能
 * - アニメーション設定
 * - カスタムフック
 * - テスト
 */
