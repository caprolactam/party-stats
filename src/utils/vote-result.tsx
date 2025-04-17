import React from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '#src/components/parts/card.tsx'
import {
  cn,
  countFormatter,
  rateFormatter,
  countIncreaseFormatter,
  rateIncreaseFormatter,
} from '#src/utils/misc.ts'

export type UnitInfo = {
  unit: 'national' | 'region' | 'prefecture' | 'city'
  unitCode: string
  label: string
}
type VoteResultRootProps = React.ComponentPropsWithRef<'div'>

function VoteResultRoot({ ref, children, ...props }: VoteResultRootProps) {
  return (
    <div
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )
}

function VoteResultItem({
  partyCode: _,
  partyName,
  partyColor,
  count,
  rate,
  increaseCount,
  increaseRate,
  className,
}: {
  partyCode: string
  partyName: string
  partyColor: string | undefined
  count: number
  rate: number
  increaseCount: number | null
  increaseRate: number | null
  className?: string
}) {
  return (
    <Card
      variant='outline'
      className={className}
    >
      <CardHeader>
        <div className='flex items-center gap-2'>
          <div
            className='border-brand-11 bg-brand-9 size-4 rounded-sm border'
            style={{ backgroundColor: partyColor }}
          />
          <CardTitle className='text-base'>{partyName}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className='grid gap-4'>
        <div className='bg-brand-7 h-4 w-full'>
          <div
            className='h-full origin-left'
            aria-hidden
            style={{
              backgroundColor: partyColor,
              transform: `scale3d(${rate}, 1, 1)`,
            }}
          ></div>
        </div>
        <div className='flex w-full gap-4'>
          <RateIncrease
            value={countFormatter.format(count)}
            count={increaseCount ?? 0}
            className='flex-1'
          >
            得票数
          </RateIncrease>
          <RateIncrease
            value={rateFormatter.format(rate)}
            rate={increaseRate ?? 0}
            className='flex-1'
          >
            得票率
          </RateIncrease>
        </div>
      </CardContent>
    </Card>
  )
}

function RateIncrease({
  value,
  children,
  className,
  count,
  rate,
}: {
  value: string
  children: string
  className?: string
} & (
  | {
      count: number
      rate?: never
    }
  | {
      count?: never
      rate: number
    }
)) {
  const increase = count ?? rate
  const isNeutral = increase === 0
  const isPositive = increase > 0
  const isNegative = increase < 0

  return (
    <div className={className}>
      <div className='text-sm'>{children}</div>
      <div className='text-2xl font-bold'>{value}</div>
      <div
        className={cn(
          'mt-1 inline-block rounded-sm px-1 py-0.5 text-sm font-medium',
          isNeutral && 'text-brand-11',
          isPositive && 'bg-green-100 text-green-900',
          isNegative && 'bg-red-100 text-red-900',
        )}
      >
        {count != null
          ? isNeutral
            ? '±0'
            : countIncreaseFormatter.format(increase)
          : null}
        {rate != null
          ? isNeutral
            ? '±0.0%'
            : rateIncreaseFormatter.format(increase)
          : null}
      </div>
    </div>
  )
}

export const VoteResult = Object.assign(VoteResultRoot, {
  Item: VoteResultItem,
})
