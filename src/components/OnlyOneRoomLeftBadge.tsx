import { cn } from '@/lib/utils'

type OnlyOneRoomLeftBadgeProps = {
  className?: string
}

/**
 * Badge shown only when user selects 1 room and the room type has exactly 1 room available.
 * Do not show availability count in any other case.
 */
export function OnlyOneRoomLeftBadge({ className }: OnlyOneRoomLeftBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-amber-300/60 bg-amber-100/70 px-3 py-1 text-xs font-medium text-amber-800',
        'dark:bg-amber-950/30 dark:border-amber-700/50 dark:text-amber-300',
        className
      )}
      aria-label="Only one room left"
    >
      Only 1 room left
    </span>
  )
}
