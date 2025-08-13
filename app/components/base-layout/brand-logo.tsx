import { href, Link } from 'react-router'
import { cn } from '~/lib/utils.ts'

export function BrandLogo({ className }: { className?: string }) {
  return (
    <Link
      to={href('/')}
      className={cn('flex h-11 w-full items-center gap-2 text-base font-medium', className)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        width={16}
        height={16}
        aria-hidden
        className="inline object-contain"
      >
        <circle
          cx="10"
          cy="10"
          r="10"
          className="fill-primary"
        />
      </svg>
      政党スタッツ
    </Link>
  )
}
