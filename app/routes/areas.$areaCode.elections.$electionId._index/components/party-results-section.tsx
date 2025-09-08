import { Link } from 'react-router'
import { Icon } from '~/components/ui/icon.tsx'

interface PartyResult {
  id: string
  name: string
  code: string
  colors: {
    light: string
    dark: string
  }
  voteRate: number
  to: string
}

interface PartyResultsSectionProps {
  parties: Array<PartyResult>
}

export function PartyResultsSection({
  parties,
}: PartyResultsSectionProps) {
  return (
    <section>
      <h2 className="mb-(--space-xs) pl-(--space-xs) text-sm text-muted-foreground">政党別得票率</h2>
      <ol className="divide-y divide-border/70 rounded-md bg-card">
        {parties.map((party) => (
          <li key={party.id} className="first-of-type:rounded-t-md last-of-type:rounded-b-md">
            <Link to={party.to} prefetch="intent" className="flex h-12 items-center gap-4 rounded-[inherit] px-4 py-1 hover:bg-hovered active:bg-selected">
              <span
                className="size-6 shrink-0 rounded-sm bg-(--party-color) dark:bg-(--party-color-dark)"
                style={{
                  '--party-color': party.colors.light,
                  '--party-color-dark': party.colors.dark,
                } as React.CSSProperties}
              />
              <div className="grid h-full flex-1 grid-rows-2 items-center">
                <div className="text-sm">{party.name}</div>
                <div className="relative flex items-center place-self-stretch">
                  <div
                    className="h-1 rounded-full bg-(--party-color) dark:bg-(--party-color-dark)"
                    style={{
                      'width': `max(${party.voteRate}%, 1%)`,
                      '--party-color': party.colors.light,
                      '--party-color-dark': party.colors.dark,
                    } as React.CSSProperties}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 font-mono text-sm"
                    style={{
                      left: `calc(max(${party.voteRate}%, 1%) + 0.5rem)`,
                    }}
                  >
                    {`${party.voteRate}%`}
                  </div>
                </div>
              </div>
              <Icon name="chevron-right" className="-translate-y-px text-muted-foreground" size={22} />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
