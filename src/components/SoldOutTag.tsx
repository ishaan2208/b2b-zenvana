import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type SoldOutTagProps = {
  className?: string
  label?: string
}

export function SoldOutTag({
  className,
  label = 'Sold out',
}: SoldOutTagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-rose-300/70 bg-rose-100/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-800 shadow-[0_10px_24px_rgba(244,63,94,0.10)] backdrop-blur-xl',
        'dark:border-rose-700/60 dark:bg-rose-950/40 dark:text-rose-200',
        className
      )}
      aria-label={label}
    >
      <AlertCircle className="h-3.5 w-3.5" />
      {label}
    </span>
  )
}
