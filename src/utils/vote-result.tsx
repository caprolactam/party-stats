import { Link } from '@tanstack/react-router'
import React from 'react'
import { buttonVariants } from '#src/components/parts/button.tsx'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
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

function VoteResultItem({
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
  partyColor: string | undefined
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
      className={className}
    >
      <CardHeader>
        <CardTitle className='text-base'>{partyName}</CardTitle>
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
      <CardFooter className='flex justify-end'>
        <Link
          to='/elections/$electionCode/$areaCode/overview/$partyCode'
          params={{
            electionCode,
            areaCode,
            partyCode,
          }}
          className={buttonVariants({
            size: 'md',
            variant: 'outline',
          })}
        >
          詳しく見る
        </Link>
      </CardFooter>
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

export const VoteResult = Object.assign(VoteResultRoot, {
  Item: VoteResultItem,
})
