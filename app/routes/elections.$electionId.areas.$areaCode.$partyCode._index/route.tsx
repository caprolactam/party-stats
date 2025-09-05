import { href } from 'react-router'
import { StickyTitleBar } from '~/components/ui/sticky-title-bar.tsx'
import type { Route } from './+types/route.ts'

const currentArea = {
  name: '全国',
}

export default function Route({ params }: Route.ComponentProps) {
  const pageTitle = `${currentArea.name}の政党別得票数`

  return (
    <StickyTitleBar
      title={pageTitle}
      backLink={{
        to: href('/elections/:electionId/areas/:areaCode', params),
        label: '概要',
      }}
    >
      <StickyTitleBar.Trigger>
        <h1
          className="text-4xl font-medium tracking-tight text-foreground"
        >
          {pageTitle}
        </h1>
      </StickyTitleBar.Trigger>
      <div className="mt-(--space-lg) grid gap-(--space-lg)"></div>
    </StickyTitleBar>
  )
}
