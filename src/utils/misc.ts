import { useLoaderData } from '@tanstack/react-router'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// source: https://ribbit.konomi.app/blog/ts-strict-object-entries/
export const strictEntries = <T extends Record<string, any>>(
  object: T,
): [keyof T, T[keyof T]][] => {
  return Object.entries(object)
}

export const rankFormatter = new Intl.NumberFormat('ja-JP')

export const countFormatter = new Intl.NumberFormat('ja-JP', {
  style: 'decimal',
  signDisplay: 'never',
  maximumFractionDigits: 0,
})

export const rateFormatter = new Intl.NumberFormat('ja-JP', {
  style: 'percent',
  signDisplay: 'never',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const countIncreaseFormatter = Intl.NumberFormat('ja-JP', {
  style: 'decimal',
  signDisplay: 'always',
  maximumFractionDigits: 0,
})

export const rateIncreaseFormatter = new Intl.NumberFormat('ja-JP', {
  style: 'percent',
  signDisplay: 'always',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export type Unit = 'national' | 'region' | 'prefecture' | 'city'

export function useUnitInfo(): { unit: Unit; unitCode: string; label: string } {
  const data = useLoaderData({
    from: '/elections/$electionCode/$unitCode',
  })

  switch (data.unit) {
    case 'national':
      return {
        unit: 'national',
        unitCode: 'national',
        label: '全国',
      }
    case 'region':
      return {
        unit: 'region',
        unitCode: data.region.code,
        label: data.region.name,
      }
    case 'prefecture':
      return {
        unit: 'prefecture',
        unitCode: data.prefecture.code,
        label: data.prefecture.name,
      }
    case 'city':
      return {
        unit: 'city',
        unitCode: data.city.code,
        label: data.city.name,
      }
    default: {
      const _exhaustiveCheck: never = data
      throw new Error(`Unexpected unit: ${_exhaustiveCheck}`)
    }
  }
}

export function convertElectionInfo({
  electionDate,
}: {
  electionDate: string
}) {
  const date = new Date(electionDate)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')

  const datetime = `${year}-${month}-${day}`
  const formattedDate = `${year}年${month}月${day}日`

  return {
    date,
    formattedDate,
    datetime,
  }
}
