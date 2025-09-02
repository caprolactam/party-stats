import type React from 'react'
import { Link } from 'react-router'
import type { To } from 'react-router'
import { LineChart, Line, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/charts.tsx'
import type { ChartConfig } from '~/components/ui/charts.tsx'
import { Icon } from '~/components/ui/icon.tsx'

type RateStats = {
  rate: number
  rateDiffFromPrevious: number | null
  rateChanges: Array<{
    electionId: string
    name: string
    rate: number | null
  }>
  to: To
} | null

interface VotingStatusSectionProps {
  electionId: string
  turnout: RateStats
  invalidVotes: RateStats
}

export function VotingStatusSection({
  turnout,
  invalidVotes,
}: VotingStatusSectionProps) {
  return (
    <section>
      <h2 className="mb-(--space-xs) pl-(--space-xs) text-sm text-muted-foreground">投票状況</h2>
      <div className="grid grid-cols-2 gap-(--space-base)">
        <StatCard
          title="投票率"
          stats={turnout}
        />
        <StatCard
          title="無効投票率"
          stats={invalidVotes}
        />
      </div>
    </section>
  )
}

type DiffType = 'increase' | 'decrease' | 'no-change'

function StatCard({
  title,
  stats,
}: {
  title: string
  stats: RateStats
}) {
  if (!stats) {
    return (
      <div className="rounded-md border border-border/70 bg-card p-(--space-base)">
        <h3 className="text-sm text-muted-foreground">{title}</h3>
        <p className="mt-(--space-xs) text-3xl leading-none font-semibold text-muted-foreground">データなし</p>
      </div>
    )
  }

  const { rate: value, rateDiffFromPrevious: diffFromPrevious } = stats
  const diffType: DiffType | null = diffFromPrevious == null
    ? 'no-change'
    : diffFromPrevious > 0 ? 'increase' : diffFromPrevious < 0 ? 'decrease' : 'no-change'

  const chartConfig: ChartConfig = {
    rate: {
      label: title,
      color: 'var(--chart-2)',
    },
  }

  // TODO: カラーのダークモード対応
  const diffs: Record<DiffType, React.ReactNode> = {
    'increase': (
      <>
        <Icon
          name="arrow-upward"
          size={12}
          className="size-3.5 rounded-full bg-green-600 text-card"
          title="プラス"
        />
        {`${diffFromPrevious!.toFixed(2)}ポイント`}
      </>
    ),
    'decrease': (
      <>
        <Icon
          name="arrow-downward"
          size={12}
          className="size-3.5 rounded-full bg-red-600 text-card"
          title="マイナス"
        />
        {`${Math.abs(diffFromPrevious!).toFixed(2)}ポイント`}
      </>
    ),
    'no-change': '変化なし',
  }

  return (
    <div className="divide-y divide-border/70 rounded-md bg-card">
      <div className="grid gap-2 p-4">
        <h3 className="text-sm text-muted-foreground">{title}</h3>
        <div className="flex items-end gap-4">
          <div className="text-3xl leading-none font-medium">
            {`${value}%`}
          </div>
          {diffType == null
            ? null
            : (
                <div className="flex items-center gap-1 font-mono font-medium text-muted-foreground">
                  {diffs[diffType]}
                </div>
              )}
        </div>
        <ChartContainer
          config={chartConfig}
          className="h-full w-full"
        >
          <LineChart
            data={stats.rateChanges}
            margin={{ top: 12, left: 12, right: 12, bottom: 0 }}
          >
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              domain={['dataMin - 5', 'dataMax + 5']}
              tickFormatter={(value) => `${value}%`}
            />
            <ChartTooltip />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="var(--color-rate)"
              strokeWidth={2}
              dot={{ fill: 'var(--color-rate)', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </div>
      <Link className="flex h-12 w-full min-w-0 items-center gap-4 rounded-b-md px-4 hover:bg-hovered active:bg-selected" to={stats.to}>
        <span className="flex-1 truncate">選挙の推移と地域の比較</span>
        <Icon name="chevron-right" className="-translate-y-px text-muted-foreground" size={22} />
      </Link>
    </div>
  )
}
