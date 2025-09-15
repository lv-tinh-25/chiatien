'use client'

import { Skeleton } from '@/components/core/atoms/Skeleton'
import { useTranslations } from 'next-intl'

/** Two date sections of expense cards, the shape the list settles into. */
export function ExpenseListSkeleton() {
  const t = useTranslations('App')

  return (
    <div className="flex flex-col gap-4">
      <p role="status" className="sr-only">
        {t('loading')}
      </p>
      {[0, 1].map((section) => (
        <div key={section} className="flex flex-col gap-2">
          <Skeleton className="h-3 w-24 rounded-full" />
          {Array.from({ length: section === 0 ? 3 : 2 }, (_, row) => (
            <Skeleton key={row} className="h-17 rounded-card" />
          ))}
        </div>
      ))}
    </div>
  )
}
