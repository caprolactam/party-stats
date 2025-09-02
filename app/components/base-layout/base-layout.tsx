/**
 * Vitepressのスタイリングを参考に作成
 * - vuejs/vitepress: https://github.com/vuejs/vitepress
 * - MIT License: https://github.com/vuejs/vitepress/blob/main/LICENSE
 */
import type { ReactNode } from 'react'
import { Separator } from '../ui/separator.tsx'
import { BrandLogo } from './brand-logo.tsx'
import { Footer } from './footer.tsx'
import { Header } from './header/header.tsx'
import { Sidebar } from './sidebar.tsx'

interface BaseLayoutProps {
  children: ReactNode
}

export function BaseLayout({
  children,
}: BaseLayoutProps) {
  return (
    <div className="flex min-h-screen [--double-space:_calc(var(--space-base)_*_2)]">
      <aside
        className="fixed inset-y-0 left-0 z-40 hidden flex-col overflow-x-hidden overflow-y-auto overscroll-contain bg-sidebar px-(--space-base) lg:flex lg:w-(--sidebar-width) xl:w-[calc((100%_-_(var(--max-screen-width)_-_var(--double-space)))_/_2_+_var(--sidebar-width)_-_var(--space-base))] xl:pl-[max(var(--space-base),_calc((100%_-_var(--max-screen-width))_/_2))]"
      >
        <div className="sticky top-0 z-45 flex h-(--header-height) shrink-0 items-center bg-sidebar">
          <BrandLogo />
        </div>
        <Sidebar className="pt-(--space-base)" />
      </aside>
      <div
        className="flex min-h-screen flex-1 flex-col gap-(--space-base) px-(--space-base) lg:pl-[calc(var(--space-base)_+_var(--sidebar-width))] xl:pr-[max(var(--space-base),_calc((100%_-_var(--max-screen-width))_/_2))] xl:pl-[calc((100%_-_var(--max-screen-width))_/_2_+_var(--sidebar-width)_+_var(--space-base))]"
      >
        <Header className="sticky inset-x-0 top-0 z-40 h-(--header-height) shrink-0 bg-background" />
        <main className="flex-1">
          {children}
        </main>
        <footer className="flex-0">
          <Separator muted />
          <Footer />
        </footer>
      </div>
    </div>
  )
}
