import { createFileRoute, Link } from '@tanstack/react-router'
import { Card } from '#src/components/parts/card.tsx'
import { Icon } from '#src/components/parts/icon.tsx'
import {
  NotFoundComponent,
  ErrorBoundary,
} from '#src/components/templates/misc.tsx'
import { convertElectionInfo } from '#src/utils/misc.ts'
import { listElections } from '#src/utils/queries.ts'

export const Route = createFileRoute('/')({
  loader: () => listElections(),
  head: () => ({
    meta: [
      {
        title: 'ホーム | 政党スタッツ',
      },
      {
        name: 'description',
        content: '国政選挙における政党の得票データのまとめ',
      },
    ],
  }),
  component: RouteComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorBoundary,
  gcTime: 0,
})

function RouteComponent() {
  const elections = Route.useLoaderData()

  return (
    <div className='mt-12 grid gap-(--space-base)'>
      <h2 className='text-2xl font-semibold'>選挙データ</h2>
      <Card
        asChild
        className='grid w-full py-4 sm:grid-cols-[repeat(auto-fit,_minmax(22rem,_1fr))]'
      >
        <ul>
          {elections.map((election) => (
            <Election
              key={election.code}
              electionName={election.name}
              electionId={election.code}
              electionDate={election.date}
            />
          ))}
        </ul>
      </Card>
      <h2 className='text-2xl font-semibold'>その他</h2>
      <div className='grid sm:grid-cols-[repeat(auto-fit,_minmax(20rem,_1fr))]'>
        <Card
          asChild
          className='hover:bg-brand-4 focus-visible:bg-brand-5 active:bg-brand-5 flex items-center justify-between p-4 text-base font-medium'
        >
          <Link
            to='/about'
            className='font-semibold'
          >
            サイトについて
            <Icon
              className='shrink-0'
              name='chevron-right'
              size={24}
            />
          </Link>
        </Card>
        <div></div>
      </div>
    </div>
  )
}

function Election({
  electionName,
  electionId,
  electionDate,
  className,
}: {
  electionName: string
  electionId: string
  electionDate: string
  className?: string
}) {
  const { datetime, formattedDate } = convertElectionInfo({
    electionDate,
  })

  return (
    <li className={className}>
      <Link
        to='/elections/$electionId/$unitId/overview'
        params={{ electionId, unitId: 'national' }}
        className='text-brand-12 hover:bg-brand-4 focus-visible:bg-brand-5 active:bg-brand-5 flex items-center gap-4 px-4 py-2'
      >
        <div className='flex-1'>
          <div className='text-base font-semibold'>{electionName}</div>
          <span className='text-brand-11 block text-sm'>
            <time dateTime={datetime}>{formattedDate}</time>
            投開票
          </span>
        </div>
        <Icon
          className='shrink-0'
          name='chevron-right'
          size={24}
        />
      </Link>
    </li>
  )
}
