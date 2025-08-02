import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router'
import type { Route } from './+types/root'
import { Footer } from './components/footer.tsx'
import { Header } from './components/header.tsx'
import { SideNavigation } from './components/side-navigation.tsx'
import { ThemeProvider } from './utils/theme.tsx'

import './app.css'

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ja"
      className="bg-background text-base text-foreground antialiased"
      suppressHydrationWarning
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
      <body className="flex min-h-screen flex-col">
        <ThemeProvider>
          <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Header className="container mx-auto w-full" />
          </div>
          <div className="container mx-auto flex w-full flex-1">
            <SideNavigation
              className="hidden lg:flex lg:w-60 lg:shrink-0 lg:flex-col"
            />
            <div className="flex flex-1 flex-col">
              <main className="flex-1 p-4 md:p-6">
                {children}
              </main>
              <Footer />
            </div>
          </div>
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

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!'
  let details = 'An unexpected error occurred.'
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error'
    details
      = error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details
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
