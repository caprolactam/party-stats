import { useState } from 'react'
import { Carousel } from '~/components/carousel/index.tsx'
import { chunkArray } from '~/lib/chunk-array.ts'
import type { Party } from '../types'
import { SectionContainer, SelectionGrid } from './section.tsx'

interface PartySectionProps {
  parties: Party[]
}

export function PartySection({ parties }: PartySectionProps) {
  const chunkedParties = chunkArray(parties, 3)
  const [activeChunk, setActiveChunk] = useState<string>('0')

  return (
    <SectionContainer title="政党から探す">
      <DesktopPartyGrid parties={parties} />
      <Carousel className="block md:hidden" value={activeChunk} onValueChange={setActiveChunk}>
        <Carousel.Viewport>
          {chunkedParties.map((chunk, index) => (
            <Carousel.Content key={index} value={String(index)}>
              <SelectionGrid>
                {chunk.map((party) => (
                  <li key={party.id}>
                    <a
                      href={`/parties/${party.id}`}
                      className="group flex items-center gap-4 py-2 pr-4"
                    >
                      <div
                        className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md border"
                        aria-hidden="true"
                      >
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: party.color }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium underline-offset-2 group-hover:underline md:text-base">
                          {party.name}
                        </div>
                      </div>
                    </a>
                  </li>
                ))}
              </SelectionGrid>
            </Carousel.Content>
          ))}
        </Carousel.Viewport>
        <Carousel.Previous />
        <Carousel.Next />
        <Carousel.Indicators />
      </Carousel>
    </SectionContainer>
  )
}

function DesktopPartyGrid({ parties }: { parties: Party[] }) {
  return (
    <div className="hidden md:grid">
      <SelectionGrid>
        {parties.map((party) => (
          <li key={party.id}>
            <a
              href={`/parties/${party.id}`}
              className="group flex items-center gap-4 py-2 pr-4"
            >
              <div
                className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md border"
                aria-hidden="true"
              >
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: party.color }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium underline-offset-2 group-hover:underline md:text-base">
                  {party.name}
                </div>
              </div>
            </a>
          </li>
        ))}
      </SelectionGrid>
    </div>
  )
}
