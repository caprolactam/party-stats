import { cn } from '~/lib/utils.ts'

interface FooterProps {
  /**
   * フッターのクラス名（追加のスタイリング用）
   */
  className?: string
}

/**
 * サイト共通フッターコンポーネント
 *
 * サイト情報とライセンス情報を表示します。
 * - 「このサイトについて」「連絡先」リンク
 * - レスポンシブ対応のテキスト配置
 * - 固定高さとセンタリング配置
 */
export function Footer({ className = '' }: FooterProps) {
  return (
    <div
      className={cn('flex h-12 items-center gap-4', className)}
    >
      <Copyright />
    </div>
  )
}

function Copyright() {
  const currentYear = new Date().getFullYear()
  return (
    <div className="inline-flex gap-2 text-[15px] leading-relaxed font-medium text-muted-foreground">
      {`© ${currentYear}`}
      <a
        href="https://github.com/caprolactam"
        target="_blank"
        rel="noopener noreferrer"
        className="underline-offset-2 hover:underline"
      >
        caprolactam
      </a>
    </div>
  )
}
