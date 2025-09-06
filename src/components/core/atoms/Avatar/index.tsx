import { participantTone } from '@/components/core/atoms/Avatar/tone'
import { avatarInitials } from '@/lib/avatar'
import { cn } from '@/lib/utils'

type AvatarProps = {
  name: string
  /** Everyone else on screen, so a shared first letter can be disambiguated. */
  peers?: readonly string[]
  size?: 'xs' | 'sm' | 'md' | 'lg'
  /** `solid` fills with the participant's hue, as the design draws it. */
  variant?: 'tinted' | 'solid'
  className?: string
}

const SIZES = {
  xs: 'size-6 text-[0.625rem]',
  sm: 'size-7 text-label-sm',
  md: 'size-8 text-label-md',
  lg: 'size-10 text-label-md',
}

/**
 * Decorative throughout: the participant's name is always written next to it,
 * so announcing the initials again would only make a screen reader repeat
 * itself in a voice that mispronounces them.
 */
export function Avatar({
  name,
  peers,
  size = 'md',
  variant = 'solid',
  className,
}: AvatarProps) {
  const tone = participantTone(name)
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-extrabold select-none',
        SIZES[size],
        variant === 'solid'
          ? cn(tone.fill, 'text-primary-foreground')
          : cn(tone.surface, 'ring-1 ring-current/15'),
        className,
      )}
    >
      {avatarInitials(name, peers)}
    </span>
  )
}
