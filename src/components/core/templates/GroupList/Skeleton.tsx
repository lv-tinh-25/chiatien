'use client'

import { Skeleton } from '@/components/core/atoms/Skeleton'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

/** Two group cards, the width the sections settle into on both layouts. */
export function GroupListSkeleton({ className }: { className?: string }) {
  const t = useTranslations('App')

  return (
    <div className={cn('flex flex-col gap-2 lg:col-span-2', className)}>
      <p role="status" className="sr-only">
        {t('loading')}
      </p>
      <Skeleton className="h-3 w-20 rounded-full" />
      {[0, 1].map((row) => (
        <Skeleton key={row} className="h-21 rounded-card" />
      ))}
    </div>
  )
}
