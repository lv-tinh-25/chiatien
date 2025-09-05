import { CategoryIcon } from '@/components/core/atoms/CategoryIcon'
import { Category } from '@/generated/prisma/browser'
import { cn } from '@/lib/utils'

const SIZES = {
  sm: 'size-9 [&_svg]:size-4',
  md: 'size-11 [&_svg]:size-5',
}

type CategoryLensProps = {
  category: Category | null
  size?: keyof typeof SIZES
  className?: string
}

/**
 * Deliberately monochrome. Colour in this app already carries two meanings —
 * who a person is, and which way money moves — and giving categories a third
 * hue axis turns a list into noise. The lens contributes depth, not hue.
 */
export function CategoryLens({
  category,
  size = 'md',
  className,
}: CategoryLensProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'glass-flush inline-flex shrink-0 items-center justify-center rounded-full text-foreground/75',
        SIZES[size],
        className,
      )}
    >
      <CategoryIcon category={category} />
    </span>
  )
}
