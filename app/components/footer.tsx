import { cn } from '~/utils/misc.ts'

interface FooterProps {
  className?: string
}

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn('flex w-full gap-4 border-t bg-background py-4', className)}>
      <Copyright />
    </footer>
  )
}

function Copyright() {
  const currentYear = new Date().getFullYear()
  return (
    <div className="inline-flex gap-2 text-[15px] leading-relaxed font-medium text-muted-foreground">
      {`© ${currentYear}`}
      <a
        href="https://github.com/caprolactam"
        target="_blank"
        rel="noopener noreferrer"
        className="underline-offset-2 hover:underline"
      >
        caprolactam
      </a>
    </div>
  )
}
