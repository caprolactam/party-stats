import { Link } from '@tanstack/react-router'
import type React from 'react'
import * as v from 'valibot'
import { cn } from '#src/utils/misc'

export function Header({
  ref,
  className,
  ...props
}: React.ComponentPropsWithRef<'header'>) {
  return (
    <header
      className={cn('border-brand-6 h-14 border-b', className)}
      ref={ref}
      {...props}
    >
      <div className='mx-auto flex size-full max-w-5xl items-center gap-(--space-base) px-(--space-base)'>
        <Link
          to='/'
          className='relative inline-flex h-10 shrink-0 items-center gap-1.5 text-base font-bold'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 200 200'
            width={16}
            height={16}
            aria-hidden
          >
            <circle
              cx='100'
              cy='100'
              r='100'
              className='fill-brand-12'
            />
          </svg>
          政党スタッツ
          <div className='absolute inset-y-1/2 h-14 w-full -translate-y-1/2' />
        </Link>
        <div className='flex-1' />
        <Link
          to='/about'
          className='data-[status=active]:decoration-brand-11 [&_]:hover:decoration-brand-12 relative inline-flex items-center text-sm font-medium underline-offset-2 hover:underline data-[status=active]:underline'
        >
          サイトについて
          <div className='absolute inset-y-1/2 h-14 w-full -translate-y-1/2' />
        </Link>
      </div>
    </header>
  )
}

export function Footer({
  ref,
  className,
  ...props
}: React.ComponentPropsWithRef<'footer'>) {
  const year = new Date().getFullYear()

  return (
    <footer
      ref={ref}
      className={cn('border-brand-6 mt-14 h-12 border-t sm:mt-28', className)}
      {...props}
    >
      <div className='mx-auto flex size-full max-w-5xl shrink-0 items-center px-4 md:px-6'>
        <div className='inline-flex items-center gap-1 text-sm'>
          {`© ${year}`}
          <a
            className='underline-offset-2 hover:underline'
            href='https://github.com/caprolactam'
          >
            caprolactam
          </a>
        </div>
      </div>
    </footer>
  )
}

export function NotFoundComponent({ data }: { data?: unknown }) {
  if (!data) {
    return (
      <div className='text-brand-11 flex h-32 items-center justify-center text-lg font-semibold'>
        存在しないページです
      </div>
    )
  }

  const message = getNotFoundData(data)

  return (
    <div className='text-brand-11 flex h-32 items-center justify-center text-lg font-semibold'>
      {message}
    </div>
  )
}

const notFoundSchema = v.object({
  data: v.object({
    message: v.string(),
  }),
})

function getNotFoundData(data: unknown) {
  const submission = v.safeParse(notFoundSchema, data)

  if (submission.success) {
    return submission.output.data.message
  }

  return 'データが見つかりませんでした'
}

export function ErrorBoundary() {
  return (
    <div className='text-brand-11 flex h-32 items-center justify-center text-lg font-semibold'>
      私たちの側で問題が発生しました
    </div>
  )
}
