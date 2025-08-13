import { useCallback } from 'react'
import { ThemeProvider as NextThemeProvider, useTheme as useNextTheme } from 'next-themes'
import type { ThemeProviderProps } from 'next-themes'

export type ResolvedTheme = 'light' | 'dark'

const THEME_OPTIONS = {
  attribute: 'class',
} satisfies ThemeProviderProps

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <NextThemeProvider {...THEME_OPTIONS}>{children}</NextThemeProvider>
}

export function useTheme() {
  const { theme: originalTheme, resolvedTheme: originalResolvedTheme, ...props } = useNextTheme()

  const theme = getTypedTheme(originalTheme)
  const resolvedTheme = originalResolvedTheme === 'dark' ? 'dark' : 'light' satisfies ResolvedTheme
  const setOriginalTheme = props.setTheme

  const toggleTheme = useCallback(
    () => {
      if (resolvedTheme === 'light') {
        setOriginalTheme('dark')
        return
      }

      setOriginalTheme('light')
    },
    [resolvedTheme, setOriginalTheme],
  )

  return {
    ...props,
    theme,
    resolvedTheme,
    toggleTheme,
  } as const
}

function getTypedTheme(theme: unknown) {
  switch (theme) {
    case 'light':
      return 'light'
    case 'dark':
      return 'dark'
    case 'system':
      return 'system'
    default:
      return 'light'
  }
}
