import ListItem from '~/components/list-item.tsx'

export default function Route() {
  return (
    <div>
      <ListItem
        size="sm"
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
    </div>
  )
}
