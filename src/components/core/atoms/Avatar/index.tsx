import { initialsOf } from '@/components/core/atoms/Avatar/initials'
import { participantTone } from '@/components/core/atoms/Avatar/tone'
import { cn } from '@/lib/utils'

type AvatarProps = {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZES = {
  sm: 'size-7 text-label-sm',
  md: 'size-10 text-label-md',
  lg: 'size-12 text-headline-sm',
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold ring-1 ring-current/15 select-none',
        SIZES[size],
        participantTone(name).surface,
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  )
}
