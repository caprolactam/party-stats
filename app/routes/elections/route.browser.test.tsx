import { createRoutesStub } from 'react-router'
import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import { ErrorBoundary } from './route.tsx'

test('ErrorBoundary renders error message', async () => {
  const Stub = createRoutesStub([
    {
      path: '/elections',
      loader: () => { throw new Error('Test error') },
      ErrorBoundary,
    },
  ])

  const screen = render(<Stub />)

  await expect.element(screen.getByText('エラーが発生しました')).toBeVisible()
})
