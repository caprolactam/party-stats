import { useLoaderData, useNavigate } from '@tanstack/react-router'
import { DropdownMenu } from 'radix-ui'
import React from 'react'
import { useMediaQuery } from 'usehooks-ts'
import { Drawer } from 'vaul'
import { Icon } from '#src/components/parts/icon.tsx'
import { cn } from '#src/utils/misc.ts'
import { useCurrentLink } from './use-current-link.ts'

export function ElectionsMenu({
  children,
  elections,
}: {
  children: React.ReactNode
  elections: Array<{
    code: string
    name: string
    date: string
    electionType: 'shugiin' | 'sangiin'
  }>
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const {
    currentElection: { code: electionCode },
  } = useLoaderData({
    from: '/elections/$electionCode',
  })

  const linkProps = useCurrentLink()

  const navigate = useNavigate()

  const isMobile = useMediaQuery('(max-width: 768px)')
  const Component = isMobile ? ElectionMenuDrawer : ElectionMenuDropDown

  return (
    <Component
      isOpen={isOpen}
      handleOpen={setIsOpen}
      elections={elections}
      selectedElectionCode={electionCode}
      handleSelect={(electionCode) => {
        void navigate({
          ...linkProps,
          params: {
            ...linkProps.params,
            electionCode,
          },
          resetScroll: false,
        })
      }}
    >
      {children}
    </Component>
  )
}

interface ElectionMenuImplProps {
  isOpen: boolean
  handleOpen: (open: boolean) => void
  children: React.ReactNode
  elections: Array<{
    code: string
    name: string
    date: string
    electionType: 'shugiin' | 'sangiin'
  }>
  selectedElectionCode: string
  handleSelect: (electionCode: string) => void
}

function ElectionMenuDropDown({
  isOpen,
  handleOpen,
  children,
  elections,
  selectedElectionCode,
  handleSelect,
}: ElectionMenuImplProps) {
  return (
    <DropdownMenu.Root
      open={isOpen}
      onOpenChange={handleOpen}
    >
      <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align='end'
          side='bottom'
          sideOffset={5}
          className={cn(
            'border-brand-7 bg-brand-3 text-brand-12 min-w-48 rounded-lg border py-2 shadow-sm',
            'ease-out-cubic data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-85 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-85 origin-top-right data-[state=closed]:duration-150 data-[state=open]:duration-200',
          )}
        >
          {elections.map((election) => {
            const label = `${election.name.slice(0, 4)}${election.electionType === 'sangiin' ? '参院選' : '衆院選'}(${new Date(election.date).getFullYear()})`

            return (
              <DropdownMenu.CheckboxItem
                key={election.code}
                checked={election.code === selectedElectionCode}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleSelect(election.code)
                  }
                }}
                className='hover:bg-brand-4 focus-visible:bg-brand-5 active:bg-brand-5 data-[disabled]:text-brand-12/38 reset-outline flex h-12 items-center gap-3 px-3 text-sm outline-none select-none data-[disabled]:pointer-events-none'
              >
                <DropdownMenu.ItemIndicator
                  className='opacity-0 data-[state=checked]:opacity-100'
                  forceMount
                  asChild
                >
                  <Icon
                    name='check'
                    size={20}
                  />
                </DropdownMenu.ItemIndicator>
                {label}
              </DropdownMenu.CheckboxItem>
            )
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

function ElectionMenuDrawer({
  isOpen,
  handleOpen,
  children,
  elections,
  selectedElectionCode,
  handleSelect,
}: ElectionMenuImplProps) {
  const contentRef = React.useRef<HTMLDivElement>(null)

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={handleOpen}
    >
      <Drawer.Trigger asChild>{children}</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className='fixed inset-0 z-40 bg-black/70' />
        <Drawer.Content
          onOpenAutoFocus={(e) => {
            if (contentRef.current) {
              e.preventDefault()
              contentRef.current.focus()
            }
          }}
          tabIndex={-1}
          ref={contentRef}
          className='bg-brand-1 fixed inset-x-2 bottom-2 z-50 flex max-h-[85%] flex-col overflow-hidden rounded-lg after:h-0!'
        >
          <Drawer.Title className='text-brand-11 relative flex h-10 shrink-0 items-center px-4 text-sm'>
            <div className='bg-brand-6 absolute inset-x-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-xl'></div>
            選挙の選択
          </Drawer.Title>
          <Drawer.Description className='sr-only'>
            データを表示する選挙を選択してください
          </Drawer.Description>
          <div className='flex-1 overflow-x-hidden overflow-y-auto'>
            {elections.map((election) => {
              return (
                <Drawer.Close
                  asChild
                  key={election.code}
                >
                  <button
                    type='button'
                    className='hover:bg-brand-4 reset-outline focus-visible:bg-brand-5 active:bg-brand-5 flex min-h-12 w-full items-center gap-4 px-4 py-2 outline-none select-none'
                    onClick={() => handleSelect(election.code)}
                  >
                    {election.code === selectedElectionCode ? (
                      <Icon
                        name='check'
                        size={24}
                      />
                    ) : (
                      <div
                        className='size-6'
                        aria-hidden
                      ></div>
                    )}
                    {election.name}
                  </button>
                </Drawer.Close>
              )
            })}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
