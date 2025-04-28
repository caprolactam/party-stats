import { Link } from '@tanstack/react-router'
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

const VoteResultContext = React.createContext<{
  electionCode: string
  areaCode: string
} | null>(null)

function useVoteResultContext() {
  const context = React.useContext(VoteResultContext)
  if (!context) {
    throw new Error(
      'useVoteResultContext must be used within a VoteResultProvider',
    )
  }
  return context
}

interface VoteResultRootProps extends React.ComponentPropsWithRef<'div'> {
  electionCode: string
  areaCode: string
}
function VoteResultRoot({
  children,
  electionCode,
  areaCode,
  ...props
}: VoteResultRootProps) {
  return (
    <div {...props}>
      <VoteResultContext.Provider value={{ electionCode, areaCode }}>
        {children}
      </VoteResultContext.Provider>
    </div>
  )
}

function VoteResultCard({
  partyCode,
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
  partyColor: string
  count: number
  rate: number
  increaseCount: number | null
  increaseRate: number | null
  className?: string
}) {
  const { electionCode, areaCode } = useVoteResultContext()

  return (
    <Card
      variant='outline'
      className={cn('card-container relative hover:shadow-md', className)}
      asChild
    >
      <Link
        to='/elections/$electionCode/$areaCode/overview/$partyCode'
        params={{
          electionCode,
          areaCode,
          partyCode,
        }}
      >
        <CardHeader>
          <CardTitle className='text-base'>{partyName}</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4'>
          <div className='bg-brand-7 border-brand-8 h-3 w-full overflow-hidden rounded-xl border'>
            <div
              className='h-full origin-left rounded-l-lg'
              aria-hidden
              style={{
                backgroundColor: partyColor,
                transform: `scale3d(clamp(0.01, ${rate}, 1), 1, 1)`,
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
      </Link>
    </Card>
  )
}

export function RateIncrease({
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
    <div className={cn('flex flex-col gap-2', className)}>
      <div className='text-sm'>{children}</div>
      <div className='text-2xl leading-none font-bold'>{value}</div>
      <div
        className={cn(
          'self-start rounded-sm px-1 py-px text-sm font-medium',
          isNeutral && 'text-brand-11',
          isPositive && 'border border-green-200 bg-green-100 text-green-950',
          isNegative && 'border border-red-200 bg-red-100 text-red-950',
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

function VoteResultListItem({
  partyCode,
  partyName,
  partyColor,
  count,
  rate,
  className,
}: {
  partyCode: string
  partyName: string
  partyColor: string
  count: number
  rate: number
  className?: string
}) {
  const { electionCode, areaCode } = useVoteResultContext()

  return (
    <Link
      className={cn('group card-container', className)}
      to='/elections/$electionCode/$areaCode/overview/$partyCode'
      params={{
        electionCode,
        areaCode,
        partyCode: partyCode,
      }}
    >
      <div className='flex items-center gap-4 py-2.5'>
        <div className='flex-1 text-base font-semibold tracking-tight underline-offset-2 group-hover:underline'>
          {partyName}
        </div>
        <div className='flex shrink-0 flex-col gap-2 text-right font-mono tabular-nums'>
          <span className='leading-none font-semibold'>
            {countFormatter.format(count)}
          </span>
          <span className='text-right text-sm leading-none'>
            {`${rateFormatter.format(rate)}`}
          </span>
        </div>
      </div>
      <div className='bg-brand-7 border-brand-8 h-2 w-full overflow-hidden rounded-md border'>
        <div
          className='h-1.5 origin-left rounded-l-sm'
          aria-hidden
          style={{
            backgroundColor: partyColor,
            transform: `scale3d(clamp(0.01, ${rate}, 1), 1, 1)`,
          }}
        ></div>
      </div>
    </Link>
  )
}

export const VoteResult = Object.assign(VoteResultRoot, {
  Card: VoteResultCard,
  ListItem: VoteResultListItem,
})
