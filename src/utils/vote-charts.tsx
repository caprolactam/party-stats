import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '#src/components/parts/chart.tsx'
import { rateFormatter, countFormatter } from './misc.ts'

type CountChangesProps<
  T extends Record<string, { label: string; color: string }>,
> = {
  config: T
  data: Array<
    {
      election: string
    } & {
      [K in keyof T]?: number
    }
  >
}

const axisCountFormatter = new Intl.NumberFormat('ja-JP', {
  notation: 'compact',
  compactDisplay: 'short',
  useGrouping: true,
})

export function CountChanges<
  T extends Record<string, { label: string; color: string }>,
>({ config, data }: CountChangesProps<T>) {
  return (
    <ChartContainer config={config}>
      <LineChart
        accessibilityLayer
        data={data}
        margin={{
          left: 0,
          top: 16,
          right: 48,
        }}
      >
        <CartesianGrid vertical={false} />
        <YAxis
          tickFormatter={(value) => {
            return axisCountFormatter.format(Number(value))
          }}
        />
        <XAxis dataKey='compactLabel' />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(_, [payload]) => payload?.payload.election}
              valueFormatter={(value) => countFormatter.format(value)}
            />
          }
        />
        {Object.keys(config).map((key) => (
          <Line
            key={key}
            dataKey={key}
            type='linear'
            stroke={`var(--color-${key})`}
            strokeWidth={2}
            isAnimationActive={false}
            dot={{
              fill: `var(--color-${key})`,
            }}
            activeDot={{
              r: 6,
            }}
          />
        ))}
        <ChartLegend
          content={<ChartLegendContent />}
          verticalAlign='bottom'
        />
      </LineChart>
    </ChartContainer>
  )
}

type RateChangesProps<
  T extends Record<string, { label: string; color: string }>,
> = {
  config: T
  data: Array<
    {
      election: string
    } & {
      [K in keyof T]?: number
    }
  >
}

const axisRateFormatter = new Intl.NumberFormat('ja-JP', {
  style: 'percent',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function RateChanges<
  T extends Record<string, { label: string; color: string }>,
>({ config, data }: RateChangesProps<T>) {
  return (
    <ChartContainer config={config}>
      <LineChart
        accessibilityLayer
        data={data}
        margin={{
          left: 0,
          top: 16,
          right: 48,
        }}
      >
        <CartesianGrid vertical={false} />
        <YAxis
          tickFormatter={(value) => {
            return axisRateFormatter.format(Number(value))
          }}
        />
        <XAxis dataKey='election' />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              valueFormatter={(value) => {
                return rateFormatter.format(Number(value))
              }}
            />
          }
        />
        {Object.keys(config).map((key) => (
          <Line
            key={key}
            dataKey={key}
            type='linear'
            stroke={`var(--color-${key})`}
            strokeWidth={2}
            isAnimationActive={false}
            dot={{
              fill: `var(--color-${key})`,
            }}
            activeDot={{
              r: 6,
            }}
          />
        ))}
        <ChartLegend
          content={<ChartLegendContent />}
          verticalAlign='bottom'
        />
      </LineChart>
    </ChartContainer>
  )
}
