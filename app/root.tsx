import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router'
import { useMatches } from 'react-router'
import type { Route } from './+types/root'
import { BaseLayout } from './components/base-layout/base-layout.tsx'
import { ThemeProvider } from './lib/theme.tsx'
import { contextStorageMiddleware } from './middleware/context-storage.ts'

import './app.css'

export const unstable_middleware: Route.unstable_MiddlewareFunction[] = [
  contextStorageMiddleware,
]

export function Layout({ children }: { children: React.ReactNode }) {
  const pageBackground = usePageBackgroudColor()

  return (
    <html
      lang="ja"
      suppressHydrationWarning
      // eslint-disable-next-line better-tailwindcss/no-unregistered-classes
      className={pageBackground === 'gray' ? 'page-gray' : ''}
    >
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <meta
          name="referrer"
          content="no-referrer"
        />
        <link
          rel="apple-touch-icon"
          href="/favicons/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/svg+xml"
          href="/favicons/favicon.svg"
        />
        <link
          rel="preload"
          as="font"
          href="/fonts/commit-mono.woff2"
          crossOrigin="anonymous"
        />
        <Meta />
        <Links />
      </head>
      <body
        className="min-h-screen min-w-(--min-screen-width) bg-background text-base text-foreground antialiased"
      >
        <ThemeProvider>
          <BaseLayout>
            {children}
          </BaseLayout>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return (
    <Outlet />
  )
}

// TODO: エラーハンドリングの設定
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!'
  let details = 'An unexpected error occurred.'
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error'
    details =
      error.status === 404 ?
        'The requested page could not be found.' :
        error.statusText || details
  }
  else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}

/**
 * pageに応じて背景色を変更する
 */
function usePageBackgroudColor(): 'white' | 'gray' {
  const matches = useMatches()

  const whitePages = [
    'routes/_index',
    'routes/about',
  ]

  const isWhitePage = matches.some((match) => whitePages.includes(match.id))

  return isWhitePage ? 'white' : 'gray'
}
