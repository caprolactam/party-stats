import {
  useLoaderData,
  useParams,
  Link,
  type NavigateOptions,
} from '@tanstack/react-router'
import React from 'react'
import { Button, buttonVariants } from '#src/components/parts/button.tsx'
import { Icon } from '#src/components/parts/icon.tsx'
import { CityCandidatesList } from '#src/utils/city-candidates-list.tsx'
import { ElectionsMenu } from '#src/utils/elections-menu.tsx'
import { strictEntries, convertElectionInfo } from '#src/utils/misc.ts'

const items = {
  overview: '選挙結果',
  ranking: 'ランキング',
} as const

export function LayoutWithSidebar({ children }: { children: React.ReactNode }) {
  const params = useParams({ from: '/elections/$electionId/$unitId' })
  const {
    date: electionDate,
    name: electionName,
    source,
    parties,
    electionType,
  } = useLoaderData({
    from: '/elections/$electionId',
  })
  const { datetime, formattedDate } = convertElectionInfo({
    electionDate,
  })
  const leadingParty = parties[0]

  return (
    <div className='flex flex-wrap gap-(--space-base)'>
      <div className='min-w-[55%] grow-999 basis-0'>
        <div className='flex flex-wrap items-start justify-end gap-4'>
          <div className='shrink-0 grow'>
            <h1 className='text-2xl font-semibold'>{electionName}</h1>
            <span className='text-brand-11 block text-base'>
              <time dateTime={datetime}>{formattedDate}</time>
              投開票
            </span>
          </div>
          <div className='flex shrink-0 items-center gap-4'>
            <a
              href={source}
              className={buttonVariants({
                variant: 'outline',
                size: 'md',
                withIcon: 'trailing',
              })}
            >
              概要
              <Icon
                name='open-in-new'
                size={16}
              />
            </a>
            <ElectionsMenu>
              <Button
                variant='default'
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
                      to={`/elections/$electionId/$unitId/${key}`}
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
                      to='/elections/$electionId/$unitId/ranking'
                      params={params}
                      search={{
                        party: leadingParty?.code,
                      }}
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
                className='text-blue-600 underline-offset-2 hover:underline'
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
