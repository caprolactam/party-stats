import type { Region } from '../types'
import { SectionContainer, SelectionGrid, SelectionCard } from './section.tsx'

interface RegionSectionProps {
  regions: Region[]
}

export function RegionSection({ regions }: RegionSectionProps) {
  return (
    <SectionContainer
      title="地域から探す"
    >
      <SelectionGrid>
        {regions.map((region) => (
          <SelectionCard
            key={region.id}
            title={region.name}
            description={`${region.totalPrefectures}都道府県`}
            href={`/regions/${region.id}`}
            icon="📍"
          />
        ))}
      </SelectionGrid>
    </SectionContainer>
  )
}
