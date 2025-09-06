import { toneAt } from '@/components/core/atoms/Avatar/tone'
import { categoryEmoji, categoryToneIndex } from '@/lib/categories'
import { cn } from '@/lib/utils'

const SIZES = {
  sm: 'size-7 text-base',
  md: 'size-10.5 text-lg',
  lg: 'size-11 text-xl',
}

/**
 * The glyph is decoration: every place this lens appears, the category name is
 * already stated in text beside it, so announcing the emoji would only repeat
 * it in a voice screen readers pronounce badly.
 */
export function CategoryEmoji({
  categoryId,
  size = 'md',
  className,
}: {
  categoryId: number
  size?: keyof typeof SIZES
  className?: string
}) {
  const tone = toneAt(categoryToneIndex(categoryId))
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full border border-white/70',
        tone.surface,
        SIZES[size],
        className,
      )}
    >
      {categoryEmoji(categoryId)}
    </span>
  )
}
