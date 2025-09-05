import { initialsOf } from '@/components/core/atoms/Avatar/initials'
import { cn } from '@/lib/utils'

const TONES = [
  'bg-primary/15 text-primary',
  'bg-secondary/15 text-secondary',
  'bg-accent/20 text-foreground',
  'bg-credit/15 text-credit',
  'bg-muted text-muted-foreground',
] as const

// A stable colour per name, so the same participant keeps the same swatch
// across every screen without storing anything.
function toneFor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return TONES[hash % TONES.length]
}

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
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold select-none',
        SIZES[size],
        toneFor(name),
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  )
}
