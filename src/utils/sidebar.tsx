import {
  useLoaderData,
  useParams,
  Link,
  type NavigateOptions,
} from '@tanstack/react-router'
import React from 'react'
import { Button } from '#src/components/parts/button.tsx'
import { Icon } from '#src/components/parts/icon.tsx'
import { CityCandidatesList } from '#src/utils/city-candidates-list.tsx'
import { ElectionsMenu } from '#src/utils/elections-menu.tsx'
import { strictEntries, convertElectionInfo } from '#src/utils/misc.ts'

const items = {
  overview: '選挙結果',
  ranking: 'ランキング',
} as const

export function LayoutWithSidebar({ children }: { children: React.ReactNode }) {
  const params = useParams({ from: '/elections/$electionCode/$areaCode' })
  const {
    currentElection: {
      date: electionDate,
      name: electionName,
      source,
      electionType,
    },
    elections,
    parties,
  } = useLoaderData({
    from: '/elections/$electionCode',
  })
  const { datetime, formattedDate } = convertElectionInfo({
    electionDate,
  })

  return (
    <div className='flex flex-wrap gap-x-(--space-base) gap-y-(--space-xl)'>
      <div className='min-w-[55%] grow-999 basis-0'>
        <div className='flex flex-wrap items-start gap-4'>
          <div className='shrink-0 grow'>
            <h1 className='text-2xl font-semibold'>{electionName}</h1>
            <span className='text-brand-11 block text-base'>
              <time dateTime={datetime}>{formattedDate}</time>
              投開票
            </span>
          </div>
          <ElectionsMenu elections={elections}>
            <Button
              variant='outline'
              size='md'
              withIcon='trailing'
              className='shrink-0'
            >
              選挙の選択
              <Icon
                name='arrow-drop-down'
                className='text-brand-11'
                size={24}
              />
            </Button>
          </ElectionsMenu>
        </div>
        <ul className='border-brand-7 mt-(--space-base) flex h-12 border-b'>
          {strictEntries(items).map(([key, label]) => {
            switch (key) {
              case 'overview':
                return (
                  <li
                    key={key}
                    className='flex-1 basis-24'
                  >
                    <TabLink
                      key={key}
                      to={`/elections/$electionCode/$areaCode/${key}`}
                      params={params}
                    >
                      {label}
                    </TabLink>
                  </li>
                )
              case 'ranking':
                return (
                  <li
                    key={key}
                    className='flex-1 basis-24'
                  >
                    <TabLink
                      to='/elections/$electionCode/$areaCode/ranking'
                      params={params}
                      search={{ party: parties[0]?.code }}
                    >
                      {label}
                    </TabLink>
                  </li>
                )
              default: {
                const _: never = key
                throw new Error(`Invalid tab: ${_}`)
              }
            }
          })}
        </ul>
        {children}
      </div>
      <div className='grow basis-80'>
        <div className='sticky top-(--space-base) flex flex-col gap-(--space-base)'>
          <CityCandidatesList />
          <div className='text-xs'>
            <cite className='not-italic'>
              <a
                href={source}
                className='text-link-base underline-offset-2 hover:underline'
              >
                {electionType === 'shugiin'
                  ? '市区町村別得票（総務省）'
                  : '候補者別市区町村別得票数（総務省）'}
              </a>
            </cite>
            をもとに作成
          </div>
        </div>
      </div>
    </div>
  )
}

function TabLink({
  children,
  ...props
}: NavigateOptions & { children: string }) {
  return (
    <Link
      className='group text-brand-11 data-[status=active]:text-brand-12 hover:text-brand-12 active:text-brand-12 hover:bg-brand-4 focus-visible:bg-brand-5 active:bg-brand-5 flex size-full items-center justify-center px-2 text-sm font-medium whitespace-nowrap select-none md:px-4'
      {...props}
      activeOptions={{
        includeSearch: false,
      }}
    >
      <div className='relative inline-flex h-full items-center'>
        <div className='bg-brand-12 rounded-t-1 absolute inset-x-0 bottom-0 h-[2px] w-full opacity-0 group-data-[status=active]:opacity-100' />
        <span>{children}</span>
      </div>
    </Link>
  )
}
