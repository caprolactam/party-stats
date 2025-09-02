import { Icon } from '~/components/ui/icon.tsx'
import { AreaChangeSheet, AreaChangeSheetTrigger } from './area-change-sheet.tsx'
import { ElectionChangeSheet, ElectionChangeSheetTrigger } from './election-change-sheet.tsx'

interface BasicInfoSectionProps {
  area: {
    name: string
    code: string
  }
  election: {
    id: string
    name: string
    heldAt: string
    heldAtDatetime: string
  }
}

export function BasicInfoSection({
  area: {
    name: areaName,
    code: areaCode,
  },
  election: {
    id: electionId,
    name: electionName,
    heldAt,
    heldAtDatetime,
  },
}: BasicInfoSectionProps) {
  return (
    <section>
      <h2 className="mb-(--space-xs) pl-(--space-xs) text-sm text-muted-foreground">情報</h2>
      <ul className="divide-y divide-border/70 rounded-md bg-card">
        <li className="rounded-t-md">
          <ElectionChangeSheet>
            <ElectionChangeSheetTrigger
              currentElectionId={electionId}
              className="block size-full rounded-[inherit] hover:bg-hovered active:bg-selected"
            >
              <ListItem label="選挙">
                {electionName}
                <Icon name="chevron-right" className="-translate-y-px text-muted-foreground" size={22} />
              </ListItem>
            </ElectionChangeSheetTrigger>
          </ElectionChangeSheet>
        </li>
        <li>
          <ListItem label="投票日">
            <time dateTime={heldAtDatetime}>{heldAt}</time>
          </ListItem>
        </li>
        <li>
          <ListItem label="集計対象">
            比例代表選挙
          </ListItem>
        </li>
        <li>
          <AreaChangeSheet>
            <AreaChangeSheetTrigger
              className="block size-full rounded-b-md hover:bg-hovered active:bg-selected"
              currentAreaCode={areaCode}
            >
              <ListItem label="地域">
                {areaName}
                <Icon name="chevron-right" className="-translate-y-px text-muted-foreground" size={22} />
              </ListItem>
            </AreaChangeSheetTrigger>
          </AreaChangeSheet>
        </li>
      </ul>
    </section>
  )
}

interface ListItemProps {
  label: string
  children: React.ReactNode
}

function ListItem({
  label,
  children,
}: ListItemProps) {
  return (
    <div className="flex h-12 items-center px-4">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <div className="flex flex-1 items-center justify-end gap-1">
        {children}
      </div>
    </div>
  )
}
