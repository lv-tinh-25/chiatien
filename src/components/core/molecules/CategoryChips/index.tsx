'use client'

import { Chip } from '@/components/core/atoms/Chip'
import type { Category } from '@/generated/prisma/browser'
import { CATEGORY_IDS, categoryEmoji } from '@/lib/categories'
import { useTranslations } from 'next-intl'

/**
 * Six chips, no popover. The taxonomy was cut to exactly what fits here, so a
 * search field would have nothing left to search.
 */
export function CategoryChips({
  id,
  value,
  onValueChange,
  categories,
  'aria-describedby': describedBy,
}: {
  id?: string
  value: number
  onValueChange: (categoryId: number) => void
  categories: Category[]
  'aria-describedby'?: string
}) {
  const t = useTranslations('Categories')
  const byId = new Map(categories.map((category) => [category.id, category]))

  return (
    <div
      id={id}
      role="listbox"
      aria-describedby={describedBy}
      className="flex flex-wrap gap-2"
    >
      {CATEGORY_IDS.map((categoryId) => {
        const category = byId.get(categoryId)
        if (category === undefined) return null
        return (
          <Chip
            key={categoryId}
            role="option"
            selected={categoryId === value}
            onClick={() => onValueChange(categoryId)}
          >
            <span aria-hidden>{categoryEmoji(categoryId)}</span>
            {t(`${category.grouping}.${category.name}`)}
          </Chip>
        )
      })}
    </div>
  )
}
