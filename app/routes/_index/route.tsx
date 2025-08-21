import { Separator } from '~/components/ui/separator.tsx'
import type { Route } from './+types/route'
import { ElectionSection } from './components/election-section'
import { HeroSection } from './components/hero-section'
import { PartySection } from './components/party-section'
import { RegionSection } from './components/region-section'
import { demoHomePageData } from './demo-data'
import type { HomePageData } from './types'

export async function loader(_: Route.LoaderArgs) {
  // TODO: 開発段階では静的なデモデータを返す
  const data: HomePageData = demoHomePageData

  return data
}

export function headers(_: Route.HeadersArgs) {
  return {
    'Cache-Control': 'private, max-age=3600',
  }
}

export default function SiteHome({ loaderData }: Route.ComponentProps) {
  const { elections, regions, parties } = loaderData

  return (
    <>
      <SiteMetadata />
      <div className="grid gap-(--space-base)">
        <h1 className="sr-only">サイトホーム</h1>
        <HeroSection />
        <Separator />
        <ElectionSection elections={elections} />
        <Separator />
        <RegionSection regions={regions} />
        <Separator />
        <PartySection parties={parties} />
      </div>
    </>
  )
}

function SiteMetadata() {
  return (
    <>
      <title>選挙統計 - 選挙結果を探してみましょう</title>
      <meta
        name="description"
        content="日本の国政選挙結果を地域別・政党別で比較・分析。衆議院・参議院選挙の統計データを提供する公開サイトです。"
      />
      <meta name="keywords" content="選挙統計,選挙結果,政党,地域別,比較,分析,衆議院,参議院,日本" />

      {/* Open Graph */}
      <meta property="og:title" content="選挙統計 - 選挙結果を探してみましょう" />
      <meta property="og:description" content="日本の国政選挙結果を地域別・政党別で比較・分析できる統計サイト" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://election-stats.com" />
      <meta property="og:image" content="https://election-stats.com/og-image.jpg" />
      <meta property="og:site_name" content="選挙統計" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="選挙統計 - 選挙結果を探してみましょう" />
      <meta name="twitter:description" content="日本の国政選挙結果を地域別・政党別で比較・分析" />
      <meta name="twitter:image" content="https://election-stats.com/twitter-card.jpg" />

      {/* Canonical */}
      <link rel="canonical" href="https://election-stats.com" />

      {/* 構造化データ（JSON-LD） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            'name': '選挙統計',
            'description': '日本の国政選挙結果を地域別・政党別で比較・分析',
            'url': 'https://election-stats.com',
            'publisher': {
              '@type': 'Organization',
              'name': '選挙統計プロジェクト',
            },
            'potentialAction': {
              '@type': 'SearchAction',
              'target': 'https://election-stats.com/search?q={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
    </>
  )
}

// エラー境界コンポーネント
export function ErrorBoundary() {
  return (
    <>
      <SiteMetadata />
      <div className="flex min-h-64 flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold text-destructive">
          データの読み込みに失敗しました
        </h2>
        <p className="max-w-md text-center text-muted-foreground">
          一時的な問題が発生している可能性があります。
          しばらく待ってから再度お試しください。
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none"
        >
          ページを再読み込み
        </button>
      </div>
    </>
  )
}
