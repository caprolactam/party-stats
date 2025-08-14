import * as React from 'react'

type RegionItem = {
  id: string
  name: string // 表示名（例: 東京都）
  subtitle?: string // 補助情報（例: 投票率ランキング）
  href: string // 遷移先
  rank?: number // 例: 1位、2位
  // あなたが作る1:1シンボル（SVG/IMG）を注入するためのノード
  // 例: <TokyoIcon /> や <img src="/icons/tokyo.svg" alt="" />
  icon?: React.ReactNode
}

type RegionRankingListProps = {
  items: RegionItem[]
  // 'auto'の場合はブレークポイントで 40→56→64 に自動スケール
  // 固定にしたい場合は 'sm' | 'md' | 'lg'
  size?: 'auto' | 'sm' | 'md' | 'lg'
  className?: string
}

function iconSizeClass(size: RegionRankingListProps['size']): string {
  // 角丸は小サイズでも視認性を確保するためやや強め
  if (size === 'sm') return 'h-10 w-10 rounded-xl'
  if (size === 'md') return 'h-14 w-14 rounded-2xl'
  if (size === 'lg') return 'h-16 w-16 rounded-2xl'
  // auto: xs:40, md:56, lg:64
  return 'h-10 w-10 md:h-14 md:w-14 lg:h-16 lg:w-16 rounded-2xl'
}

function RegionListItem(props: { item: RegionItem, size: RegionRankingListProps['size'] }) {
  const { item, size } = props
  return (
    <li className="group relative isolate">
      <a
        href={item.href}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-hovered focus:ring-2 focus:ring-blue-500
                 focus:outline-none active:bg-neutral-100 md:gap-4
                 md:px-4 md:py-3 dark:hover:bg-neutral-900/60 dark:active:bg-neutral-900"
      >
        {/* アイコン枠（中に1:1のあなたのシンボルを入れる） */}
        <span
          className={[
            'shrink-0 grid place-items-center overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900',
            iconSizeClass(size),
          ].join(' ')}
          aria-hidden="true"
        >
          {/* 例示のプレースホルダ（差し替えてください） */}
          {item.icon ?? (
            <span className="inline-block h-2/3 w-2/3 rounded-md bg-neutral-200 dark:bg-neutral-800" />
          )}
        </span>

        {/* テキスト */}
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-neutral-900 md:text-base dark:text-neutral-100">
              {item.name}
            </span>
            {typeof item.rank === 'number' && (
              <span
                className="inline-flex items-center rounded-md border border-neutral-200 bg-white
                           px-1.5 py-0.5 text-[10px] leading-none text-neutral-700
                           md:text-xs dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                aria-label={`順位 ${item.rank}位`}
              >
                #
                {item.rank}
              </span>
            )}
          </span>
          {item.subtitle && (
            <span className="mt-0.5 block truncate text-xs text-neutral-500 md:text-sm dark:text-neutral-400">
              {item.subtitle}
            </span>
          )}
        </span>

        {/* 右端のシェブロン */}
        <span className="ml-2 shrink-0 text-neutral-300 group-hover:text-neutral-400 dark:text-neutral-700 dark:group-hover:text-neutral-600">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            role="img"
            aria-label="詳細へ"
          >
            <path
              d="M9 6l6 6-6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </a>
    </li>
  )
}

export default function RegionRankingList(props: RegionRankingListProps) {
  const { items, size = 'auto', className } = props
  return (
    <nav
      aria-label="地域ランキング"
      className={['w-full', className ?? ''].join(' ')}
    >
      <ul className="divide-y divide-neutral-100 dark:divide-neutral-900">
        {items.map((item) => (
          <RegionListItem key={item.id} item={item} size={size} />
        ))}
      </ul>
    </nav>
  )
}

/* ===== 使い方の例 =====

<RegionRankingList
  size="auto"
  items={[
    {
      id: 'tokyo',
      name: '東京都',
      subtitle: '投票率ランキング',
      href: '/pref/tokyo/turnout',
      rank: 1,
      icon: (
        // ここに1:1のあなたのシンボルを入れる（SVG推奨）
        // 例: 東京都シルエット＋都庁の簡略化
        <svg viewBox="0 0 24 24" className="h-full w-full p-2">
          <rect x="4" y="6" width="6" height="12" rx="1.5" className="fill-neutral-300 dark:fill-neutral-700" />
          <rect x="12" y="4" width="6" height="14" rx="1.5" className="fill-neutral-300 dark:fill-neutral-700" />
        </svg>
      ),
    },
    {
      id: 'osaka',
      name: '大阪府',
      subtitle: '投票率ランキング',
      href: '/pref/osaka/turnout',
      rank: 2,
      icon: (
        <svg viewBox="0 0 24 24" className="h-full w-full p-2">
          <circle cx="12" cy="12" r="7" className="fill-neutral-300 dark:fill-neutral-700" />
        </svg>
      ),
    },
  ]}
/>

*/
