import { Link } from 'react-router'

export function HeroSection() {
  return (
    <section className="grid gap-(--space-base)">
      <h2 className="sr-only text-xl font-bold text-foreground md:not-sr-only">
        注目の選挙結果
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* 最新の総選挙 */}
        <ElectionHero
          title="2024年総選挙"
          description="最新の選挙結果と政党別得票状況をご確認いただけます"
          badge="最新"
          stats="289選挙区"
          to="/elections/2024"
          badgeColor="bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200"
          imageGradient="from-blue-200 to-blue-300 dark:from-blue-800 dark:to-blue-700"
          icon="📊"
        />

        {/* 参議院選挙 */}
        <ElectionHero
          title="2022年参議院選"
          description="参議院議員選挙の選挙区別・比例代表の結果を詳しく分析"
          badge="参議院"
          stats="45選挙区"
          to="/elections/2022-sangiin"
          badgeColor="bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200"
          imageGradient="from-green-200 to-green-300 dark:from-green-800 dark:to-green-700"
          icon="🏛️"
        />
      </div>
    </section>
  )
}

interface ElectionHeroProps {
  title: string
  description: string
  badge: string
  stats: string
  to: string
  badgeColor: string
  imageGradient: string
  icon: string
}

function ElectionHero({
  title,
  description,
  badge,
  stats,
  to,
  badgeColor,
  imageGradient,
  icon,
}: ElectionHeroProps) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg"
    >
      {/* 画像プレースホルダー - 全体を覆う */}
      <div className={`aspect-video overflow-hidden bg-gradient-to-r ${imageGradient} relative`}>
        {/* 背景画像エリア（将来的に画像に置き換える） */}
        <div className="absolute inset-0 flex items-center justify-center text-blue-600 dark:text-blue-300">
          <div className="text-center">
            <div className="text-6xl font-bold opacity-30">{icon}</div>
          </div>
        </div>

        {/* コンテンツエリア - 画像の上にオーバーレイ */}
        <div className="absolute inset-0 flex flex-col justify-between p-6">
          {/* ヘッダー部分（タイトルとバッジ） */}
          <div className="flex items-start justify-between">
            <div className="rounded-lg bg-white/20 px-3 py-2 backdrop-blur-md dark:bg-black/30">
              <h3 className="text-lg font-bold text-white drop-shadow-lg">
                {title}
              </h3>
            </div>
            <div className={`rounded-full border border-white/20 bg-white/90 px-3 py-1 text-xs font-medium backdrop-blur-md dark:bg-black/70 ${badgeColor.replace('bg-', 'text-').split(' ')[1]}`}>
              {badge}
            </div>
          </div>

          {/* フッター部分（説明とアクション） */}
          <div className="space-y-3">
            <div className="rounded-lg bg-white/20 p-3 backdrop-blur-md dark:bg-black/30">
              <p className="text-sm font-medium text-white drop-shadow-lg">
                {description}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="rounded-full bg-white/20 px-3 py-1 backdrop-blur-md dark:bg-black/30">
                <span className="text-xs font-medium text-white drop-shadow-lg">{stats}</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 backdrop-blur-md transition-all group-hover:bg-white/30 dark:bg-black/30 dark:group-hover:bg-black/40">
                <span className="text-xs font-medium text-white drop-shadow-lg">詳細を見る</span>
                <svg
                  className="h-3 w-3 transform text-white drop-shadow-lg transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ホバー効果用オーバーレイ */}
        <div className="absolute inset-0 bg-black/10 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </Link>
  )
}
